'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { UserPlus, Clock, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FriendButton({ targetUserId, currentUserId }: { targetUserId: string, currentUserId: string }) {
    const [status, setStatus] = useState<'none' | 'pending_sent' | 'pending_received' | 'friends'>('none')
    const [loading, setLoading] = useState(true)
    const [requestId, setRequestId] = useState<string | null>(null)
    
    const supabase = createClient()

    useEffect(() => {
        const checkStatus = async () => {
            if (!currentUserId || !targetUserId) return
            try {
                // 1. රික්වෙස්ට් එකක් තියෙනවද බලමු (යවපු හරි ආපු හරි)
                const { data, error } = await supabase
                    .from('friend_requests')
                    .select('*')
                    .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${currentUserId})`)
                    .maybeSingle()

                if (data) {
                    setRequestId(data.id)
                    if (data.status === 'accepted') {
                        setStatus('friends')
                    } else {
                        setStatus(data.sender_id === currentUserId ? 'pending_sent' : 'pending_received')
                    }
                }
            } catch (err) {
                console.error("Status check failed:", err)
            } finally {
                setLoading(false)
            }
        }
        checkStatus()
    }, [currentUserId, targetUserId])

    const handleClick = async () => {
        if (!currentUserId) return toast.error("Please login first!")
        setLoading(true)

        try {
            if (status === 'none') {
                // 🚀 රික්වෙස්ට් එකක් යවන්න
                const { data, error } = await supabase
                    .from('friend_requests')
                    .insert([{ sender_id: currentUserId, receiver_id: targetUserId, status: 'pending' }])
                    .select()
                    .single()
                
                if (error) throw error

                // 🔔 Notification එකක් යවනවා
                await supabase.from('notifications').insert([{
                    user_id: targetUserId,
                    receiver_id: targetUserId,
                    sender_id: currentUserId,
                    from_user_id: currentUserId,
                    type: 'friend_request'
                }])

                setStatus('pending_sent')
                setRequestId(data.id)
                toast.success('Friend Request Sent! 🚀')
            } 
            else if (status === 'pending_sent' || status === 'friends') {
                // 🗑️ අයින් කරන්න (Cancel or Unfriend)
                if (requestId) {
                    const { error } = await supabase.from('friend_requests').delete().eq('id', requestId)
                    if (error) throw error
                    setStatus('none')
                    setRequestId(null)
                    toast.success(status === 'friends' ? 'Unfriended' : 'Request Cancelled')
                }
            }
            else if (status === 'pending_received') {
                // ✅ රික්වෙස්ට් එක ඇක්සෙප්ට් කරන්න
                if (requestId) {
                    const { error } = await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', requestId)
                    if (error) throw error
                    
                    // 🔔 Notification එකක් යවනවා (Accepted කියලා)
                    await supabase.from('notifications').insert([{
                        user_id: targetUserId,
                        receiver_id: targetUserId,
                        sender_id: currentUserId,
                        from_user_id: currentUserId,
                        type: 'friend_accept'
                    }])

                    setStatus('friends')
                    toast.success('Request Accepted! 🎉')
                }
            }
        } catch (error: any) {
            console.error("Friend Action Error:", error)
            toast.error(error.message || "Action failed") // 🚨 මෙතනින් තමයි ඇත්තම ලෙඩේ පේන්නේ!
        } finally {
            setLoading(false)
        }
    }

    if (!currentUserId || currentUserId === targetUserId) return null

    return (
        <button 
            onClick={handleClick}
            disabled={loading}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 ${
                status === 'none' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' :
                status === 'pending_sent' ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' :
                status === 'pending_received' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white'
            }`}
        >
            {loading ? <span className="animate-pulse italic">Processing...</span> : (
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