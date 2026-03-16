'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Trash2, Loader2 } from 'lucide-react'

export default function CommentSection({
    postId,
    currentUserId,
    onCommentAdded,
    onCommentDeleted
}: {
    postId: string,
    currentUserId?: string,
    onCommentAdded: () => void,
    onCommentDeleted?: () => void
}) {
    const [comments, setComments] = useState<any[]>([])
    const [newComment, setNewComment] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
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

    const handleDelete = async (commentId: string) => {
        if (!confirm("Are you sure you want to delete this comment?")) return

        setDeletingId(commentId)
        try {
            const { error } = await supabase
                .from('comments')
                .delete()
                .eq('id', commentId)

            if (error) throw error

            setComments(prev => prev.filter(c => c.id !== commentId))
            if (onCommentDeleted) onCommentDeleted()
            
        } catch (err) {
            console.error('Error deleting comment:', err)
            alert('Could not delete comment.')
        } finally {
            setDeletingId(null)
        }
    }

    // --- අලුතින් එකතු කරපු Like Function එක ---
    const handleLike = async (commentId: string) => {
        if (!currentUserId) {
            alert("කරුණාකර Like කිරීම සඳහා ලොග් වෙන්න.");
            return; 
        }

        try {
            const response = await fetch('/api/comments/like', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    commentId: commentId, 
                    userId: currentUserId  
                }), 
            });

            const data = await response.json();
            console.log("Like response:", data.message);
            
        } catch (error) {
            console.error("Like කිරීමේදී දෝෂයක්:", error);
        }
    };

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
                            <div key={comment.id} className="group flex space-x-3 bg-spl-gray dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50 p-3 rounded-lg relative">
                                <div className="w-8 h-8 rounded-full bg-spl-blue bg-opacity-10 flex items-center justify-center text-spl-blue font-bold overflow-hidden relative shrink-0">
                                    {comment.author?.avatar_url ? (
                                        <Image src={comment.author.avatar_url} alt="avatar" fill className="object-cover" unoptimized={true} />
                                    ) : (
                                        comment.author?.display_name?.charAt(0).toUpperCase() || 'U'
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-baseline space-x-2">
                                            <span className="font-semibold text-sm text-spl-black dark:text-gray-200">{comment.author?.display_name}</span>
                                            <span className="text-xs text-spl-gray-dark">
                                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                            </span>
                                        </div>

                                        {currentUserId === comment.user_id && (
                                            <button 
                                                onClick={() => handleDelete(comment.id)}
                                                disabled={deletingId === comment.id}
                                                className="text-gray-400 hover:text-red-500 transition-opacity opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                            >
                                                {deletingId === comment.id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={14} />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-spl-black dark:text-gray-300 mt-1 whitespace-pre-wrap">{comment.content}</p>
                                    
                                    {/* --- අලුතින් එකතු කරපු Like Button එක --- */}
                                    <div className="flex items-center gap-4 mt-2">
                                        <button 
                                            onClick={() => handleLike(comment.id)}
                                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-500 transition-colors"
                                        >
                                            👍 Like
                                        </button>
                                    </div>

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