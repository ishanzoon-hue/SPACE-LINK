'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import toast from 'react-hot-toast'

// 🎬 YouTube සහ TikTok ලින්ක්ස් වලට සපෝට් කරන Helper Function එක
const getEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // YouTube Check
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^&?]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    
    // TikTok Check
    const ttMatch = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
    if (ttMatch) return `https://www.tiktok.com/embed/v2/${ttMatch[1]}`;
    
    return null;
}

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

    // 🎬 Video URL එක ගන්න Variable එක
    const embedUrl = post?.video_url ? getEmbedUrl(post.video_url) : null;

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

            {/* Content Area */}
            <div className="mb-6">
                <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed mb-4">{post.content}</p>
                
                {/* 🖼️ Image Display */}
                {post.image_url && (
                    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 mb-4">
                        <img src={post.image_url} alt="post" className="w-full h-auto" />
                    </div>
                )}

                {/* 🎬 Video Player Display */}
                {embedUrl && (
                    <div className="mt-4 w-full aspect-video rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-black relative shadow-lg">
                        <iframe 
                            src={embedUrl} 
                            className="absolute top-0 left-0 w-full h-full"
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                        ></iframe>
                    </div>
                )}
            </div>

            {/* Actions (Like & Comment) */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-50 dark:border-gray-800">
                {/* ❤️ Like Button */}
                <button onClick={handleLike} className="flex items-center gap-2 transition-all active:scale-125" style={{ color: isLiked ? themeColor : '#94a3b8' }}>
                    <Heart size={24} fill={isLiked ? themeColor : "transparent"} stroke={isLiked ? themeColor : "currentColor"} />
                    <span className="font-bold text-lg">{likesCount}</span>
                </button>
                
                {/* 💬 Comment Toggle Button */}
                <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2" style={{ color: showComments ? themeColor : '#94a3b8' }}>
                    <MessageCircle size={24} />
                    <span className="font-bold text-lg">{commentsList.length || post.comments?.[0]?.count || 0}</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                    <div className="max-h-60 overflow-y-auto space-y-4 pr-2">
                        {commentsList.length === 0 && (
                            <p className="text-gray-500 text-sm text-center py-2 italic">No comments yet. Be the first!</p>
                        )}
                        {commentsList.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <img src={comment.profiles?.avatar_url || '/default-avatar.png'} className="w-8 h-8 rounded-full flex-shrink-0" alt="avatar" />
                                <div className="bg-gray-100 dark:bg-gray-800/60 p-3 rounded-2xl flex-1 text-sm">
                                    <p className="font-bold text-gray-900 dark:text-white">{comment.profiles?.display_name}</p>
                                    <p className="text-gray-700 dark:text-gray-300">{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Comment Input Form */}
                    <form onSubmit={handleCommentSubmit} className="flex items-center gap-3 mt-4">
                        <input 
                            type="text" 
                            value={commentText} 
                            onChange={(e) => setCommentText(e.target.value)} 
                            placeholder="Add a comment..." 
                            className="w-full bg-gray-100 dark:bg-gray-800/40 text-gray-800 dark:text-white rounded-2xl py-3 px-5 outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-700 transition-all" 
                        />
                        <button 
                            type="submit" 
                            disabled={!commentText.trim()}
                            className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all disabled:opacity-30"
                            style={{ color: themeColor }}
                        >
                            <Send size={20} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}