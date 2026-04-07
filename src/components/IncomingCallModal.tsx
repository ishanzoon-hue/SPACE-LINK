'use client'

import { useEffect, useState, useRef } from 'react'
import { Phone, Video, PhoneOff, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function IncomingCallHandler({ currentUserId }: { currentUserId: string }) {
    const [incomingCall, setIncomingCall] = useState<any>(null)
    const ringtoneRef = useRef<HTMLAudioElement>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        // 🔔 යූසර්ට එන හැම කෝල් එකක්ම අහගෙන ඉන්න චැනල් එක
        const channel = supabase.channel(`notifications_${currentUserId}`)
            .on('broadcast', { event: 'webrtc_signal' }, (payload) => {
                if (payload.payload.type === 'offer') {
                    setIncomingCall({ ...payload.payload, callType: 'voice' })
                    playRingtone()
                }
            })
            .on('broadcast', { event: 'webrtc_video_signal' }, (payload) => {
                if (payload.payload.type === 'offer') {
                    setIncomingCall({ ...payload.payload, callType: 'video' })
                    playRingtone()
                }
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [currentUserId])

    const playRingtone = () => {
        if (ringtoneRef.current) {
            ringtoneRef.current.currentTime = 0
            ringtoneRef.current.play().catch(e => console.log("Autoplay blocked", e))
        }
    }

    const stopRingtone = () => {
        if (ringtoneRef.current) ringtoneRef.current.pause()
    }

    const handleAnswer = () => {
        stopRingtone()
        // ✅ Answer කරපු ගමන් කෙලින්ම කෝල් එක ගත්ත කෙනාගේ ප්‍රොෆයිල් එකට යනවා
        router.push(`/profile/${incomingCall.sender}?answer=true&type=${incomingCall.callType}`)
        setIncomingCall(null)
    }

    const handleDecline = () => {
        stopRingtone()
        setIncomingCall(null)
        // මෙතනදී කැමති නම් 'end_call' සිග්නල් එකක් යවන්න පුළුවන්
    }

    if (!incomingCall) return <audio ref={ringtoneRef} src="/ringtone.mp3" loop className="hidden" />

    return (
        <div className="fixed inset-x-0 top-10 z-[999] flex justify-center px-4 animate-in slide-in-from-top duration-500">
            <audio ref={ringtoneRef} src="/ringtone.mp3" loop className="hidden" />
            
            <div className="bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] rounded-3xl p-6 w-full max-w-md flex items-center justify-between backdrop-blur-xl bg-opacity-90">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center animate-bounce">
                        {incomingCall.callType === 'video' ? <Video className="text-emerald-500" size={30} /> : <Phone className="text-emerald-500" size={30} />}
                    </div>
                    <div>
                        <h3 className="font-black text-lg text-gray-900 dark:text-white">Incoming {incomingCall.callType} Call</h3>
                        <p className="text-gray-500 text-sm font-medium">Wants to connect with you...</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={handleDecline} className="p-4 bg-red-500 hover:bg-red-600 rounded-full text-white transition-transform hover:scale-110 shadow-lg shadow-red-500/20">
                        <PhoneOff size={24} />
                    </button>
                    <button onClick={handleAnswer} className="p-4 bg-emerald-500 hover:bg-emerald-600 rounded-full text-white transition-transform hover:scale-110 shadow-lg shadow-emerald-500/20 animate-pulse">
                        <Phone size={24} />
                    </button>
                </div>
            </div>
        </div>
    )
}