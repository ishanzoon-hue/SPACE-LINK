'use client'

import { useEffect, useRef, useState } from 'react'
import { Phone, PhoneOff, Mic, MicOff, PhoneIncoming } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function VoiceCall({ callerId, receiverId }: { callerId: string, receiverId: string }) {
    const [isCalling, setIsCalling] = useState(false)
    const [isReceivingCall, setIsReceivingCall] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    
    const localAudioRef = useRef<HTMLAudioElement>(null)
    const remoteAudioRef = useRef<HTMLAudioElement>(null)
    
    const peerConnection = useRef<RTCPeerConnection | null>(null)
    const localStream = useRef<MediaStream | null>(null)
    
    const supabase = createClient()
    const roomName = `call_${[callerId, receiverId].sort().join('_')}`
    const channel = useRef(supabase.channel(roomName))

    useEffect(() => {
        channel.current
            .on('broadcast', { event: 'webrtc_signal' }, async (payload) => {
                const data = payload.payload

                if (data.type === 'offer' && data.sender !== callerId) {
                    setIsReceivingCall(true)
                    peerConnection.current = createPeerConnection()
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer))
                }

                if (data.type === 'answer' && data.sender !== callerId) {
                    if (peerConnection.current) {
                        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer))
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

        return () => {
            channel.current.unsubscribe()
        }
    }, [])

    const createPeerConnection = () => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        })

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                channel.current.send({
                    type: 'broadcast',
                    event: 'webrtc_signal',
                    payload: { type: 'ice-candidate', candidate: event.candidate, sender: callerId }
                })
            }
        }

        pc.ontrack = (event) => {
            if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = event.streams[0]
            }
        }

        return pc
    }

    const setupMicrophone = async (pc: RTCPeerConnection) => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        localStream.current = stream
        
        if (localAudioRef.current) {
            localAudioRef.current.srcObject = stream
        }

        stream.getTracks().forEach((track) => {
            pc.addTrack(track, stream)
        })
    }

    const startCall = async () => {
        setIsCalling(true)
        const pc = createPeerConnection()
        peerConnection.current = pc

        await setupMicrophone(pc)

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        channel.current.send({
            type: 'broadcast',
            event: 'webrtc_signal',
            payload: { type: 'offer', offer: offer, sender: callerId }
        })
    }

    const acceptCall = async () => {
        setIsReceivingCall(false)
        setIsCalling(true)
        
        if (!peerConnection.current) return
        const pc = peerConnection.current

        await setupMicrophone(pc)

        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        channel.current.send({
            type: 'broadcast',
            event: 'webrtc_signal',
            payload: { type: 'answer', answer: answer, sender: callerId }
        })
    }

    const endCall = () => {
        channel.current.send({
            type: 'broadcast',
            event: 'webrtc_signal',
            payload: { type: 'end_call', sender: callerId }
        })
        cleanupCall()
    }

    const cleanupCall = () => {
        if (peerConnection.current) {
            peerConnection.current.close()
            peerConnection.current = null
        }
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop())
            localStream.current = null
        }
        setIsCalling(false)
        setIsReceivingCall(false)
    }

    const toggleMute = () => {
        if (localStream.current) {
            localStream.current.getAudioTracks()[0].enabled = !isMuted
            setIsMuted(!isMuted)
        }
    }

    return (
        <div className="flex items-center">
            {/* Audios (Hidden) */}
            <audio ref={localAudioRef} autoPlay muted playsInline className="hidden" />
            <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />

            {/* Compact Call UI */}
            {isReceivingCall ? (
                <button 
                    onClick={acceptCall}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-xl text-white font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse"
                >
                    <PhoneIncoming size={18} /> Answer
                </button>
            ) : !isCalling ? (
                <button 
                    onClick={startCall}
                    title="Voice Call"
                    className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 px-4 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center"
                >
                    <Phone size={20} className="text-emerald-500" />
                </button>
            ) : (
                <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 p-1.5 rounded-xl">
                    <span className="px-3 text-xs text-emerald-500 font-bold animate-pulse">On Call</span>
                    <button 
                        onClick={toggleMute}
                        title={isMuted ? "Unmute" : "Mute"}
                        className={`p-2 rounded-lg text-white transition-all ${isMuted ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-400 dark:bg-gray-600 hover:bg-gray-500'}`}
                    >
                        {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>
                    <button 
                        onClick={endCall}
                        title="End Call"
                        className="bg-red-500 hover:bg-red-600 p-2 rounded-lg text-white transition-all"
                    >
                        <PhoneOff size={16} />
                    </button>
                </div>
            )}
        </div>
    )
}