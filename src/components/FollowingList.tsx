'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { UserPlus, Sparkles, BadgeCheck } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function FollowingList({ currentUserId }: { currentUserId: string }) {
    const { t } = useTranslation()
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true)

            const { data, error } = await supabase
                .from('profiles')
                .select('id, display_name, avatar_url, is_verified')
                .limit(10)

            if (data) {
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
            <p className="text-[10px] text-emerald-500 uppercase tracking-[0.3em] font-black">{t('home.scanning')}</p>
        </div>
    )

    return (
        <div className="w-full bg-[#1E293B]/40 rounded-[32px] p-6 border border-white/5 shadow-2xl backdrop-blur-md">
            <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-6 px-1 flex items-center gap-2">
                <Sparkles size={12} className="animate-pulse" />
                {t('home.suggested')}
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
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <p className="text-sm font-bold text-gray-200 group-hover:text-emerald-400 transition-colors truncate">
                                            {formatName(user.display_name)}
                                        </p>
                                        {user.is_verified && (
                                            <BadgeCheck size={14} className="text-emerald-400 fill-emerald-400/20 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-medium leading-none">
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
                        <p className="text-[10px] text-gray-600 italic">{t('home.no_humans')}</p>
                    </div>
                )}
            </div>
        </div>
    )
}