'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Home, MessageSquare, User, TrendingUp, Trophy, Menu, X, Radio, ShieldCheck } from 'lucide-react'
import NotificationBell from './NotificationBell'
import SettingsToggle from './SettingsToggle'
import ThemeToggle from './ThemeToggle'
import SignOutButton from './SignOutButton'
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslation } from '@/hooks/useTranslation'

interface MobileMenuProps {
    userId: string
    notifications: any[]
}

export default function MobileMenu({ userId, notifications }: MobileMenuProps) {
    const { t } = useTranslation()
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
            {/* 
              * Invisible Hitbox — Touch Target Fix
              * Icon: 24px | Tappable area: 48×48px (meets Apple HIG 44px & Google 48px)
              * padding: 12px all sides → (24 + 12*2 = 48px)
              */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="mobile-menu-button sm:hidden flex items-center justify-center min-h-[48px] min-w-[48px] p-3 rounded-full text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-gray-800 transition-all"
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-[140] sm:hidden"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Menu Panel */}
                    <div className="mobile-menu fixed top-0 bottom-0 right-0 w-[280px] bg-white dark:bg-[#0F172A] border-l border-gray-200 dark:border-gray-800 shadow-2xl z-[150] sm:hidden animate-slide-left flex flex-col">
                        <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 mb-2">
                            <span className="text-xl font-black text-emerald-500 italic">Elimeno</span>
                            <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 p-4 gap-1 overflow-y-auto no-scrollbar">
                            <MobileNavItem href="/" icon={<Home size={20} />} label={t('common.home')} onClick={() => setIsOpen(false)} />
                            <MobileNavItem href="/live" icon={<Radio size={20} className="text-red-500" />} label={t('common.live_orbit')} onClick={() => setIsOpen(false)} />
                            <MobileNavItem href="/leaderboard" icon={<Trophy size={20} className="text-yellow-500" />} label={t('common.leaderboard')} onClick={() => setIsOpen(false)} />
                            <MobileNavItem href="/market" icon={<TrendingUp size={20} className="text-blue-500" />} label={t('common.market')} onClick={() => setIsOpen(false)} />
                            <MobileNavItem href="/messages" icon={<MessageSquare size={20} />} label={t('common.messages')} onClick={() => setIsOpen(false)} />
                            <MobileNavItem href={`/profile/${userId}`} icon={<User size={20} />} label={t('common.profile')} onClick={() => setIsOpen(false)} />

                            <div className="h-px bg-gray-200 dark:bg-gray-800 my-4" />

                            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('common.notifications')}</span>
                                <NotificationBell notifications={notifications} />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Language</span>
                                <LanguageSwitcher />
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('common.settings')}</span>
                                <SettingsToggle />
                            </div>

                            <MobileNavItem href="/settings" icon={<ShieldCheck size={20} className="text-emerald-500" />} label="Settings & Privacy" onClick={() => setIsOpen(false)} />

                            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
                                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{t('common.theme')}</span>
                                <ThemeToggle />
                            </div>

                            <div className="h-px bg-gray-200 dark:bg-gray-800 my-4" />

                            <div className="p-3">
                                <SignOutButton />
                            </div>
                        </div>
                    </div>
                </>
            )}
            <style jsx>{`
                @keyframes slide-left {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-left {
                    animation: slide-left 0.3s ease-out;
                }
            `}</style>
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
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{label}</span>
        </Link>
    )
}