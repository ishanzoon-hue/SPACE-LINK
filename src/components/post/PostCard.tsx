'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react'

interface PostCardProps {
  post: any;
  currentUserId?: string;
  themeColor?: string;
}

export default function PostCard({ post, currentUserId, themeColor = '#10b981' }: PostCardProps) {
    const [isLiked, setIsLiked] = useState(false)
    const [showComments, setShowComments] = useState(false) // 👈 කමෙන්ට් පෙන්වන්න/වහන්න
    const [likesCount, setLikesCount] = useState(post.likes?.length || 0)
    const [commentText, setCommentText] = useState('')

    const handleLike = () => {
        setIsLiked(!isLiked) 
        setLikesCount((prev: number) => isLiked ? prev - 1 : prev + 1)
    }

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!commentText.trim()) return
        alert("Comment posted: " + commentText) // තාම Database එකට යවන්නේ නැහැ, පස්සේ ඒක හදමු
        setCommentText('')
    }

    return (
        <div className="bg-white dark:bg-[#0F172A] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-all mb-5">
            {/* 👤 Header */}
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
                <button className="text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* 📝 Content */}
            <div className="mb-6">
                <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed mb-4">{post.content}</p>
                {post.image_url && (
                    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-lg">
                        <img src={post.image_url} alt="post" className="w-full h-auto object-cover max-h-[500px]" />
                    </div>
                )}
            </div>

            {/* ⚡ Actions Bar */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-50 dark:border-gray-800">
                {/* Like Button */}
                <button 
                    onClick={handleLike}
                    className="flex items-center gap-2 transition-all active:scale-125 group"
                    style={{ color: isLiked ? themeColor : '#94a3b8' }}
                >
                    <Heart 
                        size={24} 
                        fill={isLiked ? themeColor : "transparent"} 
                        stroke={isLiked ? themeColor : "currentColor"}
                        className="transition-colors"
                    />
                    <span className="font-bold text-lg">{likesCount}</span>
                </button>

                {/* Comment Toggle Button */}
                <button 
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center gap-2 transition-all group"
                    style={{ color: showComments ? themeColor : '#94a3b8' }}
                >
                    <MessageCircle 
                        size={24} 
                        fill={showComments ? `${themeColor}20` : "transparent"} 
                        className="group-hover:scale-110 transition-transform"
                    />
                    <span className="font-bold text-lg">{post.comments?.[0]?.count || 0}</span>
                </button>

                {/* Share Button */}
                <button className="flex items-center gap-2 text-gray-400 hover:text-emerald-500 ml-auto transition-colors">
                    <Share2 size={24} />
                </button>
            </div>

            {/* 💬 COMMENT SECTION (Dynamic) */}
            {showComments && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-4 duration-500">
                    <form onSubmit={handleCommentSubmit} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-800 overflow-hidden flex-shrink-0 border border-gray-700">
                             <img src="/default-avatar.png" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 relative group">
                            <input 
                                type="text" 
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Add a comment..." 
                                className="w-full bg-gray-100 dark:bg-gray-800/40 border-none rounded-2xl py-3 px-5 pr-12 outline-none focus:ring-2 transition-all text-gray-800 dark:text-white"
                                style={{ '--tw-ring-color': themeColor } as any}
                            />
                            <button 
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all hover:scale-110 active:scale-90" 
                                style={{ color: themeColor }}
                            >
                                <Send size={20} fill={commentText ? themeColor : 'transparent'} />
                            </button>
                        </div>
                    </form>

                    {/* Placeholder for comments list */}
                    <div className="mt-4 space-y-4 px-2">
                        <p className="text-xs text-gray-500 italic">No comments yet. Be the first to vibe!</p>
                    </div>
                </div>
            )}
        </div>
    )
}