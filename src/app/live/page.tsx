import { createClient } from '@/utils/supabase/server'
import LiveChat from '@/components/LiveChat' // ඔයාගේ LiveChat component එක තියෙන තැන
import { redirect } from 'next/navigation'
import { Radio, Users, Eye, Rocket, Share2 } from 'lucide-react'

export default async function LiveStreamPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // ලොග් වෙලා නැත්නම් Home එකට යවනවා
    if (!user) {
        redirect('/')
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-gray-900 dark:text-white pb-10">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                
                {/* 🔴 LIVE Badge & Title Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-md font-black text-xs uppercase tracking-widest flex items-center gap-2 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                        <Radio size={14} /> Live
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black flex items-center gap-2">
                        ELIMENO ORBIT LAUNCH <Rocket className="text-emerald-400" size={28} />
                    </h1>
                </div>

                <div className="flex flex-col xl:flex-row gap-6">
                    
                    {/* 🎬 ⬅️ MAIN COLUMN (Video Player Area) */}
                    <div className="flex-1 flex flex-col gap-4">
                        
                        {/* Video Container */}
                        <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl group">
                            {/* දැනට placeholder වීඩියෝ එකක් දාලා තියෙන්නේ. පස්සේ YouTube එකක් හරි Mux/Twitch player එකක් හරි දාන්න පුළුවන් */}
                            <video 
                                autoPlay 
                                loop 
                                muted
                                playsInline 
                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                            >
                                <source src="/lmo-intro.mp4" type="video/mp4" />
                            </video>
                            
                            {/* Viewers Overlay */}
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 text-white text-sm font-bold">
                                <Eye size={16} className="text-emerald-400" />
                                1,245 Watching
                            </div>
                        </div>

                        {/* Stream Info & Actions */}
                        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <img src="/logo.png" alt="Elimeno" className="w-14 h-14 rounded-full border-2 border-emerald-500 bg-black p-1" />
                                <div>
                                    <h2 className="font-bold text-xl text-gray-900 dark:text-white flex items-center gap-1">
                                        Elimeno Official <span className="text-emerald-400 text-sm">✔</span>
                                    </h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1">
                                        <Users size={14} /> 120K Followers
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex gap-3">
                                <button className="bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white px-6 py-2.5 rounded-xl font-bold transition-colors flex items-center gap-2">
                                    <Share2 size={18} /> Share
                                </button>
                                <button className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 rounded-xl font-black transition-all active:scale-95 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                                    SUBSCRIBE
                                </button>
                            </div>
                        </div>
                        
                        {/* Stream Description */}
                        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm">
                            <h3 className="font-bold mb-2">About this Stream</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                Welcome to the first official Elimeno Orbit Launch! 🚀 Today we are discussing the future of Web3 social media and how you can earn $LMO just by interacting. Drop your questions in the chat!
                            </p>
                        </div>
                    </div>

                    {/* 💬 ➡️ RIGHT SIDEBAR (Live Chat) */}
                    <div className="w-full xl:w-[400px] shrink-0 xl:h-[calc(100vh-120px)] xl:sticky xl:top-24 flex flex-col">
                        <div className="flex-1 bg-white dark:bg-[#0F172A] rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden flex flex-col h-[500px] xl:h-full">
                            {/* අර අපි කලින් හදපු LiveChat component එක මෙතනින් රෙන්ඩර් වෙනවා! */}
                            <LiveChat currentUserId={user.id} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}