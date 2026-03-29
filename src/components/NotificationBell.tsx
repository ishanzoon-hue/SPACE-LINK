'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Heart, MessageCircle, UserPlus, UserCheck, Bell, CheckCheck, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
    id: string
    type: string
    is_read: boolean
    from_user: { display_name: string, avatar_url?: string }
    post?: { content: string }
    post_id?: string
    sender_id?: string
    from_user_id?: string
    created_at: string
}

interface NotificationBellProps {
    notifications: Notification[]
}

export default function NotificationBell({ notifications: initialNotifications }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState(initialNotifications)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    useEffect(() => {
        setNotifications(initialNotifications)
    }, [initialNotifications])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const unreadCount = notifications.filter(n => !n.is_read).length

    const handleMarkAllRead = async () => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('is_read', false)

        if (!error) {
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
        }
    }

    const markAsRead = async (id: string, currentlyUnread: boolean) => {
        if (!currentlyUnread) return;
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'like': return { Icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10' }
            case 'comment': return { Icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' }
            case 'follow': return { Icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
            case 'accept_request': return { Icon: UserCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' }
            case 'mention': return { Icon: MessageCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
            case 'message': return { Icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-500/10' }
            default: return { Icon: Bell, color: 'text-gray-400', bg: 'bg-gray-800' }
        }
    }

    const getNotificationText = (notification: Notification) => {
        switch (notification.type) {
            case 'like': return `liked your post`
            case 'comment': return `commented on your post`
            case 'follow': return `started following you`
            case 'accept_request': return `accepted your friend request`
            case 'mention': return `mentioned you in a post`
            case 'message': return `sent you a message`
            default: return `interacted with you`
        }
    }

    const getNotificationLink = (notification: Notification) => {
        if (notification.post_id) return `/post/${notification.post_id}`
        const sender = notification.from_user_id || notification.sender_id
        if (notification.type === 'follow' && sender) return `/profile/${sender}`
        if (notification.type === 'message') return '/messages'
        return '#'
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 sm:p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-gray-800 hover:text-emerald-500 transition-all flex items-center justify-center shrink-0 cursor-pointer min-h-[44px] min-w-[44px]"
                aria-label="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white dark:border-[#0F172A]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-[-60px] sm:right-0 mt-2 w-[340px] sm:w-[350px] bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl z-[150] overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h3>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    title="Mark all as read"
                                    className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <CheckCheck size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2 opacity-50" />
                                <p className="text-sm font-medium text-gray-500">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {notifications.map(notification => {
                                    const { Icon, color, bg } = getNotificationIcon(notification.type)
                                    const isUnread = !notification.is_read
                                    const displayName = notification.from_user?.display_name || 'Someone'

                                    return (
                                        <Link
                                            key={notification.id}
                                            href={getNotificationLink(notification)}
                                            onClick={() => {
                                                markAsRead(notification.id, isUnread)
                                                setIsOpen(false)
                                            }}
                                            className={`flex items-start gap-3 p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-50 dark:border-gray-800/50 last:border-0 ${isUnread ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                                }`}
                                        >
                                            {/* Avatar with Icon Badge */}
                                            <div className="relative shrink-0 mt-1">
                                                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                                                    {notification.from_user?.avatar_url ? (
                                                        <img src={notification.from_user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                                            {displayName[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 p-1 rounded-full border-[3px] border-white dark:border-[#1E293B] ${bg}`}>
                                                    <Icon size={11} className={color} fill={notification.type === 'like' ? 'currentColor' : 'none'} />
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0 pr-2">
                                                <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">
                                                    <span className="font-bold text-gray-900 dark:text-white">{displayName}</span> {getNotificationText(notification)}
                                                </p>
                                                <p className={`text-[13px] mt-0.5 ${isUnread ? 'text-blue-500 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                </p>
                                            </div>

                                            {/* Unread Dot Indicator */}
                                            {isUnread && (
                                                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0 mt-3 mr-1 shadow-[0_0_5px_#3b82f6]" />
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
                        <Link
                            href="/notifications"
                            onClick={() => setIsOpen(false)}
                            className="block w-full text-center py-2 text-sm font-semibold text-emerald-500 dark:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            See all in Notifications
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}