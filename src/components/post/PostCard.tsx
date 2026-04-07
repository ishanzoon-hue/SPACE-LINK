'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, Trash2, MoreHorizontal, Link as LinkIcon, Repeat2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import CommentSection from './CommentSection'

const REACTIONS = [
    { type: 'like', icon: '👍', color: '#10b981' },
    { type: 'love', icon: '❤️', color: '#f43f5e' },
    { type: 'haha', icon: '😂', color: '#f59e0b' },
    { type: 'wow', icon: '😲', color: '#f59e0b' },
    { type: 'sad', icon: '😢', color: '#f59e0b' },
    { type: 'angry', icon: '😡', color: '#ef4444' }
]

const getEmbedUrl = (url: string) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/|.*embed\/))([^&?]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const ttMatch = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
    if (ttMatch) return `https://www.tiktok.com/embed/v2/${ttMatch[1]}`;
    return null;
}

interface PostCardProps {
    post: any;
    currentUserId?: string;
    themeColor?: string;
    isNested?: boolean;
}

export default function PostCard({ post, currentUserId, themeColor = '#10b981', isNested = false }: PostCardProps) {
    const supabase = createClient()
    const router = useRouter()

    const [mounted, setMounted] = useState(false)
    const [myReaction, setMyReaction] = useState<string | null>(null)
    const [likesCount, setLikesCount] = useState(0)
    const [showComments, setShowComments] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [commentCount, setCommentCount] = useState(0)
    const [showPostOptions, setShowPostOptions] = useState(false)
    const [showShareOptions, setShowShareOptions] = useState(false)
    const [showReactionBar, setShowReactionBar] = useState(false)
    const [topReactionIcon, setTopReactionIcon] = useState('❤️')

    const embedUrl = post?.video_url ? getEmbedUrl(post.video_url) : null;

    useEffect(() => {
        setMounted(true)
        if (post.likes) {
            setLikesCount(post.likes.length)
            const myLike = post.likes.find((like: any) => like.user_id === currentUserId)
            setMyReaction(myLike ? myLike.reaction_type || 'like' : null)

            // Determine most common reaction simply
            if (post.likes.length > 0) {
                const recentType = post.likes[post.likes.length - 1].reaction_type || 'like'
                const reactionObj = REACTIONS.find(r => r.type === recentType)
                if (reactionObj) setTopReactionIcon(reactionObj.icon)
            }
        }
        setCommentCount(post.comments?.[0]?.count || 0)
    }, [currentUserId, post.likes, post.comments])

    const fetchCommentsCount = async () => {
        const { count } = await supabase
            .from('comments')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id)
        if (count !== null) setCommentCount(count)
    }

    const handleReact = async (reactionType: string) => {
        if (!currentUserId) return toast.error("Please login to react!")
        
        setShowReactionBar(false)
        const originalReaction = myReaction
        const isRemoving = originalReaction === reactionType

        // Optimistic Update
        if (isRemoving) {
            setMyReaction(null)
            setLikesCount(prev => prev - 1)
        } else {
            setMyReaction(reactionType)
            if (!originalReaction) setLikesCount(prev => prev + 1)
            const reactionObj = REACTIONS.find(r => r.type === reactionType)
            if (reactionObj) setTopReactionIcon(reactionObj.icon)
        }

        try {
            if (originalReaction) {
                 await supabase.from('likes').delete().match({ post_id: post.id, user_id: currentUserId })
            }
            if (!isRemoving) {
                 await supabase.from('likes').insert([{ post_id: post.id, user_id: currentUserId, reaction_type: reactionType }])
            }
        } catch (error) { 
            toast.error("Failed to react")
            setMyReaction(originalReaction) 
        }
    }

    const handleShareLink = async () => {
        const shareUrl = `${window.location.origin}/profile/${post.user_id}`;
        setShowShareOptions(false)
        if (navigator.share) {
            try { await navigator.share({ title: 'Space Link', url: shareUrl }); } catch (err) { }
        } else {
            navigator.clipboard.writeText(shareUrl);
            toast.success('Link copied! 📋');
        }
    }

    const handleRepost = async () => {
        if (!currentUserId) return toast.error("Please login to repost")
        setShowShareOptions(false)
        
        const caption = window.prompt("Write a caption for your repost (optional):", "")
        if (caption === null) return; // User cancelled

        try {
            toast.loading("Reposting...", { id: 'repost' })
            const { error } = await supabase.from('posts').insert({
                user_id: currentUserId,
                content: caption,
                shared_post_id: post.id
            })
            if (error) throw error
            toast.success("Successfully shared to your Timeline!", { id: 'repost' })
            router.refresh()
        } catch (error) {
            toast.error("Failed to repost", { id: 'repost' })
        }
    }

    const handleDeletePost = async () => {
        if (!window.confirm('Delete this post?')) return;
        setIsDeleting(true);
        try {
            const { error } = await supabase.from('posts').delete().eq('id', post.id);
            if (error) throw error;
            toast.success('Post deleted! 🗑️');
            router.refresh();
        } catch (error) { toast.error('Delete failed.'); } finally { setIsDeleting(false); }
    }

    if (!mounted) return null;

    const currentReactionConfig = REACTIONS.find(r => r.type === myReaction)

    return (
        <div className={`bg-white dark:bg-[#0F172A] p-6 transition-all mb-5 relative group ${isNested ? 'rounded-2xl border border-gray-100 dark:border-gray-800' : 'rounded-[32px] shadow-sm border border-gray-100 dark:border-gray-800'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Link href={`/profile/${post.user_id}`}>
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2" style={{ borderColor: themeColor }}>
                            <img src={post.author?.avatar_url || '/default-avatar.png'} alt="avatar" className="w-full h-full object-cover" />
                        </div>
                    </Link>
                    <div>
                        <Link href={`/profile/${post.user_id}`}>
                            <h4 className="font-bold text-gray-900 dark:text-white hover:underline">{post.author?.display_name}</h4>
                        </Link>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter opacity-60" suppressHydrationWarning={true}>
                            {new Date(post.created_at).toLocaleDateString()} {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
                {!isNested && (
                    <div className="relative">
                        <button onClick={() => setShowPostOptions(!showPostOptions)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                            <MoreHorizontal size={20} />
                        </button>
                        {showPostOptions && (
                            <div className="absolute right-0 top-10 w-40 bg-white dark:bg-[#1E293B] rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-10">
                                {currentUserId === post.user_id && (
                                    <button onClick={() => { setShowPostOptions(false); handleDeletePost(); }} disabled={isDeleting} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-red-500 text-sm font-medium transition-colors">
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mb-4">
                {post.content && <p className="text-gray-800 dark:text-gray-200 text-[15px] md:text-lg leading-relaxed mb-4 whitespace-pre-wrap">{post.content}</p>}
                
                {post.image_url && (
                    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 mb-4 max-h-[600px] flex items-center justify-center bg-black/5">
                        <img src={post.image_url} alt="post" className="max-w-full max-h-[600px] object-contain" />
                    </div>
                )}
                {embedUrl && (
                    <div className="mt-4 w-full aspect-video rounded-2xl overflow-hidden relative shadow-lg">
                        <iframe src={embedUrl} className="absolute top-0 left-0 w-full h-full" frameBorder="0" allowFullScreen></iframe>
                    </div>
                )}
                
                {/* 🔁 Nested Shared Post Rendering */}
                {post.shared_post && (
                    <div className="mt-4">
                        <PostCard 
                           post={post.shared_post} 
                           currentUserId={currentUserId} 
                           themeColor={themeColor} 
                           isNested={true} 
                        />
                    </div>
                )}
            </div>

            {/* Interaction Bar (Hidden if nested to prevent inception logic) */}
            {!isNested && (
                <div className="flex items-center justify-between pt-1 pb-1 px-1 border-t border-gray-100 dark:border-gray-800 mt-2 relative">
                    
                    {/* Reactions Bar (Shows on Hover) */}
                    {showReactionBar && (
                        <div 
                            className="absolute -top-12 left-0 bg-white dark:bg-[#1E293B] rounded-full shadow-lg border border-gray-200 dark:border-gray-700 p-1 flex gap-1 z-20 animate-in slide-in-from-bottom-2 fade-in"
                            onMouseEnter={() => setShowReactionBar(true)}
                            onMouseLeave={() => setShowReactionBar(false)}
                        >
                            {REACTIONS.map((reaction) => (
                                <button 
                                    key={reaction.type}
                                    onClick={() => handleReact(reaction.type)}
                                    className="text-2xl hover:scale-125 transition-transform p-1 hover:-translate-y-1"
                                >
                                    {reaction.icon}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Like/React Button */}
                    <div 
                         className="flex-1"
                         onMouseEnter={() => setShowReactionBar(true)}
                         onMouseLeave={() => setShowReactionBar(false)}
                    >
                        <button 
                            onClick={() => handleReact(myReaction || 'like')} 
                            className="w-full flex items-center justify-center gap-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-lg transition-colors font-bold text-sm" 
                            style={{ color: currentReactionConfig ? currentReactionConfig.color : '#64748b' }}
                        >
                            {currentReactionConfig ? (
                                <span className="text-xl animate-in zoom-in">{currentReactionConfig.icon}</span>
                            ) : (
                                <Heart size={20} stroke="currentColor" fill="transparent" className="text-gray-500" />
                            )}
                            <span className="hidden sm:inline capitalize">{currentReactionConfig ? currentReactionConfig.type : 'React'}</span> 
                            {likesCount > 0 && <span className="ml-1 text-gray-500 font-normal">({likesCount})</span>}
                        </button>
                    </div>
                    
                    <button onClick={() => setShowComments(!showComments)} className="flex items-center justify-center flex-1 gap-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-lg transition-colors text-gray-500 font-bold text-sm">
                        <MessageCircle size={20} />
                        <span className="hidden sm:inline">Comment</span> {commentCount > 0 && `(${commentCount})`}
                    </button>
                    
                    {/* Share Menu */}
                    <div className="relative flex-1">
                        <button onClick={() => setShowShareOptions(!showShareOptions)} className="w-full flex items-center justify-center gap-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-lg transition-colors text-gray-500 font-bold text-sm">
                            <Share2 size={20} />
                            <span className="hidden sm:inline">Share</span>
                        </button>
                        {showShareOptions && (
                            <div className="absolute right-0 bottom-12 w-48 bg-white dark:bg-[#1E293B] rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.1)] border border-gray-100 dark:border-gray-700 py-1 z-20 animate-in fade-in zoom-in-95">
                                <button onClick={handleRepost} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-bold transition-colors">
                                    <Repeat2 size={16} className="text-emerald-500" />
                                    Share to Timeline
                                </button>
                                <button onClick={handleShareLink} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-bold transition-colors">
                                    <LinkIcon size={16} className="text-blue-500" />
                                    Copy Link
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {!isNested && showComments && (
                <CommentSection
                    postId={post.id}
                    currentUserId={currentUserId}
                    onCommentAdded={fetchCommentsCount}
                    onCommentDeleted={fetchCommentsCount}
                />
            )}
        </div>
    )
}