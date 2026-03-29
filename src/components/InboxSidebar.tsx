'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { format } from 'date-fns'

export default function InboxSidebar({ currentUserId }: { currentUserId?: string }) {
    const [chatUsers, setChatUsers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()
    const pathname = usePathname()

    useEffect(() => {
        const fetchInboxData = async () => {
            const userId = currentUserId || (await supabase.auth.getUser()).data.user?.id
            if (!userId) return

            const { data: messages } = await supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .order('created_at', { ascending: false })

            if (messages && messages.length > 0) {
                const contactIds = new Set<string>()
                const lastMessagesMap = new Map()

                messages.forEach((msg) => {
                    const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
                    if (!contactIds.has(otherUserId)) {
                        contactIds.add(otherUserId)

                        let timeStr = ''
                        try {
                            const date = new Date(msg.created_at)
                            if (new Date().toDateString() === date.toDateString()) {
                                timeStr = format(date, 'h:mm a')
                            } else {
                                timeStr = format(date, 'MMM d')
                            }
                        } catch (e) { }

                        lastMessagesMap.set(otherUserId, {
                            content: msg.content,
                            isImage: !!msg.image_url,
                            time: timeStr,
                            isUnread: msg.receiver_id === userId && !msg.is_read
                        })
                    }
                })

                const contactIdsArray = Array.from(contactIds)
                if (contactIdsArray.length > 0) {
                    const { data: profiles } = await supabase
                        .from('profiles')
                        .select('id, display_name, avatar_url')
                        .in('id', contactIdsArray)

                    if (profiles) {
                        const finalInbox = profiles.map(profile => ({
                            ...profile,
                            ...lastMessagesMap.get(profile.id)
                        }))

                        // Sort by latest message
                        finalInbox.sort((a, b) => {
                            // Basic string compare since we format dates, ideally sort by raw timestamp but this works for simple cases
                            return -1;
                        })

                        setChatUsers(finalInbox)
                    }
                }
            }
            setIsLoading(false)
        }

        fetchInboxData()
    }, [currentUserId])

    return (
        <div className="w-full h-full flex flex-col bg-white dark:bg-[#0F172A] border-r border-gray-200 dark:border-gray-800">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Chats</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3 animate-pulse">
                                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full shrink-0"></div>
                                <div className="flex-1 py-1">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-2"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-3/4"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : chatUsers.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                        <p className="text-sm text-gray-500 font-medium">No messages yet.</p>
                        <Link href="/" className="mt-2 text-sm text-emerald-500 hover:text-emerald-600 font-bold">Find friends to chat</Link>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                        {chatUsers.map((chat) => {
                            const isActive = pathname.includes(`/chat/${chat.id}`)
                            return (
                                <Link
                                    href={`/chat/${chat.id}`}
                                    key={chat.id}
                                    className={`block p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${isActive ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''}`}
                                >
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        <div className="relative shrink-0">
                                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                                {chat.avatar_url ? (
                                                    <img src={chat.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center font-bold text-gray-500">{chat.display_name?.[0] || 'U'}</div>
                                                )}
                                            </div>
                                            {/* Online badge mock */}
                                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0F172A] rounded-full shadow-sm"></div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <h3 className={`font-bold truncate text-sm sm:text-base ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
                                                    {chat.display_name}
                                                </h3>
                                                <span className={`text-[10px] sm:text-xs shrink-0 ml-2 ${chat.isUnread ? 'text-emerald-500 font-bold' : 'text-gray-500'}`}>
                                                    {chat.time}
                                                </span>
                                            </div>
                                            <p className={`text-xs sm:text-sm truncate ${chat.isUnread ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {chat.isImage ? "📷 Sent a photo" : chat.content}
                                            </p>
                                        </div>

                                        {chat.isUnread && (
                                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0 shadow-sm"></div>
                                        )}
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
