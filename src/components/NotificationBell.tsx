'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

interface Notification {
    id: string
    type: string
    is_read: boolean
    from_user: { display_name: string }
    post: { content: string }
    created_at: string
}

interface NotificationBellProps {
    notifications: Notification[]
}

export default function NotificationBell({ notifications }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false)
    const supabase = createClient()

    const unreadCount = notifications.filter(n => !n.is_read).length

    const handleMarkAllRead = async () => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('is_read', false)

        if (!error) {
            // Update local state or refetch
            setIsOpen(false)
            // For simplicity, we can close the dropdown
        }
    }

    const getNotificationMessage = (notification: Notification) => {
        switch (notification.type) {
            case 'like':
                return `${notification.from_user?.display_name || 'Someone'} liked your post`
            default:
                return 'New notification'
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative text-spl-gray-dark hover:text-spl-blue dark:text-gray-300 dark:hover:text-spl-blue transition-colors"
                aria-label="Notifications"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V7a5 5 0 00-10 0v5l-5 5h5m0 0v1a3 3 0 006 0v-1m-6 0h6" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50">
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-spl-black dark:text-gray-200 mb-3">Notifications</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <p className="text-sm text-spl-gray-dark">No notifications yet</p>
                            ) : (
                                notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`p-3 rounded-lg ${notification.is_read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20'}`}
                                    >
                                        <p className="text-sm text-spl-black dark:text-gray-300">
                                            {getNotificationMessage(notification)}
                                        </p>
                                        <p className="text-xs text-spl-gray-dark mt-1">
                                            {new Date(notification.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="mt-3 w-full bg-spl-blue text-white px-4 py-2 rounded-lg hover:bg-spl-blue-dark transition-colors text-sm font-medium"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}