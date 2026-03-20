import { createClient } from '@/utils/supabase/server'
import FollowingList from '@/components/FollowingList'
import FriendRequestCard from '@/components/post/FriendRequestCard' // 👈 මේක අමතක නොකර Import කරන්න
import { Users, LayoutDashboard, Settings } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div className="p-20 text-center text-white font-bold uppercase tracking-widest">Please login to view dashboard.</div>

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            {/* 🚀 Dashboard Header */}
            <div className="flex items-center gap-4 mb-10">
                <div className="p-4 bg-emerald-500/10 rounded-3xl border border-emerald-500/20">
                    <LayoutDashboard className="text-emerald-500" size={32} />
                </div>
                <div>
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">Your Dashboard</h1>
                    <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">Manage your space connections</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 📊 LEFT: Stats Cards & Settings */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#0F172A] p-8 rounded-[40px] border border-gray-800 shadow-2xl">
                        <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest mb-6">Quick Stats</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                <span className="text-gray-400 font-bold">Total Following</span>
                                <span className="text-3xl font-black text-emerald-500 italic">24</span>
                            </div>
                            <div className="flex justify-between items-end border-b border-white/5 pb-4">
                                <span className="text-gray-400 font-bold">Total Followers</span>
                                <span className="text-3xl font-black text-blue-500 italic">156</span>
                            </div>
                            <div className="flex justify-between items-end">
                                <span className="text-gray-400 font-bold">Post Reach</span>
                                <span className="text-3xl font-black text-purple-500 italic">1.2k</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[40px] shadow-xl text-white group cursor-pointer overflow-hidden relative">
                        <div className="relative z-10">
                            <Settings className="mb-4 group-hover:rotate-90 transition-transform duration-500" size={32} />
                            <h3 className="text-xl font-black uppercase italic">Account Settings</h3>
                            <p className="text-white/70 text-sm mt-1">Privacy, Security & Vibe</p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                             <Settings size={150} />
                        </div>
                    </div>
                </div>

                {/* 📋 RIGHT: Notifications & Connections */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* 🔔 මෙන්න මෙතනට Friend Requests කාඩ් එක දැම්මා */}
                    <FriendRequestCard /> 

                    <div className="bg-[#0F172A]/30 backdrop-blur-md rounded-[48px] border border-gray-800/50 overflow-hidden">
                        <div className="p-8 border-b border-gray-800 bg-[#0F172A]/50 flex justify-between items-center">
                            <h2 className="text-2xl font-black text-white uppercase italic flex items-center gap-3">
                                <Users className="text-emerald-500" /> My Connections
                            </h2>
                            <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-500/20">
                                Real-time
                            </span>
                        </div>
                        
                        <div className="p-2">
                             <FollowingList />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}