'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, PhoneOff, Video } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function IncomingCallHandler({ currentUserId }: { currentUserId: string }) {
    const [incomingCall, setIncomingCall] = useState<any>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        // 1. තමන්ගේ ID එකට එන කෝල් මැසේජ් වලට සවන් දීම (Listen)
        const channel = supabase.channel(`call_${currentUserId}`)

        channel
            .on('broadcast', { event: 'incoming-call' }, (payload) => {
                console.log("Incoming call received!", payload)
                setIncomingCall(payload.payload)
                
                // 2. රිංගින් සවුන්ඩ් එක ප්ලේ කිරීම
                if (audioRef.current) {
                    audioRef.current.play().catch(err => console.log("Audio play failed:", err))
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [currentUserId, supabase])

    // කෝල් එක Accept කිරීම
    const acceptCall = () => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }
        // කෝල් එක ආපු Room එකට යෑම
        router.push(`/video-call/${incomingCall.roomId}`)
        setIncomingCall(null)
    }

    // කෝල් එක Decline කිරීම
    const declineCall = () => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }
        setIncomingCall(null)
    }

    if (!incomingCall) return (
        // සවුන්ඩ් එක ලෝඩ් කර තබා ගැනීමට (නමුත් පෙනෙන්නට නැත)
        <audio ref={audioRef} src="/ringtone.mp3" loop />
    )

    return (
        <div className="fixed top-5 right-5 z-[999] animate-in fade-in slide-in-from-top-4 duration-300">
            {/* රිංග්ටෝන් එක */}
            <audio ref={audioRef} src="/ringtone.mp3" loop autoPlay />

            <div className="bg-white dark:bg-[#1E293B] shadow-2xl border-2 border-green-500 p-5 rounded-2xl w-80 shadow-green-500/20">
                <div className="flex flex-col items-center text-center">
                    {/* Caller Avatar */}
                    <div className="relative mb-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 p-1 animate-pulse">
                            <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 overflow-hidden flex items-center justify-center">
                                {incomingCall.callerAvatar ? (
                                    <img src={incomingCall.callerAvatar} alt="caller" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl font-bold text-gray-400">{incomingCall.callerName[0]}</span>
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-green-500 p-2 rounded-full border-4 border-white dark:border-[#1E293B]">
                            <Video className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                        {incomingCall.callerName}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                        Incoming Video Call...
                    </p>
                    
                    {/* Buttons */}
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={declineCall}
                            className="flex-1 flex items-center justify-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 py-3 rounded-xl font-bold transition-all"
                        >
                            <PhoneOff className="w-5 h-5" /> Decline
                        </button>
                        <button 
                            onClick={acceptCall}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-green-500/30 transition-all"
                        >
                            <Phone className="w-5 h-5" /> Accept
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}