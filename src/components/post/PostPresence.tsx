'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Eye } from 'lucide-react'

export default function PostPresence({ postId }: { postId: string }) {
    const [viewers, setViewers] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        const getPresence = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            
            // අපි යූසර්ගේ නම ඩේටාබේස් එකෙන් ගමු
            let displayName = "Guest"
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('display_name')
                    .eq('id', user.id)
                    .single()
                displayName = profile?.display_name || "User"
            }

            const channel = supabase.channel(`post-viewers-${postId}`)

            channel
                .on('presence', { event: 'sync' }, () => {
                    const state = channel.presenceState()
                    const activeViewers: any[] = []
                    
                    // හැමෝගේම විස්තර එකතු කරගන්නවා
                    Object.values(state).forEach((presence: any) => {
                        activeViewers.push(...presence)
                    })
                    setViewers(activeViewers)
                })
                .subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        // නම සහ වෙලාව Track කරනවා
                        await channel.track({ 
                            user_name: displayName,
                            online_at: new Date().toISOString() 
                        })
                    }
                })

            return channel
        }

        const channelPromise = getPresence()

        return () => {
            channelPromise.then(channel => channel.unsubscribe())
        }
    }, [postId])

    if (viewers.length < 1) return null

    return (
        <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-spl-green bg-spl-green/10 px-2 py-0.5 rounded-full animate-pulse">
                <Eye size={12} />
                <span>{viewers.length} {viewers.length === 1 ? 'viewing' : 'viewing now'}</span>
            </div>
            
            {/* මෙන්න මෙතනින් නම් ටික පේනවා */}
            <div className="text-[9px] text-gray-400">
                {viewers.map((v, i) => (
                    <span key={i}>{v.user_name}{i !== viewers.length - 1 ? ', ' : ''}</span>
                ))}
            </div>
        </div>
    )
}