import { createClient } from '@/utils/supabase/server'
import PostCard from '@/components/post/PostCard'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import FriendButton from '@/components/post/FriendButton'
import EditProfileModal from './EditProfileModal'
import OnlineFollowers from '@/components/post/OnlineFollowers'
import AdSection from '@/components/AdSection'
import { MapPin, Link as LinkIcon, Briefcase, GraduationCap, LayoutDashboard, Cake, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
    // 1. Params await කිරීම (Next.js 15+ සඳහා අනිවාර්යයි)
    const { id } = await params
    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // 2. ප්‍රොෆයිල් දත්ත ලබා ගැනීම
    const { data: profile, error } = await supabase
        .from('profiles')
        .select(`*, followers:follows!followed_id(count), following:follows!follower_id(count)`)
        .eq('id', id)
        .single()

    if (error || !profile) notFound()

    const vibeColor = profile.theme_color || '#10b981'

    // 3. පෝස්ට් දත්ත ලබා ගැනීම
    const { data: posts } = await supabase
        .from('posts')
        .select(`*, author:profiles!user_id(display_name, avatar_url), likes(id), comments(count)`)
        .eq('user_id', id)
        .order('created_at', { ascending: false })

    const isOwnProfile = currentUser?.id === id

    return (
        <div className="min-h-screen bg-[#020817] text-white pb-10 transition-colors">
            
            {/* 📸 COVER PHOTO */}
            <div className="relative h-56 sm:h-80 overflow-hidden max-w-full shadow-2xl" style={{ background: `linear-gradient(to right, ${vibeColor}, #000000)` }}>
                {profile.cover_url && <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover opacity-60" />}
                {isOwnProfile && (
                    <div className="absolute top-6 right-6 z-20">
                         <EditProfileModal profile={profile} /> 
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4">
                {/* 👤 PROFILE HEADER */}
                <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-24 mb-10 pb-8 border-b border-gray-800">
                    <div className="relative w-40 h-40 md:w-56 md:h-56 rounded-full border-[6px] bg-[#0F172A] shadow-2xl overflow-hidden z-10 shrink-0" style={{ borderColor: vibeColor }}>
                        {profile.avatar_url ? (
                            <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" unoptimized={true} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl font-black" style={{ backgroundColor: vibeColor }}>
                                {profile.display_name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left pb-2">
                        <h1 className="text-5xl md:text-6xl font-black mb-2 tracking-tighter">
                            {profile.display_name}
                        </h1>
                        <p className="text-gray-400 text-xl font-bold italic">
                            <span style={{ color: vibeColor }}>{profile.followers?.[0]?.count || 0}</span> followers • <span>{profile.following?.[0]?.count || 0}</span> following
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 mb-4 shrink-0">
                        {isOwnProfile ? (
                            <button className="text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all hover:scale-105 shadow-xl" style={{ backgroundColor: vibeColor }}>
                                <LayoutDashboard size={24} /> Dashboard
                            </button>
                        ) : (
                            <div className="flex gap-3">
                                {/* ✅ Fix: initialIsFollowing prop එක අයින් කළා */}
                                <FriendButton targetUserId={id} currentUserId={currentUser?.id || ''} />
                                <Link href={`/chat/${id}`} className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-2xl font-black transition-all">Message</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* 📍 CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LEFT: INTRO */}
                    <div className="lg:col-span-3">
                        <div className="bg-[#0F172A] p-6 rounded-[32px] border border-gray-800 sticky top-24 shadow-xl">
                            <h3 className="font-black text-3xl mb-6 uppercase tracking-tighter italic text-white">Intro</h3>
                            
                            {profile.bio && (
                                <p className="text-center text-gray-300 mb-8 italic text-lg leading-relaxed border-b border-gray-800 pb-6">
                                    "{profile.bio}"
                                </p>
                            )}

                            <div className="space-y-6">
                                {profile.birthday && (
                                    <div className="flex items-center gap-3 text-gray-400 mb-6">
                                        <div className="p-2 bg-pink-500/10 rounded-lg">
                                            <Cake className="text-pink-500" size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-gray-500">Human Born On</span>
                                            <span className="text-sm font-bold text-gray-200">
                                                {new Date(profile.birthday).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {profile.location && (
                                    <div className="flex items-center gap-4 text-gray-300 hover:text-white transition-colors">
                                        <MapPin style={{ color: vibeColor }} size={24} className="shrink-0" />
                                        <span className="text-lg">Lives in <span className="font-bold text-white">{profile.location}</span></span>
                                    </div>
                                )}

                                {profile.education && (
                                    <div className="flex items-center gap-4 text-gray-300 hover:text-white transition-colors">
                                        <GraduationCap style={{ color: vibeColor }} size={24} className="shrink-0" />
                                        <span className="text-lg">Studied at <span className="font-bold text-white">{profile.education}</span></span>
                                    </div>
                                )}

                                {profile.work && (
                                    <div className="flex items-center gap-4 text-gray-300 hover:text-white transition-colors">
                                        <Briefcase style={{ color: vibeColor }} size={24} className="shrink-0" />
                                        <span className="text-lg">Works as <span className="font-bold text-white">{profile.work}</span></span>
                                    </div>
                                )}

                                {profile.website && (
                                    <div className="flex items-center gap-4 text-gray-300 hover:text-white transition-colors">
                                        <LinkIcon style={{ color: vibeColor }} size={24} className="shrink-0" />
                                        <a 
                                            href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-lg font-bold text-white hover:underline truncate"
                                        >
                                            {profile.website.replace(/^https?:\/\//, '')}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* CENTER: ACTIVITY */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center gap-3 mb-4">
                             <div className="w-2 h-10 rounded-full" style={{ backgroundColor: vibeColor }}></div>
                             <h2 className="text-3xl font-black uppercase tracking-widest italic">Timeline</h2>
                        </div>
                        <div className="space-y-6">
                            {posts && posts.map((post) => (
                                <PostCard key={post.id} post={post} currentUserId={currentUser?.id} themeColor={vibeColor} />
                            ))}
                            {posts?.length === 0 && (
                                <div className="text-center py-20 bg-[#0F172A] rounded-[32px] border border-dashed border-gray-800">
                                    <p className="text-gray-500 font-bold italic text-xl">No transmissions found on this frequency. 🛸</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: SIDEBAR */}
                    <div className="lg:col-span-2 hidden lg:block">
                        <div className="sticky top-24 space-y-6">
                            <OnlineFollowers currentUserId={id} />
                            <AdSection />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}