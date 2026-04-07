import { createClient } from '@/utils/supabase/server'
import Feed from '@/components/post/Feed'
import FollowingList from '@/components/FollowingList'
import FollowingChart from '@/components/FollowingChart'
import ReferralCard from '@/components/ReferralCard'
import AdvertisementWidget from '@/components/AdvertisementWidget'
import HomeHero from '@/components/HomeHero'
import RewardBanner from '@/components/RewardBanner'
import StoryTray from '@/components/stories/StoryTray'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    isAdmin = profile?.is_admin || false
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">

      {/* ⬅️ MAIN COLUMN */}
      <div className="flex-1 space-y-6">

        {/* 🚀 2. යූසර් ලොග් වෙලා ඉන්නවා නම් විතරක් Reward Banner එක පෙන්වනවා */}
        {user && (
          <div className="mb-2 space-y-6">
            <RewardBanner />
            <StoryTray />
          </div>
        )}

        {/* LMO Intro & Wallet Banner */}
        <HomeHero />

        {/* 📈 Following Chart - Only show for logged-in users */}
        {user && <FollowingChart />}

        {/* 📝 Feed (Server Side) */}
        <Feed />
      </div>

      {/* ➡️ RIGHT SIDEBAR */}
      {user && (
        <div className="hidden lg:flex flex-col gap-6 w-80 shrink-0 sticky top-24 h-fit">
          <AdvertisementWidget isAdmin={isAdmin} />

          {/* 🎁 Invite & Earn Card */}
          <ReferralCard userId={user.id} />
          <FollowingList currentUserId={user.id} />
        </div>
      )}

    </div>
  )
}