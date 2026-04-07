"use client"

import { useEffect, useState, useRef, useCallback, use } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import EmojiPicker, { Theme } from 'emoji-picker-react'
import InboxSidebar from '@/components/InboxSidebar'
import { Video, Image as ImageIcon, Smile, Send, ChevronLeft, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { useCall } from '@/context/CallContext'
import imageCompression from 'browser-image-compression'

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const receiverId = resolvedParams.id
  const router = useRouter()
  const supabase = createClient()
  const { startCall } = useCall()

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [receiver, setReceiver] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isInitializing, setIsInitializing] = useState(true)

  // Use ref to avoid stale closure in realtime subscription
  const currentUserRef = useRef<any>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Step 1: Auth & profile fetch 
  useEffect(() => {
    if (!receiverId) return;

    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUser(user)
        currentUserRef.current = user
        fetchMessages(user.id, receiverId)

        // Mark as read
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('receiver_id', user.id)
          .eq('sender_id', receiverId)
          .eq('is_read', false)
      }
      const { data: recData } = await supabase.from('profiles').select('*').eq('id', receiverId).single()
      if (recData) setReceiver(recData)
      setIsInitializing(false)
    }
    fetchData()
  }, [receiverId])

  // Step 2: Realtime subscription — separate effect, uses ref so closure never stale
  useEffect(() => {
    if (!receiverId) return;

    const channel = supabase
      .channel(`chat-${receiverId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload: any) => {
        const msg = payload.new
        const userId = currentUserRef.current?.id
        if (!userId) return

        // Only accept messages that belong to this conversation
        const isRelevant =
          (msg.sender_id === userId && msg.receiver_id === receiverId) ||
          (msg.sender_id === receiverId && msg.receiver_id === userId)

        if (isRelevant) {
          setMessages((prev) => {
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [receiverId])

  const fetchMessages = async (currentUserId: string, friendId: string) => {
    const { data } = await supabase.from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  const startVideoCall = async () => {
    if (!currentUser || !receiverId) return
    startCall(receiverId, 'video')
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !currentUser) return

    setUploading(true)

    let finalFile = file;
    try {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true }
        finalFile = await imageCompression(file, options)
    } catch (e) {
        console.error("Compression isolated error:", e)
    }

    const fileExt = finalFile.name.split('.').pop() || 'jpg'
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${currentUser.id}/${fileName}`

    const { error: uploadError } = await supabase.storage.from('chat-images').upload(filePath, finalFile)
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

    // Reset file input so the same file can be sent again
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    const content = newMessage;
    setNewMessage(""); // Optimistic clear
    setShowEmojiPicker(false)

    await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: receiverId,
      content: content,
      is_read: false
    })

    // Subtly trigger Push Notification in background
    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        receiverId: receiverId,
        title: `New message from ${currentUser.user_metadata?.display_name || 'a friend'}`,
        body: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        url: `/chat/${currentUser.id}`
      })
    }).catch(e => console.error(e))
  }

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-gray-50 dark:bg-[#020817] container max-w-7xl mx-auto px-0 md:px-4">

      {/* Inbox Sidebar - Hidden on mobile, fixed width on desktop */}
      <div className="hidden md:block md:w-[350px] shrink-0 h-full border-x md:border-l-0 border-gray-200 dark:border-gray-800">
        <InboxSidebar currentUserId={currentUser?.id} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0F172A] border-r border-gray-200 dark:border-gray-800 relative z-10 w-full">

        {/* Header */}
        <div className="px-3 sm:px-6 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-[#0F172A] z-20 shrink-0 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/messages" className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <ChevronLeft size={24} />
            </Link>

            <div className="relative shrink-0">
              <img src={receiver?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80'} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-100 dark:border-gray-700 object-cover" />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#0F172A] rounded-full"></div>
            </div>

            <div>
              <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-tight">
                {isInitializing ? 'Loading...' : (receiver?.display_name || 'Space Explorer')}
              </h1>
              <p className="text-xs text-emerald-500 font-semibold">Active now</p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button onClick={startVideoCall} className="p-2.5 sm:p-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full transition-all group relative">
              <Video size={20} className="group-hover:scale-110 transition-transform" />
              <span className="absolute top-2.5 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-75"></span>
              <span className="absolute top-2.5 right-2 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 bg-gray-50/30 dark:bg-transparent">
          <div className="text-center my-6">
            <div className="inline-block w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/20 mb-3 overflow-hidden border-4 border-white dark:border-[#0F172A] shadow-sm">
              <img src={receiver?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80'} className="w-full h-full rounded-full object-cover" />
            </div>
            <h3 className="font-bold text-gray-800 dark:text-gray-200">Say hi to {receiver?.display_name}!</h3>
            <p className="text-xs text-gray-500 mt-1">Chat securely on the Space Link network</p>
          </div>

          {messages.map((msg, idx) => {
            const isMe = msg.sender_id === currentUser?.id
            const isLastInGroup = idx === messages.length - 1 || messages[idx + 1]?.sender_id !== msg.sender_id;

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && isLastInGroup && (
                  <img src={receiver?.avatar_url} className="w-7 h-7 rounded-full mr-2 self-end mb-1 shrink-0" />
                )}
                {!isMe && !isLastInGroup && <div className="w-9 shrink-0"></div>}

                <div className={`max-w-[75%] sm:max-w-[60%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2.5 shadow-sm text-[15px] leading-relaxed 
                    ${isMe
                      ? `bg-emerald-500 text-white rounded-[20px] ${isLastInGroup ? 'rounded-br-sm' : ''}`
                      : `bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700/50 rounded-[20px] ${isLastInGroup ? 'rounded-bl-sm' : ''}`
                    }`}>
                    {msg.content}
                    {msg.image_url && <img src={msg.image_url} alt="sent image" className="max-w-full h-auto rounded-xl mt-1.5 object-cover max-h-[300px]" />}
                  </div>
                  {isLastInGroup && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 px-1">
                      {(() => { try { return format(new Date(msg.created_at), 'h:mm a') } catch { return '' } })()}
                      {isMe && msg.is_read ? ' • Read' : ''}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} className="h-4" />
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-white dark:bg-[#0F172A] border-t border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex gap-2 items-end relative max-w-4xl mx-auto">

            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />

            <div className="flex gap-1 mb-1">
              <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-full transition-colors shrink-0">
                <ImageIcon size={22} />
              </button>
            </div>

            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-end px-3 py-1 shadow-inner border border-transparent focus-within:border-emerald-500/30 transition-all">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={uploading ? "Sending image..." : "Type a message..."}
                className="w-full bg-transparent text-gray-900 dark:text-white px-2 py-2.5 max-h-32 focus:outline-none resize-none min-h-[44px] text-[15px]"
                rows={1}
              />
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 mb-0.5 text-gray-400 hover:text-yellow-500 transition-colors shrink-0 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <Smile size={20} />
              </button>
            </div>

            {showEmojiPicker && (
              <div className="absolute bottom-16 right-16 sm:right-auto sm:left-4 z-[100] shadow-2xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                <EmojiPicker onEmojiClick={(d) => setNewMessage(p => p + d.emoji)} theme={Theme.AUTO} />
              </div>
            )}

            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() && !uploading}
              className={`p-3.5 rounded-full shrink-0 mb-0.5 transition-all shadow-md ${newMessage.trim() || uploading
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white hover:-translate-y-0.5'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                }`}
            >
              {uploading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}