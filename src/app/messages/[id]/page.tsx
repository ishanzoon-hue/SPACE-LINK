'use client'

import { useEffect, useState, use } from 'react'
import { createClient } from '@/utils/supabase/client'
// 1. Link import එක එකතු කළා
import Link from 'next/link'

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: receiverId } = use(params)
  
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
        
        const { data } = await supabase
          .from('messages')
          .select('*')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverId}),and(sender_id.eq.${receiverId},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: true })

        if (data) setMessages(data)
      }
    }

    fetchUserAndMessages()

    const channel = supabase
      .channel('realtime messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const newMsg = payload.new
        setMessages((prev) => [...prev, newMsg])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [receiverId, supabase])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUserId || isSending) return

    setIsSending(true)

    try {
      const { error } = await supabase.from('messages').insert({
        sender_id: currentUserId,
        receiver_id: receiverId,
        content: newMessage
      })

      if (error) {
        alert("Database Error: " + error.message)
        console.error(error)
      } else {
        setNewMessage('')
      }
    } catch (err) {
      console.error("Error sending message:", err)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-2xl mx-auto border-x border-gray-200 dark:border-gray-800">
      {/* Header කොටසට Video Call Button එක එකතු කළා */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F172A] sticky top-0 z-10 shadow-sm flex justify-between items-center">
        <h2 className="text-lg font-bold text-spl-black dark:text-white">Chat</h2>
        
        <Link 
          href={`/video-call/${receiverId}`} 
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-spl-blue flex items-center gap-2 group"
          title="Start Video Call"
        >
          <span className="text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">Video Call</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </Link>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2 rounded-2xl shadow-sm ${
              msg.sender_id === currentUserId 
                ? 'bg-spl-blue text-white rounded-br-sm' 
                : 'bg-white dark:bg-gray-800 text-spl-black dark:text-white border border-gray-100 dark:border-gray-700 rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-[#0F172A] border-t border-gray-200 dark:border-gray-800 flex gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={isSending}
          className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-spl-blue/50 dark:bg-gray-800 dark:text-white disabled:opacity-50"
          placeholder="Type a message..."
        />
        <button type="submit" disabled={isSending} className="px-6 py-2.5 bg-spl-blue text-white rounded-full font-semibold hover:bg-blue-600 transition shadow-sm disabled:opacity-50">
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}