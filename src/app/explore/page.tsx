import { createClient } from '@/utils/supabase/server'
import Feed from '@/components/post/Feed'
import Link from 'next/link'
import Image from 'next/image'
import { Hash, Search } from 'lucide-react'

// Note: Next.js page components with searchParams should be async in app router
export default async function ExplorePage({
    searchParams
}: {
    searchParams: Promise<{ hashtag?: string, user?: string }>
}) {
    const supabase = await createClient()
    const params = await searchParams

    const hashtag = params.hashtag
    const userQuery = params.user

    let posts: any[] = []
    let users: any[] = []

    if (hashtag) {
        // Find posts containing the hashtag. We use 'ilike' for case-insensitive search.
        const { data } = await supabase
            .from('posts')
            .select(`
                *,
                user:profiles!user_id(display_name, avatar_url, is_verified),
                likes:likes(id, user_id, reaction_type),
                comments:comments(id)
            `)
            .ilike('content', `%#${hashtag}%`)
            .order('created_at', { ascending: false })
            
        posts = data || []
    }

    if (userQuery) {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .ilike('display_name', `%${userQuery}%`)
            .limit(20)
            
        users = data || []
    }

    return (
        <div className="w-full max-w-3xl mx-auto pt-6 px-4 pb-20 min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-900/40 to-[#0F172A] p-8 rounded-3xl mb-8 border border-emerald-500/20 shadow-lg relative overflow-hidden">
                <div className="absolute -right-10 -top-10 text-emerald-500/10 pointer-events-none">
                    {hashtag ? <Hash size={180} /> : <Search size={180} />}
                </div>
                
                <h1 className="text-3xl font-black text-white flex items-center gap-3 relative z-10">
                    {hashtag && <><span className="text-emerald-500">Explore</span> #{hashtag}</>}
                    {userQuery && <><span className="text-blue-500">Search Mentions for</span> @{userQuery}</>}
                    {!hashtag && !userQuery && "Explore Space Link"}
                </h1>
                <p className="text-gray-400 mt-2 font-medium relative z-10">
                    {hashtag && `Showing posts tagged with #${hashtag}`}
                    {userQuery && `Showing users matching "@${userQuery}"`}
                    {!hashtag && !userQuery && "Find trending hashtags and connect with people."}
                </p>
            </div>

            {/* Results */}
            <div className="space-y-6">
                {hashtag && (
                    <>
                        {posts.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-[#0F172A] rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
                                <p className="text-gray-500 font-bold">No posts found with #{hashtag} yet.</p>
                                <p className="text-sm mt-2 text-gray-400">Be the first to post using this tag!</p>
                            </div>
                        ) : (
                            // Since Feed component handles generic fetching, we'll just render custom Feed UI here or update Feed to accept pre-fetched posts.
                            // To keep it perfectly integrated with PostCard, let's render them manually reusing the layout, or we can just show a simpler layout.
                            // Actually, Feed normally fetches on client. Let's just pass `posts` to a new Client component `ExploreFeed` or just list them here.
                            <ExploreFeedClient initialPosts={posts} />
                        )}
                    </>
                )}

                {userQuery && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {users.length === 0 ? (
                            <div className="col-span-full text-center py-12 bg-white dark:bg-[#0F172A] rounded-3xl border border-dashed border-gray-300 dark:border-gray-800">
                                <p className="text-gray-500 font-bold text-lg">No users found matching "{userQuery}"</p>
                            </div>
                        ) : (
                            users.map((u) => (
                                <Link key={u.id} href={`/profile/${u.id}`} className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 hover:border-blue-500 transition-colors group">
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                        {u.avatar_url 
                                            ? <img src={u.avatar_url} alt={u.display_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            : <span className="text-2xl font-black text-emerald-600">{(u.display_name || 'U').charAt(0).toUpperCase()}</span>
                                        }
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">{u.display_name}</p>
                                        <p className="text-sm text-gray-500 text-blue-500 font-bold">@{u.display_name.replace(/\s+/g, '')}</p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// Inline client component to render PostCards safely
import PostCard from '@/components/post/PostCard'

function ExploreFeedClient({ initialPosts }: { initialPosts: any[] }) {
    // Note: To render PostCard properly, we just map over them.  
    return (
        <div className="flex flex-col gap-6">
            {initialPosts.map((post) => (
                <PostCard key={post.id} post={post} currentUserId={undefined} />
            ))}
        </div>
    )
}
