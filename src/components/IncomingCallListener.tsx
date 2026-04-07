'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Phone, PhoneOff, Video } from 'lucide-react'

export default function IncomingCallListener() {
    const supabase = createClient()
    const router = useRouter()

    const [incomingCall, setIncomingCall] = useState<any>(null)
    const [callerProfile, setCallerProfile] = useState<any>(null)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const timeoutRef = useRef<any>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Get current user
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setCurrentUserId(user.id)
        }
        getUser()
    }, [])

    // 🔔 Listen for calls (Broadcast method)
    useEffect(() => {
        if (!currentUserId) return

        const channel = supabase.channel(`notifications_${currentUserId}`)
            .on('broadcast', { event: 'webrtc_signal' }, async (payload) => {
                if (payload.payload.type === 'offer') {
                    handleIncomingSignal(payload.payload, 'voice')
                }
            })
            .on('broadcast', { event: 'webrtc_video_signal' }, async (payload) => {
                if (payload.payload.type === 'offer') {
                    handleIncomingSignal(payload.payload, 'video')
                }
            })
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [currentUserId])

    const handleIncomingSignal = async (data: any, type: string) => {
        setIncomingCall({ ...data, callType: type })
        
        // Fetch caller profile ලස්සනට පේන්න
        const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', data.sender)
            .single()
        
        if (profile) setCallerProfile(profile)
        startRingtone()
    }

    const startRingtone = () => {
        if (!audioRef.current) {
            audioRef.current = new Audio('/ringtone.mp3')
            audioRef.current.loop = true
        }
        audioRef.current.play().catch(e => console.log("Autoplay blocked"))

        // Vibration for mobile
        if (navigator.vibrate) navigator.vibrate([500, 300, 500, 300, 500])

        // Auto-dismiss after 30s
        timeoutRef.current = setTimeout(() => cleanup(), 30000)
    }

    const acceptCall = () => {
        const type = incomingCall.callType
        const senderId = incomingCall.sender
        cleanup()
        // ✅ Answer කරපු ගමන් අදාළ ප්‍රොෆයිල් එකට යනවා
        router.push(`/profile/${senderId}?accept=true&type=${type}`)
    }

    const rejectCall = () => {
        cleanup()
    }

    const cleanup = () => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        if (navigator.vibrate) navigator.vibrate(0)
        setIncomingCall(null)
    }

    if (!incomingCall) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#1E293B] rounded-[40px] shadow-2xl w-[340px] overflow-hidden border border-emerald-500/20">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-10 text-center relative">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <div className="w-40 h-40 rounded-full border-2 border-white animate-ping"></div>
                    </div>

                    <div className="relative z-10">
                        <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white/30 shadow-xl overflow-hidden animate-bounce">
                             {callerProfile?.avatar_url ? (
                                <img src={callerProfile.avatar_url} className="w-full h-full object-cover" />
                             ) : (
                                <div className="w-full h-full bg-emerald-400 flex items-center justify-center text-3xl font-bold text-white">
                                    {callerProfile?.display_name?.[0] || '?'}
                                </div>
                             )}
                        </div>
                        <h2 className="text-xl font-black text-white mb-1 uppercase tracking-tight">
                            {callerProfile?.display_name || 'Incoming Call'}
                        </h2>
                        <p className="text-white/80 text-xs font-bold animate-pulse uppercase tracking-widest">
                            Incoming {incomingCall.callType} Call...
                        </p>
                    </div>
                </div>

                <div className="p-8 flex items-center justify-center gap-10">
                    <button onClick={rejectCall} className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95">
                        <PhoneOff size={28} className="text-white" />
                    </button>
                    <button onClick={acceptCall} className="w-16 h-16 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 animate-pulse">
                        <Phone size={28} className="text-white" />
                    </button>
                </div>
            </div>
        </div>
    )
}