'use client'

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import GlobalCallOverlay from '@/components/call/GlobalCallOverlay';
import toast from 'react-hot-toast';

type CallType = 'video' | 'voice';

interface CallState {
    status: 'idle' | 'ringing' | 'calling' | 'active';
    type: CallType | null;
    roomId: string | null;
    peerId: string | null; // The person you are talking to
    peerProfile: any | null; // Their profile data
    isMuted: boolean;
    isVideoOff: boolean;
}

interface CallContextProps {
    startCall: (receiverId: string, type: CallType) => void;
    acceptCall: () => void;
    rejectCall: () => void;
    endCall: () => void;
    toggleMute: () => void;
    toggleVideo: () => void;
    callState: CallState;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
}

const CallContext = createContext<CallContextProps | undefined>(undefined);

export function CallProvider({ children }: { children: React.ReactNode }) {
    const supabase = createClient();
    
    const [callState, setCallState] = useState<CallState>({
        status: 'idle',
        type: null,
        roomId: null,
        peerId: null,
        peerProfile: null,
        isMuted: false,
        isVideoOff: false,
    });

    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const sessionChannelRef = useRef<any>(null); // For active WebRTC exchanging
    const notificationChannelRef = useRef<any>(null); // For incoming call alerts
    
    const ringtoneRef = useRef<HTMLAudioElement | null>(null);
    const dialtoneRef = useRef<HTMLAudioElement | null>(null);
    
    const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);

    useEffect(() => {
        const initUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);
            }
            // setup audio
            ringtoneRef.current = new Audio('/ringtone.mp3');
            ringtoneRef.current.loop = true;
            dialtoneRef.current = new Audio('/dialtone.mp3');
            dialtoneRef.current.loop = true;
        };
        initUser();
    }, []);

    // Listen for incoming calls globally
    useEffect(() => {
        if (!currentUserId) return;

        notificationChannelRef.current = supabase.channel(`notifications_${currentUserId}`)
            .on('broadcast', { event: 'incoming_call' }, async (payload) => {
                const data = payload.payload;
                if (callState.status !== 'idle') return; // Busy

                // Fetch caller profile
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.callerId).single();
                
                setCallState({
                    status: 'ringing',
                    roomId: data.roomId,
                    peerId: data.callerId,
                    type: data.callType,
                    peerProfile: profile,
                    isMuted: false,
                    isVideoOff: false
                });
                
                pendingOfferRef.current = data.offer;
                if (ringtoneRef.current) {
                    ringtoneRef.current.currentTime = 0;
                    ringtoneRef.current.play().catch(e => console.log('Autoplay prevent', e));
                }
            })
            .subscribe();

        return () => {
            if (notificationChannelRef.current) supabase.removeChannel(notificationChannelRef.current);
        };
    }, [currentUserId, callState.status]);

    const getIceServers = () => {
        return [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            {
                urls: "turn:global.metered.ca:80",
                username: "635e95878dc1f8ed4c754e23",
                credential: "svzy/u1LcpBxx1Zd",
            },
            {
                urls: "turn:global.metered.ca:443",
                username: "635e95878dc1f8ed4c754e23",
                credential: "svzy/u1LcpBxx1Zd",
            },
            {
                urls: "turn:global.metered.ca:443?transport=tcp",
                username: "635e95878dc1f8ed4c754e23",
                credential: "svzy/u1LcpBxx1Zd",
            }
        ];
    };

    const setupMedia = async (type: CallType, pc: RTCPeerConnection) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: type === 'video'
            });
            setLocalStream(stream);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));
            return stream;
        } catch (err) {
            console.error("Failed to get media", err);
            toast.error("Could not access camera/microphone");
            return null;
        }
    };

    const createPeerConnection = (roomId: string) => {
        const pc = new RTCPeerConnection({ iceServers: getIceServers() });
        
        pc.onicecandidate = (event) => {
            if (event.candidate && sessionChannelRef.current) {
                sessionChannelRef.current.send({
                    type: 'broadcast',
                    event: 'webrtc_signal',
                    payload: { type: 'ice-candidate', candidate: event.candidate, sender: currentUserId }
                });
            }
        };

        pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                setRemoteStream(event.streams[0]);
            }
        };

        pc.onconnectionstatechange = () => {
            if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                endCall();
            }
        };

        return pc;
    };

    const joinSessionChannel = (roomId: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (sessionChannelRef.current) supabase.removeChannel(sessionChannelRef.current);
            const channel = supabase.channel(`call_${roomId}`);
            
            channel.on('broadcast', { event: 'webrtc_signal' }, async (payload) => {
                const data = payload.payload;
                if (data.sender === currentUserId) return;

                if (data.type === 'answer' && pcRef.current) {
                    if (dialtoneRef.current) dialtoneRef.current.pause();
                    await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                    setCallState(prev => ({ ...prev, status: 'active' }));
                }

                if (data.type === 'ice-candidate' && pcRef.current) {
                    await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                }

                if (data.type === 'end_call') {
                    cleanupCall();
                }
                
                if (data.type === 'reject_call') {
                    toast.error("Call Declined");
                    cleanupCall();
                }
            }).subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    resolve();
                }
            });

            sessionChannelRef.current = channel;
        });
    };

    const startCall = async (receiverId: string, type: CallType) => {
        if (!currentUserId) return;
        
        const roomId = `${Date.now()}_${currentUserId}`;
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', receiverId).single();

        setCallState({ status: 'calling', roomId, peerId: receiverId, type, peerProfile: profile, isMuted: false, isVideoOff: false });
        
        if (dialtoneRef.current) {
            dialtoneRef.current.currentTime = 0;
            dialtoneRef.current.play().catch(e => console.log(e));
        }

        const pc = createPeerConnection(roomId);
        pcRef.current = pc;
        
        await joinSessionChannel(roomId);
        
        const stream = await setupMedia(type, pc);
        if (!stream) {
            cleanupCall();
            return;
        }

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Ping the receiver
        supabase.channel(`notifications_${receiverId}`).send({
            type: 'broadcast',
            event: 'incoming_call',
            payload: { callerId: currentUserId, roomId, callType: type, offer }
        });
    };

    const acceptCall = async () => {
        if (!callState.roomId || !pendingOfferRef.current || !callState.type || !currentUserId) return;
        
        if (ringtoneRef.current) ringtoneRef.current.pause();

        setCallState(prev => ({ ...prev, status: 'active' }));
        const pc = createPeerConnection(callState.roomId);
        pcRef.current = pc;
        
        await joinSessionChannel(callState.roomId);
        
        await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
        const stream = await setupMedia(callState.type, pc);
        
        if (!stream) {
            endCall();
            return;
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        sessionChannelRef.current.send({
            type: 'broadcast',
            event: 'webrtc_signal',
            payload: { type: 'answer', answer, sender: currentUserId }
        });
    };

    const rejectCall = () => {
        if (ringtoneRef.current) ringtoneRef.current.pause();
        if (callState.roomId && currentUserId) {
            // Tell the caller we rejected
            const tempChannel = supabase.channel(`call_${callState.roomId}`);
            tempChannel.subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    tempChannel.send({
                        type: 'broadcast',
                        event: 'webrtc_signal',
                        payload: { type: 'reject_call', sender: currentUserId }
                    });
                    setTimeout(() => supabase.removeChannel(tempChannel), 500);
                }
            });
        }
        cleanupCall();
    };

    const endCall = () => {
        if (sessionChannelRef.current && currentUserId) {
            sessionChannelRef.current.send({
                type: 'broadcast',
                event: 'webrtc_signal',
                payload: { type: 'end_call', sender: currentUserId }
            });
        }
        cleanupCall();
    };

    const cleanupCall = () => {
        if (ringtoneRef.current) ringtoneRef.current.pause();
        if (dialtoneRef.current) dialtoneRef.current.pause();
        
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        
        if (sessionChannelRef.current) {
            supabase.removeChannel(sessionChannelRef.current);
            sessionChannelRef.current = null;
        }

        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        
        setRemoteStream(null);
        pendingOfferRef.current = null;
        
        setCallState({ status: 'idle', type: null, roomId: null, peerId: null, peerProfile: null, isMuted: false, isVideoOff: false });
    };

    const toggleMute = () => {
        if (localStream) {
            const audioTrack = localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setCallState(prev => ({ ...prev, isMuted: !audioTrack.enabled }));
            }
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setCallState(prev => ({ ...prev, isVideoOff: !videoTrack.enabled }));
            }
        }
    };

    return (
        <CallContext.Provider value={{ startCall, acceptCall, rejectCall, endCall, toggleMute, toggleVideo, callState, localStream, remoteStream }}>
            {children}
            {callState.status !== 'idle' && <GlobalCallOverlay />}
        </CallContext.Provider>
    );
}

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) throw new Error("useCall must be used within CallProvider");
    return context;
};
