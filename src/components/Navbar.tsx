import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import SearchBar from './SearchBar' 
import ThemeToggle from './ThemeToggle'
import SignOutButton from './SignOutButton'
import NotificationBell from './NotificationBell'
import SettingsToggle from './SettingsToggle' 
import { Home, MessageSquare, User, TrendingUp, Trophy, Radio } from 'lucide-react'
import MobileMenu from './MobileMenu'

export default async function Navbar() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    let notifications = []
    if (user) {
        const { data, error } = await supabase
            .from('notifications')
            .select(`
                *,
                from_user:profiles!sender_id(display_name, avatar_url),
                post:posts!post_id(content)
            `)
            .eq('receiver_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)
            
        if (error) {
            console.error("Navbar Notification Error:", error)
        }
        notifications = data || []
    }

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
                                {/* Desktop Icons (Phone එකේදී මේ ටික හැංගෙනවා) */}
                                <div className="hidden sm:flex items-center gap-0.5 sm:gap-1">
                                    <NavIcon href="/" icon={<Home size={20} />} tooltip="Home" />
                                    
                                    {/* 🔴 LIVE Stream Button (Desktop) */}
                                    <div className="relative group">
                                        <Link href="/live" className={`${iconBtnStyle} hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500`}>
                                            <Radio size={20} className="animate-pulse" />
                                            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                            <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-ping opacity-75"></span>
                                        </Link>
                                        <span className={tooltipStyle}>Live Orbit</span>
                                    </div>

                                    <NavIcon href="/leaderboard" icon={<Trophy size={20} className="text-yellow-500" />} tooltip="Leaderboard" />
                                    <NavIcon href="/market" icon={<TrendingUp size={20} className="text-blue-500" />} tooltip="Live Market" />
                                    <NavIcon href="/messages" icon={<MessageSquare size={20} />} tooltip="Messages" />
                                    <NavIcon href={`/profile/${user.id}`} icon={<User size={20} />} tooltip="Profile" />
                                    
                                    <div className="relative group">
                                        <NotificationBell notifications={notifications} />
                                        <span className={tooltipStyle}>Notifications</span>
                                    </div>
                                    
                                    <div className="relative group">
                                        <SettingsToggle />
                                        <span className={tooltipStyle}>Settings</span>
                                    </div>
                                    
                                    <div className="relative group">
                                        <ThemeToggle />
                                        <span className={tooltipStyle}>Theme</span>
                                    </div>
                                    
                                    <div className="relative group ml-1 pl-1 border-l border-gray-200 dark:border-gray-800">
                                        <SignOutButton />
                                        <span className={tooltipStyle}>Log Out</span>
                                    </div>
                                </div>

                                {/* 🔴 Mobile LIVE Stream Button (Phone එකේ විතරක් පේන්න) */}
                                <Link href="/live" className="sm:hidden relative p-2 text-red-500 hover:bg-red-500/10 rounded-full transition-all flex items-center justify-center mr-1">
                                    <Radio size={22} className="animate-pulse" />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-75"></span>
                                </Link>

                                {/* Mobile Menu Button */}
                                <MobileMenu userId={user.id} notifications={notifications} />
                            </>
                        ) : (
                            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                <ThemeToggle />
                                <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-emerald-500 dark:text-gray-300 transition-colors px-2 sm:px-0">
                                    Log in
                                </Link>
                                <Link href="/signup" className="text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white px-3 sm:px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20">
                                    Sign up
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

// ✅ NavIcon Component - Reusable
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