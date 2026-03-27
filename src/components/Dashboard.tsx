'use client'

import { useState } from 'react'
import { Wallet, TrendingUp, Users, Gift, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState<'feed' | 'wallet'>('feed')

    return (
        <div className="space-y-4 pb-20">
            {/* Tab Switcher */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <button
                    onClick={() => setActiveTab('feed')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                        activeTab === 'feed'
                            ? 'bg-white dark:bg-gray-900 text-emerald-600 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400'
                    }`}
                >
                    Feed
                </button>
                <button
                    onClick={() => setActiveTab('wallet')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                        activeTab === 'wallet'
                            ? 'bg-white dark:bg-gray-900 text-emerald-600 shadow-sm'
                            : 'text-gray-500 dark:text-gray-400'
                    }`}
                >
                    Wallet
                </button>
            </div>

            {/* Feed Tab */}
            {activeTab === 'feed' && <FeedSection />}

            {/* Wallet Tab */}
            {activeTab === 'wallet' && <WalletSection />}
        </div>
    )
}

// ✅ Wallet Section Component
function WalletSection() {
    return (
        <div className="space-y-4">
            {/* LMO Banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs opacity-80 uppercase tracking-wider">LMO MAINNET IS LIVE</p>
                        <h2 className="text-2xl font-bold mt-1">100 LMO BONUS</h2>
                        <p className="text-sm opacity-90 mt-1">Claim your welcome bonus</p>
                    </div>
                    <Gift size={32} className="opacity-80" />
                </div>
            </div>

            {/* Wallet Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                            <Wallet size={24} className="text-emerald-600 dark:text-emerald-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">Elimen LMO Wallet</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your assets</p>
                        </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                </div>

                {/* Balance Display */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Balance</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">0.00 LMO</p>
                    <p className="text-xs text-gray-400 mt-1">≈ $0.00 USD</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-medium transition-all active:scale-95">
                        Open Wallet
                    </button>
                    <button className="flex-1 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 py-3 rounded-xl font-medium transition-all active:scale-95">
                        Claim Bonus
                    </button>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Recent Activity</h3>
                <div className="space-y-3">
                    <TransactionItem 
                        type="bonus"
                        title="Welcome Bonus"
                        amount="+100 LMO"
                        status="pending"
                        date="Just now"
                    />
                    <TransactionItem 
                        type="reward"
                        title="Post Reward"
                        amount="+5 LMO"
                        status="completed"
                        date="2 hours ago"
                    />
                </div>
            </div>
        </div>
    )
}

// ✅ Feed Section Component
function FeedSection() {
    const following = [
        { name: 'ELIMEN', avatar: 'E', verified: true },
        { name: 'Niro', avatar: 'N', verified: false },
        { name: 'Chamath', avatar: 'C', verified: false },
    ]

    const posts = [
        {
            id: 1,
            user: 'ELIMEN',
            username: '@elimen',
            avatar: 'E',
            content: '🚀 Elimeno Web3 platform is now live! Claim your 100 LMO bonus and start connecting with friends.',
            timestamp: '2h ago',
            likes: 24,
            comments: 5,
        },
        {
            id: 2,
            user: 'Niro',
            username: '@niro',
            avatar: 'N',
            content: 'Just joined Elimeno! This is the future of social media. #Elimeno #Web3',
            timestamp: '5h ago',
            likes: 12,
            comments: 3,
        },
    ]

    return (
        <div className="space-y-4">
            {/* Empty State / Radar Section */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Users size={28} className="text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">No humans found in your radar.</p>
                <button className="mt-3 text-emerald-600 dark:text-emerald-500 font-medium text-sm">
                    START EXPLORING →
                </button>
            </div>

            {/* Following Section */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Following</h3>
                    <Link href="/following" className="text-sm text-emerald-600 dark:text-emerald-500">
                        See All
                    </Link>
                </div>
                <div className="flex gap-4">
                    {following.map((user, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shadow-md">
                                {user.avatar}
                            </div>
                            <p className="text-sm font-medium mt-2 text-gray-700 dark:text-gray-300">
                                {user.name}
                            </p>
                            {user.verified && (
                                <span className="text-xs text-emerald-500">✓ Verified</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-3">
                {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>
        </div>
    )
}

// ✅ Post Card Component
function PostCard({ post }: { post: any }) {
    const [liked, setLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(post.likes)

    const handleLike = () => {
        if (liked) {
            setLikesCount(likesCount - 1)
        } else {
            setLikesCount(likesCount + 1)
        }
        setLiked(!liked)
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
            {/* User Info */}
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                    {post.avatar}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">{post.user}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{post.username}</span>
                        <span className="text-xs text-gray-400">· {post.timestamp}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm">{post.content}</p>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-6 mt-3 pt-2">
                        <button 
                            onClick={handleLike}
                            className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px]"
                        >
                            <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
                            <span className="text-sm">{likesCount}</span>
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-colors min-h-[44px] min-w-[44px]">
                            <span>💬</span>
                            <span className="text-sm">{post.comments}</span>
                        </button>
                        <button className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-emerald-500 transition-colors min-h-[44px] min-w-[44px]">
                            <span>↗️</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ✅ Transaction Item Component
function TransactionItem({ type, title, amount, status, date }: { 
    type: 'bonus' | 'reward' | 'send' | 'receive'
    title: string
    amount: string
    status: 'pending' | 'completed' | 'failed'
    date: string
}) {
    const statusColors = {
        pending: 'text-yellow-600 bg-yellow-50',
        completed: 'text-emerald-600 bg-emerald-50',
        failed: 'text-red-600 bg-red-50',
    }

    return (
        <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    type === 'bonus' ? 'bg-emerald-100' : 'bg-blue-100'
                }`}>
                    {type === 'bonus' ? '🎁' : '⭐'}
                </div>
                <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{title}</p>
                    <p className="text-xs text-gray-400">{date}</p>
                </div>
            </div>
            <div className="text-right">
                <p className={`font-semibold ${
                    amount.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                }`}>
                    {amount}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[status]}`}>
                    {status}
                </span>
            </div>
        </div>
    )
}