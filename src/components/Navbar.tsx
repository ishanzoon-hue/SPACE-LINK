'use client'

import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import SearchBar from './SearchBar'
import ThemeToggle from './ThemeToggle'
import SignOutButton from './SignOutButton'
import NotificationBell from './NotificationBell'
import SettingsToggle from './SettingsToggle'
import { Home, MessageSquare, User, TrendingUp, Trophy, Radio, Coins, Users, Store, Hash } from 'lucide-react'
import MobileMenu from './MobileMenu'
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslation } from '@/hooks/useTranslation'
import { useEffect, useState } from 'react'

export default function Navbar() {
    const { t } = useTranslation()
    const [user, setUser] = useState<any>(null)
    const [lmoBalance, setLmoBalance] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            setUser(authUser)

            if (authUser) {
                // 1. LMO Balance
                const { data: profileData } = await supabase
                    .from('profiles')
                    .select('lmo_balance')
                    .eq('id', authUser.id)
                    .single()
                if (profileData) setLmoBalance(profileData.lmo_balance || 0)
            }
        }
        getUser()

        // Auth Listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const iconBtnStyle = "p-2 sm:p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-gray-800 hover:text-emerald-500 transition-all flex items-center justify-center shrink-0 cursor-pointer min-h-[44px] min-w-[44px]"
    const tooltipStyle = "absolute top-full mt-1.5 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl pointer-events-none z-[120] hidden sm:block"

    return (
        <header className="bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-[100] transition-colors shadow-sm">
            <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">
                <div className="h-14 sm:h-16 flex items-center justify-between gap-2">

                    {/* Logo */}
                    <Link href="/" className="shrink-0 flex items-center hover:opacity-90 transition-opacity">
                        <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-emerald-600 dark:text-emerald-500 tracking-tighter" style={{ letterSpacing: '-0.05em' }}>
                            Elimeno
                        </span>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:block flex-1 max-w-sm mx-4">
                        <SearchBar />
                    </div>

                    {/* Right side - Icons & User Menu */}
                    <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                        {user ? (
                            <>
                                {/* 💸 LMO Balance Badge */}
                                <div className="flex items-center gap-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 px-3 py-1.5 rounded-full transition-all mr-1 sm:mr-3 cursor-default shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                                    <Coins size={16} className="text-yellow-500" />
                                    <span className="text-yellow-500 font-black text-sm sm:text-base">{lmoBalance}</span>
                                </div>

                                {/* Desktop Icons */}
                                <div className="hidden sm:flex items-center gap-0.5 sm:gap-1">
                                    <div className="lg:hidden">
                                        <NavIcon href="/" icon={<Home size={20} />} tooltip={t('common.home')} />
                                    </div>

                                    <div className="relative group">
                                        <Link href="/live" className={`${iconBtnStyle} hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500`}>
                                            <Radio size={20} className="animate-pulse" />
                                            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping opacity-75"></span>
                                        </Link>
                                        <span className={tooltipStyle}>{t('common.live_orbit')}</span>
                                    </div>

                                    <NavIcon href="/leaderboard" icon={<Trophy size={20} className="text-yellow-500" />} tooltip={t('common.leaderboard')} />
                                    
                                    <div className="lg:hidden flex items-center gap-0.5 sm:gap-1">
                                        <NavIcon href="/explore" icon={<Hash size={20} className="text-emerald-500" />} tooltip="Explore" />
                                        <NavIcon href="/marketplace" icon={<Store size={20} className="text-purple-500" />} tooltip="Marketplace" />
                                        <NavIcon href="/market" icon={<TrendingUp size={20} className="text-blue-500" />} tooltip={t('common.market')} />
                                        <NavIcon href="/friends" icon={<Users size={20} className="text-blue-400" />} tooltip={t('common.friends')} />
                                        <NavIcon href="/messages" icon={<MessageSquare size={20} />} tooltip={t('common.messages')} />
                                        <NavIcon href={`/profile/${user.id}`} icon={<User size={20} />} tooltip={t('common.profile')} />
                                    </div>

                                    <div className="relative group">
                                        <NotificationBell />
                                        <span className={tooltipStyle}>{t('common.notifications')}</span>
                                    </div>

                                    <div className="relative group">
                                        <SettingsToggle />
                                        <span className={tooltipStyle}>{t('common.settings')}</span>
                                    </div>

                                    <div className="relative group">
                                        <LanguageSwitcher />
                                        <span className={tooltipStyle}>Language</span>
                                    </div>

                                    <div className="relative group">
                                        <ThemeToggle />
                                        <span className={tooltipStyle}>{t('common.theme')}</span>
                                    </div>

                                    <div className="relative group ml-1 pl-1 border-l border-gray-200 dark:border-gray-800">
                                        <SignOutButton />
                                        <span className={tooltipStyle}>{t('common.logout')}</span>
                                    </div>
                                </div>

                                {/* Mobile Menu Button */}
                                <MobileMenu userId={user.id} />
                            </>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                <LanguageSwitcher />
                                <ThemeToggle />
                                <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-emerald-500 dark:text-gray-300 transition-colors px-2 sm:px-0">
                                    {t('common.login')}
                                </Link>
                                <Link href="/signup" className="text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20">
                                    {t('common.signup')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="md:hidden w-full pb-3">
                    <SearchBar />
                </div>
            </div>
        </header>
    )
}

function NavIcon({ href, icon, tooltip }: { href: string; icon: React.ReactNode; tooltip: string }) {
    const iconBtnStyle = "p-2 sm:p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-gray-800 hover:text-emerald-500 transition-all flex items-center justify-center shrink-0 cursor-pointer min-h-[44px] min-w-[44px]"
    const tooltipStyle = "absolute top-full mt-1.5 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl pointer-events-none z-[120] hidden sm:block"

    return (
        <div className="relative group">
            <Link href={href} className={iconBtnStyle}>
                {icon}
            </Link>
            <span className={tooltipStyle}>{tooltip}</span>
        </div>
    )
}