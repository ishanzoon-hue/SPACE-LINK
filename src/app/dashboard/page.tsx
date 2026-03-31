import { createClient } from '@/utils/supabase/server'
import FollowingList from '@/components/FollowingList'
import FriendRequestCard from '@/components/post/FriendRequestCard'
import { Users, LayoutDashboard, Settings, MessageSquare, Heart, Zap, Award, Share2 } from 'lucide-react'
import Link from 'next/link'
import StatCard from '@/components/dashboard/StatCard'
import WalletWidget from '@/components/dashboard/WalletWidget'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div className="p-20 text-center text-white font-bold uppercase tracking-widest">Please login to view dashboard.</div>

    // 📊 Fetch User Profile & Stats
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // 📈 Real-time counts
    const [{ count: postCount }, { count: followerCount }, { count: followingCount }] = await Promise.all([
        supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('friend_requests').select('*', { count: 'exact', head: true }).eq('receiver_id', user.id).eq('status', 'accepted'),
        supabase.from('friend_requests').select('*', { count: 'exact', head: true }).eq('sender_id', user.id).eq('status', 'accepted')
    ])

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            {/* 🚀 Futuristic Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="flex items-center gap-6">
                    <div className="p-5 bg-emerald-500/10 rounded-[32px] border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                        <LayoutDashboard className="text-emerald-500" size={40} />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase">Command Center</h1>
                        <p className="text-gray-500 text-xs uppercase tracking-[0.3em] font-black mt-1 flex items-center gap-2">
                             <Zap size={14} className="text-emerald-500" /> System Online & Synced
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="bg-[#0F172A] px-6 py-3 rounded-2xl border border-gray-800 flex items-center gap-3">
                        <Award className="text-yellow-500" size={20} />
                        <span className="text-white font-black italic">{profile?.is_verified ? 'Verified Citizen' : 'Space Explorer'}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 🛡️ LEFT: Main Stats & Wallet (8 Columns) */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <StatCard 
                            label="Total Posts" 
                            value={postCount || 0} 
                            icon={MessageSquare} 
                            color="#10b981" 
                            trend="+12% this week"
                        />
                        <StatCard 
                            label="Followers" 
                            value={followerCount || 0} 
                            icon={Users} 
                            color="#3b82f6" 
                            trend="New"
                        />
                        <StatCard 
                            label="Engagement" 
                            value="2.4k" 
                            icon={Heart} 
                            color="#f43f5e" 
                            trend="Hot"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Wallet Area */}
                        <WalletWidget 
                            balance={profile?.lmo_balance || 0} 
                            refCode={profile?.id.split('-')[0].toUpperCase() || 'ERRO'} 
                        />

                        {/* Recent Performance/Activity Concept */}
                        <div className="bg-[#0F172A] p-8 rounded-[40px] border border-gray-800 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Network Health</h3>
                                <div className="space-y-6">
                                    {[
                                        { label: 'Followers Gained', val: 85, color: '#3b82f6' },
                                        { label: 'Post Impressions', val: 62, color: '#8b5cf6' },
                                        { label: 'Ad Revenue share', val: 30, color: '#10b981' }
                                    ].map((item) => (
                                        <div key={item.label} className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                                                <span>{item.label}</span>
                                                <span style={{ color: item.color }}>{item.val}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.val}%`, backgroundColor: item.color }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Link href="/settings" className="mt-8 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-black py-4 rounded-2xl border border-gray-800 transition-all group">
                                <Settings size={16} className="group-hover:rotate-90 transition-transform" /> 
                                Advanced Settings
                            </Link>
                        </div>
                    </div>

                    {/* Friend Requests moved here for better flow */}
                    <FriendRequestCard /> 
                </div>

                {/* 📋 RIGHT: Connections & Social (4 Columns) */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-[#0F172A] rounded-[48px] border border-gray-800 overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-gray-800 bg-gray-900/30 flex justify-between items-center">
                            <h2 className="text-xl font-black text-white uppercase italic flex items-center gap-3">
                                <Users className="text-emerald-500" /> Space Squad
                            </h2>
                            <Link href="/search" className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-all">
                                <Share2 size={18} />
                            </Link>
                        </div>
                        
                        <div className="p-4">
                             <FollowingList currentUserId={user.id} />
                        </div>
                    </div>

                    {/* Quick Info Card */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black italic mb-2 uppercase">Pro Explorer</h3>
                            <p className="text-white/70 text-sm mb-6 leading-relaxed">Upgrade to unlock advanced analytics and personalized themes for your profile.</p>
                            <button className="w-full bg-white text-blue-600 font-bold py-3 rounded-2xl hover:scale-105 active:scale-95 transition-all">
                                Coming Soon
                            </button>
                        </div>
                        <Zap size={140} className="absolute -right-10 -bottom-10 text-white/10 rotate-12" />
                    </div>
                </div>

            </div>
        </div>
    )
}