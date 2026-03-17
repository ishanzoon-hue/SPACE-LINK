import Feed from '@/components/post/Feed'
import OnlineFriends from '@/components/OnlineFriends'
import { createClient } from '@/utils/supabase/server'

// මේ function එකට ඉදිරියෙන් 'export default' අනිවාර්යයෙන්ම තිබිය යුතුයි
export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1">
        <Feed />
      </div>
      
      {user && (
        <div className="hidden lg:block w-72 shrink-0">
          <OnlineFriends currentUserId={user.id} />
        </div>
      )}
    </div>
  )
}