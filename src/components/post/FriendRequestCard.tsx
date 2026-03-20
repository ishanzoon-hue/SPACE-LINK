'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import Link from 'next/link'

export default function FriendRequestCard() {
    const [requests, setRequests] = useState<any[]>([])
    const supabase = createClient()

    // රික්වෙස්ට් ටික ගේමු
    useEffect(() => {
        const fetchRequests = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase
                    .from('friend_requests')
                    .select(`
                        id,
                        sender_id,
                        profiles!sender_id (id, display_name, avatar_url)
                    `)
                    .eq('receiver_id', user.id)
                    .eq('status', 'pending')

                setRequests(data || [])
            }
        }
        fetchRequests()
    }, [supabase])

    // Confirm Logic
    const handleConfirm = async (requestId: string) => {
        const { error } = await supabase
            .from('friend_requests')
            .update({ status: 'accepted' })
            .eq('id', requestId)
        
        if (!error) {
            setRequests(requests.filter(req => req.id !== requestId))
            // මෙතනදී ඕනෙ නම් 'follows' ටේබල් එකටත් දත්ත දාන්න පුළුවන්
        }
    }

    // Delete Logic
    const handleDelete = async (requestId: string) => {
        await supabase.from('friend_requests').delete().eq('id', requestId)
        setRequests(requests.filter(req => req.id !== requestId))
    }

    if (requests.length === 0) return null

    return (
        <div className="bg-[#0F172A] rounded-[32px] p-6 border border-gray-800 mb-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-black uppercase italic tracking-tighter">Friend Requests</h3>
                <button className="text-emerald-500 text-xs font-bold hover:underline">See all</button>
            </div>

            <div className="space-y-6">
                {requests.map((req) => (
                    <div key={req.id} className="flex items-start gap-4">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0">
                            <Image 
                                src={req.profiles.avatar_url || '/default-avatar.png'} 
                                alt="avatar" 
                                fill 
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <p className="text-sm font-black text-white">{req.profiles.display_name}</p>
                                <span className="text-[10px] text-gray-500 uppercase font-bold">New</span>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <button 
                                    onClick={() => handleConfirm(req.id)}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black py-2.5 rounded-xl transition-all active:scale-95"
                                >
                                    Confirm
                                </button>
                                <button 
                                    onClick={() => handleDelete(req.id)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-black py-2.5 rounded-xl transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}