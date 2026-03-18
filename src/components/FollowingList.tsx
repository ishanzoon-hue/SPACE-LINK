'use client' // 👈 මේක අනිවාර්යයි බට්න් වැඩ කරන්න

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client' // 👈 Client එක ගත්තා

export default function FollowingList() {
  const [following, setFollowing] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      // 1. දැනට ලොග් වෙලා ඉන්න යූසර්ව ගන්නවා
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      if (user) {
        // 2. Following ලිස්ට් එක ගන්නවා
        const { data, error } = await supabase
          .from('follows')
          .select(`
            followed_id,
            profiles!followed_id (
              display_name,
              avatar_url
            )
          `)
          .eq('follower_id', user.id)

        if (!error && data) {
          setFollowing(data)
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // 📞 වීඩියෝ කෝල් එක පටන් ගන්න Function එක
  const startVideoCall = async (friendId: string) => {
    if (!currentUser) return

    // Supabase 'calls' ටේබල් එකට රෙකෝඩ් එකක් දානවා (එතකොට තමයි යාලුවාට රින්ග් වෙන්නේ)
    const { error } = await supabase.from('calls').insert({
      caller_id: currentUser.id,
      receiver_id: friendId,
      status: 'ringing'
    })

    if (!error) {
      // කෝල් පේජ් එකට යනවා (Backticks පාවිච්චි කරලා තියෙන්නේ)
      router.push(`/video-call/${friendId}`)
    } else {
      alert("Call start failed: " + error.message)
    }
  }

  if (loading) return <div className="p-4 text-gray-400">Loading friends...</div>
  if (!following || following.length === 0) {
    return <div className="p-4 text-gray-500 text-sm">You are not following anyone yet.</div>
  }

  return (
    <div className="p-4 bg-[#1e2738] rounded-lg shadow w-full text-white">
      <h2 className="font-bold text-lg mb-4">Following</h2>
      <ul className="flex flex-col gap-4">
        {following.map((follow: any) => (
          <li key={follow.followed_id} className="flex items-center justify-between gap-3 group">
            
            {/* ෆොටෝ එක සහ නම */}
            <div className="flex items-center gap-3">
              <img
                src={follow.profiles?.avatar_url || 'https://via.placeholder.com/40'}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover border border-gray-600"
              />
              <span className="font-medium text-gray-200">
                {follow.profiles?.display_name || 'Unknown User'}
              </span>
            </div>

            {/* බට්න් දෙක */}
            <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
              
              {/* Message Button */}
              <Link 
                href={`/chat/${follow.followed_id}`}
                className="p-2 bg-blue-500/20 text-blue-400 rounded-full hover:bg-blue-500 hover:text-white transition-colors block"
                title="Send Message"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </Link>

              {/* Call Button - දැන් මේක වැඩ! ✅ */}
              <button 
                onClick={() => startVideoCall(follow.followed_id)}
                className="p-2 bg-green-500/20 text-green-400 rounded-full hover:bg-green-500 hover:text-white transition-colors"
                title="Start Video Call"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

          </li>
        ))}
      </ul>
    </div>
  )
}