'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { Phone, PhoneOff, Mic, MicOff, PhoneIncoming } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useSearchParams } from 'next/navigation'

function VoiceCallContent({ callerId, receiverId }: { callerId: string, receiverId: string }) {
    const [isCalling, setIsCalling] = useState(false)
    const [isReceivingCall, setIsReceivingCall] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    
    const localAudioRef = useRef<HTMLAudioElement>(null)
    const remoteAudioRef = useRef<HTMLAudioElement>(null)
    const ringtoneRef = useRef<HTMLAudioElement>(null)
    const dialtoneRef = useRef<HTMLAudioElement>(null)
    
    const peerConnection = useRef<RTCPeerConnection | null>(null)
    const localStream = useRef<MediaStream | null>(null)
    
    const supabase = createClient()
    const searchParams = useSearchParams()
    const shouldAccept = searchParams.get('accept') === 'true'
    const callType = searchParams.get('type')

    const roomName = `call_${[callerId, receiverId].sort().join('_')}`
    const channel = useRef(supabase.channel(roomName))

    // 🚀 Auto-Answer Logic
    useEffect(() => {
        if (shouldAccept && callType === 'voice' && !isCalling) {
            const timer = setTimeout(() => {
                acceptCall()
            }, 1500)
            return () => clearTimeout(timer)
        }
    }, [shouldAccept, callType])

    useEffect(() => {
        channel.current
            .on('broadcast', { event: 'webrtc_signal' }, async (payload) => {
                const data = payload.payload

                if (data.type === 'offer' && data.sender !== callerId) {
                    setIsReceivingCall(true)
                    if (ringtoneRef.current) ringtoneRef.current.play().catch(e => console.log(e))
                    peerConnection.current = createPeerConnection()
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer))
                }

                if (data.type === 'answer' && data.sender !== callerId) {
                    if (dialtoneRef.current) dialtoneRef.current.pause()
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
                }
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
            if (remoteAudioRef.current) remoteAudioRef.current.srcObject = event.streams[0]
        }

        return pc
    }

    const setupMicrophone = async (pc: RTCPeerConnection) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
            localStream.current = stream
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
        if (ringtoneRef.current) ringtoneRef.current.pause()
        const pc = peerConnection.current || createPeerConnection()
        peerConnection.current = pc
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
        if (ringtoneRef.current) ringtoneRef.current.pause()
        if (dialtoneRef.current) dialtoneRef.current.pause()
        if (peerConnection.current) peerConnection.current.close()
        if (localStream.current) localStream.current.getTracks().forEach(track => track.stop())
        setIsCalling(false)
        setIsReceivingCall(false)
    }

    return (
        <div className="flex items-center">
            <audio ref={remoteAudioRef} autoPlay playsInline className="hidden" />
            <audio ref={ringtoneRef} src="/ringtone.mp3" loop className="hidden" />
            <audio ref={dialtoneRef} src="/dialtone.mp3" loop className="hidden" />

            {isReceivingCall ? (
                <button onClick={acceptCall} className="bg-emerald-500 p-3 rounded-xl text-white animate-pulse"><PhoneIncoming /></button>
            ) : !isCalling ? (
                <button onClick={startCall} className="bg-gray-200 dark:bg-gray-800 p-3 rounded-xl ml-2"><Phone size={20} className="text-emerald-500" /></button>
            ) : (
                <div className="flex gap-2 bg-gray-200 dark:bg-gray-800 p-2 rounded-xl ml-2">
                    <span className="text-xs text-emerald-500 font-bold animate-pulse">On Call</span>
                    <button onClick={endCall} className="bg-red-500 p-2 rounded-lg text-white"><PhoneOff size={16} /></button>
                </div>
            )}
        </div>
    )
}

export default function VoiceCall(props: any) {
    return <Suspense><VoiceCallContent {...props} /></Suspense>
}