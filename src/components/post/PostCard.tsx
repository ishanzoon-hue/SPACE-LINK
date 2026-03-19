'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import toast from 'react-hot-toast'

interface PostCardProps {
  post: any;
  currentUserId?: string;
  themeColor?: string;
}

export default function PostCard({ post, currentUserId, themeColor = '#10b981' }: PostCardProps) {
    const supabase = createClient()
    const [isLiked, setIsLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(0)
    const [showComments, setShowComments] = useState(false)
    const [commentText, setCommentText] = useState('')
    const [commentsList, setCommentsList] = useState<any[]>([])

    useEffect(() => {
        if (post.likes) {
            setLikesCount(post.likes.length)
            const alreadyLiked = post.likes.some((like: any) => like.user_id === currentUserId)
            setIsLiked(alreadyLiked)
        }
    }, [currentUserId, post.likes])

    // ✅ 1. ලයික් එක දාන ෆන්ක්ෂන් එක
    const handleLike = async () => {
        if (!currentUserId) return toast.error("Please login to like!")

        const originalIsLiked = isLiked
        setIsLiked(!isLiked)
        setLikesCount(prev => originalIsLiked ? prev - 1 : prev + 1)

        try {
            if (originalIsLiked) {
                // ලයික් එක අයින් කරනවා
                await supabase.from('likes').delete().match({ post_id: post.id, user_id: currentUserId })
            } else {
                // ලයික් එක දානවා
                await supabase.from('likes').insert([{ post_id: post.id, user_id: currentUserId }])
                
                // 🔔 ලයික් එකට නොටිෆිකේෂන් එකක් යවනවා
                const postOwnerId = post.user_id || post.author?.id || post.author_id; 
                if (postOwnerId && String(postOwnerId) !== String(currentUserId)) {
                    await supabase.from('notifications').insert([{
                        user_id: postOwnerId,
                        from_user_id: currentUserId,
                        type: 'like',
                        post_id: post.id
                    }])
                }
                toast.success('Liked! ❤️')
            }

            const { data } = await supabase.from('likes').select('id').eq('post_id', post.id)
            if (data) setLikesCount(data.length)
        } catch (error) {
            setIsLiked(originalIsLiked)
            toast.error("Something went wrong")
        }
    }

    // ✅ 2. කමෙන්ට්ස් ගන්න ෆන්ක්ෂන් එක
    const fetchComments = async () => {
        const { data } = await supabase
            .from('comments')
            .select(`*, profiles:user_id(display_name, avatar_url)`)
            .eq('post_id', post.id)
            .order('created_at', { ascending: true })
        if (data) setCommentsList(data)
    }

    useEffect(() => {
        if (showComments) fetchComments()
    }, [showComments])

    // ✅ 3. කමෙන්ට් එකක් දාන ෆන්ක්ෂන් එක
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!commentText.trim() || !currentUserId) return

        const { error } = await supabase
            .from('comments')
            .insert([{ post_id: post.id, user_id: currentUserId, content: commentText }])

        if (!error) {
            setCommentText('')
            fetchComments()
            toast.success('Comment posted! 💬')
            
            // 🔔 කමෙන්ට් එකට නොටිෆිකේෂන් එකක් යවනවා
            const postOwnerId = post.user_id || post.author?.id || post.author_id;
            if (postOwnerId && String(postOwnerId) !== String(currentUserId)) {
                await supabase.from('notifications').insert([{
                    user_id: postOwnerId,
                    from_user_id: currentUserId,
                    type: 'comment',
                    post_id: post.id
                }])
            }
        }
    }

    return (
        <div className="bg-white dark:bg-[#0F172A] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-all mb-5">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border-2" style={{ borderColor: themeColor }}>
                        <img src={post.author?.avatar_url || '/default-avatar.png'} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{post.author?.display_name}</h4>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter opacity-60">Posted Just Now</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mb-6">
                <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed mb-4">{post.content}</p>
                {post.image_url && (
                    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                        <img src={post.image_url} alt="post" className="w-full h-auto" />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-50 dark:border-gray-800">
                <button onClick={handleLike} className="flex items-center gap-2 transition-all active:scale-125" style={{ color: isLiked ? themeColor : '#94a3b8' }}>
                    <Heart size={24} fill={isLiked ? themeColor : "transparent"} stroke={isLiked ? themeColor : "currentColor"} />
                    <span className="font-bold text-lg">{likesCount}</span>
                </button>
                <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2" style={{ color: showComments ? themeColor : '#94a3b8' }}>
                    <MessageCircle size={24} />
                    <span className="font-bold text-lg">{commentsList.length || post.comments?.[0]?.count || 0}</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                    <div className="max-h-60 overflow-y-auto space-y-4 pr-2">
                        {commentsList.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <img src={comment.profiles?.avatar_url || '/default-avatar.png'} className="w-8 h-8 rounded-full" />
                                <div className="bg-gray-100 dark:bg-gray-800/60 p-3 rounded-2xl flex-1 text-sm">
                                    <p className="font-bold">{comment.profiles?.display_name}</p>
                                    <p>{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <form onSubmit={handleCommentSubmit} className="flex items-center gap-3">
                        <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Add a comment..." className="w-full bg-gray-100 dark:bg-gray-800/40 rounded-2xl py-3 px-5 outline-none" />
                        <button type="submit" style={{ color: themeColor }}><Send size={20} /></button>
                    </form>
                </div>
            )}
        </div>
    )
}