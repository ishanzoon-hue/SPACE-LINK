import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Heart, MessageCircle, UserPlus, UserCheck, Bell } from 'lucide-react'

export default async function NotificationsPage() {
    const supabase = await createClient()
    
    // 1. දැනට ලොග් වෙලා ඉන්න යූසර්ව ගන්නවා
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 2. නොටිෆිකේෂන් ටික Database එකෙන් ගන්නවා (කවුද එව්වේ, මොන පෝස්ට් එකටද කියලා විස්තරත් එක්ක)
    const { data: notifications } = await supabase
        .from('notifications')
        .select(`
            id, type, created_at, is_read, post_id,
            from_user:profiles!from_user_id(id, display_name, avatar_url),
            post:posts!post_id(content)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30) // අලුත්ම 30 යි පෙන්වන්නේ

    // 3. පේජ් එකට ආවට පස්සේ කියවපු නැති (unread) නොටිෆිකේෂන් ඔක්කොම 'read' කරනවා
    await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

    return (
        <div className="min-h-screen bg-[#020617] text-white pt-8 pb-20">
            <div className="max-w-3xl mx-auto px-4">
                
                <div className="flex items-center gap-3 mb-8 border-b border-gray-800 pb-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                        <Bell size={28} />
                    </div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">Notifications</h1>
                </div>

                <div className="space-y-4">
                    {(!notifications || notifications.length === 0) ? (
                        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-gray-800">
                            <Bell size={48} className="mx-auto text-gray-600 mb-4 opacity-50" />
                            <h2 className="text-xl font-bold text-gray-400">No new notifications</h2>
                            <p className="text-gray-500 mt-2">When someone interacts with you, it will show up here. 🛸</p>
                        </div>
                    ) : (
                        notifications.map((noti: any) => {
                            // මොන ජාතියේ නොටිෆිකේෂන් එකක්ද කියලා බලලා අයිකන් සහ පාට තීරණය කිරීම
                            let Icon = Bell
                            let iconColor = 'text-gray-400'
                            let bgColor = 'bg-gray-800'
                            let text = ''

                            if (noti.type === 'like') {
                                Icon = Heart
                                iconColor = 'text-pink-500'
                                bgColor = 'bg-pink-500/10'
                                text = 'liked your post.'
                            } else if (noti.type === 'comment') {
                                Icon = MessageCircle
                                iconColor = 'text-blue-500'
                                bgColor = 'bg-blue-500/10'
                                text = 'commented on your post.'
                            } else if (noti.type === 'friend_request') {
                                Icon = UserPlus
                                iconColor = 'text-emerald-500'
                                bgColor = 'bg-emerald-500/10'
                                text = 'sent you a friend request.'
                            } else if (noti.type === 'accept_request') {
                                Icon = UserCheck
                                iconColor = 'text-purple-500'
                                bgColor = 'bg-purple-500/10'
                                text = 'accepted your friend request.'
                            }

                            return (
                                <Link 
                                    href={noti.post_id ? `/#post-${noti.post_id}` : `/profile/${noti.from_user?.id}`} 
                                    key={noti.id}
                                >
                                    <div className={`flex items-start gap-4 p-4 rounded-2xl border transition-all hover:scale-[1.01] ${noti.is_read ? 'bg-white/5 border-gray-800 hover:bg-white/10' : 'bg-[#0F172A] border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'}`}>
                                        
                                        {/* Avatar & Icon Badge */}
                                        <div className="relative shrink-0">
                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-800 bg-gray-900">
                                                <img src={noti.from_user?.avatar_url || '/default-avatar.png'} alt="avatar" className="w-full h-full object-cover" />
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full border-2 border-[#020617] ${bgColor}`}>
                                                <Icon size={12} className={iconColor} fill={noti.type === 'like' ? 'currentColor' : 'none'} />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-gray-300">
                                                <span className="font-bold text-white text-lg">{noti.from_user?.display_name}</span> {text}
                                            </p>
                                            
                                            {/* පෝස්ට් එකේ පොඩි කෑල්ලක් පෙන්වීම (comment/like නම්) */}
                                            {noti.post?.content && (
                                                <p className="text-sm text-gray-500 mt-1 truncate italic">
                                                    "{noti.post.content}"
                                                </p>
                                            )}

                                            <p className="text-xs text-gray-600 mt-2 font-bold uppercase tracking-wider">
                                                {new Date(noti.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                                            </p>
                                        </div>
                                        
                                        {/* අලුත් ඒවට නිල් පාට තිතක් */}
                                        {!noti.is_read && (
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-2 shadow-[0_0_10px_#10b981]" />
                                        )}
                                    </div>
                                </Link>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    )
}