'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
    Home, 
    Compass, 
    Bell, 
    Mail, 
    ShoppingBag, 
    User, 
    Settings, 
    PlusCircle,
    Bookmark,
    TrendingUp
} from 'lucide-react'

export default function SidebarNav({ currentUserId }: { currentUserId: string | undefined }) {
    const pathname = usePathname()

    const navItems = [
        { name: 'Home', icon: Home, href: '/' },
        { name: 'Explore', icon: Compass, href: '/explore' },
        { name: 'Trending', icon: TrendingUp, href: '/trending' },
        { name: 'Messages', icon: Mail, href: '/chat' },
        { name: 'Notifications', icon: Bell, href: '/notifications' },
        { name: 'Marketplace', icon: ShoppingBag, href: '/marketplace' },
        { name: 'Bookmarks', icon: Bookmark, href: '/bookmarks' },
        { name: 'Profile', icon: User, href: `/profile/${currentUserId}` },
        { name: 'Settings', icon: Settings, href: '/settings' },
    ]

    return (
        <aside className="hidden xl:flex flex-col gap-2 w-64 shrink-0 sticky top-24 h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
            <div className="flex flex-col gap-1 p-2 bg-white/50 dark:bg-[#0F172A]/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl shadow-sm">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group relative overflow-hidden ${
                                isActive 
                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-emerald-500'
                            }`}
                        >
                            <item.icon size={22} className={`shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
                            <span className="font-bold tracking-wide">{item.name}</span>
                            
                            {isActive && (
                                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/30 rounded-l-full" />
                            )}
                        </Link>
                    )
                })}
            </div>

            <button className="mt-4 w-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white p-4 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/30 hover:opacity-90 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 active:scale-95">
                <PlusCircle size={24} />
                Create Post
            </button>

            {/* Premium Link Mini Banner */}
            <div className="mt-auto p-5 bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <h4 className="text-white font-black text-lg relative z-10">Space Link Pro</h4>
                <p className="text-blue-100 text-xs mt-1 relative z-10 leading-relaxed">Unlock advanced analytics and exclusive badges.</p>
                <button className="mt-3 bg-white text-blue-700 px-4 py-1.5 rounded-xl text-xs font-black hover:bg-blue-50 transition-colors relative z-10">
                    Upgrade Now
                </button>
            </div>
        </aside>
    )
}
