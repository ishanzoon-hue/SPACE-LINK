'use client'

import { useState } from 'react'
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-center'
import { Heart as HeartIcon, MessageCircle as MessageIcon, Share2 as ShareIcon, MoreHorizontal as MoreIcon } from 'lucide-react'

interface PostCardProps {
  post: any;
  currentUserId?: string;
  themeColor?: string;
}

export default function PostCard({ post, currentUserId, themeColor = '#10b981' }: PostCardProps) {
    const [isLiked, setIsLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(post.likes?.length || 0)

    const handleLike = () => {
        // 1. මේක තමයි හරි විදිහ - True/False මාරු කරනවා විතරයි
        setIsLiked(!isLiked) 

        // 2. මෙතනදී තමයි අංකය (prev: number) වෙනස් කරන්නේ
        setLikesCount((prev: number) => isLiked ? prev - 1 : prev + 1)
        
        // පස්සේ මෙතනට Supabase කෝඩ් එක දාන්න පුළුවන්
    }

    return (
        <div className="bg-white dark:bg-[#0F172A] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-800 transition-all">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden border-2" style={{ borderColor: themeColor }}>
                        <img src={post.author?.avatar_url || '/default-avatar.png'} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">{post.author?.display_name}</h4>
                        <p className="text-xs text-gray-500">Just now</p>
                    </div>
                </div>
                <button className="text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full">
                    <MoreIcon size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="mb-6">
                <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed mb-4">{post.content}</p>
                {post.image_url && (
                    <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                        <img src={post.image_url} alt="post" className="w-full h-auto" />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-50 dark:border-gray-800">
                <button 
                    onClick={handleLike}
                    className="flex items-center gap-2 transition-all active:scale-125 group"
                    style={{ color: isLiked ? themeColor : '#94a3b8' }}
                >
                    <HeartIcon 
                        size={22} 
                        fill={isLiked ? themeColor : "transparent"} 
                        stroke={isLiked ? themeColor : "currentColor"}
                        className="transition-colors"
                    />
                    <span className="font-bold text-lg">{likesCount}</span>
                </button>

                <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors">
                    <MessageIcon size={22} />
                    <span className="font-bold text-lg">{post.comments?.[0]?.count || 0}</span>
                </button>

                <button className="flex items-center gap-2 text-gray-400 hover:text-emerald-500 ml-auto transition-colors">
                    <ShareIcon size={22} />
                </button>
            </div>
        </div>
    )
}