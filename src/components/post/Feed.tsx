import { createClient } from '@/utils/supabase/server'
import PostCard from './PostCard'
import CreatePost from './CreatePost'

export default async function Feed() {
    const supabase = await createClient()

    // Fetch posts with their authors, likes, and comments count
    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
      *,
      author:profiles!user_id(display_name, avatar_url),
      likes(id),
      comments(count)
    `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching posts:', error)
        return <div className="text-red-500">Failed to load posts.</div>
    }

    const {
        data: { user },
    } = await supabase.auth.getUser()

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {user && <CreatePost user={user} />}

            <div className="space-y-4">
                {posts?.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                        currentUserId={user?.id}
                    />
                ))}
                {posts?.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                        <h3 className="text-xl font-medium text-spl-black mb-2">No posts yet</h3>
                        <p className="text-spl-gray-dark">Be the first to share something with the universe.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
