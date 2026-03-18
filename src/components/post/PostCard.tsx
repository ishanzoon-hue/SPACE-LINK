'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react'
import { createClient } from '@/utils/supabase/client' // 👈

interface PostCardProps {
  post: any;
  currentUserId?: string;
  themeColor?: string;
}

export default function PostCard({ post, currentUserId, themeColor = '#10b981' }: PostCardProps) {
    const [isLiked, setIsLiked] = useState(false)
    const [showComments, setShowComments] = useState(false)
    const [likesCount, setLikesCount] = useState(post.likes?.length || 0)
    const [commentText, setCommentText] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLike = () => {
        setIsLiked(!isLiked) 
        setLikesCount((prev: number) => isLiked ? prev - 1 : prev + 1)
    }

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!commentText.trim() || !currentUserId) {
            return alert("Please login to comment!")
        }
        
        setLoading(true)
        const supabase = createClient()

        try {
            const { error } = await supabase
                .from('comments')
                .insert([{
                    post_id: post.id,
                    user_id: currentUserId,
                    content: commentText,
                }])

            if (error) throw error

            setCommentText('')
            setShowComments(true)
            // මෙතනදී සාමාන්‍යයෙන් comments list එක refresh කරන්න ඕනේ
        } catch (err: any) {
            alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white dark:bg-[#0F172A] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-all mb-5">
            {/* Header, Content කොටස් ඊයේ වගේමයි... */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border-2" style={{ borderColor: themeColor }}>
                        <img src={post.author?.avatar_url || '/default-avatar.png'} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white leading-tight">{post.author?.display_name}</h4>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter opacity-60">Just Now</p>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed mb-4">{post.content}</p>
                {post.image_url && (
                    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-lg">
                        <img src={post.image_url} alt="post" className="w-full h-auto object-cover max-h-[500px]" />
                    </div>
                )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-50 dark:border-gray-800">
                <button onClick={handleLike} className="flex items-center gap-2" style={{ color: isLiked ? themeColor : '#94a3b8' }}>
                    <Heart size={24} fill={isLiked ? themeColor : "transparent"} stroke={isLiked ? themeColor : "currentColor"} />
                    <span className="font-bold text-lg">{likesCount}</span>
                </button>

                <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2" style={{ color: showComments ? themeColor : '#94a3b8' }}>
                    <MessageCircle size={24} />
                    <span className="font-bold text-lg">{post.comments?.[0]?.count || 0}</span>
                </button>
            </div>

            {/* 💬 COMMENT SECTION */}
            {showComments && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <form onSubmit={handleCommentSubmit} className="flex items-center gap-3">
                        <input 
                            type="text" 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..." 
                            className="w-full bg-gray-100 dark:bg-gray-800/40 border-none rounded-2xl py-3 px-5 pr-12 outline-none focus:ring-2 transition-all"
                            style={{ '--tw-ring-color': themeColor } as any}
                        />
                        <button disabled={loading} type="submit" style={{ color: themeColor }}>
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}