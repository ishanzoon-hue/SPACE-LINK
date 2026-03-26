import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import SearchBar from './SearchBar' 
import ThemeToggle from './ThemeToggle'
import SignOutButton from './SignOutButton'
import NotificationBell from './NotificationBell'
import SettingsToggle from './SettingsToggle' 
import { Home, MessageSquare, User, TrendingUp, Trophy } from 'lucide-react'

export default async function Navbar() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    let notifications = []
    if (user) {
        const { data } = await supabase
            .from('notifications')
            .select(`
                *,
                from_user:profiles!from_user_id(display_name),
                post:posts!post_id(content)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)
        notifications = data || []
    }

    const iconBtnStyle = "p-2 sm:p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-gray-800 hover:text-emerald-500 transition-all flex items-center justify-center shrink-0 cursor-pointer relative"
    
    // 🌟 Tooltip එකට දාන පොදු කෝඩ් කෑල්ල
    const tooltipStyle = "absolute top-full mt-1.5 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-800 text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl pointer-events-none z-[120]"

    return (
        <header className="bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-[100] transition-colors shadow-sm">
            
            <div className="max-w-7xl mx-auto px-4">
                {/* 🏠 MAIN ROW */}
                <div className="h-16 flex items-center justify-between gap-2 sm:gap-4">
                    
                    {/* 1. Logo (Facebook Style Text Logo) */}
                    <Link href="/" className="shrink-0 flex items-center hover:opacity-90 transition-opacity">
                        <span className="text-3xl md:text-4xl font-black text-blue-600 dark:text-blue-500 tracking-tighter" style={{ letterSpacing: '-0.05em' }}>
                            Elimeno
                        </span>
                    </Link>

                    {/* 2. Search Bar (Desktop) */}
                    <div className="hidden md:block flex-1 max-w-sm mx-4 relative">
                        <SearchBar />
                    </div>

                    {/* 3. Action Icons */}
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0 relative">
                        {user ? (
                            <>
                                {/* Home */}
                                <div className="relative group flex items-center justify-center">
                                    <Link href="/" className={iconBtnStyle}>
                                        <Home size={22} strokeWidth={2.5} />
                                    </Link>
                                    <span className={tooltipStyle}>Home</span>
                                </div>

                                {/* Leaderboard */}
                                <div className="relative group flex items-center justify-center">
                                    <Link href="/leaderboard" className={iconBtnStyle}>
                                        <Trophy size={22} strokeWidth={2.5} className="text-yellow-500 drop-shadow-sm group-hover:scale-110 transition-transform" />
                                    </Link>
                                    <span className={tooltipStyle}>Leaderboard</span>
                                </div>

                                {/* Live Market */}
                                <div className="relative group flex items-center justify-center">
                                    <Link href="/market" className={iconBtnStyle}>
                                        <TrendingUp size={22} strokeWidth={2.5} className="text-blue-500" />
                                    </Link>
                                    <span className={tooltipStyle}>Live Market</span>
                                </div>

                                {/* Messages */}
                                <div className="relative group flex items-center justify-center">
                                    <Link href="/messages" className={iconBtnStyle}>
                                        <MessageSquare size={22} strokeWidth={2.5} />
                                    </Link>
                                    <span className={tooltipStyle}>Messages</span>
                                </div>

                                {/* Profile */}
                                <div className="relative group flex items-center justify-center">
                                    <Link href={`/profile/${user.id}`} className={iconBtnStyle}>
                                        <User size={22} strokeWidth={2.5} />
                                    </Link>
                                    <span className={tooltipStyle}>Profile</span>
                                </div>

                                {/* Notifications */}
                                <div className="relative group shrink-0 flex items-center justify-center">
                                    <NotificationBell notifications={notifications} />
                                    <span className={tooltipStyle}>Notifications</span>
                                </div>
                                
                                {/* Settings */}
                                <div className="relative group shrink-0 flex items-center justify-center">
                                    <SettingsToggle />
                                    <span className={tooltipStyle}>Settings</span>
                                </div> 
                                
                                {/* Theme */}
                                <div className="relative group shrink-0 flex items-center justify-center">
                                    <ThemeToggle />
                                    <span className={tooltipStyle}>Theme</span>
                                </div>
                                
                                {/* Sign Out */}
                                <div className="relative group shrink-0 flex items-center justify-center ml-1 pl-1 border-l border-gray-200 dark:border-gray-800">
                                    <SignOutButton />
                                    <span className={tooltipStyle}>Log Out</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3 shrink-0">
                                <ThemeToggle />
                                <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-emerald-500 dark:text-gray-300 transition-colors">Log in</Link>
                                <Link href="/signup" className="text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20">Sign up</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Mobile Search Bar */}
                <div className="md:hidden w-full px-1 pb-3">
                    <SearchBar />
                </div>

            </div>
        </header>
    )
}