'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PhoneOutgoing } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function OnlineFriends({ currentUserId }: { currentUserId: string }) {
    const [onlineFriends, setOnlineFriends] = useState<any[]>([])
    const [myProfile, setMyProfile] = useState<any>(null) // ඔබේ විස්තර තබා ගැනීමට
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const setupPresence = async () => {
            // 1. ඔබේ ප්‍රෝෆයිල් විස්තර ලබා ගැනීම (Call එකක් යවන විට ඔබේ නම පෙන්වීමට)
            const { data: profile } = await supabase
                .from('profiles')
                .select('display_name, avatar_url')
                .eq('id', currentUserId)
                .single()
            
            setMyProfile(profile)

            // 2. Follow කරන අයගේ ලිස්ට් එක ගැනීම
            const { data: following } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', currentUserId)

            const followingIds = following?.map(f => f.following_id) || []

            // 3. Presence Channel එක
            const channel = supabase.channel('online-users', {
                config: { presence: { key: currentUserId } }
            })

            channel
                .on('presence', { event: 'sync' }, () => {
                    const state = channel.presenceState()
                    const onlineList: any[] = []

                    Object.keys(state).forEach((userId) => {
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
    }, [currentUserId, supabase])

    // --- පියවර 1: කෝල් එක පටන් ගැනීම සහ රිංගින් මැසේජ් එක යැවීම ---
    const handleStartCall = async (friendId: string) => {
        // යාළුවාගේ ID එකට අදාළ විශේෂ චැනල් එකක් සාදා ගැනීම
        const callChannel = supabase.channel(`call_${friendId}`);

        await callChannel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                // යාළුවාට 'incoming-call' මැසේජ් එක බ්‍රෝඩ්කාස්ට් කිරීම
                await callChannel.send({
                    type: 'broadcast',
                    event: 'incoming-call',
                    payload: {
                        callerId: currentUserId,
                        callerName: myProfile?.display_name || 'Someone',
                        callerAvatar: myProfile?.avatar_url,
                        roomId: currentUserId // ඔබේ ID එකම Room ID එක ලෙස පාවිච්චි වේ
                    }
                });

                // පණිවිඩය යැවූ පසු ඔබව කෝල් එකේ පේජ් එකට යොමු කරයි
                router.push(`/video-call/${currentUserId}`);
            }
        });
    };

    if (onlineFriends.length === 0) {
        return (
            <div className="bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-[11px] text-gray-400 text-center">No friends online</p>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-[#0F172A] p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-widest">Active Now</h3>
            
            <div className="space-y-2">
                {onlineFriends.map((friend) => (
                    <button 
                        key={friend.id}
                        onClick={() => handleStartCall(friend.id)}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 overflow-hidden flex items-center justify-center border-2 border-transparent group-hover:border-green-500 transition-all">
                                    {friend.avatar ? (
                                        <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">{friend.name[0]}</span>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#0F172A] rounded-full"></div>
                            </div>
                            
                            <div className="text-left">
                                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 group-hover:text-green-600 transition-colors">
                                    {friend.name}
                                </p>
                                <p className="text-[10px] text-green-500 font-medium animate-pulse">Available for call</p>
                            </div>
                        </div>

                        <PhoneOutgoing className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-all" />
                    </button>
                ))}
            </div>
        </div>
    )
}