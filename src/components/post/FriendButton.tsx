'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { UserPlus, Clock, UserCheck, UserX } from 'lucide-react'

export default function FriendButton({ targetUserId, currentUserId }: { targetUserId: string, currentUserId: string }) {
    // status පුළුවන්: 'none' | 'pending_sent' | 'pending_received' | 'friends'
    const [status, setStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'friends'>('none')
    const [loading, setLoading] = useState(true)
    const [requestId, setRequestId] = useState<string | null>(null)
    
    const supabase = createClient()

    useEffect(() => {
        const checkStatus = async () => {
            if (!currentUserId || !targetUserId) return

            // 1. මම යවපු රික්වෙස්ට් එකක් තියෙනවද බලමු
            const { data: sentReq } = await supabase
                .from('friend_requests')
                .select('*')
                .eq('sender_id', currentUserId)
                .eq('receiver_id', targetUserId)
                .single()

            if (sentReq) {
                setRequestId(sentReq.id)
                setStatus(sentReq.status === 'accepted' ? 'friends' : 'pending_sent')
                setLoading(false)
                return
            }

            // 2. එයා මට එවපු රික්වෙස්ට් එකක් තියෙනවද බලමු
            const { data: receivedReq } = await supabase
                .from('friend_requests')
                .select('*')
                .eq('sender_id', targetUserId)
                .eq('receiver_id', currentUserId)
                .single()

            if (receivedReq) {
                setRequestId(receivedReq.id)
                setStatus(receivedReq.status === 'accepted' ? 'friends' : 'pending_received')
                setLoading(false)
                return
            }

            setLoading(false)
        }

        checkStatus()
    }, [currentUserId, targetUserId, supabase])

    const handleClick = async () => {
        setLoading(true)

        if (status === 'none') {
            // රික්වෙස්ට් එකක් යවන්න (Send Request)
            const { data, error } = await supabase
                .from('friend_requests')
                .insert({ sender_id: currentUserId, receiver_id: targetUserId, status: 'pending' })
                .select()
                .single()
            
            if (!error && data) {
                setStatus('pending_sent')
                setRequestId(data.id)
            }
        } 
        else if (status === 'pending_sent') {
            // යැව්ව එක කැන්සල් කරන්න (Cancel Request)
            if (requestId) {
                await supabase.from('friend_requests').delete().eq('id', requestId)
                setStatus('none')
                setRequestId(null)
            }
        }
        else if (status === 'pending_received') {
            // ආපු රික්වෙස්ට් එක ඇක්සෙප්ට් කරන්න (Accept Request)
            if (requestId) {
                await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', requestId)
                setStatus('friends')
            }
        }
        else if (status === 'friends') {
            // යාළුකම අයින් කරන්න (Unfriend)
            if (requestId) {
                await supabase.from('friend_requests').delete().eq('id', requestId)
                setStatus('none')
                setRequestId(null)
            }
        }

        setLoading(false)
    }

    if (!currentUserId || currentUserId === targetUserId) return null // තමන්ටම රික්වෙස්ට් යවාගන්න බෑනේ!

    // බටන් එකේ පෙනුම තීරණය කිරීම
    return (
        <button 
            onClick={handleClick}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 ${
                status === 'none' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' :
                status === 'pending_sent' ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' :
                status === 'pending_received' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                'bg-white/10 hover:bg-red-500/20 text-white hover:text-red-500 border border-white/10 hover:border-red-500/50'
            }`}
        >
            {loading ? <span className="animate-pulse">Loading...</span> : (
                <>
                    {status === 'none' && <><UserPlus size={18} /> Add Friend</>}
                    {status === 'pending_sent' && <><Clock size={18} /> Requested</>}
                    {status === 'pending_received' && <><UserCheck size={18} /> Accept Request</>}
                    {status === 'friends' && <><UserCheck size={18} /> Friends</>}
                </>
            )}
        </button>
    )
}