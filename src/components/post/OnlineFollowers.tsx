'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

export default function OnlineFollowers({ currentUserId }: { currentUserId: string }) {
    const [onlineUsers, setOnlineUsers] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        if (!currentUserId) return

        // 1. Realtime Channel එකක් හදනවා
        const channel = supabase.channel('online-users', {
            config: {
                presence: {
                    key: currentUserId,
                },
            },
        })

        // 2. යූසර්ලා එන-යන එක (Sync) බලනවා
        channel
            .on('presence', { event: 'sync' }, () => {
                const newState = channel.presenceState()
                const users = Object.values(newState).flat()

                // 🚀 Duplicate Keys Fix: 
                // එකම යූසර්ට tabs කීපයක් තිබ්බොත් duplication එක නැති කරන්න unique list එකක් ගන්නවා
                const uniqueUsers = Array.from(new Map(users.map((u: any) => [u.id, u])).values())
                setOnlineUsers(uniqueUsers)
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // ඔයා ඔන්ලයින් කියලා අනිත් අයට කියනවා
                    await channel.track({
                        id: currentUserId,
                        online_at: new Date().toISOString(),
                    })
                }
            })

        return () => {
            supabase.removeChannel(channel)
        }
    }, [currentUserId])

    return (
        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm sticky top-20">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Online Friends ({onlineUsers.length})
            </h3>

            <div className="space-y-3">
                {onlineUsers.length === 0 ? (
                    <p className="text-xs text-gray-500">No one is online right now.</p>
                ) : (
                    onlineUsers.map((user: any) => (
                        <Link
                            key={user.id}
                            href={`/profile/${user.id}`} // ප්‍රොෆයිල් එකට යන ලින්ක් එක
                            className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all group"
                        >
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                                    {/* මෙතනට Profile පින්තූරය ගන්න ඕනේ */}
                                    <span className="text-sm font-bold text-blue-600">
                                        {user.id?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#0F172A] rounded-full"></div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate group-hover:text-blue-500">
                                    User {user.id?.slice(0, 5)}...
                                </p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}