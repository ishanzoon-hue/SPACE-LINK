import { createClient } from '@/utils/supabase/server'
import PostCard from '@/components/post/PostCard'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import FollowButton from './FollowButton'
import EditProfileModal from './EditProfileModal'
import OnlineFollowers from '@/components/post/OnlineFollowers'
import { MapPin, Link as LinkIcon, Briefcase, GraduationCap, Edit2, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // 1. Fetch Profile Data
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

    // 2. Fetch User's Posts
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

    // 3. Check if current user follows this profile
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
        <div className="min-h-screen bg-gray-50 dark:bg-[#020817] text-white pb-10 transition-colors duration-300">
            
            {/* 📸 COVER PHOTO - පළල max-w-7xl දක්වා වැඩි කළා */}
            <div className="relative h-56 sm:h-96 bg-gradient-to-r from-emerald-600 to-teal-800 rounded-b-3xl overflow-hidden max-w-7xl mx-auto shadow-2xl">
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
                
                {/* 👤 PROFILE HEADER Section */}
                <div className="relative flex flex-col md:flex-row items-center md:items-end gap-8 -mt-16 md:-mt-20 mb-10 pb-8 border-b border-gray-200 dark:border-gray-800">
                    
                    {/* Profile Picture */}
                    <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full border-8 border-white dark:border-[#020817] bg-gray-800 shadow-2xl overflow-hidden z-10 transition-transform hover:scale-105 duration-300">
                        {profile.avatar_url ? (
                            <Image
                                src={profile.avatar_url}
                                alt="Avatar"
                                fill
                                className="object-cover"
                                unoptimized={true}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-spl-green text-white text-6xl font-bold">
                                {profile.display_name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Name & Stats */}
                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
                            {profile.display_name}
                            {profile.username && <span className="text-gray-500 text-2xl font-normal ml-3">({profile.username})</span>}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-xl font-bold">
                            <span className="text-gray-900 dark:text-white">{profile.followers?.[0]?.count || 0}</span> followers • <span className="text-gray-900 dark:text-white">{profile.following?.[0]?.count || 0}</span> following
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 mb-4">
                        {isOwnProfile ? (
                            <div className="flex gap-3">
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95">
                                    <LayoutDashboard size={20} /> Dashboard
                                </button>
                                <EditProfileModal profile={profile} />
                            </div>
                        ) : currentUser ? (
                            <div className="flex gap-3">
                                <FollowButton
                                    targetUserId={id}
                                    currentUserId={currentUser.id}
                                    initialIsFollowing={isFollowing}
                                />
                                <Link href={`/chat/${id}`} className="bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-8 py-3 rounded-xl font-bold transition-all shadow-sm">
                                    Message
                                </Link>
                            </div>
                        ) : null}
                    </div>
                </div>

                {/* 🏠 MAIN CONTENT GRID - මෙතන තමයි 12-column grid එක තියෙන්නේ */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT SIDEBAR (Intro Details) - 12න් 3ක ඉඩක් ගනී */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 sticky top-24">
                            <h3 className="font-black text-2xl mb-5 text-gray-900 dark:text-white tracking-tight">Intro</h3>
                            <p className="text-center text-gray-700 dark:text-gray-300 mb-8 text-lg italic leading-relaxed">
                                "{profile.bio || 'Sharing my thoughts with the world.'}"
                            </p>
                            
                            <div className="space-y-5 text-gray-600 dark:text-gray-300 text-lg">
                                <div className="flex items-center gap-4">
                                    <Briefcase className="text-emerald-500" size={24} />
                                    <span>Digital creator</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <MapPin className="text-red-500" size={24} />
                                    <span>Lives in <span className="font-bold dark:text-white">{profile.location || 'Colombo'}</span></span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <GraduationCap className="text-blue-500" size={24} />
                                    <span>Studied at <span className="font-bold dark:text-white">University of Space</span></span>
                                </div>
                                {profile.website && (
                                    <div className="flex items-center gap-4">
                                        <LinkIcon className="text-sky-500" size={24} />
                                        <a href={profile.website} target="_blank" className="text-blue-500 hover:underline truncate">{profile.website}</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 🚀 CENTER (Post Feed) - 12න් 7ක ලොකු ඉඩක් ගනී (පෝස්ට් දැන් ලොකුවට පේනවා) */}
                    <div className="lg:col-span-7 space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                             <h2 className="text-2xl font-black text-gray-900 dark:text-gray-200 uppercase tracking-widest">Recent Activity</h2>
                        </div>
                        
                        {posts && posts.length > 0 ? (
                            <div className="space-y-8">
                                {posts.map((post) => (
                                    <div key={post.id} className="transition-transform duration-300 hover:scale-[1.01]">
                                        <PostCard post={post} currentUserId={currentUser?.id} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-32 bg-white dark:bg-[#0F172A] rounded-3xl border-4 border-dashed border-gray-100 dark:border-gray-800">
                                <p className="text-gray-500 text-xl font-medium">This user hasn't posted anything yet.</p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT SIDEBAR (Online Followers) - ඉතිරි 12න් 2ක ඉඩ ගනී */}
                    <div className="hidden lg:block lg:col-span-2">
                        <div className="sticky top-24">
                             <OnlineFollowers currentUserId={currentUser?.id || ''} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}