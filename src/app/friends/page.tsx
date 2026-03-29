import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import FriendsList from '@/components/FriendsList'

export const metadata = {
    title: 'Friends | Elimeno',
    description: 'Manage your friends on Elimeno',
}

export default async function FriendsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    // 1. Get all friend_requests involving this user
    const { data: allRequests } = await supabase
        .from('friend_requests')
        .select('id, status, sender_id, receiver_id')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

    // Separate friends (accepted) and pending requests received
    const acceptedIds: string[] = []
    const acceptedRequestIds: { [userId: string]: string } = {}
    const pendingReceivedIds: string[] = []
    const pendingReceivedRequestIds: { [userId: string]: string } = {}
    const allKnownUserIds = new Set<string>()

    for (const req of allRequests || []) {
        const otherId = req.sender_id === user.id ? req.receiver_id : req.sender_id
        allKnownUserIds.add(otherId)

        if (req.status === 'accepted') {
            acceptedIds.push(otherId)
            acceptedRequestIds[otherId] = req.id
        } else if (req.status === 'pending' && req.receiver_id === user.id) {
            pendingReceivedIds.push(otherId)
            pendingReceivedRequestIds[otherId] = req.id
        }
    }

    // 2. Fetch friend profiles
    const friendProfiles = acceptedIds.length > 0
        ? (await supabase.from('profiles').select('id, display_name, avatar_url, is_verified').in('id', acceptedIds)).data || []
        : []

    // 3. Fetch pending request profiles
    const pendingProfiles = pendingReceivedIds.length > 0
        ? (await supabase.from('profiles').select('id, display_name, avatar_url, is_verified').in('id', pendingReceivedIds)).data || []
        : []

    // 4. Fetch suggestions (everyone else, max 30)
    const excludeIds = [user.id, ...Array.from(allKnownUserIds)]
    const { data: suggestionsRaw } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, is_verified')
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .limit(30)

    const friends = friendProfiles.map(p => ({ ...p, requestId: acceptedRequestIds[p.id] }))
    const pendingRequests = pendingProfiles.map(p => ({ ...p, requestId: pendingReceivedRequestIds[p.id] }))
    const suggestions = suggestionsRaw || []

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020817] transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <FriendsList
                    friends={friends}
                    pendingRequests={pendingRequests}
                    suggestions={suggestions}
                    currentUserId={user.id}
                />
            </div>
        </div>
    )
}
