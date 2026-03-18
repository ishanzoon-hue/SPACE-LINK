'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

interface PostCardProps {
  post: any;
  currentUserId?: string;
  themeColor?: string;
}

export default function PostCard({ post, currentUserId, themeColor = '#10b981' }: PostCardProps) {
    const supabase = createClient()
    
    // 1. Likes Logic
    const [isLiked, setIsLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(0) // මුලින් 0 දානවා
    
    // 2. Comments Logic
    const [showComments, setShowComments] = useState(false)
    const [commentText, setCommentText] = useState('')
    const [commentsList, setCommentsList] = useState<any[]>([])

    // 🔥 පෝස්ට් එක ලෝඩ් වෙද්දී සහ ලයික් එකක් වැටෙද්දී කවුන්ට් එක හරියට ගන්නවා
    useEffect(() => {
        if (post.likes) {
            setLikesCount(post.likes.length)
            const alreadyLiked = post.likes.some((like: any) => like.user_id === currentUserId)
            setIsLiked(alreadyLiked)
        }
    }, [currentUserId, post.likes])

    // 🔥 ලයික් එක දාද්දී කවුන්ට් එක අප්ඩේට් කරන සුපිරි Function එක
    const handleLike = async () => {
        if (!currentUserId) return alert("Please login to like!")

        const originalIsLiked = isLiked
        const originalCount = likesCount

        // 1. UI එකේ වහාම වෙනස් කරනවා (Optimistic Update)
        setIsLiked(!isLiked)
        setLikesCount(prev => originalIsLiked ? prev - 1 : prev + 1)

        try {
            if (originalIsLiked) {
                // Database එකෙන් අයින් කරනවා
                await supabase.from('likes').delete().match({ post_id: post.id, user_id: currentUserId })
            } else {
                // Database එකට දානවා
                await supabase.from('likes').insert([{ post_id: post.id, user_id: currentUserId }])
            }

            // 2. Database එකෙන් අලුත්ම කවුන්ට් එක අරන් ආපහු ෂුවර් කරගන්නවා
            const { data } = await supabase
                .from('likes')
                .select('id')
                .eq('post_id', post.id)
            
            if (data) setLikesCount(data.length)

        } catch (error) {
            // මොකක් හරි අවුලක් වුණොත් පරණ ගාණටම කරකවනවා
            setIsLiked(originalIsLiked)
            setLikesCount(originalCount)
        }
    }

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

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!commentText.trim() || !currentUserId) return

        const { error } = await supabase
            .from('comments')
            .insert([{ post_id: post.id, user_id: currentUserId, content: commentText }])

        if (!error) {
            setCommentText('')
            fetchComments()
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
                        <h4 className="font-bold text-gray-900 dark:text-white">{post.author?.display_name}</h4>
                        <p className="text-xs text-gray-500 uppercase font-bold tracking-tighter opacity-60">Posted Just Now</p>
                    </div>
                </div>
                <button className="text-gray-400 p-2 rounded-full"><MoreHorizontal size={20} /></button>
            </div>

            {/* Content */}
            <div className="mb-6">
                <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed mb-4">{post.content}</p>
                {post.image_url && (
                    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-lg">
                        <img src={post.image_url} alt="post" className="w-full h-auto" />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-50 dark:border-gray-800">
                <button 
                    onClick={handleLike} 
                    className="flex items-center gap-2 transition-all active:scale-125" 
                    style={{ color: isLiked ? themeColor : '#94a3b8' }}
                >
                    <Heart size={24} fill={isLiked ? themeColor : "transparent"} stroke={isLiked ? themeColor : "currentColor"} />
                    <span className="font-bold text-lg">{likesCount}</span>
                </button>

                <button 
                    onClick={() => setShowComments(!showComments)} 
                    className="flex items-center gap-2" 
                    style={{ color: showComments ? themeColor : '#94a3b8' }}
                >
                    <MessageCircle size={24} />
                    <span className="font-bold text-lg">{commentsList.length || post.comments?.[0]?.count || 0}</span>
                </button>

                <button className="flex items-center gap-2 text-gray-400 hover:text-emerald-500 ml-auto transition-colors">
                    <Share2 size={24} />
                </button>
            </div>

            {/* 💬 COMMENT SECTION */}
            {showComments && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                    <div className="max-h-60 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {commentsList.map((comment) => (
                            <div key={comment.id} className="flex gap-3 animate-in fade-in duration-500">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0">
                                    <img src={comment.profiles?.avatar_url || '/default-avatar.png'} className="w-full h-full rounded-full object-cover" />
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-800/60 p-3 rounded-2xl flex-1 text-sm">
                                    <p className="font-bold text-gray-900 dark:text-white mb-1">{comment.profiles?.display_name}</p>
                                    <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleCommentSubmit} className="flex items-center gap-3">
                        <input 
                            type="text" 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..." 
                            className="w-full bg-gray-100 dark:bg-gray-800/40 border-none rounded-2xl py-3 px-5 pr-12 outline-none focus:ring-2 transition-all"
                            style={{ '--tw-ring-color': themeColor } as any}
                        />
                        <button type="submit" style={{ color: themeColor }}>
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}