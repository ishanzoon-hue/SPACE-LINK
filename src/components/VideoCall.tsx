'use client'

import { useEffect, useRef, useState } from 'react'
import { Video, VideoOff, PhoneOff, Mic, MicOff } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function VideoCall({ callerId, receiverId }: { callerId: string, receiverId: string }) {
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
    const roomName = `video_call_${[callerId, receiverId].sort().join('_')}` 
    const channel = useRef(supabase.channel(roomName))

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
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }]
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
        
        // 🚀 වෙනස මෙතනයි: Remote Video එක ආවම හරියටම ප්ලේ වෙන්න හදලා තියෙන්නේ
        pc.ontrack = (event) => {
            if (remoteVideoRef.current && event.streams && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0]
                // සමහර බ්‍රව්සර් වලට play() එක explicitly කෝල් කරන්න ඕනේ
                remoteVideoRef.current.play().catch(e => console.error("Error playing remote video:", e))
            }
        }
        
        return pc
    }

    const setupMedia = async (pc: RTCPeerConnection) => {
        try {
            // 🚀 කැමරාව සහ මයික් එක ඉල්ලනවා
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            localStream.current = stream
            
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream
                // අපේ කැමරාවත් හරියටම ප්ලේ වෙන්න
                localVideoRef.current.play().catch(e => console.error("Error playing local video:", e))
            }
            
            stream.getTracks().forEach((track) => pc.addTrack(track, stream))
        } catch (error) {
            console.error("Error accessing camera/mic:", error)
            alert("කැමරාවට හෝ මයික් එකට permission දෙන්න!")
        }
    }

    const startCall = async () => {
        setIsCalling(true)
        if (dialtoneRef.current) {
            dialtoneRef.current.currentTime = 0
            dialtoneRef.current.play().catch(e => console.log(e))
        }
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
        
        if (!peerConnection.current) return
        const pc = peerConnection.current
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
        if (peerConnection.current) {
            peerConnection.current.close()
            peerConnection.current = null
        }
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop())
            localStream.current = null
        }
        
        // 🚀 වීඩියෝ ටැග් වල තියෙන stream එක අයින් කරනවා
        if (localVideoRef.current) localVideoRef.current.srcObject = null
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null

        setIsCalling(false)
        setIsReceivingCall(false)
        setCallActive(false)
        setIsMuted(false)
        setIsVideoOff(false)
    }

    const toggleMute = () => {
        if (localStream.current) {
            const audioTrack = localStream.current.getAudioTracks()[0]
            if (audioTrack) {
                audioTrack.enabled = !isMuted
                setIsMuted(!isMuted)
            }
        }
    }

    const toggleVideo = () => {
        if (localStream.current) {
            const videoTrack = localStream.current.getVideoTracks()[0]
            if (videoTrack) {
                videoTrack.enabled = !isVideoOff
                setIsVideoOff(!isVideoOff)
            }
        }
    }

    return (
        <div className="flex items-center">
            <audio ref={ringtoneRef} src="/ringtone.mp3" loop className="hidden" />
            <audio ref={dialtoneRef} src="/dialtone.mp3" loop className="hidden" />

            {!isCalling && !isReceivingCall && (
                <button 
                    onClick={startCall}
                    title="Video Call"
                    className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 px-4 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center ml-2"
                >
                    <Video size={20} className="text-blue-500" />
                </button>
            )}

            {isReceivingCall && (
                <button 
                    onClick={acceptCall}
                    className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl text-white font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse ml-2"
                >
                    <Video size={18} /> Answer Video
                </button>
            )}

            {isCalling && (
                <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
                    
                    {/* අනිත් කෙනාගේ වීඩියෝ එක */}
                    <video 
                        ref={remoteVideoRef} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover"
                    />

                    {/* අපේ වීඩියෝ එක (කැඩපතක් වගේ පේන්න transform: scaleX(-1) දාලා තියෙනවා) */}
                    <video 
                        ref={localVideoRef} 
                        autoPlay 
                        muted 
                        playsInline 
                        className={`absolute bottom-28 right-6 w-32 h-48 md:w-48 md:h-64 bg-gray-800 rounded-2xl object-cover border-2 border-white/20 shadow-2xl transition-all ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}
                        style={{ transform: 'scaleX(-1)' }} 
                    />

                    {!callActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-10">
                            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center animate-pulse mb-4">
                                <Video size={40} className="text-blue-400" />
                            </div>
                            <h2 className="text-white text-2xl font-bold tracking-widest">CALLING...</h2>
                        </div>
                    )}

                    {/* Control බටන් ටික */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-gray-900/80 px-8 py-4 rounded-full border border-white/10 backdrop-blur-md shadow-2xl z-20">
                        <button 
                            onClick={toggleMute}
                            className={`p-4 rounded-full text-white transition-all ${isMuted ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                        </button>

                        <button 
                            onClick={endCall}
                            className="bg-red-500 hover:bg-red-600 p-5 rounded-full text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.5)] transform hover:scale-110"
                        >
                            <PhoneOff size={28} />
                        </button>

                        <button 
                            onClick={toggleVideo}
                            className={`p-4 rounded-full text-white transition-all ${isVideoOff ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}