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
        // 1. ඔයාගේ සියලුම මැසේජ් ගේන්න
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
                time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              })
            }
          })

          // 2. ඒ අදාළ අයගේ ප්‍රොෆයිල් තොරතුරු (නම, පින්තූරය) ගේන්න
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
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
    <div className="max-w-2xl mx-auto border-x border-gray-200 dark:border-gray-800 min-h-[calc(100vh-80px)] bg-white dark:bg-[#0F172A]">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-[#0F172A] z-10 flex justify-between items-center">
        <h2 className="text-xl font-bold text-spl-black dark:text-white">Inbox</h2>
        <div className="text-xs bg-spl-blue/10 text-spl-blue px-2 py-1 rounded-full font-bold">Live</div>
      </div>
      
      {isLoading ? (
        <div className="p-8 text-center text-gray-500 font-medium">Loading inbox...</div>
      ) : chatUsers.length === 0 ? (
        <div className="p-8 text-center h-64 flex flex-col items-center justify-center">
          <p className="text-gray-500">තාම මැසේජ් මුකුත් නැහැ.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {chatUsers.map((chat) => (
            <Link href={`/messages/${chat.id}`} key={chat.id} className="block hover:bg-gray-50 dark:hover:bg-gray-900 transition p-4">
              <div className="flex items-center gap-4">
                {/* ප්‍රොෆයිල් පින්තූරය */}
                <div className="relative">
                  {chat.avatar_url ? (
                    <img src={chat.avatar_url} alt="" className="w-14 h-14 rounded-full object-cover border border-gray-200" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-spl-blue text-white flex items-center justify-center font-bold text-xl uppercase shadow-inner">
                      {chat.full_name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#0F172A] rounded-full"></div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-gray-900 dark:text-white truncate">
                      {chat.full_name || 'Space Link User'}
                    </h3>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <p className="text-sm truncate text-gray-600 dark:text-gray-400">
                    {chat.lastMessage}
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