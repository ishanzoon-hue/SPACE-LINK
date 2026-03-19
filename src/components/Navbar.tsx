import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import SearchBar from './SearchBar'
import ThemeToggle from './ThemeToggle'
import SignOutButton from './SignOutButton'
import NotificationBell from './NotificationBell'
import SettingsToggle from './SettingsToggle' // ✅ අලුතින් ඇඩ් කළා

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

    return (
        <header className="bg-white dark:bg-[#0F172A] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors">
            <div className="max-w-5xl mx-auto px-2 sm:px-4 h-16 flex items-center justify-between gap-1 sm:gap-4">
                
                {/* 1. Logo */}
                <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
                    <div className="flex items-center">
                        <svg 
                            viewBox="0 0 160 40" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                            className="hover:scale-105 transition-transform duration-300 w-24 sm:w-40 h-auto"
                        >
                            <text x="0" y="30" fontFamily="system-ui, -apple-system, sans-serif" fontSize="28" fontWeight="800" fill="#10B981" letterSpacing="-1">elimen</text>
                            <circle cx="115" cy="20" r="11" fill="none" stroke="#10B981" strokeWidth="3.5"/>
                            <circle cx="108" cy="12" r="4.5" fill="#10B981"/>
                            <circle cx="122" cy="12" r="4.5" fill="#10B981"/>
                            <path d="M 106 26 C 106 14, 124 14, 124 26 Z" fill="#10B981"/>
                            <circle cx="111" cy="19" r="1.5" fill="#FFFFFF"/>
                            <circle cx="119" cy="19" r="1.5" fill="#FFFFFF"/>
                            <circle cx="115" cy="23" r="1.2" fill="#FFFFFF"/>
                        </svg>
                    </div>
                </Link>

                {/* 2. Search Bar */}
                <div className="flex-1 max-w-[140px] xs:max-w-[200px] sm:max-w-sm mx-1 sm:mx-4">
                    <SearchBar />
                </div>

                {/* 3. Action Icons */}
                <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
                    {user ? (
                        <>
                            {/* Home */}
                            <Link href="/" className="p-1.5 text-gray-500 hover:text-spl-green dark:text-gray-400 transition-colors">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            </Link>

                            {/* Messages */}
                            <Link href="/messages" className="p-1.5 text-gray-500 hover:text-spl-green dark:text-gray-400 transition-colors">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                            </Link>

                            {/* Profile */}
                            <Link href={`/profile/${user.id}`} className="p-1.5 text-gray-500 hover:text-spl-green dark:text-gray-400 transition-colors">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </Link>

                            <NotificationBell notifications={notifications} />
                            
                            {/* ✅ Settings Toggle බට්න් එක මෙතන තියෙනවා */}
                            <SettingsToggle /> 

                            <ThemeToggle />
                            <SignOutButton />
                        </>
                    ) : (
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <SettingsToggle /> {/* ✅ Log වෙලා නැති අයටත් Settings බලන්න පුළුවන් */}
                            <Link href="/login" className="text-xs font-semibold px-3 py-2">Log in</Link>
                            <Link href="/signup" className="text-xs font-bold bg-spl-green text-white px-3 py-2 rounded-lg">Sign up</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}