'use client'

import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/client'
import CommentSection from './CommentSection'
import PostPresence from './PostPresence'
import { Trash2, Loader2 } from 'lucide-react' // අයිකන් Import කළා

export default function PostCard({ post, currentUserId }: { post: any, currentUserId?: string }) {
    const [likesCount, setLikesCount] = useState(post.likes?.[0]?.count || 0)
    const [commentsCount, setCommentsCount] = useState(post.comments?.[0]?.count || 0)
    const [showComments, setShowComments] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false) // මකන ගමන්ද කියලා බලන්න
    const [isLiked, setIsLiked] = useState(
        post.likes?.some((like: any) => like.user_id === currentUserId)
    )
    const supabase = createClient()

    // --- පෝස්ට් එක මකා දැමීමේ Function එක ---
    async function handleDeletePost() {
        if (!confirm("මෙම පෝස්ට් එක මකා දැමීමට ඔබට විශ්වාසද?")) return

        setIsDeleting(true)
        try {
            // 1. පින්තූරයක් තිබේ නම් එය Storage එකෙන් මකමු
            if (post.image_url) {
                // URL එකෙන් පින්තූරයේ නම (filename) වෙන් කරගැනීම
                const parts = post.image_url.split('/')
                const fileName = parts[parts.length - 1]

                if (fileName) {
                    const { error: storageError } = await supabase.storage
                        .from('post-images') // ඔයාගේ Bucket නම මෙතනට දෙන්න
                        .remove([fileName])
                    
                    if (storageError) console.error("Storage delete error:", storageError)
                }
            }

            // 2. Database එකෙන් පෝස්ට් එක මකා දැමීම
            const { error: dbError } = await supabase
                .from('posts')
                .delete()
                .eq('id', post.id)

            if (dbError) throw dbError

            // සාර්ථක නම් පේජ් එක Refresh කිරීම
            window.location.reload()

        } catch (error) {
            console.error('Error deleting post:', error)
            alert("පෝස්ට් එක මකා දැමීමට නොහැකි විය.")
        } finally {
            setIsDeleting(false)
        }
    }

    async function handleLike() {
        if (!currentUserId) return

        if (isLiked) {
            setLikesCount((prev: number) => prev - 1)
            setIsLiked(false)
            await supabase.from('likes').delete().match({ post_id: post.id, user_id: currentUserId })
        } else {
            setLikesCount((prev: number) => prev + 1)
            setIsLiked(true)
            await supabase.from('likes').insert({ post_id: post.id, user_id: currentUserId })
            if (post.author.id !== currentUserId) {
                await supabase.from('notifications').insert({
                    user_id: post.author.id,
                    type: 'like',
                    from_user_id: currentUserId,
                    post_id: post.id
                })
            }
        }
    }

    return (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transform transition-all hover:shadow-md">
            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-spl-blue bg-opacity-10 flex items-center justify-center text-spl-blue font-bold overflow-hidden relative">
                            {post.author.avatar_url ? (
                                <Image src={post.author.avatar_url} alt="avatar" fill className="object-cover" unoptimized={true} />
                            ) : (
                                post.author.display_name?.charAt(0).toUpperCase() || '?'
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-spl-black dark:text-gray-200">{post.author.display_name}</p>
                            <p className="text-xs text-spl-gray-dark">
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <PostPresence postId={post.id} />
                        
                        {/* --- මකන බටන් එක (අයිතිකරුට පමණක් පෙනේ) --- */}
                        {currentUserId === post.user_id && (
                            <button 
                                onClick={handleDeletePost}
                                disabled={isDeleting}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                                {isDeleting ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Trash2 size={18} />
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <p className="text-spl-black dark:text-gray-300 mb-4 whitespace-pre-wrap">{post.content}</p>

                {post.image_url && (
                    <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-4 border border-gray-50 dark:border-gray-800">
                        <Image
                            src={
                                post.image_url.startsWith('http')
                                    ? post.image_url
                                    : supabase.storage.from('post-images').getPublicUrl(post.image_url).data.publicUrl
                            }
                            alt="Post Image"
                            fill
                            className="object-cover"
                            unoptimized={true}
                        />
                    </div>
                )}

                <div className="flex items-center space-x-6 pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
                    <button
                        onClick={handleLike}
                        disabled={!currentUserId}
                        className={`flex items-center space-x-1.5 focus:outline-none transition-colors ${isLiked ? 'text-spl-green' : 'text-spl-gray-dark hover:text-spl-blue'}`}
                    >
                        <svg className={`w-5 h-5 ${isLiked ? 'fill-current' : 'fill-none stroke-current stroke-2'}`} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        <span className="text-sm font-medium">{likesCount} Likes</span>
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center space-x-1.5 text-spl-gray-dark hover:text-spl-blue transition-colors focus:outline-none"
                    >
                        <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                        </svg>
                        <span className="text-sm font-medium">{commentsCount} Comments</span>
                    </button>
                </div>

                {showComments && (
                    <CommentSection
                        postId={post.id}
                        currentUserId={currentUserId}
                        onCommentAdded={() => setCommentsCount((prev: number) => prev + 1)}
                       onCommentDeleted={() => setCommentsCount((prev: number) => prev - 1)} 
                    />
                )}
            </div>
        </div>
    )
}