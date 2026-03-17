'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function OnlineFriends({ currentUserId }: { currentUserId: string }) {
    const [onlineFriends, setOnlineFriends] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        const setupPresence = async () => {
            // 1. Follow කරන අයගේ ලිස්ට් එක ගන්නවා
            const { data: following, error: followError } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', currentUserId)

            if (followError) {
                console.error("Follow list error:", followError)
                return
            }

            const followingIds = following?.map(f => f.following_id) || []
            console.log("මම Follow කරන අයගේ IDs:", followingIds)

            // 2. Realtime Channel එක
            const channel = supabase.channel('online-users', {
                config: { presence: { key: currentUserId } }
            })

            channel
                .on('presence', { event: 'sync' }, () => {
                    const state = channel.presenceState()
                    console.log("දැනට ඔන්ලයින් ඉන්න මුළු සෙට් එක:", state)

                    const onlineList: any[] = []

                    Object.keys(state).forEach((userId) => {
                        // වැදගත්: මෙතනදී අපි Follow කරන අය විතරක් තෝරනවා
                        // පරීක්ෂා කිරීමට නම්: (followingIds.includes(userId) || userId === currentUserId)
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
        return () => { channelPromise.then(c => c && c.unsubscribe()) }
    }, [currentUserId])

    // ලිස්ට් එක හිස් නම් පෙන්නන්න දෙයක් නැහැ
    if (onlineFriends.length === 0) {
        return (
            <div className="bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-xs text-gray-400">No friends online right now.</p>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 mb-4 uppercase tracking-wider">Online Friends</h3>
            <div className="space-y-4">
                {onlineFriends.map((friend) => (
                    <div key={friend.id} className="flex items-center gap-3 group cursor-pointer">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 overflow-hidden flex items-center justify-center">
                                {friend.avatar ? (
                                    <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-blue-600 font-bold">{friend.name[0]}</span>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#0F172A] rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-500">
                            {friend.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}