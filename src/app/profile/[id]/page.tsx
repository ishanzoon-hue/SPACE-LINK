import { createClient } from '@/utils/supabase/server'
import PostCard from '@/components/post/PostCard'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import FollowButton from './FollowButton'
import EditProfileModal from './EditProfileModal'
import OnlineFollowers from '@/components/post/OnlineFollowers' // අලුත් sidebar එක import කළා

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // 1. Fetch Profile Data (Followers/Following count එක්කම)
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, followers:follows!followed_id(count), following:follows!follower_id(count)')
        .eq('id', id)
        .single()

    if (error || !profile) {
        notFound()
    }

    // 2. Fetch User's Posts
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

    // 3. Check if current user follows this profile
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
        <div className="max-w-6xl mx-auto px-4 py-6">
            {/* ප්‍රධාන Grid එක - කොටස් 4කට බෙදා ඇත */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* වම් පැත්ත සහ මැද (ප්‍රොෆයිල් එක සහ පෝස්ට් - කොටස් 3ක් ගනී) */}
                <div className="lg:col-span-3 space-y-8">
                    
                    {/* Profile Header Section */}
                    <div className="bg-white dark:bg-[#0F172A] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-8 transition-all">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            
                            {/* Profile Picture */}
                            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-spl-green bg-opacity-10 flex items-center justify-center text-spl-green font-bold text-5xl overflow-hidden relative shrink-0 border-4 border-white dark:border-[#0F172A] shadow-lg">
                                {profile.avatar_url ? (
                                    <Image
                                        src={profile.avatar_url}
                                        alt="Profile Picture"
                                        fill
                                        className="object-cover"
                                        unoptimized={true}
                                    />
                                ) : (
                                    profile.display_name?.charAt(0).toUpperCase() || 'U'
                                )}
                            </div>

                            {/* Bio and Stats */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                                    <h1 className="text-3xl font-extrabold text-spl-black dark:text-gray-100">
                                        {profile.display_name}
                                    </h1>
                                    <div className="mt-2 md:mt-0">
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
                                
                                <p className="text-spl-gray-dark dark:text-gray-400 text-lg max-w-xl leading-relaxed">
                                    {profile.bio || 'No bio provided yet.'}
                                </p>

                                <div className="flex items-center justify-center md:justify-start gap-8 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800/50">
                                    <div className="text-center">
                                        <span className="block font-bold text-2xl text-spl-black dark:text-white">{posts?.length || 0}</span>
                                        <span className="text-sm text-spl-gray-dark font-medium">Posts</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="block font-bold text-2xl text-spl-black dark:text-white">{profile.followers?.[0]?.count || 0}</span>
                                        <span className="text-sm text-spl-gray-dark font-medium">Followers</span>
                                    </div>
                                    <div className="text-center">
                                        <span className="block font-bold text-2xl text-spl-black dark:text-white">{profile.following?.[0]?.count || 0}</span>
                                        <span className="text-sm text-spl-gray-dark font-medium">Following</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Posts Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-1 h-6 bg-spl-green rounded-full"></div>
                             <h2 className="text-xl font-bold text-spl-black dark:text-gray-200">Recent Activity</h2>
                        </div>
                        
                        {posts && posts.length > 0 ? (
                            posts.map((post) => (
                                <PostCard key={post.id} post={post} currentUserId={currentUser?.id} />
                            ))
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-[#0F172A] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                                <p className="text-spl-gray-dark dark:text-gray-400">This user hasn't posted anything yet.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* දකුණු පැත්ත (Sidebar - කොටස් 1ක් ගනී) */}
                <div className="hidden lg:block">
                    <div className="sticky top-24">
                         <OnlineFollowers currentUserId={currentUser?.id || ''} />
                    </div>
                </div>

            </div>
        </div>
    )
}