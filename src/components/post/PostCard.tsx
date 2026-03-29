'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, Trash2, MoreHorizontal, Link as LinkIcon } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import CommentSection from './CommentSection'

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
}

export default function PostCard({ post, currentUserId, themeColor = '#10b981' }: PostCardProps) {
    const supabase = createClient()
    const router = useRouter()

    // ✅ Hydration Error එක වැළැක්වීමට mounted state එක
    const [mounted, setMounted] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(0)
    const [showComments, setShowComments] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [commentCount, setCommentCount] = useState(0)
    const [showPostOptions, setShowPostOptions] = useState(false)

    const embedUrl = post?.video_url ? getEmbedUrl(post.video_url) : null;

    useEffect(() => {
        setMounted(true) // Component එක ලෝඩ් වුණාම මේක true වෙනවා
        if (post.likes) {
            setLikesCount(post.likes.length)
            const alreadyLiked = post.likes.some((like: any) => like.user_id === currentUserId)
            setIsLiked(alreadyLiked)
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

    const handleLike = async () => {
        if (!currentUserId) return toast.error("Please login to like!")
        const originalIsLiked = isLiked
        setIsLiked(!isLiked)
        setLikesCount(prev => originalIsLiked ? prev - 1 : prev + 1)
        try {
            if (originalIsLiked) {
                await supabase.from('likes').delete().match({ post_id: post.id, user_id: currentUserId })
            } else {
                await supabase.from('likes').insert([{ post_id: post.id, user_id: currentUserId }])
                toast.success('Liked! ❤️')
            }
        } catch (error) { setIsLiked(originalIsLiked) }
    }

    const handleShare = async () => {
        const shareUrl = `${window.location.origin}/profile/${post.user_id}`;
        if (navigator.share) {
            try { await navigator.share({ title: 'Space Link', url: shareUrl }); } catch (err) { }
        } else {
            navigator.clipboard.writeText(shareUrl);
            toast.success('Link copied! 📋');
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

    // ✅ සර්වර් එකේ HTML එකයි ක්ලයන්ට් එකේ HTML එකයි වෙනස් වීම වළක්වයි
    if (!mounted) return null;

    return (
        <div className="bg-white dark:bg-[#0F172A] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-all mb-5 relative group">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Link href={`/profile/${post.user_id}`}>
                        <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border-2" style={{ borderColor: themeColor }}>
                            <img src={post.author?.avatar_url || '/default-avatar.png'} alt="avatar" className="w-full h-full object-cover" />
                        </div>
                    </Link>
                    <div>
                        <Link href={`/profile/${post.user_id}`}>
                            <h4 className="font-bold text-gray-900 dark:text-white hover:underline">{post.author?.display_name}</h4>
                        </Link>
                        {/* ✅ suppressesHydrationWarning එක දාමු dynamic dates තියෙන තැන් වලට */}
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter opacity-60" suppressHydrationWarning={true}>
                            Posted Just Now
                        </p>
                    </div>
                </div>
                <div className="relative">
                    <button onClick={() => setShowPostOptions(!showPostOptions)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                        <MoreHorizontal size={20} />
                    </button>
                    {showPostOptions && (
                        <div className="absolute right-0 top-10 w-40 bg-white dark:bg-[#1E293B] rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-10">
                            {currentUserId === post.user_id && (
                                <button onClick={() => { setShowPostOptions(false); handleDeletePost(); }} disabled={isDeleting} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-red-500 text-sm font-medium transition-colors">
                                    <Trash2 size={16} />
                                    Delete post
                                </button>
                            )}
                            <button onClick={() => { setShowPostOptions(false); handleShare(); }} className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors">
                                <LinkIcon size={16} />
                                Copy link
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mb-6">
                <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed mb-4">{post.content}</p>
                {post.image_url && (
                    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 mb-4">
                        <img src={post.image_url} alt="post" className="w-full h-auto" />
                    </div>
                )}
                {embedUrl && (
                    <div className="mt-4 w-full aspect-video rounded-2xl overflow-hidden relative shadow-lg">
                        <iframe src={embedUrl} className="absolute top-0 left-0 w-full h-full" frameBorder="0" allowFullScreen></iframe>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between pt-1 pb-1 px-1 border-t border-gray-100 dark:border-gray-800 mt-2">
                <button onClick={handleLike} className="flex items-center justify-center flex-1 gap-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-lg transition-colors font-semibold text-sm" style={{ color: isLiked ? themeColor : '#64748b' }}>
                    <Heart size={20} fill={isLiked ? themeColor : "transparent"} stroke={isLiked ? themeColor : "currentColor"} />
                    Like {likesCount > 0 && `(${likesCount})`}
                </button>
                <button onClick={() => setShowComments(!showComments)} className="flex items-center justify-center flex-1 gap-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-lg transition-colors text-gray-500 font-semibold text-sm">
                    <MessageCircle size={20} />
                    Comment {commentCount > 0 && `(${commentCount})`}
                </button>
                <button onClick={handleShare} className="flex items-center justify-center flex-1 gap-2 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-lg transition-colors text-gray-500 font-semibold text-sm">
                    <Share2 size={20} />
                    Share
                </button>
            </div>

            {showComments && (
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