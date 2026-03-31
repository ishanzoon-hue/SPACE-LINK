'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useUser } from '@/hooks/useUser'

// Notification type - matches your database structure
interface Notification {
    id: string
    type: 'like' | 'comment' | 'follow' | 'accept_request' | 'mention' | 'message'
    title: string
    content: string
    is_read: boolean          // your DB uses is_read
    read?: boolean            // alias for convenience
    created_at: string
    from_user_id: string
    user_id: string          // your notifications page uses user_id
    post_id?: string
    from_user?: {
        id: string
        display_name: string
        avatar_url: string
        username?: string
    }
    post?: {
        content: string
    }
}

interface NotificationContextType {
    notifications: Notification[]
    unreadCount: number
    addNotification: (notification: Notification) => void
    markAsRead: (id: string) => Promise<void>
    markAllAsRead: () => Promise<void>
    deleteNotification: (id: string) => Promise<void>
    isLoading: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { user } = useUser()
    const supabase = createClient()

    // Helper: convert is_read to read for convenience
    const normalizeNotification = (n: any): Notification => ({
        ...n,
        read: n.is_read,
    })

    // Load initial notifications
    const loadNotifications = useCallback(async () => {
        if (!user) return

        setIsLoading(true)
        const { data, error } = await supabase
            .from('notifications')
            .select(`
                id, type, title, content, is_read, created_at,
                from_user_id, user_id, post_id,
                from_user:profiles!from_user_id(id, display_name, avatar_url, username),
                post:posts!post_id(content)
            `)
            .eq('user_id', user.id)   // your DB uses user_id
            .order('created_at', { ascending: false })
            .limit(50)

        if (error) {
            console.error('Error loading notifications:', error)
        } else {
            setNotifications((data || []).map(normalizeNotification))
        }
        setIsLoading(false)
    }, [user, supabase])

    // Subscribe to realtime notifications
    useEffect(() => {
        if (!user) return

        loadNotifications()

        // Subscribe to new INSERTs
        const channel = supabase
            .channel('notifications-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,   // your DB filter
                },
                async (payload) => {
                    // Fetch full notification with relations
                    const { data: newNoti } = await supabase
                        .from('notifications')
                        .select(`
                            id, type, title, content, is_read, created_at,
                            from_user_id, user_id, post_id,
                            from_user:profiles!from_user_id(id, display_name, avatar_url, username),
                            post:posts!post_id(content)
                        `)
                        .eq('id', payload.new.id)
                        .single()

                    if (newNoti) {
                        const normalized = normalizeNotification(newNoti)
                        setNotifications(prev => [normalized, ...prev])

                        // Show browser notification if permission granted
                        if (Notification.permission === 'granted') {
                            new Notification(normalized.title || 'New notification', {
                                body: normalized.content,
                                icon: '/icon.png',
                            })
                        }
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    setNotifications(prev =>
                        prev.map(n => n.id === payload.new.id ? normalizeNotification(payload.new) : n)
                    )
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, supabase, loadNotifications])

    // Request notification permission on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission()
        }
    }, [])

    // Mark single as read
    const markAsRead = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)

        if (!error) {
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true, read: true } : n)
            )
        }
    }

    // Mark all as read
    const markAllAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id)
        if (unreadIds.length === 0) return

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', unreadIds)

        if (!error) {
            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true, read: true }))
            )
        }
    }

    // Delete notification
    const deleteNotification = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id)

        if (!error) {
            setNotifications(prev => prev.filter(n => n.id !== id))
        }
    }

    // Add manual notification (if needed)
    const addNotification = (notification: Notification) => {
        setNotifications(prev => [notification, ...prev])
    }

    const unreadCount = notifications.filter(n => !n.is_read).length

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                addNotification,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                isLoading,
            }}
        >
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider')
    }
    return context
}