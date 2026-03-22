import Link from 'next/link' // 👈 මේක අමතක කරන්න එපා
import { Wallet, ArrowRight } from 'lucide-react' // 👈 Icon එකක් දාමු ලස්සනට
import Feed from '@/components/post/Feed'
import OnlineFriends from '@/components/OnlineFriends'
import FollowingList from '@/components/FollowingList'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1 space-y-6">
        
        {/* 💳 මෙන්න Wallet එකට යන ලොකු බටන් එක */}
        <div className="bg-gradient-to-r from-blue-900/40 to-black border border-blue-500/30 p-6 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white italic tracking-tighter">ELIMEN LMO WALLET 🚀</h2>
            <p className="text-sm text-blue-400 font-bold uppercase">Manage your assets & Claim bonus</p>
          </div>
          <Link href="/wallet">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/40">
              <Wallet size={20} />
              OPEN WALLET
              <ArrowRight size={18} />
            </button>
          </Link>
        </div>

        {/* ඔයාගේ පරණ Feed එක මෙතනින් පල්ලෙහාට තියෙනවා */}
        <Feed />
      </div>
      
      {user && (
        <div className="hidden lg:flex flex-col gap-6 w-72 shrink-0">
          <OnlineFriends currentUserId={user.id} />
          <FollowingList /> 
        </div>
      )}
    </div>
  )
}