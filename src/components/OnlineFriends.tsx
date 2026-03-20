'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'

export default function OnlineFriends({ currentUserId }: { currentUserId: string }) {
    const [following, setFollowing] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUserId) return;

            // 🚀 අපි කෙලින්ම currentUserId පාවිච්චි කරනවා
            const { data, error } = await supabase
                .from('follows')
                .select(`
                    followed_id,
                    profiles!followed_id (
                        id,
                        display_name,
                        avatar_url,
                        is_online
                    )
                `)
                .eq('follower_id', currentUserId) // මෙතනට currentUserId දැම්මා

            if (!error && data) {
                setFollowing(data)
            }
            setLoading(false)
        }

        fetchData()
    }, [currentUserId, supabase]) // dependency එකට currentUserId දැම්මා

    if (loading) return <div className="p-10 text-center animate-pulse text-gray-500 italic">Scanning the galaxy for connections...</div>

    return (
        <div className="w-full">
            {following.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                    {following.map((item) => {
                        const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
                        if (!profile) return null;

                        return (
                            <Link 
                                key={item.followed_id} 
                                href={`/profile/${profile.id}`} 
                                className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 rounded-[28px] transition-all group"
                            >
                                {/* 🖼️ User Photo */}
                                <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gray-800 group-hover:border-emerald-500 transition-all shrink-0 shadow-lg">
                                    {profile.avatar_url ? (
                                        <Image 
                                            src={profile.avatar_url} 
                                            alt={profile.display_name} 
                                            fill 
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-xl">
                                            {profile.display_name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    
                                    {/* Online indicator dot */}
                                    {profile.is_online && (
                                        <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0F172A] rounded-full"></div>
                                    )}
                                </div>

                                {/* 📛 User Name & Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-base font-black text-gray-200 group-hover:text-white transition-colors truncate uppercase tracking-tighter italic">
                                        {profile.display_name}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md font-bold uppercase tracking-widest">
                                            Following
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="text-gray-600 group-hover:text-emerald-500 transition-colors pr-2">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"></path></svg>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            ) : (
                <div className="p-20 text-center">
                    <p className="text-gray-500 text-lg font-medium italic">No humans found in your radar. 🛸</p>
                    <Link href="/" className="text-emerald-500 text-sm font-bold uppercase tracking-widest mt-2 block hover:underline">Start Exploring</Link>
                </div>
            )}
        </div>
    )
}