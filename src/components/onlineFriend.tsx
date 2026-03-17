'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'

export default function OnlineFriends({ currentUserId }: { currentUserId: string }) {
    const [onlineFriends, setOnlineFriends] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        const setupPresence = async () => {
            // 1. අපි මුලින්ම බලනවා මේ යූසර් Follow කරලා ඉන්නේ කවුද කියලා
            const { data: following } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', currentUserId)console.log("Follow කරන අයගේ IDs:", followingIds);

            const followingIds = following?.map(f => f.following_id) || []

            // 2. Realtime Channel එකක් හදනවා මුළු සයිට් එකටම
            const channel = supabase.channel('online-users', {
                config: { presence: { key: currentUserId } }
            })

            channel
                .on('presence', { event: 'sync' }, () => {
                    const state = channel.presenceState()
                    const onlineList: any[] = []

                    // ඔන්ලයින් ඉන්න අයගෙන් අපි Follow කරන අය විතරක් Filter කරනවා
                    Object.keys(state).forEach((userId) => {console.log("දැනට සයිට් එකේ ඉන්න මුළු සෙට් එක (Presence):", state);
                        if (followingIds.includes(userId)) {
                            const userPresence: any = state[userId][0]
                            onlineList.push({
                                id: userId,
                                name: userPresence.name,
                                avatar: userPresence.avatar
                            })
                        }
                    })
                    setOnlineFriends(onlineList)
                })
                .subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        // යූසර්ගේ ප්‍රොෆයිල් විස්තරත් එක්ක Track කරනවා
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('display_name, avatar_url')
                            .eq('id', currentUserId)
                            .single()

                        await channel.track({
                            name: profile?.display_name || 'User',
                            avatar: profile?.avatar_url
                        })
                    }
                })

            return channel
        }

        const channelPromise = setupPresence()
        return () => { channelPromise.then(c => c.unsubscribe()) }
    }, [currentUserId])

    if (onlineFriends.length === 0) return null

    return (
        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Online Friends</h3>
            <div className="space-y-4">
                {onlineFriends.map((friend) => (
                    <div key={friend.id} className="flex items-center gap-3 group cursor-pointer">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                {friend.avatar ? (
                                    <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-xs">
                                        {friend.name[0]}
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#0F172A] rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-500 transition-colors">
                            {friend.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}