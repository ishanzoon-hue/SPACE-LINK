'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Home, MessageSquare, User, TrendingUp, Trophy, Menu, X } from 'lucide-react'
import NotificationBell from './NotificationBell'
import SettingsToggle from './SettingsToggle'
import ThemeToggle from './ThemeToggle'
import SignOutButton from './SignOutButton'

interface MobileMenuProps {
    userId: string
    notifications: any[]
}

export default function MobileMenu({ userId, notifications }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (!target.closest('.mobile-menu') && !target.closest('.mobile-menu-button')) {
                setIsOpen(false)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    // Close menu on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false)
        }
        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [])

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    return (
        <>
            {/* Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="mobile-menu-button sm:hidden flex items-center justify-center min-h-[44px] min-w-[44px] rounded-full text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-gray-800 transition-all"
                aria-label="Menu"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/50 z-40 sm:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Menu Panel */}
                    <div className="mobile-menu fixed top-14 left-0 right-0 bg-white dark:bg-[#0F172A] border-b border-gray-200 dark:border-gray-800 shadow-xl z-50 sm:hidden animate-slide-down">
                        <div className="flex flex-col p-4 gap-1 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
                            
                            <MobileNavItem href="/" icon={<Home size={20} />} label="Home" onClick={() => setIsOpen(false)} />
                            <MobileNavItem href="/leaderboard" icon={<Trophy size={20} className="text-yellow-500" />} label="Leaderboard" onClick={() => setIsOpen(false)} />
                            <MobileNavItem href="/market" icon={<TrendingUp size={20} className="text-blue-500" />} label="Live Market" onClick={() => setIsOpen(false)} />
                            <MobileNavItem href="/messages" icon={<MessageSquare size={20} />} label="Messages" onClick={() => setIsOpen(false)} />
                            <MobileNavItem href={`/profile/${userId}`} icon={<User size={20} />} label="Profile" onClick={() => setIsOpen(false)} />
                            
                            <div className="h-px bg-gray-200 dark:bg-gray-800 my-2" />
                            
                            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</span>
                                <NotificationBell notifications={notifications} />
                            </div>
                            
                            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Settings</span>
                                <SettingsToggle />
                            </div>
                            
                            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                                <ThemeToggle />
                            </div>
                            
                            <div className="h-px bg-gray-200 dark:bg-gray-800 my-2" />
                            
                            <div className="p-3">
                                <SignOutButton />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

// Mobile Navigation Item Component
function MobileNavItem({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-98"
        >
            <span className="text-gray-600 dark:text-gray-400">{icon}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        </Link>
    )
}