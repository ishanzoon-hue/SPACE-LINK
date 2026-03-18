import { createClient } from '@/utils/supabase/server'
import PostCard from '@/components/post/PostCard'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import FollowButton from './FollowButton'
import EditProfileModal from './EditProfileModal'
import OnlineFollowers from '@/components/post/OnlineFollowers'
import AdSection from '@/components/AdSection'
import { MapPin, Link as LinkIcon, Briefcase, GraduationCap, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // 1. Profile Data Fetch කිරීම
    const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
            *, 
            followers:follows!followed_id(count), 
            following:follows!follower_id(count)
        `)
        .eq('id', id)
        .single()

    if (error || !profile) {
        notFound()
    }

    // යූසර් තෝරලා තියෙන පාට (Vibe Color)
    const vibeColor = profile.theme_color || '#10b981'

    // 2. User ගේ Posts Fetch කිරීම
    const { data: posts } = await supabase
        .from('posts')
        .select(`
            *,
            author:profiles!user_id(display_name, avatar_url),
            likes(id),
            comments(count)
        `)
        .eq('user_id', id)
        .order('created_at', { ascending: false })

    let isFollowing = false
    if (currentUser && currentUser.id !== id) {
        const { data: follow } = await supabase
            .from('follows')
            .select('follower_id')
            .match({ follower_id: currentUser.id, followed_id: id })
            .single()
        if (follow) isFollowing = true
    }

    const isOwnProfile = currentUser?.id === id

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#020817] text-white pb-10 transition-colors">
            
            {/* 📸 COVER PHOTO */}
            <div 
                className="relative h-56 sm:h-96 rounded-b-3xl overflow-hidden max-w-7xl mx-auto shadow-2xl"
                style={{ background: `linear-gradient(to right, ${vibeColor}, #000000)` }}
            >
                {profile.cover_url && (
                    <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" />
                )}
                {isOwnProfile && (
                    <div className="absolute bottom-6 right-6 z-20">
                         <EditProfileModal profile={profile} /> 
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4">
                
                {/* 👤 PROFILE HEADER */}
                <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8 -mt-16 md:-mt-20 mb-10 pb-8 border-b border-gray-200 dark:border-gray-800">
                    <div 
                        className="relative w-40 h-40 md:w-52 md:h-52 rounded-full border-8 bg-gray-800 shadow-2xl overflow-hidden z-10"
                        style={{ borderColor: vibeColor }}
                    >
                        {profile.avatar_url ? (
                            <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" unoptimized={true} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-6xl font-bold" style={{ backgroundColor: vibeColor }}>
                                {profile.display_name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-black dark:text-white mb-2 tracking-tight">
                            {profile.display_name}
                            {profile.username && <span className="text-gray-500 text-2xl font-normal ml-3">({profile.username})</span>}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-xl font-bold">
                            <span style={{ color: vibeColor }}>{profile.followers?.[0]?.count || 0}</span> followers • <span>{profile.following?.[0]?.count || 0}</span> following
                        </p>
                    </div>

                    <div className="flex gap-3 mb-4">
                        {isOwnProfile ? (
                            <button className="text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2" style={{ backgroundColor: vibeColor }}>
                                <LayoutDashboard size={20} /> Dashboard
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                {/* ✅ Vercel Fix: මෙතන currentUserId එකට || '' ඇඩ් කළා */}
                                <FollowButton 
                                    targetUserId={id} 
                                    currentUserId={currentUser?.id || ''} 
                                    initialIsFollowing={isFollowing} 
                                />
                                <Link href={`/chat/${id}`} className="bg-gray-800 text-white px-8 py-3 rounded-xl font-bold">Message</Link>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT SIDEBAR (Intro) */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl shadow-sm border border-gray-800 sticky top-24">
                            <h3 className="font-black text-2xl mb-5 dark:text-white uppercase tracking-tighter">Intro</h3>
                            <p className="text-center text-gray-300 mb-8 italic">"{profile.bio || 'Sharing my thoughts with the world.'}"</p>
                            <div className="space-y-5 text-gray-300">
                                <div className="flex items-center gap-4">
                                    <MapPin style={{ color: vibeColor }} size={24} />
                                    <span>Lives in <span className="font-bold">{profile.location || 'Dubai'}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 🚀 CENTER (Post Feed) */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-2 h-8 rounded-full" style={{ backgroundColor: vibeColor }}></div>
                             <h2 className="text-2xl font-black dark:text-gray-200 uppercase tracking-widest">Recent Activity</h2>
                        </div>
                        
                        {posts && posts.map((post) => (
                            <div key={post.id} className="transition-transform duration-300 hover:scale-[1.01]">
                                <PostCard 
                                    post={post} 
                                    currentUserId={currentUser?.id} 
                                    themeColor={vibeColor}
                                />
                            </div>
                        ))}
                    </div>

                    {/* 📺 RIGHT SIDEBAR (Ads) */}
                    <div className="hidden lg:block lg:col-span-2">
                        <div className="sticky top-24 space-y-6">
                            <AdSection />
                            <OnlineFollowers currentUserId={currentUser?.id || ''} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}