'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Phone, PhoneOff, Video } from 'lucide-react'

// Pre-warm AudioContext on first user gesture (mobile browsers block autoplay without this)
let sharedAudioCtx: AudioContext | null = null

function getOrCreateAudioCtx(): AudioContext {
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
        sharedAudioCtx = new AudioContext()
    }
    if (sharedAudioCtx.state === 'suspended') {
        sharedAudioCtx.resume()
    }
    return sharedAudioCtx
}

export default function IncomingCallListener() {
    const supabase = createClient()
    const router = useRouter()

    const [incomingCall, setIncomingCall] = useState<any>(null)
    const [callerProfile, setCallerProfile] = useState<any>(null)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const ringIntervalRef = useRef<any>(null)
    const timeoutRef = useRef<any>(null)

    // Pre-warm AudioContext on ANY user interaction (click/touch/key)
    useEffect(() => {
        const warmUp = () => {
            try {
                getOrCreateAudioCtx()
            } catch (e) { }
        }
        document.addEventListener('click', warmUp, { once: false })
        document.addEventListener('touchstart', warmUp, { once: false })
        document.addEventListener('keydown', warmUp, { once: false })

        return () => {
            document.removeEventListener('click', warmUp)
            document.removeEventListener('touchstart', warmUp)
            document.removeEventListener('keydown', warmUp)
        }
    }, [])

    // Get current user on mount
    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setCurrentUserId(user.id)
        }
        getUser()
    }, [])

    // Listen for incoming calls
    useEffect(() => {
        if (!currentUserId) return

        const channel = supabase
            .channel('incoming-calls')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'calls',
                filter: `receiver_id=eq.${currentUserId}`
            }, async (payload: any) => {
                const call = payload.new
                if (call.status === 'ringing') {
                    setIncomingCall(call)

                    // Fetch caller profile
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('id, display_name, avatar_url')
                        .eq('id', call.caller_id)
                        .single()

                    if (profile) setCallerProfile(profile)

                    // Start ringing
                    startRingtone()
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [currentUserId])

    const audioRef = useRef<HTMLAudioElement | null>(null)

    const startRingtone = () => {
        try {
            if (!audioRef.current) {
                audioRef.current = new Audio('/sounds/ringtone.mp3')
                audioRef.current.loop = true
            }
            
            // Resume if suspended (some browsers)
            audioRef.current.play().catch(e => {
                console.log("Autoplay blocked, waiting for user interaction", e)
            })

            // Auto-dismiss after 30 seconds
            timeoutRef.current = setTimeout(() => {
                cleanup()
            }, 30000)

        } catch (e) {
            console.error("Audio error:", e)
        }
    }

    // Also try to play via vibration on mobile
    useEffect(() => {
        if (incomingCall && navigator.vibrate) {
            // Vibrate pattern: vibrate 500ms, pause 500ms, repeat
            const vibratePattern = [500, 300, 500, 300, 500, 300, 500, 300, 500, 300, 500, 300, 500, 300, 500, 300, 500, 300, 500]
            navigator.vibrate(vibratePattern)
        }
        return () => {
            if (navigator.vibrate) navigator.vibrate(0) // Stop vibration on cleanup
        }
    }, [incomingCall])

    const acceptCall = () => {
        if (!incomingCall) return
        cleanup()
        router.push(`/video-call/${incomingCall.caller_id}`)
    }

    const rejectCall = async () => {
        if (!incomingCall) return

        await supabase
            .from('calls')
            .update({ status: 'rejected' })
            .eq('id', incomingCall.id)

        cleanup()
    }

    const cleanup = () => {
        try {
            if (ringIntervalRef.current) clearInterval(ringIntervalRef.current)
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.currentTime = 0
            }
            ringIntervalRef.current = null
            timeoutRef.current = null
        } catch (e) { }
        if (navigator.vibrate) navigator.vibrate(0)
        setIncomingCall(null)
        setCallerProfile(null)
    }

    if (!incomingCall) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm" style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl w-[340px] overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Top section with gradient */}
                <div className="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 p-8 text-center relative overflow-hidden">
                    {/* Animated rings */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-32 h-32 rounded-full border-2 border-white/20 animate-ping" style={{ animationDuration: '2s' }}></div>
                        <div className="absolute w-40 h-40 rounded-full border-2 border-white/10 animate-ping" style={{ animationDuration: '3s' }}></div>
                    </div>

                    <div className="relative z-10">
                        <div className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white/30 shadow-xl overflow-hidden animate-bounce" style={{ animationDuration: '2s' }}>
                            {callerProfile?.avatar_url ? (
                                <img src={callerProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-white/20 flex items-center justify-center text-3xl font-bold text-white">
                                    {callerProfile?.display_name?.[0] || '?'}
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1 drop-shadow-lg">
                            {callerProfile?.display_name || 'Someone'}
                        </h2>
                        <div className="flex items-center justify-center gap-2 text-white/80">
                            <Video size={16} />
                            <span className="text-sm font-medium animate-pulse">Incoming Video Call...</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 flex items-center justify-center gap-8">
                    <button
                        onClick={rejectCall}
                        className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 group"
                    >
                        <PhoneOff size={28} className="text-white group-hover:rotate-[135deg] transition-transform" />
                    </button>

                    <button
                        onClick={acceptCall}
                        className="w-16 h-16 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 animate-pulse group"
                    >
                        <Phone size={28} className="text-white group-hover:rotate-[135deg] transition-transform" />
                    </button>
                </div>

                <div className="px-6 pb-4 text-center">
                    <p className="text-xs text-gray-400">Call will auto-dismiss in 30s</p>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    )
}
