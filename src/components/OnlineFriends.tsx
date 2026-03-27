'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { MessageCircle, Video, ChevronRight } from 'lucide-react'

export default function OnlineFriends({ currentUserId }: { currentUserId: string }) {
    const [following, setFollowing] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUserId) return;
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
                .eq('follower_id', currentUserId)

            if (!error && data) {
                setFollowing(data)
            }
            setLoading(false)
        }
        fetchData()
    }, [currentUserId])

    if (loading) return <div className="p-6 text-center animate-pulse text-gray-500 text-xs italic">Searching for allies...</div>

    return (
        <div className="w-full space-y-2">
            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest px-2 mb-4">Following</h3>
            
            {following.length > 0 ? (
                <div className="flex flex-col gap-1">
                    {following.map((item) => {
                        const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
                        if (!profile) return null;

                        return (
                            <div key={item.followed_id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-white/5 transition-all group">
                                
                                {/* 🔗 මේක තමයි ප්‍රොෆයිල් එකට යන ලින්ක් එක */}
                                <Link 
                                    href={`/profile/${profile.id}`} 
                                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                                >
                                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-800 group-hover:border-emerald-500 transition-all shrink-0">
                                        <img 
                                            src={profile.avatar_url || '/default-avatar.png'} 
                                            alt={profile.display_name} 
                                            className="w-full h-full object-cover"
                                        />
                                        {profile.is_online && (
                                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0F172A] rounded-full"></div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-200 group-hover:text-emerald-400 transition-colors truncate uppercase tracking-tighter">
                                            {profile.display_name}
                                        </p>
                                    </div>
                                </Link>

                                {/* 💬 Action Buttons (Profile ලින්ක් එකෙන් පිට තියෙන්නේ) */}
                                <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                    <Link href={`/chat/${profile.id}`} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all">
                                        <MessageCircle size={16} />
                                    </Link>
                                    <button className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all">
                                        <Video size={16} />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="p-4 text-center">
                    <p className="text-gray-500 text-xs italic">No humans found 🛸</p>
                </div>
            )}
        </div>
    )
}