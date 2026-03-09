import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import SearchBar from './SearchBar'
import ThemeToggle from './ThemeToggle'
import SignOutButton from './SignOutButton'
import NotificationBell from './NotificationBell'
import { Video } from 'lucide-react' // අලුතින් එකතු කළ import එක

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
            .limit(10) // limit to 10 for dropdown
        notifications = data || []
    }

    return (
        <header className="bg-white dark:bg-[#0F172A] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors">
            <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                
                {/* අලුත් මී ලෝගෝ එක මෙතන තියෙනවා */}
                <Link href="/" className="shrink-0 transition-opacity hover:opacity-80">
                    <div className="flex items-center gap-2">
                        <svg 
                            width="160" 
                            height="40" 
                            viewBox="0 0 160 40" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                            className="hover:scale-105 transition-transform duration-300"
                        >
                            {/* "elimen" Text */}
                            <text 
                                x="0" 
                                y="30" 
                                fontFamily="system-ui, -apple-system, sans-serif" 
                                fontSize="28" 
                                fontWeight="800" 
                                fill="#10B981"
                                letterSpacing="-1"
                            >
                                elimen
                            </text>
                            
                            {/* The 'o' circle outline */}
                            <circle cx="115" cy="20" r="11" fill="none" stroke="#10B981" strokeWidth="3.5"/>
                            
                            {/* Mouse ears peeking out */}
                            <circle cx="108" cy="12" r="4.5" fill="#10B981"/>
                            <circle cx="122" cy="12" r="4.5" fill="#10B981"/>
                            
                            {/* Mouse face base */}
                            <path d="M 106 26 C 106 14, 124 14, 124 26 Z" fill="#10B981"/>
                            
                            {/* Mouse eyes */}
                            <circle cx="111" cy="19" r="1.5" fill="#FFFFFF"/>
                            <circle cx="119" cy="19" r="1.5" fill="#FFFFFF"/>
                            
                            {/* Mouse nose */}
                            <circle cx="115" cy="23" r="1.2" fill="#FFFFFF"/>
                        </svg>
                    </div>
                </Link>

                <div className="hidden md:flex flex-1 max-w-sm mx-6">
                    <SearchBar />
                </div>

                <div className="flex items-center gap-4 shrink-0">
                    {user ? (
                        <>
                            {/* Home Link */}
                            <Link
                                href="/"
                                className="text-spl-gray-dark hover:text-spl-blue dark:text-gray-300 dark:hover:text-spl-blue transition-colors"
                                aria-label="Home"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                            </Link>

                            {/* Messages Link */}
                            <Link
                                href="/messages"
                                className="text-spl-gray-dark hover:text-spl-blue dark:text-gray-300 dark:hover:text-spl-blue transition-colors"
                                aria-label="Messages"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                            </Link>

                            {/* Video Call Link - අලුතින් එකතු කළ කොටස */}
                            <Link
                                href="/video-call"
                                className="text-spl-gray-dark hover:text-spl-blue dark:text-gray-300 dark:hover:text-spl-blue transition-colors"
                                aria-label="Video Call"
                            >
                                <Video className="w-6 h-6" />
                            </Link>

                            {/* Profile Link */}
                            <Link
                                href={`/profile/${user.id}`}
                                className="text-spl-gray-dark hover:text-spl-blue dark:text-gray-300 dark:hover:text-spl-blue transition-colors"
                                aria-label="Profile"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </Link>

                            <NotificationBell notifications={notifications} />

                            <ThemeToggle />
                            <SignOutButton />
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <Link
                                href="/login"
                                className="text-sm font-medium text-spl-black dark:text-gray-200 hover:text-spl-blue transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/signup"
                                className="text-sm font-medium bg-spl-green text-white px-4 py-2 rounded-lg hover:bg-spl-green-dark transition-colors"
                            >
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}