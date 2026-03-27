'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, MessageCircle, UserPlus, UserCheck, Bell, CheckCheck, Trash2 } from 'lucide-react'
import { useNotifications } from '@/context/NotificationContext'
import { formatDistanceToNow } from 'date-fns'

export default function NotificationsPage() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, isLoading } = useNotifications()
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all')

    // Filter notifications
    const filteredNotifications = activeFilter === 'all' 
        ? notifications 
        : notifications.filter(n => !n.read)

    // Mark all as read when page loads (optional)
    useEffect(() => {
        if (unreadCount > 0) {
            // Auto mark as read when viewing page? Up to you
            // markAllAsRead()
        }
    }, [])

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'like':
                return { Icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10' }
            case 'comment':
                return { Icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' }
            case 'follow':
                return { Icon: UserPlus, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
            case 'accept_request':
                return { Icon: UserCheck, color: 'text-purple-500', bg: 'bg-purple-500/10' }
            case 'mention':
                return { Icon: MessageCircle, color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
            case 'message':
                return { Icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-500/10' }
            default:
                return { Icon: Bell, color: 'text-gray-400', bg: 'bg-gray-800' }
        }
    }

    const getNotificationText = (notification: any) => {
        const displayName = notification.from_user?.display_name || 'Someone'
        
        switch (notification.type) {
            case 'like':
                return `${displayName} liked your post`
            case 'comment':
                return `${displayName} commented on your post`
            case 'follow':
                return `${displayName} started following you`
            case 'accept_request':
                return `${displayName} accepted your friend request`
            case 'mention':
                return `${displayName} mentioned you in a post`
            case 'message':
                return `${displayName} sent you a message`
            default:
                return notification.title || `${displayName} interacted with you`
        }
    }

    const getNotificationLink = (notification: any) => {
        if (notification.post_id) return `/post/${notification.post_id}`
        if (notification.type === 'follow') return `/profile/${notification.sender_id}`
        if (notification.type === 'message') return '/messages'
        return '#'
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#020617] pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-xl">
                                <Bell size={24} className="text-emerald-500" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Notifications
                            </h1>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </div>
                        
                        {/* Mark all as read button */}
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-1 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-all"
                            >
                                <CheckCheck size={16} />
                                <span>Mark all read</span>
                            </button>
                        )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                activeFilter === 'all'
                                    ? 'bg-emerald-500 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveFilter('unread')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                activeFilter === 'unread'
                                    ? 'bg-emerald-500 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            Unread
                            {unreadCount > 0 && (
                                <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-600 text-white text-xs rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-w-3xl mx-auto px-4 py-4">
                {isLoading ? (
                    // Loading state
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-4 animate-pulse">
                                <div className="flex gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
                                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    // Empty state
                    <div className="text-center py-20 bg-white dark:bg-gray-900/50 rounded-3xl border border-gray-200 dark:border-gray-800">
                        <Bell size={48} className="mx-auto text-gray-400 dark:text-gray-600 mb-4 opacity-50" />
                        <h2 className="text-xl font-bold text-gray-600 dark:text-gray-400">No notifications</h2>
                        <p className="text-gray-500 dark:text-gray-500 mt-2">
                            {activeFilter === 'unread' 
                                ? "You've read all your notifications! 🎉" 
                                : "When someone interacts with you, it will show up here. 🛸"}
                        </p>
                    </div>
                ) : (
                    // Notifications list
                    <div className="space-y-2">
                        {filteredNotifications.map((notification) => {
                            const { Icon, color, bg } = getNotificationIcon(notification.type)
                            const isUnread = !notification.read
                            
                            return (
                                <div
                                    key={notification.id}
                                    className={`group relative rounded-2xl transition-all ${
                                        isUnread 
                                            ? 'bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-900/20 dark:to-transparent'
                                            : ''
                                    }`}
                                >
                                    <Link
                                        href={getNotificationLink(notification)}
                                        onClick={() => {
                                            if (isUnread) markAsRead(notification.id)
                                        }}
                                        className="block"
                                    >
                                        <div className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all active:scale-[0.99]">
                                            
                                            {/* Avatar with Icon Badge */}
                                            <div className="relative shrink-0">
                                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                                                    {notification.from_user?.avatar_url ? (
                                                        <img 
                                                            src={notification.from_user.avatar_url} 
                                                            alt="avatar" 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-bold">
                                                            {notification.from_user?.display_name?.[0] || 'U'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full border-2 border-white dark:border-gray-900 ${bg}`}>
                                                    <Icon size={12} className={color} fill={notification.type === 'like' ? 'currentColor' : 'none'} />
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                        {notification.from_user?.display_name || 'Someone'}
                                                    </span>{' '}
                                                    {getNotificationText(notification)}
                                                </p>
                                                
                                                {/* Post preview */}
                                                {notification.post?.content && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-1 italic">
                                                        "{notification.post.content.substring(0, 80)}"
                                                    </p>
                                                )}

                                                {/* Time */}
                                                <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                </p>
                                            </div>
                                            
                                            {/* Unread indicator */}
                                            {isUnread && (
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-2 shadow-[0_0_8px_#10b981]" />
                                            )}
                                        </div>
                                    </Link>
                                    
                                    {/* Delete button (hover) */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault()
                                            deleteNotification(notification.id)
                                        }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all"
                                    >
                                        <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}