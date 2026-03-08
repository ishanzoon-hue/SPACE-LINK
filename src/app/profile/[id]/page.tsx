import { createClient } from '@/utils/supabase/server'
import PostCard from '@/components/post/PostCard'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import FollowButton from './FollowButton'
import EditProfileModal from './EditProfileModal'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // Fetch profile
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, followers:follows!followed_id(count), following:follows!follower_id(count)')
        .eq('id', id)
        .single()

    if (error || !profile) {
        notFound()
    }

    // Fetch user posts
    const { data: posts } = await supabase
        .from('posts')
        .select(`
      *,
      author:profiles!user_id(display_name, avatar_url),
      likes(id),
      comments(count)
    `)
        .eq('user_id', id)
        .order('created_at', { ascending: false })

    // Check if current user follows this profile
    let isFollowing = false
    if (currentUser && currentUser.id !== id) {
        const { data: follow } = await supabase
            .from('follows')
            .select('follower_id')
            .match({ follower_id: currentUser.id, followed_id: id })
            .single()

        if (follow) isFollowing = true
    }

    const isOwnProfile = currentUser?.id === id

    return (
        <div className="max-w-3xl mx-auto space-y-8 mt-4">
            <div className="bg-white dark:bg-[#0F172A] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 transition-colors">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-spl-green bg-opacity-10 flex items-center justify-center text-spl-green font-bold text-4xl overflow-hidden relative shrink-0">
                        {profile.avatar_url ? (
                            <<Image 
  src={profile.avatar_url} 
  alt="Profile Picture" 
  fill 
  className="object-cover" 
  unoptimized // මෙන්න මේක අලුතින් එකතු කරන්න
/>>
                        ) : (
                            profile.display_name?.charAt(0).toUpperCase() || 'U'
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl md:text-3xl font-bold text-spl-black dark:text-gray-200">{profile.display_name}</h1>
                        <p className="text-spl-gray-dark dark:text-gray-400 mt-2 whitespace-pre-wrap">{profile.bio || 'No bio provided.'}</p>

                        <div className="flex items-center justify-center md:justify-start gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <div className="text-center">
                                <span className="block font-bold text-spl-black dark:text-gray-200 text-lg">{posts?.length || 0}</span>
                                <span className="text-sm text-spl-gray-dark dark:text-gray-400">Posts</span>
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-spl-black dark:text-gray-200 text-lg">{profile.followers?.[0]?.count || 0}</span>
                                <span className="text-sm text-spl-gray-dark dark:text-gray-400">Followers</span>
                            </div>
                            <div className="text-center">
                                <span className="block font-bold text-spl-black dark:text-gray-200 text-lg">{profile.following?.[0]?.count || 0}</span>
                                <span className="text-sm text-spl-gray-dark dark:text-gray-400">Following</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 md:mt-0">
                        {isOwnProfile ? (
                            <EditProfileModal profile={profile} />
                        ) : currentUser ? (
                            <FollowButton
                                targetUserId={id}
                                currentUserId={currentUser.id}
                                initialIsFollowing={isFollowing}
                            />
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-bold text-spl-black dark:text-gray-200 mb-4">Posts</h2>
                {posts && posts.length > 0 ? (
                    posts.map((post) => (
                        <PostCard key={post.id} post={post} currentUserId={currentUser?.id} />
                    ))
                ) : (
                    <div className="text-center py-12 bg-white dark:bg-[#0F172A] rounded-xl border border-gray-100 dark:border-gray-800 transition-colors">
                        <h3 className="text-lg font-medium text-spl-gray-dark dark:text-gray-300 mb-1">No posts</h3>
                        <p className="text-sm text-gray-400 dark:text-gray-500">This user hasn't posted anything yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
