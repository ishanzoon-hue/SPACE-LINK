import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import SearchBar from './SearchBar' 
import ThemeToggle from './ThemeToggle'
import SignOutButton from './SignOutButton'
import NotificationBell from './NotificationBell'
import SettingsToggle from './SettingsToggle' 
import { Home, MessageSquare, User, TrendingUp } from 'lucide-react'

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

    const iconBtnStyle = "p-2 sm:p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-gray-800 hover:text-emerald-500 transition-all flex items-center justify-center shrink-0 cursor-pointer"

    return (
        <header className="bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-[100] transition-colors shadow-sm">
            
            <div className="max-w-7xl mx-auto px-4">
                {/* 🏠 MAIN ROW: Logo + Desktop Search + Action Icons */}
                <div className="h-16 flex items-center justify-between gap-2 sm:gap-4">
                    
                    {/* 1. Logo */}
                    <Link href="/" className="shrink-0 transition-all hover:opacity-90 group flex items-center gap-2">
                        <div className="relative p-0.5 rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-600 via-purple-500 to-pink-500 shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                            <div className="bg-[#0F172A] rounded-[14px] p-1">
                                <img 
                                    src="/logo.png" 
                                    alt="ELIMEN Logo" 
                                    className="h-10 sm:h-12 w-auto object-contain group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </Link>

                    {/* 2. Search Bar (Desktop Only) */}
                    <div className="hidden md:block flex-1 max-w-sm mx-4 relative">
                        <SearchBar />
                    </div>

                    {/* 3. Action Icons */}
                    <div 
                        className="flex items-center gap-1 sm:gap-2 shrink-0 overflow-x-auto no-scrollbar"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {user ? (
                            <>
                                <Link href="/" className={iconBtnStyle} title="Home">
                                    <Home size={22} strokeWidth={2.5} />
                                </Link>

                                <Link href="/market" className={iconBtnStyle} title="Live Market">
                                    <TrendingUp size={22} strokeWidth={2.5} className="text-blue-500" />
                                </Link>

                                <Link href="/messages" className={iconBtnStyle} title="Messages">
                                    <MessageSquare size={22} strokeWidth={2.5} />
                                </Link>

                                <Link href={`/profile/${user.id}`} className={iconBtnStyle} title="Profile">
                                    <User size={22} strokeWidth={2.5} />
                                </Link>

                                <div className="shrink-0 flex items-center justify-center">
                                    <NotificationBell notifications={notifications} />
                                </div>
                                <div className="shrink-0 flex items-center justify-center">
                                    <SettingsToggle />
                                </div> 
                                <div className="shrink-0 flex items-center justify-center">
                                    <ThemeToggle />
                                </div>
                                
                                <div className="shrink-0 flex items-center justify-center ml-1 pl-1 border-l border-gray-200 dark:border-gray-800">
                                    <SignOutButton />
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

                {/* 🔍 4. Mobile Search Bar */}
                <div className="md:hidden w-full px-1 pb-3">
                    <SearchBar />
                </div>

            </div>
        </header>
    )
}