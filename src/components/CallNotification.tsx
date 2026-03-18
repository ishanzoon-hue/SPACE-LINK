'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function CallNotification() {
  const [incomingCall, setIncomingCall] = useState<any>(null)
  const [callerName, setCallerName] = useState("")
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const listen = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // කෝල් එකක් එනවාද කියලා බලන් ඉන්නවා
      supabase.channel('calls')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'calls', 
          filter: `receiver_id=eq.${user.id}` 
        }, async (payload) => {
          const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', payload.new.caller_id).single()
          setCallerName(profile?.display_name || "Someone")
          setIncomingCall(payload.new)
        }).subscribe()
    }
    listen()
  }, [])

  if (!incomingCall) return null

  return (
    <div className="fixed inset-0 bg-black/90 z-[999] flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="w-24 h-24 bg-green-500 rounded-full mb-4 animate-pulse flex items-center justify-center">
         <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
      </div>
      <h2 className="text-2xl font-bold mb-1">{callerName} Is Calling...</h2>
      <p className="text-gray-400 mb-8 font-medium">Video Call Incoming</p>
      
      <div className="flex gap-6 w-full max-w-xs">
        <button onClick={() => setIncomingCall(null)} className="flex-1 bg-red-600 py-4 rounded-full font-bold">Decline</button>
        <button onClick={() => {
            router.push(`/video-call/${incomingCall.caller_id}`);
            setIncomingCall(null);
        }} className="flex-1 bg-green-600 py-4 rounded-full font-bold">Accept</button>
      </div>
    </div>
  )
}