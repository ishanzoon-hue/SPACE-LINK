'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus } from 'lucide-react'
import AddStoryModal from './AddStoryModal'
import StoryViewer from './StoryViewer'

export default function StoryTray() {
    const supabase = createClient()
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [groupedStories, setGroupedStories] = useState<any[]>([])
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [viewingUserStories, setViewingUserStories] = useState<any[] | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchStories = async (user: any) => {
        setIsLoading(true)

        // Fetch active stories
        // Due to RLS policy 'Anyone can view active stories', only unexpired ones return
        const { data: stories, error } = await supabase
            .from('stories')
            .select(`*, user:profiles!user_id(id, display_name, avatar_url)`)
            .order('created_at', { ascending: true })

        if (!error && stories) {
            // Group stories by user_id
            const groups: Record<string, any> = {}
            stories.forEach(story => {
                if (!groups[story.user_id]) {
                    groups[story.user_id] = {
                        user: story.user,
                        stories: []
                    }
                }
                groups[story.user_id].stories.push(story)
            })

            // Convert to array and put the current user first if they have stories
            let groupArr = Object.values(groups)
            const myIndex = groupArr.findIndex(g => g.user.id === user?.id)
            if (myIndex > -1) {
                const myGroup = groupArr.splice(myIndex, 1)[0]
                groupArr.unshift(myGroup)
            }
            
            setGroupedStories(groupArr)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUser(user)
            if (user) {
                await fetchStories(user)
            } else {
                setIsLoading(false)
            }
        }
        init()
    }, [])

    return (
        <>
            <div className="w-full bg-white dark:bg-[#0F172A] p-4 lg:p-5 rounded-[24px] lg:rounded-[32px] border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto no-scrollbar flex items-center gap-4">
                
                {/* 1. Add Story Bubble (Static) */}
                {currentUser && (
                    <div className="flex flex-col items-center gap-2 shrink-0 cursor-pointer" onClick={() => setIsAddOpen(true)}>
                        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gray-100 dark:bg-gray-800 border-[3px] border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden hover:scale-105 transition">
                            <Plus size={32} className="text-gray-400" />
                        </div>
                        <span className="text-[11px] font-bold text-gray-500">Your Story</span>
                    </div>
                )}

                {/* 2. Loading State */}
                {isLoading && !groupedStories.length && (
                    <div className="flex gap-4 opacity-50 px-2 md:px-0">
                        {[1, 2, 3].map(i => (
                           <div key={i} className="flex flex-col items-center gap-2 shrink-0">
                               <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                               <div className="w-12 h-2 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-full"></div>
                           </div> 
                        ))}
                    </div>
                )}

                {/* 3. Render Avatars */}
                {groupedStories.map((group) => (
                    <div 
                        key={group.user.id} 
                        className="flex flex-col items-center gap-2 shrink-0 cursor-pointer group"
                        onClick={() => setViewingUserStories(group.stories)}
                    >
                        {/* Avatar with Gradient Ring */}
                        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full p-[3px] bg-gradient-to-tr from-yellow-400 via-emerald-500 to-teal-500 group-hover:scale-105 transition-transform">
                            <div className="w-full h-full rounded-full border-[3px] border-white dark:border-[#0F172A] overflow-hidden bg-gray-100 dark:bg-gray-800 relative z-10">
                                <img src={group.user.avatar_url || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                            </div>
                        </div>
                        <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate w-16 text-center">
                            {group.user.id === currentUser?.id ? 'You' : (group.user.display_name?.split(' ')[0] || 'User')}
                        </span>
                    </div>
                ))}

            </div>

            {/* Modals */}
            {isAddOpen && <AddStoryModal currentUser={currentUser} onClose={() => { setIsAddOpen(false); fetchStories(currentUser) }} />}
            {viewingUserStories && <StoryViewer userStories={viewingUserStories} onClose={() => setViewingUserStories(null)} />}
        </>
    )
}
