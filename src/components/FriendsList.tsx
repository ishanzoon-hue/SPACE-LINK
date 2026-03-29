'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import { Users, UserCheck, UserPlus, UserX, Clock, BadgeCheck, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from '@/hooks/useTranslation'

type Profile = {
    id: string
    display_name: string
    avatar_url: string | null
    is_verified?: boolean
    requestId?: string
}

type Props = {
    friends: Profile[]
    pendingRequests: Profile[]
    suggestions: Profile[]
    currentUserId: string
}

export default function FriendsList({ friends: initialFriends, pendingRequests: initialRequests, suggestions: initialSuggestions, currentUserId }: Props) {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'suggestions'>('friends')
    const [friends, setFriends] = useState<Profile[]>(initialFriends)
    const [pendingRequests, setPendingRequests] = useState<Profile[]>(initialRequests)
    const [suggestions, setSuggestions] = useState<Profile[]>(initialSuggestions)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const supabase = createClient()

    const formatName = (name: string) => name?.includes('@') ? name.split('@')[0] : (name || 'User')

    const filteredFriends = friends.filter(f => formatName(f.display_name).toLowerCase().includes(searchQuery.toLowerCase()))

    // Accept a friend request
    const handleAccept = async (user: Profile) => {
        if (!user.requestId) return
        setLoadingId(user.id)
        try {
            const { error } = await supabase
                .from('friend_requests')
                .update({ status: 'accepted' })
                .eq('id', user.requestId)
            if (error) throw error

            // Send notification
            await supabase.from('notifications').insert([{
                user_id: user.id,
                receiver_id: user.id,
                sender_id: currentUserId,
                from_user_id: currentUserId,
                type: 'friend_accept'
            }])

            setPendingRequests(prev => prev.filter(u => u.id !== user.id))
            setFriends(prev => [...prev, { ...user, requestId: undefined }])
            toast.success(`You and ${formatName(user.display_name)} are now friends! 🎉`)
        } catch (e: any) {
            toast.error(e.message || 'Failed')
        } finally {
            setLoadingId(null)
        }
    }

    // Decline / cancel a request or unfriend
    const handleDecline = async (user: Profile, fromTab: 'requests' | 'friends') => {
        if (!user.requestId) return
        setLoadingId(user.id)
        try {
            const { error } = await supabase
                .from('friend_requests')
                .delete()
                .eq('id', user.requestId)
            if (error) throw error

            if (fromTab === 'requests') {
                setPendingRequests(prev => prev.filter(u => u.id !== user.id))
                toast.success('Request declined')
            } else {
                setFriends(prev => prev.filter(u => u.id !== user.id))
                toast.success(`Unfriended ${formatName(user.display_name)}`)
            }
        } catch (e: any) {
            toast.error(e.message || 'Failed')
        } finally {
            setLoadingId(null)
        }
    }

    // Send friend request from suggestions
    const handleAddFriend = async (user: Profile) => {
        setLoadingId(user.id)
        try {
            const { data, error } = await supabase
                .from('friend_requests')
                .insert([{ sender_id: currentUserId, receiver_id: user.id, status: 'pending' }])
                .select()
                .single()
            if (error) throw error

            await supabase.from('notifications').insert([{
                user_id: user.id,
                receiver_id: user.id,
                sender_id: currentUserId,
                from_user_id: currentUserId,
                type: 'friend_request'
            }])

            setSuggestions(prev => prev.filter(u => u.id !== user.id))
            toast.success(`Friend request sent! 🚀`)
        } catch (e: any) {
            toast.error(e.message || 'Failed')
        } finally {
            setLoadingId(null)
        }
    }

    const tabs = [
        { key: 'friends', label: t('friends.tab_friends'), icon: <Users size={18} />, count: friends.length },
        { key: 'requests', label: t('friends.tab_requests'), icon: <Clock size={18} />, count: pendingRequests.length },
        { key: 'suggestions', label: t('friends.tab_suggestions'), icon: <UserPlus size={18} />, count: suggestions.length },
    ] as const

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{t('friends.title')}</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('friends.sub')}</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1.5 bg-gray-100 dark:bg-[#0F172A] rounded-2xl mb-8 w-full overflow-x-auto no-scrollbar border border-gray-200 dark:border-gray-800">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all flex-1 justify-center ${activeTab === tab.key
                            ? 'bg-white dark:bg-[#1E293B] text-emerald-500 shadow-sm border border-gray-200 dark:border-gray-700'
                            : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                        {tab.count > 0 && (
                            <span className={`text-xs font-black px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-emerald-500 text-white' : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}>{tab.count}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* --- FRIENDS TAB --- */}
            {activeTab === 'friends' && (
                <div>
                    {/* Search bar */}
                    <div className="relative mb-6">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={t('common.search')}
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
                        />
                    </div>

                    {filteredFriends.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-[#0F172A] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="text-gray-400" size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No friends yet</h3>
                            <p className="text-gray-500 text-sm">Start adding friends from the suggestions tab!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredFriends.map(user => (
                                <FriendCard
                                    key={user.id}
                                    user={user}
                                    formatName={formatName}
                                    loadingId={loadingId}
                                    actions={
                                        <div className="flex gap-2 mt-4 w-full">
                                            <Link
                                                href={`/profile/${user.id}`}
                                                className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-center py-2 rounded-xl font-bold text-xs transition-all"
                                            >
                                                {t('friends.view_profile')}
                                            </Link>
                                            <button
                                                onClick={() => handleDecline(user, 'friends')}
                                                disabled={loadingId === user.id}
                                                className="flex-1 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-500 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1"
                                            >
                                                <UserX size={13} /> {t('friends.unfriend')}
                                            </button>
                                        </div>
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- REQUESTS TAB --- */}
            {activeTab === 'requests' && (
                <div>
                    {pendingRequests.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-[#0F172A] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Clock className="text-gray-400" size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No pending requests</h3>
                            <p className="text-gray-500 text-sm">When someone sends you a friend request, it'll appear here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendingRequests.map(user => (
                                <FriendCard
                                    key={user.id}
                                    user={user}
                                    formatName={formatName}
                                    loadingId={loadingId}
                                    badge={<span className="text-[10px] text-blue-500 font-bold bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">Wants to be friends</span>}
                                    actions={
                                        <div className="flex gap-2 mt-4 w-full">
                                            <button
                                                onClick={() => handleAccept(user)}
                                                disabled={loadingId === user.id}
                                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 disabled:opacity-60"
                                            >
                                                <UserCheck size={13} /> {loadingId === user.id ? '...' : t('friends.accept')}
                                            </button>
                                            <button
                                                onClick={() => handleDecline(user, 'requests')}
                                                disabled={loadingId === user.id}
                                                className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1"
                                            >
                                                <UserX size={13} /> {t('friends.decline')}
                                            </button>
                                        </div>
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- SUGGESTIONS TAB --- */}
            {activeTab === 'suggestions' && (
                <div>
                    {suggestions.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-[#0F172A] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UserPlus className="text-gray-400" size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No suggestions right now</h3>
                            <p className="text-gray-500 text-sm">Check back later for new people to connect with.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {suggestions.map(user => (
                                <FriendCard
                                    key={user.id}
                                    user={user}
                                    formatName={formatName}
                                    loadingId={loadingId}
                                    actions={
                                        <div className="flex gap-2 mt-4 w-full">
                                            <button
                                                onClick={() => handleAddFriend(user)}
                                                disabled={loadingId === user.id}
                                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 disabled:opacity-60 shadow-md shadow-emerald-500/20"
                                            >
                                                <UserPlus size={13} /> {loadingId === user.id ? '...' : t('friends.add_friend')}
                                            </button>
                                            <Link
                                                href={`/profile/${user.id}`}
                                                className="flex-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white text-center py-2 rounded-xl font-bold text-xs transition-all flex items-center justify-center"
                                            >
                                                {t('friends.view_profile')}
                                            </Link>
                                        </div>
                                    }
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// Reusable card component
function FriendCard({
    user,
    formatName,
    loadingId,
    actions,
    badge
}: {
    user: Profile
    formatName: (n: string) => string
    loadingId: string | null
    actions: React.ReactNode
    badge?: React.ReactNode
}) {
    const name = formatName(user.display_name)
    return (
        <div className={`bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col ${loadingId === user.id ? 'opacity-60 pointer-events-none' : ''}`}>
            {/* Cover banner */}
            <div className="h-20 bg-gradient-to-br from-emerald-500/30 via-blue-500/20 to-purple-500/20" />

            <div className="px-4 pb-4 -mt-10 flex flex-col items-center text-center relative">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full border-4 border-white dark:border-[#0F172A] overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-md mb-3">
                    {user.avatar_url ? (
                        <img src={user.avatar_url} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl font-black text-emerald-500">{name.charAt(0).toUpperCase()}</span>
                    )}
                </div>

                {/* Name + badge */}
                <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="font-black text-gray-900 dark:text-white text-sm truncate max-w-[140px]">{name}</p>
                    {user.is_verified && (
                        <BadgeCheck size={15} className="text-emerald-400 fill-emerald-400/20 shrink-0" />
                    )}
                </div>
                <p className="text-[11px] text-gray-400 font-medium mb-2">@{name.toLowerCase()}</p>

                {badge && <div className="mb-2">{badge}</div>}

                {actions}
            </div>
        </div>
    )
}
