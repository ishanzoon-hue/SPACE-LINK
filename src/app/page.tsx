import { createClient } from '@/utils/supabase/server'
import Feed from '@/components/post/Feed'
import FollowingList from '@/components/FollowingList'
import FollowingChart from '@/components/FollowingChart'
import ReferralCard from '@/components/ReferralCard'
import AdvertisementWidget from '@/components/AdvertisementWidget'
import HomeHero from '@/components/HomeHero'
import RewardBanner from '@/components/RewardBanner'
import StoryTray from '@/components/stories/StoryTray'
import SidebarNav from '@/components/SidebarNav'
import TrendingTags from '@/components/TrendingTags'
import MarketplacePreview from '@/components/MarketplacePreview'
import MarketPriceWidget from '@/components/MarketPriceWidget'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    isAdmin = profile?.is_admin || false
  }

  return (
    <div className="flex flex-col xl:flex-row gap-4 2xl:gap-8 max-w-[2000px] mx-auto px-4">

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
        <div className="hidden lg:flex flex-col gap-6 w-full xl:w-72 2xl:w-80 shrink-0 sticky top-24 h-fit pb-10">
          {/* Market Watch (New) */}
          <MarketPriceWidget />

          {/* Trending Section (New) */}
          <TrendingTags />

          {/* Marketplace Preview (New) */}
          <MarketplacePreview />

          {/* Existing Widgets */}
          <AdvertisementWidget isAdmin={isAdmin} />
          <ReferralCard userId={user.id} />
          <FollowingList currentUserId={user.id} />
        </div>
      )}

    </div>
  )
}