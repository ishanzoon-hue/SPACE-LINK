'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { Video, VideoOff, PhoneOff, Mic, MicOff } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useSearchParams } from 'next/navigation'

function VideoCallContent({ callerId, receiverId }: { callerId: string, receiverId: string }) {
    const [isCalling, setIsCalling] = useState(false)
    const [isReceivingCall, setIsReceivingCall] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [callActive, setCallActive] = useState(false)
    
    const localVideoRef = useRef<HTMLVideoElement>(null)
    const remoteVideoRef = useRef<HTMLVideoElement>(null)
    const ringtoneRef = useRef<HTMLAudioElement>(null)
    const dialtoneRef = useRef<HTMLAudioElement>(null)
    
    const peerConnection = useRef<RTCPeerConnection | null>(null)
    const localStream = useRef<MediaStream | null>(null)
    
    const supabase = createClient()
    const searchParams = useSearchParams()
    const shouldAccept = searchParams.get('accept') === 'true'
    const callType = searchParams.get('type')

    const roomName = `video_call_${[callerId, receiverId].sort().join('_')}` 
    const channel = useRef(supabase.channel(roomName))

    // 🚀 Auto-Answer Logic
    useEffect(() => {
        if (shouldAccept && callType === 'video' && !callActive && !isCalling) {
            const timer = setTimeout(() => {
                acceptCall()
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [shouldAccept, callType])

    useEffect(() => {
        channel.current
            .on('broadcast', { event: 'webrtc_video_signal' }, async (payload) => {
                const data = payload.payload

                if (data.type === 'offer' && data.sender !== callerId) {
                    setIsReceivingCall(true)
                    if (ringtoneRef.current) {
                        ringtoneRef.current.currentTime = 0
                        ringtoneRef.current.play().catch(e => console.log(e))
                    }
                    peerConnection.current = createPeerConnection()
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer))
                }

                if (data.type === 'answer' && data.sender !== callerId) {
                    if (dialtoneRef.current) dialtoneRef.current.pause()
                    if (peerConnection.current) {
                        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer))
                        setCallActive(true)
                    }
                }

                if (data.type === 'ice-candidate' && data.sender !== callerId) {
                    if (peerConnection.current) {
                        await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate))
                    }
                }

                if (data.type === 'end_call' && data.sender !== callerId) {
                    cleanupCall()
                }
            })
            .subscribe()

        return () => { channel.current.unsubscribe() }
    }, [])

    const createPeerConnection = () => {
        const pc = new RTCPeerConnection({
            iceServers: [
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
                },
                {
                    urls: "turns:global.metered.ca:443",
                    username: "635e95878dc1f8ed4c754e23",
                    credential: "svzy/u1LcpBxx1Zd",
                }
            ]
        })
        
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                channel.current.send({
                    type: 'broadcast',
                    event: 'webrtc_video_signal',
                    payload: { type: 'ice-candidate', candidate: event.candidate, sender: callerId }
                })
            }
        }
        
        pc.ontrack = (event) => {
            if (remoteVideoRef.current && event.streams && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0]
                remoteVideoRef.current.onloadedmetadata = () => {
                    remoteVideoRef.current?.play().catch(e => console.error("Play error:", e));
                };
            }
        };
        
        return pc
    }

    const setupMedia = async (pc: RTCPeerConnection) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            localStream.current = stream
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream
                localVideoRef.current.play().catch(e => console.error(e))
            }
            stream.getTracks().forEach((track) => pc.addTrack(track, stream))
        } catch (error) {
            console.error(error)
        }
    }

    const startCall = async () => {
        setIsCalling(true)
        if (dialtoneRef.current) dialtoneRef.current.play().catch(e => console.log(e))
        const pc = createPeerConnection()
        peerConnection.current = pc
        await setupMedia(pc)
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        channel.current.send({
            type: 'broadcast',
            event: 'webrtc_video_signal',
            payload: { type: 'offer', offer: offer, sender: callerId }
        })
    }

    const acceptCall = async () => {
        setIsReceivingCall(false)
        setIsCalling(true)
        setCallActive(true)
        if (ringtoneRef.current) ringtoneRef.current.pause()
        
        const pc = peerConnection.current || createPeerConnection()
        peerConnection.current = pc
        await setupMedia(pc)
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        channel.current.send({
            type: 'broadcast',
            event: 'webrtc_video_signal',
            payload: { type: 'answer', answer: answer, sender: callerId }
        })
    }

    const endCall = () => {
        channel.current.send({
            type: 'broadcast',
            event: 'webrtc_video_signal',
            payload: { type: 'end_call', sender: callerId }
        })
        cleanupCall()
    }

    const cleanupCall = () => {
        if (ringtoneRef.current) ringtoneRef.current.pause()
        if (dialtoneRef.current) dialtoneRef.current.pause()
        if (peerConnection.current) peerConnection.current.close()
        if (localStream.current) localStream.current.getTracks().forEach(track => track.stop())
        setIsCalling(false)
        setIsReceivingCall(false)
        setCallActive(false)
    }

    const toggleMute = () => {
        if (localStream.current) {
            localStream.current.getAudioTracks()[0].enabled = !isMuted
            setIsMuted(!isMuted)
        }
    }

    const toggleVideo = () => {
        if (localStream.current) {
            localStream.current.getVideoTracks()[0].enabled = !isVideoOff
            setIsVideoOff(!isVideoOff)
        }
    }

    return (
        <div className="flex items-center">
            <audio ref={ringtoneRef} src="/ringtone.mp3" loop className="hidden" />
            <audio ref={dialtoneRef} src="/dialtone.mp3" loop className="hidden" />

            {!isCalling && !isReceivingCall && (
                <button onClick={startCall} className="bg-gray-200 dark:bg-gray-800 p-3 rounded-xl ml-2">
                    <Video size={20} className="text-blue-500" />
                </button>
            )}

            {isReceivingCall && (
                <button onClick={acceptCall} className="bg-blue-500 p-3 rounded-xl text-white ml-2 animate-pulse">
                    Answer Video
                </button>
            )}

            {isCalling && (
                <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <video ref={localVideoRef} autoPlay muted playsInline className={`absolute bottom-28 right-6 w-32 h-48 bg-gray-800 rounded-2xl object-cover border-2 border-white/20 ${isVideoOff ? 'opacity-0' : 'opacity-100'}`} style={{ transform: 'scaleX(-1)' }} />
                    
                    {!callActive && <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white font-bold">CALLING...</div>}

                    <div className="absolute bottom-8 flex gap-6 bg-gray-900/80 p-4 rounded-full">
                        <button onClick={toggleMute} className="p-4 bg-gray-700 rounded-full text-white">{isMuted ? <MicOff /> : <Mic />}</button>
                        <button onClick={endCall} className="p-4 bg-red-500 rounded-full text-white"><PhoneOff /></button>
                        <button onClick={toggleVideo} className="p-4 bg-gray-700 rounded-full text-white">{isVideoOff ? <VideoOff /> : <Video />}</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function VideoCall(props: any) {
    return <Suspense><VideoCallContent {...props} /></Suspense>
}