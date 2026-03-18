'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function InboxPage() {
  const [chatUsers, setChatUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchInboxData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // 1. සියලුම මැසේජ් ගේනවා
        const { data: messages } = await supabase
          .from('messages')
          .select('*')
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order('created_at', { ascending: false })

        if (messages && messages.length > 0) {
          const contactIds = new Set()
          const lastMessagesMap = new Map()

          messages.forEach((msg) => {
            const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
            if (!contactIds.has(otherUserId)) {
              contactIds.add(otherUserId)
              lastMessagesMap.set(otherUserId, {
                content: msg.content,
                // පින්තූරයක් නම් "Sent a photo" කියලා පෙන්වනවා
                isImage: !!msg.image_url,
                time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              })
            }
          })

          // 2. ප්‍රොෆයිල් තොරතුරු (display_name, avatar_url) ගේනවා
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, display_name, avatar_url')
            .in('id', Array.from(contactIds))

          if (profiles) {
            const finalInbox = profiles.map(profile => ({
              ...profile,
              ...lastMessagesMap.get(profile.id)
            }))
            setChatUsers(finalInbox)
          }
        }
      }
      setIsLoading(false)
    }

    fetchInboxData()
  }, [])

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-[#0F172A] text-white border-x border-gray-800">
      <div className="p-4 border-b border-gray-800 sticky top-0 bg-[#0F172A]/80 backdrop-blur-md z-10 flex justify-between items-center">
        <h2 className="text-xl font-bold">Messages</h2>
        <div className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-bold">Live</div>
      </div>
      
      {isLoading ? (
        <div className="p-8 text-center text-gray-500 font-medium">Loading conversations...</div>
      ) : chatUsers.length === 0 ? (
        <div className="p-8 text-center h-64 flex flex-col items-center justify-center">
          <p className="text-gray-500">No messages yet. Start a conversation!</p>
          <Link href="/" className="mt-4 text-blue-400 hover:underline">Find friends</Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
          {chatUsers.map((chat) => (
            <Link 
              href={`/chat/${chat.id}`} // 👈 මෙතන /chat/ කියලා තිබුණොත් තමයි අපි හදපු පේජ් එකට යන්නේ
              key={chat.id} 
              className="block hover:bg-gray-900 transition p-4"
            >
              <div className="flex items-center gap-4">
                {/* ප්‍රොෆයිල් පින්තූරය */}
                <div className="relative">
                  <img 
                    src={chat.avatar_url || 'https://via.placeholder.com/56'} 
                    alt="" 
                    className="w-14 h-14 rounded-full object-cover border border-gray-700" 
                  />
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#0F172A] rounded-full"></div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold truncate">
                      {chat.display_name || 'Space Link User'}
                    </h3>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <p className="text-sm truncate text-gray-400">
                    {chat.isImage ? "📷 Photo" : chat.content}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}