'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useInView } from 'react-intersection-observer'
import PostCard from '@/components/post/PostCard'
import { Loader2, FileText } from 'lucide-react'

interface ProfilePostsListProps {
    initialPosts: any[];
    userId: string;
    currentUserId?: string;
    themeColor: string;
}

export default function ProfilePostsList({ initialPosts, userId, currentUserId, themeColor }: ProfilePostsListProps) {
    const supabase = createClient()
    const [posts, setPosts] = useState<any[]>(initialPosts || [])
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState((initialPosts?.length || 0) === 10) // If less than 10, no more left
    
    // The ref attached to the element at the bottom of the list
    const { ref, inView } = useInView({
        threshold: 0,
        triggerOnce: false,
    })

    useEffect(() => {
        if (inView && hasMore) {
            loadMorePosts()
        }
    }, [inView, hasMore])

    const loadMorePosts = async () => {
        const from = page * 10;
        const to = from + 9;

        const { data: newPosts, error } = await supabase
            .from('posts')
            .select(`*, author:profiles!user_id(display_name, avatar_url), likes(id), comments(count)`)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(from, to)

        if (newPosts && newPosts.length > 0) {
            setPosts((prev) => {
                // filter out duplicates just in case new posts were added during scroll
                const existingIds = new Set(prev.map(p => p.id));
                const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
                return [...prev, ...uniqueNewPosts];
            });
            setPage((prevPage) => prevPage + 1);
            if (newPosts.length < 10) setHasMore(false);
        } else {
            setHasMore(false);
        }
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-16 bg-white dark:bg-[#0F172A] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-gray-400" size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No posts yet</h3>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {posts.map((post) => (
                <PostCard key={post.id} post={post} currentUserId={currentUserId} themeColor={themeColor} />
            ))}
            
            {hasMore && (
                <div ref={ref} className="flex justify-center p-4">
                    <Loader2 className="animate-spin text-gray-400" size={24} />
                </div>
            )}

            {!hasMore && posts.length > 0 && (
                <div className="text-center py-6 text-gray-400 text-sm font-bold">
                    You've reached the end! 🚀
                </div>
            )}
        </div>
    )
}
