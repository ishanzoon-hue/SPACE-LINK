'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'

export default function CommentSection({
    postId,
    currentUserId,
    onCommentAdded
}: {
    postId: string,
    currentUserId?: string,
    onCommentAdded: () => void
}) {
    const [comments, setComments] = useState<any[]>([])
    const [newComment, setNewComment] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchComments()
    }, [postId])

    const fetchComments = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('comments')
            .select(`
                *,
                author:profiles!user_id(display_name, avatar_url)
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: true })

        if (!error && data) {
            setComments(data)
        }
        setIsLoading(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!currentUserId || !newComment.trim()) return

        setIsSubmitting(true)
        try {
            const { error } = await supabase
                .from('comments')
                .insert({
                    post_id: postId,
                    user_id: currentUserId,
                    content: newComment.trim()
                })

            if (error) throw error

            setNewComment('')
            await fetchComments()
            onCommentAdded()
        } catch (err: any) {
            console.error('Error adding comment:', err)
            alert('Failed to post comment.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            {isLoading ? (
                <div className="text-center py-4 text-sm text-spl-gray-dark">Loading comments...</div>
            ) : (
                <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
                    {comments.length === 0 ? (
                        <p className="text-sm text-center text-spl-gray-dark py-2">No comments yet. Be the first to share your thoughts!</p>
                    ) : (
                        comments.map(comment => (
                            <div key={comment.id} className="flex space-x-3 bg-spl-gray dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50 p-3 rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-spl-blue bg-opacity-10 flex items-center justify-center text-spl-blue font-bold overflow-hidden relative shrink-0">
                                    {comment.author?.avatar_url ? (
                                        <Image src={comment.author.avatar_url} alt="avatar" fill className="object-cover" unoptimized={true} />
                                    ) : (
                                        comment.author?.display_name?.charAt(0).toUpperCase() || 'U'
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-baseline space-x-2">
                                        <span className="font-semibold text-sm text-spl-black dark:text-gray-200">{comment.author?.display_name}</span>
                                        <span className="text-xs text-spl-gray-dark">
                                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-spl-black dark:text-gray-300 mt-1 whitespace-pre-wrap">{comment.content}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {currentUserId ? (
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 bg-spl-gray dark:bg-gray-800 dark:text-gray-200 border-transparent focus:bg-white dark:focus:bg-[#0F172A] focus:border-spl-blue focus:ring-2 focus:ring-spl-blue rounded-full px-4 py-2 text-sm transition-all"
                        disabled={isSubmitting}
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        className="bg-spl-blue text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-spl-blue-dark transition-colors disabled:opacity-50"
                    >
                        Post
                    </button>
                </form>
            ) : (
                <div className="text-center text-sm text-spl-gray-dark py-2">
                    Please log in to comment.
                </div>
            )}
        </div>
    )
}
