import { createClient } from '@/utils/supabase/server'
import Feed from '@/components/post/Feed'
import FollowingList from '@/components/FollowingList'
import FollowingChart from '@/components/FollowingChart'
import AdvertisementWidget from '@/components/AdvertisementWidget'
import HomeHero from '@/components/HomeHero'
import RewardBanner from '@/components/RewardBanner'
import StoryTray from '@/components/stories/StoryTray'
import SidebarNav from '@/components/SidebarNav'
import ReferralCard from '@/components/ReferralCard'
import MarketPriceWidget from '@/components/MarketPriceWidget'
import OnlineFollowers from '@/components/post/OnlineFollowers'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    isAdmin = profile?.is_admin || false
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 xl:gap-6 w-full mx-auto px-2 lg:px-4">

      {/* ⬅️ COLUMN 1: LEFT SIDEBAR (NAV) */}
      <SidebarNav currentUserId={user?.id} />

      {/* 🛡️ COLUMN 2: MAIN FEED */}
      <div className="flex-1 min-w-0 space-y-6">
        
        {/* 🚀 Rewards & Stories */}
        {user && (
          <div className="space-y-6">
            <RewardBanner />
            <StoryTray />
          </div>
        )}

        {/* LMO Intro & Wallet Banner */}
        <HomeHero />

        {/* 📈 Following Chart - Only show for logged-in users */}
        {user && <FollowingChart />}

        {/* 📝 Feed */}
        <Feed />
      </div>

      {/* ➡️ COLUMN 3: RIGHT SIDEBAR (WIDGETS) */}
      {user && (
        <aside className="hidden lg:flex flex-col gap-8 w-72 xl:w-80 shrink-0 sticky top-16 h-[calc(100vh-72px)] overflow-y-auto no-scrollbar pr-1 pt-4 pb-20">

          {/* 👥 Online Friends - TOP */}
          <OnlineFollowers currentUserId={user.id} />

          {/* 🏆 Following List */}
          <FollowingList currentUserId={user.id} />

          {/* 💌 Invite & Earn */}
          <ReferralCard userId={user.id} />


          {/* 📢 Advertisement */}
          <AdvertisementWidget isAdmin={isAdmin} />

          {/* 📈 Market Watch */}
          <MarketPriceWidget />
        </aside>
      )}


    </div>
  )
}