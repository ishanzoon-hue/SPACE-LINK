import Link from 'next/link'
import { Wallet, ArrowRight } from 'lucide-react'
import Feed from '@/components/post/Feed'
import FollowingList from '@/components/FollowingList' 
import FollowingChart from '@/components/FollowingChart'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col md:flex-row gap-6">
      
      {/* ⬅️ MAIN COLUMN (වම් පැත්තේ කොටස) */}
      <div className="flex-1 space-y-6">
      
        {/* 🎬 Intro Video */}
        <div className="w-full max-w-2xl mx-auto my-8 rounded-[40px] overflow-hidden border-4 border-blue-500/20 shadow-2xl shadow-blue-500/10">
          <video 
            autoPlay 
            loop 
            muted
            playsInline 
            className="w-full h-full object-cover"
          >
            <source src="/lmo-intro.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        
        {/* 💳 Wallet Button */}
        <div className="bg-gradient-to-r from-blue-900/40 to-black border border-blue-500/30 p-6 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white italic tracking-tighter">ELIMEN LMO WALLET 🚀</h2>
            <p className="text-sm text-blue-400 font-bold uppercase">Manage your assets & Claim bonus</p>
          </div>
          <Link href="/wallet" target="_blank" rel="noopener noreferrer">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/40">
              <Wallet size={20} />
              OPEN WALLET
              <ArrowRight size={18} />
            </button>
          </Link>
        </div>

        {/* 📈 Following Chart - Only show for logged-in users */}
        {user && <FollowingChart />}

        {/* 📝 Feed */}
        <Feed />
      </div>
      
      {/* ➡️ RIGHT SIDEBAR (දකුණු පැත්තේ කොටස - Desktop විතරයි) */}
      {user && (
        <div className="hidden lg:flex flex-col gap-6 w-80 shrink-0 sticky top-24 h-fit">
          {/* ✅ හරියටම user.id එක පාස් කරනවා */}
          <FollowingList currentUserId={user.id} />
        </div>
      )}

    </div>
  )
}