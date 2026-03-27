'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { UserPlus, Sparkles } from 'lucide-react'

export default function FollowingList({ currentUserId }: { currentUserId: string }) {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true)
            
            // 🚀 සරලම Query එක: profiles ටේබල් එකේ ඉන්න ඕනෑම 10 දෙනෙක්ව ගන්නවා
            const { data, error } = await supabase
                .from('profiles')
                .select('id, display_name, avatar_url') 
                .limit(10)

            if (error) {
                console.error("Supabase Error:", error.message)
            }

            if (data) {
                // තමන්ගේම නම අයින් කරලා අනිත් අයව පෙන්වනවා
                const others = data.filter(u => u.id !== currentUserId)
                setUsers(others)
            }
            setLoading(false)
        }

        fetchUsers()
    }, [currentUserId])

    const formatName = (name: string) => {
        if (!name) return 'Space User';
        return name.includes('@') ? name.split('@')[0] : name;
    };

    if (loading) return (
        <div className="w-full bg-[#1E293B]/40 rounded-[32px] p-8 border border-white/5 text-center animate-pulse">
            <p className="text-[10px] text-emerald-500 uppercase tracking-[0.3em] font-black">Scanning Space...</p>
        </div>
    )

    return (
        <div className="w-full bg-[#1E293B]/40 rounded-[32px] p-6 border border-white/5 shadow-2xl backdrop-blur-md">
            <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-6 px-1 flex items-center gap-2">
                <Sparkles size={12} className="animate-pulse" />
                Suggested Friends
            </h3>
            
            <div className="flex flex-col gap-5">
                {users.length > 0 ? (
                    users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between group">
                            <Link href={`/profile/${user.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="w-11 h-11 rounded-full border-2 border-gray-800 group-hover:border-emerald-500 overflow-hidden bg-gray-900 flex items-center justify-center shrink-0 transition-all">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-emerald-500 font-black text-sm">
                                            {formatName(user.display_name).charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="truncate pr-2">
                                    <p className="text-sm font-bold text-gray-200 group-hover:text-emerald-400 transition-colors truncate">
                                        {formatName(user.display_name)}
                                    </p>
                                    <p className="text-[10px] text-gray-500 font-medium">
                                        @{formatName(user.display_name).toLowerCase()}
                                    </p>
                                </div>
                            </Link>
                            
                            <Link href={`/profile/${user.id}`} className="p-2 text-gray-500 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all">
                                <UserPlus size={18} />
                            </Link>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4">
                        <p className="text-[10px] text-gray-600 italic">No humans detected 🛸</p>
                        <p className="text-[8px] text-gray-700 mt-2 uppercase">Check Profiles Table in Supabase</p>
                    </div>
                )}
            </div>
        </div>
    )
}