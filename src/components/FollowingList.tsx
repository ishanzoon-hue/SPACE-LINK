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
        <div className="flex flex-col gap-6">
            {/* Main Following List Box */}
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

            {/* Sidebar Footer Links (Social Media & Copyright) */}
            <div className="flex flex-col items-center justify-center gap-4 px-4 opacity-80">
                <div className="flex items-center gap-5">
                    {/* Telegram Icon */}
                    <Link 
                        href="https://t.me/elimeno_official" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-[#229ED9] transition-colors duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                        </svg>
                    </Link>
                    
                    {/* Twitter (X) Icon */}
                    <Link 
                        href="https://twitter.com/http://@IshanC70063" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-white transition-colors duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                    </Link>
                </div>

                <div className="flex gap-4 text-[10px] text-gray-600 font-medium tracking-wide">
                    <Link href="#" className="hover:text-emerald-400 transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-emerald-400 transition-colors">Terms</Link>
                    <span>&copy; {new Date().getFullYear()} Elimeno</span>
                </div>
            </div>
        </div>
    )
}