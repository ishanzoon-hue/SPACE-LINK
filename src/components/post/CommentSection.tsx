'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Trash2, Loader2, Edit2, X, Check, MoreHorizontal } from 'lucide-react'
import RichText from '@/components/RichText'

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
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editContent, setEditContent] = useState('')
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
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

    const handleEdit = (comment: any) => {
        setEditingId(comment.id)
        setEditContent(comment.content)
    }

    const handleCancelEdit = () => {
        setEditingId(null)
        setEditContent('')
    }

    const handleUpdate = async (commentId: string) => {
        if (!editContent.trim()) return

        try {
            const { error } = await supabase
                .from('comments')
                .update({ content: editContent.trim() })
                .eq('id', commentId)

            if (error) throw error

            setComments(prev => prev.map(c =>
                c.id === commentId ? { ...c, content: editContent.trim() } : c
            ))
            setEditingId(null)
        } catch (err) {
            console.error('Error updating comment:', err)
            alert('Could not update comment.')
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
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === comment.id ? null : comment.id)}
                                                    className="p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <MoreHorizontal size={16} />
                                                </button>

                                                {openMenuId === comment.id && (
                                                    <div className="absolute right-0 top-6 w-32 bg-white dark:bg-[#1E293B] rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-10">
                                                        <button
                                                            onClick={() => { handleEdit(comment); setOpenMenuId(null); }}
                                                            className="w-full flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm transition-colors"
                                                        >
                                                            <Edit2 size={14} className="mr-2" /> Edit
                                                        </button>
                                                        <button
                                                            onClick={() => { handleDelete(comment.id); setOpenMenuId(null); }}
                                                            disabled={deletingId === comment.id}
                                                            className="w-full flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-red-500 text-sm transition-colors"
                                                        >
                                                            {deletingId === comment.id ? <Loader2 size={14} className="animate-spin mr-2" /> : <Trash2 size={14} className="mr-2" />} Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {editingId === comment.id ? (
                                        <div className="mt-2">
                                            <textarea
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                className="w-full bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-spl-blue dark:text-gray-200"
                                                rows={2}
                                                autoFocus
                                            />
                                            <div className="flex justify-end space-x-2 mt-1">
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="flex items-center text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                                                >
                                                    <X size={12} className="mr-1" /> Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleUpdate(comment.id)}
                                                    disabled={!editContent.trim() || editContent.trim() === comment.content}
                                                    className="flex items-center text-xs bg-spl-blue text-white px-3 py-1.5 rounded-md hover:bg-spl-blue-dark transition-colors disabled:opacity-50"
                                                >
                                                    <Check size={12} className="mr-1" /> Save
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-spl-black dark:text-gray-300 mt-1 whitespace-pre-wrap">
                                            <RichText content={comment.content} />
                                        </p>
                                    )}

                                    {/* --- අලුතින් එකතු කරපු Like Button එක --- */}
                                    <div className="flex items-center gap-4 mt-1 pl-2">
                                        <button
                                            onClick={() => handleLike(comment.id)}
                                            className="font-bold text-[12px] text-gray-500 dark:text-gray-400 hover:underline transition-all"
                                        >
                                            Like
                                        </button>
                                        <button
                                            onClick={() => handleEdit(comment)}
                                            className="font-bold text-[12px] text-gray-500 dark:text-gray-400 hover:underline transition-all"
                                        >
                                            Reply
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