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
        
        {/* 💳 මෙන්න Wallet එකට යන ලොකු බටන් එක */}
        <div className="bg-gradient-to-r from-blue-900/40 to-black border border-blue-500/30 p-6 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white italic tracking-tighter">ELIMEN LMO WALLET 🚀</h2>
            <p className="text-sm text-blue-400 font-bold uppercase">Manage your assets & Claim bonus</p>
          </div>
          <Link href="/wallet"target="_blank" rel="noopener noreferrer">
            <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/40">
              <Wallet size={20} />
              OPEN WALLET
              <ArrowRight size={18} />
            </button>
          </Link>
        </div>
        <div className="w-full h-[350px] md:h-[450px] bg-black/40 rounded-[32px] overflow-hidden border border-blue-500/20 shadow-xl my-6 relative group">
          <div className="absolute top-4 left-6 z-10 pointer-events-none">
            <h3 className="text-white font-black italic tracking-wider bg-black/50 px-3 py-1 rounded-lg backdrop-blur-sm border border-white/10">LMO NETWORK (BNB) LIVE</h3>
          </div>
          <iframe
            src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_1&symbol=BINANCE%3ABNBUSDT&interval=60&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=3&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
            style={{ width: '100%', height: '100%', border: 'none' }}
            title="Live Market Chart"
          ></iframe>
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