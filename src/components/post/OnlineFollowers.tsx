'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import Image from 'next/image'

export default function OnlineFollowers({ currentUserId, isSidebar = false }: { currentUserId: string; isSidebar?: boolean }) {
    const [onlineUsers, setOnlineUsers] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        const fetchProfiles = async () => {
            if (onlineUsers.length === 0) return;
            const idsToFetch = onlineUsers.filter(u => !u.display_name).map(u => u.id);
            if (idsToFetch.length === 0) return;

            const { data, error } = await supabase.from('profiles').select('id, display_name, avatar_url').in('id', idsToFetch);
            if (data && !error && data.length > 0) {
                setOnlineUsers(prev => prev.map(ou => {
                    const profileData = data.find(p => p.id === ou.id);
                    return profileData ? { ...ou, ...profileData } : ou;
                }));
            }
        };

        fetchProfiles();
    }, [onlineUsers, supabase]);

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
        <div className={`${isSidebar ? '' : 'bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm sticky top-20'}`}>
            {!isSidebar && (
                <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online Friends ({onlineUsers.length})
                </h3>
            )}

            <div className={`${isSidebar ? 'flex flex-col items-center 2xl:items-stretch gap-1' : 'space-y-3'}`}>
                {onlineUsers.length === 0 ? (
                    !isSidebar && <p className="text-xs text-gray-500">No one is online right now.</p>
                ) : (
                    onlineUsers.map((user: any) => (
                        <Link
                            key={user.id}
                            href={`/profile/${user.id}`}
                            className={`flex items-center gap-3 p-2 hover:bg-white/10 dark:hover:bg-gray-800/50 rounded-xl transition-all group ${isSidebar ? 'justify-center 2xl:justify-start' : ''}`}
                            title={user.display_name}
                        >
                            <div className="relative shrink-0">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110">
                                    {user.avatar_url ? (
                                        <Image src={user.avatar_url} alt="avatar" width={40} height={40} className="object-cover" unoptimized />
                                    ) : (
                                        <span className="text-sm font-bold text-emerald-600">
                                            {(user.display_name || user.id || 'U').charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#0F172A] rounded-full"></div>
                            </div>
                            <div className={`flex-1 overflow-hidden ${isSidebar ? 'hidden xl:block' : ''}`}>
                                <p className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate group-hover:text-emerald-500 transition-colors">
                                    {user.display_name || `User ${user.id?.slice(0, 5)}...`}
                                </p>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}