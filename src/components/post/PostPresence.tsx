'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Eye } from 'lucide-react'

export default function PostPresence({ postId }: { postId: string }) {
    const [viewerCount, setViewerCount] = useState(0)
    const supabase = createClient()

    useEffect(() => {
        // මේ පෝස්ට් එකටම වෙන් වුණු Realtime Channel එකක්
        const channel = supabase.channel(`post-viewers-${postId}`)

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState()
                // දැනට මේ පෝස්ට් එක බලන අයගේ ගණන
                setViewerCount(Object.keys(state).length)
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    // අපි පෝස්ට් එක බලනවා කියලා track කරනවා
                    await channel.track({ online_at: new Date().toISOString() })
                }
            })

        return () => {
            channel.unsubscribe()
        }
    }, [postId])

    if (viewerCount < 1) return null

    return (
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-spl-green bg-spl-green/10 px-2 py-0.5 rounded-full animate-pulse">
            <Eye size={12} />
            <span>{viewerCount} {viewerCount === 1 ? 'viewing' : 'viewing now'}</span>
        </div>
    )
}