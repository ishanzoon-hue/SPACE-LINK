'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function IncomingCall() {
  const [call, setCall] = useState<any>(null)
  const [caller, setCaller] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()
  
  // 🔊 රින්ග්ටෝන් එක පාලනය කරන්න Ref එකක් පාවිච්චි කරනවා
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // 1. පේජ් එක ලෝඩ් වෙද්දීම රින්ග්ටෝන් ෆයිල් එක ලෝඩ් කරගන්නවා
    audioRef.current = new Audio('/sounds/ringtone.mp3')
    audioRef.current.loop = true // කෝල් එක ගන්නකම් දිගටම ප්ලේ වෙන්න

    const listenForCalls = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 2. Realtime Listener එක: අලුත් කෝල් එකක් එනවාද බලනවා
      const channel = supabase
        .channel('incoming-calls')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'calls',
            filter: `receiver_id=eq.${user.id}` 
        }, async (payload) => {
          // කෝල් එක එවපු කෙනාගේ විස්තර ගන්නවා
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.caller_id)
            .single()
          
          setCaller(profile)
          setCall(payload.new)

          // 🔊 කෝල් එකක් ආපු ගමන් සද්දේ ප්ලේ කරනවා
          audioRef.current?.play().catch(e => console.log("Audio play failed (needs user interaction):", e))
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }
    listenForCalls()
  }, [])

  // 🔇 සද්දේ නතර කරන Function එක
  const stopRingtone = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }

  if (!call) return null

  return (
    <div className="fixed inset-0 bg-[#0f172a]/95 z-[9999] flex flex-col items-center justify-center text-white">
      {/* ප්‍රොෆයිල් පින්තූරය ඇනිමේෂන් එකක් එක්ක */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
        <img 
          src={caller?.avatar_url || 'https://via.placeholder.com/150'} 
          className="w-32 h-32 rounded-full border-4 border-green-500 object-cover relative z-10" 
        />
      </div>

      <h2 className="text-3xl font-bold mb-2">{caller?.display_name || "Space Link User"}</h2>
      <p className="text-green-400 text-lg font-medium tracking-widest animate-pulse">INCOMING VIDEO CALL...</p>
      
      <div className="flex gap-12 mt-16">
        {/* Decline Button (ප්‍රතික්ෂේප කිරීම) */}
        <button 
          onClick={() => {
            stopRingtone() // 🔊 සද්දේ නතර කරනවා
            setCall(null)
          }} 
          className="group flex flex-col items-center gap-3"
        >
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-all shadow-lg shadow-red-900/40 active:scale-90">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79a15.15 15.15 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.72 11.72 0 003.7.59 1 1 0 011 1V20a1 1 0 01-1 1A15 15 0 013 6a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.7 1 1 0 01-.27 1.11l-2.2 2.2z"/></svg>
          </div>
          <span className="text-sm font-bold text-gray-400">Decline</span>
        </button>

        {/* Accept Button (පිළිගැනීම) */}
        <button 
          onClick={() => {
            stopRingtone() // 🔊 සද්දේ නතර කරනවා
            router.push(`/video-call/${call.caller_id}`);
            setCall(null);
          }} 
          className="group flex flex-col items-center gap-3"
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition-all shadow-lg shadow-green-900/40 animate-bounce active:scale-90">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M21 6.5L17 10.5V7c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h11c.55 0 1-.45 1-1v-3.5l4 4V6.5z"/></svg>
          </div>
          <span className="text-sm font-bold text-gray-400">Accept</span>
        </button>
      </div>
    </div>
  )
}