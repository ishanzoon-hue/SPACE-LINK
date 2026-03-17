import Feed from '@/components/post/Feed'
import OnlineFriends from '@/components/OnlineFriends'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* මැද පෝස්ට් වැටෙන කෑල්ල */}
      <div className="flex-1">
        <Feed />
      </div>
      
      {/* දකුණු පැත්තෙන් ඔන්ලයින් ලිස්ට් එක (ලොකු ස්ක්‍රීන් වලදී විතරක් පෙනේ) */}
      {user && (
        <div className="hidden lg:block w-72 shrink-0">
          <OnlineFriends currentUserId={user.id} />
        </div>
      )}
    </div>
  )
}