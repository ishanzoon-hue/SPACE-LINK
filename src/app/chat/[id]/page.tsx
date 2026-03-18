"use client"

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import EmojiPicker, { Theme } from 'emoji-picker-react'

export default function ChatPage() {
  const params = useParams() 
  const receiverId = params?.id as string
  const supabase = createClient()

  // --- 1. Variables (දත්ත තියාගන්න තැන්) ---
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [receiver, setReceiver] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [uploading, setUploading] = useState(false)

  // --- 2. Refs (අයිතම අල්ලගන්නා "සලකුණු") ---
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // අලුත් මැසේජ් ආවම පල්ලෙහාටම යන විදිහ
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // --- 3. Logic (වැඩ කරන විදිහ) ---
  useEffect(() => {
    if (!receiverId) return;
    
    const fetchUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser(user)
        fetchMessages(user.id, receiverId)
      }
      const { data: receiverData } = await supabase.from('profiles').select('display_name, avatar_url').eq('id', receiverId).single()
      if (receiverData) setReceiver(receiverData)
    }
    fetchUserAndData()

    const channel = supabase.channel('realtime-messages').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new])
      }).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [receiverId])

  const fetchMessages = async (currentUserId: string, friendId: string) => {
    const { data } = await supabase.from('messages').select('*').or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${friendId}),and(sender_id.eq.${receiverId},receiver_id.eq.${currentUserId})`).order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  // ෆොටෝ එකක් Upload කරන විදිහ
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !currentUser) return

    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${currentUser.id}/${fileName}`

    const { error: uploadError } = await supabase.storage.from('chat-images').upload(filePath, file)
    if (uploadError) {
      alert("Upload failed: " + uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage.from('chat-images').getPublicUrl(filePath)

    await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: receiverId,
      content: "",
      image_url: publicUrl,
      is_read: false
    })
    setUploading(false)
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;
    await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: receiverId, 
      content: newMessage,
      is_read: false
    })
    setNewMessage("");
    setShowEmojiPicker(false)
  }

  // --- 4. Visuals (ඇසට පෙනෙන පෙනුම) ---
  return (
    <div className="flex flex-col h-screen bg-[#0f172a] text-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-700 bg-[#1e2738]">
        <Link href="/" className="p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <img src={receiver?.avatar_url || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full border border-gray-600 object-cover" />
        <h1 className="text-xl font-bold">{receiver?.display_name || 'Loading...'}</h1>
      </div>

      {/* Messages ලිස්ට් එක */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUser?.id 
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                {msg.content}
                {msg.image_url && <img src={msg.image_url} alt="sent" className="w-full h-auto rounded-lg mt-1" />}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area (මැසේජ් ටයිප් කරන තැන) */}
      <div className="p-4 bg-[#1e2738] border-t border-gray-700 flex gap-2 items-center relative">
        
        {/* පින්තූර තෝරන බට්න් එක */}
        <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-green-400 p-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </button>
        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

        {/* Emoji බට්න් එක */}
        <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-gray-400 hover:text-yellow-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </button>

        {showEmojiPicker && (
          <div className="absolute bottom-20 left-4 z-50">
           <EmojiPicker onEmojiClick={(d) => setNewMessage(p => p + d.emoji)} theme={Theme.DARK} />
          </div>
        )}

        <input 
          type="text" 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)} 
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()} 
          placeholder={uploading ? "Sending image..." : "Type a message..."} 
          className="flex-1 bg-[#0f172a] text-white rounded-full px-4 py-2 border border-gray-600 focus:outline-none" 
        />
        
        <button onClick={sendMessage} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-500">
          Send
        </button>
      </div>
    </div>
  )
}