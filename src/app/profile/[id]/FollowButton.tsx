'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function FollowButton({
    targetUserId,
    currentUserId,
    initialIsFollowing = false
}: {
    targetUserId: string,
    currentUserId: string,
    initialIsFollowing?: boolean
}) {
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [isLoading, setIsLoading] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleFollow = async () => {
        if (isLoading) return
        setIsLoading(true)

        try {
            if (isFollowing) {
                // Unfollow
                const { error } = await supabase
                    .from('follows')
                    .delete()
                    .match({ follower_id: currentUserId, followed_id: targetUserId })

                if (error) throw error
                setIsFollowing(false)
            } else {
                // Follow
                const { error } = await supabase
                    .from('follows')
                    .insert({ follower_id: currentUserId, followed_id: targetUserId })

                if (error) throw error
                setIsFollowing(true)
            }
            router.refresh()
        } catch (err) {
            console.error('Error toggling follow:', err)
            alert('Failed to update follow status.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <button
            onClick={handleFollow}
            disabled={isLoading}
            className={`px-6 py-2 rounded-full font-medium transition-colors ${isFollowing
                    ? 'bg-white border-2 border-spl-gray-dark text-spl-gray-dark hover:bg-gray-50'
                    : 'bg-spl-green hover:bg-spl-green-dark text-white shadow-sm'
                } disabled:opacity-50`}
        >
            {isLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
        </button>
    )
}
