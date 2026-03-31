'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import {
    User,
    Lock,
    Bell,
    Eye,
    Palette,
    Globe,
    ChevronRight,
    LogOut,
    ArrowLeft,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    Terminal,
    Smartphone,
    Heart,
    Instagram,
    Twitter,
    Linkedin,
    Map,
    Check,
    Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useTranslation } from '@/hooks/useTranslation'
import { useSettings } from '@/context/SettingsContext'
import { SecurityCard } from '@/components/settings/SecurityCard'

export default function SettingsPage() {
    const { t } = useTranslation()
    const { vibeColor, updateVibeColor, fontFamily, updateFont } = useSettings()
    const [activeSection, setActiveSection] = useState('account')
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)
    const supabase = createClient()
    const router = useRouter()
    
    // NEW: Password update state
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    useEffect(() => {
        async function loadUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setUser(user)
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
            setProfile(profile)
        }
        loadUser()
    }, [supabase, router])

    const handleUpdateProfile = async (updates: any) => {
        setLoading(true)
        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)

        if (!error) {
            setProfile({ ...profile, ...updates })
            toast.success('Settings updated! 🚀')
        } else {
            toast.error('Failed to update settings')
        }
        setLoading(false)
    }

    const handleUpdatePassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error('Please fill in both password fields')
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        const { error } = await supabase.auth.updateUser({ password: newPassword })

        if (!error) {
            toast.success('Password updated successfully! 🔐')
            setNewPassword('')
            setConfirmPassword('')
        } else {
            toast.error(error.message || 'Failed to update password')
        }
        setLoading(false)
    }

    const handleAccountDeletion = async () => {
        // This is a UI mockup for now, as Supabase requires management API for full deletion usually.
        toast.error('Please contact support to delete your account permanently.', {
            icon: '🛡️',
            duration: 5000
        })
    }

    if (!profile) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#020817]">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        </div>
    )

    const sections = [
        { id: 'account', icon: User, label: 'Account Settings', desc: 'Manage your profile and personal info' },
        { id: 'privacy', icon: Lock, label: 'Privacy', desc: 'Control who sees your profile and activity' },
        { id: 'preferences', icon: Palette, label: 'Appearance', desc: 'Customize themes, fonts, and vibes' },
        { id: 'security', icon: ShieldCheck, label: 'Security', desc: 'Manage passwords and account safety' },
        { id: 'notifications', icon: Bell, label: 'Notifications', desc: 'Stay updated with your world' },
    ]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#020817] pb-20">
            {/* 🔝 HEADER */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black tracking-tight">{t('common.settings')} & Privacy</h1>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* 📋 SIDEBAR NAVIGATION */}
                <aside className="lg:col-span-4 space-y-2">
                    <div className="bg-white dark:bg-[#0F172A] rounded-3xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-4 p-4 mb-4 border-b border-gray-50 dark:border-gray-800">
                            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-emerald-500/20">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center font-bold text-xl text-emerald-500">
                                        {profile.display_name?.[0]}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="font-bold text-lg leading-none">{profile.display_name}</h2>
                                <p className="text-sm text-gray-500 mt-1">Personal Account</p>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            {sections.map((s) => (
                                <button
                                    key={s.id}
                                    onClick={() => setActiveSection(s.id)}
                                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeSection === s.id
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <s.icon size={22} className={activeSection === s.id ? 'text-white' : 'text-gray-400'} />
                                    <div className="text-left">
                                        <p className="font-bold text-sm">{s.label}</p>
                                        <p className={`text-[10px] opacity-70 ${activeSection === s.id ? 'text-white' : 'text-gray-500'}`}>{s.desc}</p>
                                    </div>
                                    <ChevronRight size={18} className="ml-auto opacity-40" />
                                </button>
                            ))}
                        </nav>

                        <div className="mt-8 pt-4 border-t border-gray-50 dark:border-gray-800">
                            <button className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-bold">
                                <LogOut size={22} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* ⚙️ CONTENT AREA */}
                <div className="lg:col-span-8 bg-white dark:bg-[#0F172A] rounded-[40px] p-8 border border-gray-100 dark:border-gray-800 shadow-sm min-h-[600px]">

                    {/* SECTION: ACCOUNT (EXPANDED) */}
                    {activeSection === 'account' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-black underline decoration-emerald-500 decoration-4 underline-offset-8">Account Details</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Basic Information */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <User size={14} className="text-emerald-500" /> Basic Info
                                    </h3>
                                    <div className="space-y-4">
                                        <SettingItem
                                            label="Display Name"
                                            value={profile.display_name}
                                            onSave={(val: string) => handleUpdateProfile({ display_name: val })}
                                        />
                                        <SettingItem
                                            label="Bio"
                                            value={profile.bio || ''}
                                            type="textarea"
                                            onSave={(val: string) => handleUpdateProfile({ bio: val })}
                                        />
                                        <SettingItem
                                            label="Birthday"
                                            value={profile.birthday || ''}
                                            type="date"
                                            onSave={(val: string) => handleUpdateProfile({ birthday: val })}
                                        />
                                        <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 border border-transparent">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Gender</span>
                                            <div className="flex gap-2">
                                                {['male', 'female', 'other'].map((g) => (
                                                    <button
                                                        key={g}
                                                        onClick={() => handleUpdateProfile({ gender: g })}
                                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${profile.gender === g ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white dark:bg-gray-900 text-gray-400'}`}
                                                    >
                                                        {g}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact & Education */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Smartphone size={14} className="text-emerald-500" /> Contact & Career
                                    </h3>
                                    <div className="space-y-4">
                                        <SettingItem
                                            label="Phone Number"
                                            value={profile.phone || ''}
                                            onSave={(val: string) => handleUpdateProfile({ phone: val })}
                                        />
                                        <SettingItem
                                            label="Current Job / Work"
                                            value={profile.work || ''}
                                            onSave={(val: string) => handleUpdateProfile({ work: val })}
                                        />
                                        <SettingItem
                                            label="Education / University"
                                            value={profile.education || ''}
                                            onSave={(val: string) => handleUpdateProfile({ education: val })}
                                        />
                                        <SettingItem
                                            label="Website URL"
                                            value={profile.website || ''}
                                            onSave={(val: string) => handleUpdateProfile({ website: val })}
                                        />
                                    </div>
                                </div>

                                {/* Places Lived */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Map size={14} className="text-emerald-500" /> Places Lived
                                    </h3>
                                    <div className="space-y-4">
                                        <SettingItem
                                            label="Current City"
                                            value={profile.location || ''}
                                            onSave={(val: string) => handleUpdateProfile({ location: val })}
                                        />
                                        <SettingItem
                                            label="Hometown"
                                            value={profile.hometown || ''}
                                            onSave={(val: string) => handleUpdateProfile({ hometown: val })}
                                        />
                                    </div>
                                </div>

                                {/* Relationships & Social */}
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Heart size={14} className="text-emerald-500" /> Relationships & Social
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 border border-transparent">
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Relationship Status</span>
                                            <select 
                                                value={profile.relationship_status || ''}
                                                onChange={(e) => handleUpdateProfile({ relationship_status: e.target.value })}
                                                className="w-full bg-white dark:bg-gray-900 p-3 rounded-xl border border-transparent outline-none text-xs font-bold"
                                            >
                                                <option value="">Select Status</option>
                                                <option value="single">Single</option>
                                                <option value="in_relationship">In a Relationship</option>
                                                <option value="married">Married</option>
                                                <option value="engaged">Engaged</option>
                                                <option value="it_is_complicated">It's Complicated</option>
                                            </select>
                                        </div>
                                        <SettingItem
                                            label="Instagram Username"
                                            value={profile.instagram_url || ''}
                                            onSave={(val: string) => handleUpdateProfile({ instagram_url: val })}
                                        />
                                        <SettingItem
                                            label="Twitter / X"
                                            value={profile.twitter_url || ''}
                                            onSave={(val: string) => handleUpdateProfile({ twitter_url: val })}
                                        />
                                        <SettingItem
                                            label="LinkedIn Profile"
                                            value={profile.linkedin_url || ''}
                                            onSave={(val: string) => handleUpdateProfile({ linkedin_url: val })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION: PRIVACY */}
                    {activeSection === 'privacy' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-black underline decoration-emerald-500 decoration-4 underline-offset-8">Privacy Control</h2>
                            <div className="space-y-6">
                                <PrivacyToggle
                                    icon={Eye}
                                    title="Profile Visibility"
                                    desc="Who can see your profile page and activity"
                                    options={[
                                        { id: 'public', label: 'Public - Everyone can see' },
                                        { id: 'friends', label: 'Friends - Only friends' },
                                        { id: 'private', label: 'Private - Only me' }
                                    ]}
                                    value={profile.privacy_profile_visibility || 'public'}
                                    onChange={(val: string) => handleUpdateProfile({ privacy_profile_visibility: val })}
                                />

                                <PrivacyToggle
                                    icon={Globe}
                                    title="Default Post Audience"
                                    desc="Who can see your new posts by default"
                                    options={[
                                        { id: 'public', label: 'Public' },
                                        { id: 'friends', label: 'Friends' },
                                    ]}
                                    value={profile.privacy_post_default || 'public'}
                                    onChange={(val: string) => handleUpdateProfile({ privacy_post_default: val })}
                                />

                                <div className="space-y-4">
                                    <BooleanToggle
                                        label="Show Email Address"
                                        desc="Allow others to see your email on your profile"
                                        checked={profile.privacy_show_email}
                                        onChange={(val: boolean) => handleUpdateProfile({ privacy_show_email: val })}
                                    />
                                    <BooleanToggle
                                        label="Show Birthday"
                                        desc="Allow others to see your birth date"
                                        checked={profile.privacy_show_birthday}
                                        onChange={(val: boolean) => handleUpdateProfile({ privacy_show_birthday: val })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION: PREFERENCES (APPEARANCE) */}
                    {activeSection === 'preferences' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-black underline decoration-emerald-500 decoration-4 underline-offset-8">Appearance & Theme</h2>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-[2px]">Vibe Color</label>
                                <div className="flex flex-wrap gap-4">
                                    {['#10b981', '#3b82f6', '#f43f5e', '#f59e0b', '#8b5cf6', '#ff007f'].map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => updateVibeColor(color)}
                                            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-4 ${vibeColor === color ? 'border-white scale-110 shadow-xl' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                            style={{ backgroundColor: color }}
                                        >
                                            {vibeColor === color && <Check size={24} className="text-white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black text-gray-500 uppercase tracking-[2px]">Font Style</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: 'font-sans', label: 'Modern Sans' },
                                        { id: 'font-serif', label: 'Classic Serif' },
                                        { id: 'font-mono', label: 'Space Mono' }
                                    ].map((f) => (
                                        <button
                                            key={f.id}
                                            onClick={() => updateFont(f.id)}
                                            className={`p-4 rounded-2xl border-2 transition-all font-bold ${fontFamily === f.id ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500' : 'border-gray-100 dark:border-gray-800'}`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SECTION: SECURITY */}
                    {activeSection === 'security' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-2xl font-black underline decoration-emerald-500 decoration-4 underline-offset-8">Security & Access</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Password Management */}
                                <SecurityCard 
                                    icon={Lock} 
                                    title="Update Password" 
                                    desc="Keep your account safe with a strong password"
                                >
                                    <div className="space-y-4 pt-2">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">New Password</label>
                                            <input 
                                                type="password" 
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3 rounded-2xl outline-none focus:border-emerald-500/50 transition-all text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Confirm Password</label>
                                            <input 
                                                type="password" 
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-3 rounded-2xl outline-none focus:border-emerald-500/50 transition-all text-sm"
                                            />
                                        </div>
                                        <button 
                                            onClick={handleUpdatePassword}
                                            disabled={loading}
                                            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
                                        >
                                            {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Update Password'}
                                        </button>
                                    </div>
                                </SecurityCard>

                                {/* Account Protection */}
                                <div className="space-y-4">
                                    <SecurityCard 
                                        icon={ShieldCheck} 
                                        title="Two-Factor Auth" 
                                        desc="Add an extra layer of protection"
                                    >
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-50 dark:border-gray-800">
                                            <span className="text-xs font-bold text-gray-500">Status: Disabled</span>
                                            <button className="text-xs font-black text-emerald-500 hover:underline">Enable</button>
                                        </div>
                                    </SecurityCard>

                                    <SecurityCard 
                                        icon={ShieldAlert} 
                                        title="Login Alerts" 
                                        desc="Get notified of new logins"
                                    >
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-xs font-medium text-gray-400">Email Notifications</span>
                                            <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                                            </div>
                                        </div>
                                    </SecurityCard>
                                </div>

                                {/* Active Sessions */}
                                <SecurityCard 
                                    icon={Terminal} 
                                    title="Current Session" 
                                    desc="Device information for this login"
                                >
                                    <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-50 dark:border-gray-800 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-500">Operating System</span>
                                            <span className="text-xs font-black text-gray-900 dark:text-white uppercase">Windows</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-gray-500">Status</span>
                                            <span className="text-xs font-black text-emerald-500">Active Now</span>
                                        </div>
                                    </div>
                                </SecurityCard>

                                {/* Danger Zone */}
                                <SecurityCard 
                                    icon={Trash2} 
                                    variant="danger"
                                    title="Danger Zone" 
                                    desc="Irreversible actions for your account"
                                >
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed mb-1">
                                        Deactivating your account will hide your profile from all other users on the platform. This is irreversible after 30 days.
                                    </p>
                                    <button 
                                        onClick={handleAccountDeletion}
                                        className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-3 rounded-2xl shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] text-sm uppercase tracking-wider"
                                    >
                                        Delete Forever
                                    </button>
                                </SecurityCard>
                            </div>
                        </div>
                    )}

                    {/* SECTION: NOTIFICATIONS */}
                    {activeSection === 'notifications' && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
                                {(() => {
                                    const Icon = sections.find(s => s.id === activeSection)?.icon || Bell;
                                    return <Icon size={40} className="text-gray-300" />;
                                })()}
                            </div>
                            <h3 className="text-xl font-bold">Coming Soon!</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">We are working hard to bring advanced {activeSection} settings to Elimeno.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

function SettingItem({ label, value, onSave, type = 'text' }: { label: string, value: string, onSave: (val: string) => void, type?: string }) {
    const [isEditing, setIsEditing] = useState(false)
    const [val, setVal] = useState(value)

    return (
        <div className="p-5 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 border border-transparent hover:border-emerald-500/20 transition-all">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-emerald-500 hover:underline">Edit</button>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(false)} className="text-xs font-bold text-gray-500">Cancel</button>
                        <button onClick={() => { onSave(val); setIsEditing(false); }} className="text-xs font-bold text-emerald-500">Save</button>
                    </div>
                )}
            </div>
            {isEditing ? (
                type === 'textarea' ? (
                    <textarea
                        value={val}
                        onChange={e => setVal(e.target.value)}
                        className="w-full bg-white dark:bg-gray-900 p-3 rounded-xl border border-emerald-500/20 outline-none h-24 text-sm"
                    />
                ) : (
                    <input
                        type="text"
                        value={val}
                        onChange={e => setVal(e.target.value)}
                        className="w-full bg-white dark:bg-gray-900 p-3 rounded-xl border border-emerald-500/20 outline-none text-sm"
                    />
                )
            ) : (
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{value}</p>
            )}
        </div>
    )
}

function PrivacyToggle({ icon: Icon, title, desc, options, value, onChange }: any) {
    return (
        <div className="p-6 rounded-3xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                    <Icon size={24} className="text-emerald-500" />
                </div>
                <div>
                    <h3 className="font-bold">{title}</h3>
                    <p className="text-[11px] text-gray-500">{desc}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {options.map((opt: any) => (
                    <button
                        key={opt.id}
                        onClick={() => onChange(opt.id)}
                        className={`p-3 rounded-xl text-xs font-bold transition-all border-2 ${value === opt.id ? 'border-emerald-500 bg-emerald-500/5 text-emerald-500' : 'border-transparent bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400'}`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

function BooleanToggle({ label, desc, checked, onChange }: any) {
    return (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30">
            <div>
                <p className="font-bold text-sm tracking-tight">{label}</p>
                <p className="text-[10px] text-gray-500">{desc}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`w-12 h-6 rounded-full transition-all relative ${checked ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}
            >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-7' : 'left-1'}`} />
            </button>
        </div>
    )
}
