import { createClient } from '@/utils/supabase/server'
import PostCard from '@/components/post/PostCard'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import FriendButton from '@/components/post/FriendButton'
import EditProfileModal from './EditProfileModal'
import OnlineFollowers from '@/components/post/OnlineFollowers'
import AdSection from '@/components/AdSection'
// ✅ Heart අයිකන් එක මෙතනට අලුතින් එකතු කළා!
import { MapPin, Link as LinkIcon, Briefcase, GraduationCap, LayoutDashboard, Cake, FileText, Users, Image as ImageIcon, Sparkles, CalendarDays, Heart } from 'lucide-react'
import Link from 'next/link'

// ✅ Next.js 15+ වල searchParams ගන්න විදිහ
export default async function ProfilePage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ tab?: string }> }) {
    const { id } = await params
    const resolvedSearchParams = await searchParams
    const activeTab = resolvedSearchParams.tab || 'posts' // දැනට ඉන්න Tab එක මොකක්ද කියලා බලනවා

    const supabase = await createClient()
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // 1. ප්‍රොෆයිල් දත්ත ලබා ගැනීම
    const { data: profile, error } = await supabase
        .from('profiles')
        .select(`*, followers:follows!followed_id(count), following:follows!follower_id(count)`)
        .eq('id', id)
        .single()

    if (error || !profile) notFound()

    const vibeColor = profile.theme_color || '#10b981'

    // 2. පෝස්ට් දත්ත ලබා ගැනීම
    const { data: posts } = await supabase
        .from('posts')
        .select(`*, author:profiles!user_id(display_name, avatar_url), likes(id), comments(count)`)
        .eq('user_id', id)
        .order('created_at', { ascending: false })

    const isOwnProfile = currentUser?.id === id

    // 📸 ෆොටෝ තියෙන පෝස්ට් විතරක් පෙරා ගන්නවා (Photos Tab එකට)
    const photoPosts = posts?.filter(post => post.image_url) || []

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-gray-900 dark:text-white pb-10 transition-colors">
            
            {/* 📸 COVER PHOTO - Facebook Style */}
            <div className="relative h-64 md:h-96 w-full max-w-7xl mx-auto md:rounded-b-3xl overflow-hidden shadow-lg group" style={{ background: `linear-gradient(135deg, ${vibeColor}88, #000000)` }}>
                {profile.cover_url ? (
                    <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-900 opacity-50"></div>
                )}
                
                {/* 🌟 Glowing Edge Effect */}
                <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>

                {isOwnProfile && (
                    <div className="absolute top-6 right-6 z-20">
                         <EditProfileModal profile={profile} /> 
                    </div>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* 👤 PROFILE HEADER - Clean & Modern */}
                <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 -mt-20 md:-mt-24 mb-6 z-10">
                    
                    {/* Avatar */}
                    <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full border-[6px] border-white dark:border-[#0F172A] shadow-2xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800 transition-transform hover:scale-105 duration-300">
                        {profile.avatar_url ? (
                            <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" unoptimized={true} />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl font-black text-white" style={{ backgroundColor: vibeColor }}>
                                {profile.display_name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* Name & Title */}
                    <div className="flex-1 text-center md:text-left pb-4 md:pb-6">
                        <h1 className="text-4xl md:text-5xl font-extrabold mb-1 tracking-tight text-gray-900 dark:text-white flex items-center justify-center md:justify-start gap-2">
                            {profile.display_name}
                            <Sparkles className="w-6 h-6" style={{ color: vibeColor }} />
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
                            {profile.bio ? profile.bio : "Exploring the Web3 Universe 🚀"}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mb-6 shrink-0">
                        {isOwnProfile ? (
                            <button className="text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:-translate-y-1 shadow-lg shadow-emerald-500/20" style={{ backgroundColor: vibeColor }}>
                                <LayoutDashboard size={20} /> Dashboard
                            </button>
                        ) : (
                            <>
                                <FriendButton targetUserId={id} currentUserId={currentUser?.id || ''} />
                                <Link href={`/chat/${id}`} className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 px-6 py-3 rounded-xl font-bold transition-all shadow-sm">
                                    Message
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                {/* 📊 STATS BAR */}
                <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto md:mx-0 mb-8 bg-white/50 dark:bg-[#0F172A]/80 backdrop-blur-md p-4 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div className="text-center p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{posts?.length || 0}</p>
                        <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mt-1">Posts</p>
                    </div>
                    <div className="text-center p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer border-x border-gray-200 dark:border-gray-800">
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{profile.followers?.[0]?.count || 0}</p>
                        <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mt-1">Followers</p>
                    </div>
                    <div className="text-center p-2 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer">
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{profile.following?.[0]?.count || 0}</p>
                        <p className="text-xs uppercase tracking-wider text-gray-500 font-bold mt-1">Following</p>
                    </div>
                </div>

                {/* 📑 TABS MENU (✅ <Link> වෙනුවට <a> ටැග් එක දැම්මා) */}
                <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 border-b border-gray-200 dark:border-gray-800 pb-px">
                    <a href={`/profile/${id}?tab=posts`} className={`px-6 py-4 font-bold text-sm md:text-base whitespace-nowrap border-b-4 transition-colors flex items-center gap-2 ${activeTab === 'posts' ? '' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`} style={activeTab === 'posts' ? { borderBottomColor: vibeColor, color: vibeColor } : {}}>
                        <FileText size={18} /> Posts
                    </a>
                    <a href={`/profile/${id}?tab=about`} className={`px-6 py-4 font-bold text-sm md:text-base whitespace-nowrap border-b-4 transition-colors flex items-center gap-2 ${activeTab === 'about' ? '' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`} style={activeTab === 'about' ? { borderBottomColor: vibeColor, color: vibeColor } : {}}>
                        <Users size={18} /> About
                    </a>
                    <a href={`/profile/${id}?tab=photos`} className={`px-6 py-4 font-bold text-sm md:text-base whitespace-nowrap border-b-4 transition-colors flex items-center gap-2 ${activeTab === 'photos' ? '' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white'}`} style={activeTab === 'photos' ? { borderBottomColor: vibeColor, color: vibeColor } : {}}>
                        <ImageIcon size={18} /> Photos
                    </a>
                </div>

                {/* ======================================================= */}
                {/* 📍 TAB 1: POSTS CONTENT GRID */}
                {/* ======================================================= */}
                {activeTab === 'posts' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* ⬅️ LEFT SIDEBAR: INTRO */}
                        <div className="lg:col-span-3">
                            <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 sticky top-24 shadow-sm">
                                <h3 className="font-extrabold text-lg mb-4 text-gray-900 dark:text-white">Intro</h3>
                                <div className="space-y-3 text-sm">
                                    {profile.location && (
                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                            <MapPin className="text-gray-400 shrink-0" size={18} />
                                            <span>Lives in <span className="font-semibold text-gray-900 dark:text-white">{profile.location}</span></span>
                                        </div>
                                    )}
                                    {profile.education && (
                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                            <GraduationCap className="text-gray-400 shrink-0" size={18} />
                                            <span>Studied at <span className="font-semibold text-gray-900 dark:text-white">{profile.education}</span></span>
                                        </div>
                                    )}
                                    {profile.work && (
                                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                            <Briefcase className="text-gray-400 shrink-0" size={18} />
                                            <span>Works as <span className="font-semibold text-gray-900 dark:text-white">{profile.work}</span></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 🎯 CENTER: ACTIVITY FEED */}
                        <div className="lg:col-span-6 space-y-6">
                            {posts && posts.map((post) => (
                                <PostCard key={post.id} post={post} currentUserId={currentUser?.id} themeColor={vibeColor} />
                            ))}
                            {posts?.length === 0 && (
                                <div className="text-center py-16 bg-white dark:bg-[#0F172A] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="text-gray-400" size={28} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No posts yet</h3>
                                </div>
                            )}
                        </div>

                        {/* ➡️ RIGHT SIDEBAR: ONLINE & ADS */}
                        <div className="lg:col-span-3 hidden lg:block relative z-0">
                            <div className="sticky top-24 space-y-6 w-full overflow-hidden">
                                <OnlineFollowers currentUserId={id} />
                                <AdSection />
                            </div>
                        </div>
                    </div>
                )}

                {/* ======================================================= */}
                {/* 📍 TAB 2: ABOUT SECTION */}
                {/* ======================================================= */}
                {activeTab === 'about' && (
                    <div className="max-w-4xl mx-auto bg-white dark:bg-[#0F172A] p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm animate-in fade-in duration-500">
                        <h2 className="text-2xl font-black mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">About {profile.display_name}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg">
                            {profile.bio && (
                                <div className="col-span-1 md:col-span-2 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl">
                                    <p className="text-gray-600 dark:text-gray-300 italic">"{profile.bio}"</p>
                                </div>
                            )}
                            {profile.location && (
                                <div className="flex items-start gap-4"><MapPin style={{color: vibeColor}} size={28} className="shrink-0 mt-1" /><div><p className="text-sm text-gray-500">Current City</p><p className="font-bold">{profile.location}</p></div></div>
                            )}
                            {profile.work && (
                                <div className="flex items-start gap-4"><Briefcase style={{color: vibeColor}} size={28} className="shrink-0 mt-1" /><div><p className="text-sm text-gray-500">Work</p><p className="font-bold">{profile.work}</p></div></div>
                            )}
                            {profile.education && (
                                <div className="flex items-start gap-4"><GraduationCap style={{color: vibeColor}} size={28} className="shrink-0 mt-1" /><div><p className="text-sm text-gray-500">Education</p><p className="font-bold">{profile.education}</p></div></div>
                            )}
                            {profile.birthday && (
                                <div className="flex items-start gap-4"><Cake style={{color: vibeColor}} size={28} className="shrink-0 mt-1" /><div><p className="text-sm text-gray-500">Birthday</p><p className="font-bold">{new Date(profile.birthday).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div></div>
                            )}
                            {profile.website && (
                                <div className="flex items-start gap-4"><LinkIcon style={{color: vibeColor}} size={28} className="shrink-0 mt-1" /><div><p className="text-sm text-gray-500">Website</p><a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline text-blue-500 truncate block max-w-[200px]">{profile.website.replace(/^https?:\/\//, '')}</a></div></div>
                            )}
                        </div>
                    </div>
                )}

                {/* ======================================================= */}
                {/* 📍 TAB 3: PHOTOS GALLERY */}
                {/* ======================================================= */}
                {activeTab === 'photos' && (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black">Photos</h2>
                            <p className="text-gray-500">{photoPosts.length} Photos</p>
                        </div>
                        
                        {photoPosts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {photoPosts.map((post) => (
                                    <div key={post.id} className="aspect-square rounded-2xl overflow-hidden group relative bg-gray-100 dark:bg-gray-800 cursor-pointer shadow-sm">
                                        <img src={post.image_url} alt="User Post" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="flex items-center gap-4 text-white font-bold">
                                                <span className="flex items-center gap-1"><Heart size={20} fill="white" /> {post.likes?.length || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white dark:bg-[#0F172A] rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                                <ImageIcon className="mx-auto text-gray-400 mb-4" size={48} />
                                <h3 className="text-xl font-bold mb-2">No Photos Yet</h3>
                                <p className="text-gray-500">Photos from your posts will automatically appear here.</p>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    )
}