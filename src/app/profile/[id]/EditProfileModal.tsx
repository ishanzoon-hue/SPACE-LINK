'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { X, Save, Camera, Check, Palette, Loader2, MapPin, Briefcase, GraduationCap, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import imageCompression from 'browser-image-compression'

export default function EditProfileModal({ profile }: { profile: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // 1. ඔක්කොම Fields ටික මෙතන තියෙනවා
  const [formData, setFormData] = useState({
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    location: profile.location || '',
    birthday: profile.birthday || '',
    education: profile.education || '',
    work: profile.work || '',
    website: profile.website || '',
    theme_color: profile.theme_color || '#10b981'
  })
  
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState(profile.cover_url || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url || '')

  const supabase = createClient()
  const router = useRouter()

  const vibes = [
    { name: 'Emerald', color: '#10b981' },
    { name: 'Cyberpunk', color: '#ff007f' },
    { name: 'Ocean', color: '#0ea5e9' },
    { name: 'Sunset', color: '#f59e0b' },
    { name: 'Midnight', color: '#6366f1' },
    { name: 'Rose', color: '#f43f5e' }
  ]

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let finalCoverUrl = profile.cover_url
      let finalAvatarUrl = profile.avatar_url

      // Image Upload Logic
      const compressOptions = { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true }

      if (coverFile) {
        const compressedCover = await imageCompression(coverFile, compressOptions)
        const fileName = `cover-${profile.id}-${Date.now()}`
        const { data } = await supabase.storage.from('avatars').upload(fileName, compressedCover)
        if (data) finalCoverUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl
      }

      if (avatarFile) {
        const compressedAvatar = await imageCompression(avatarFile, compressOptions)
        const fileName = `avatar-${profile.id}-${Date.now()}`
        const { data } = await supabase.storage.from('avatars').upload(fileName, compressedAvatar)
        if (data) finalAvatarUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl
      }

      // Supabase Update
      const { error } = await supabase
        .from('profiles')
        .update({
          ...formData,
          cover_url: finalCoverUrl,
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id)

      if (!error) {
        toast.success("Vibe Applied! 🚀")
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error("Update failed ❌")
      }
    } catch (err) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-black/40 hover:bg-black/60 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 backdrop-blur-md border border-white/20 shadow-lg active:scale-95 transition-all"
      >
        <Camera size={18} /> Edit Profile
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#0F172A] w-full max-w-xl rounded-[40px] overflow-hidden shadow-2xl border dark:border-gray-800"
            >
              {/* Header */}
              <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h2 className="text-xl font-black dark:text-white flex items-center gap-2 uppercase tracking-tighter">
                   <Palette style={{ color: formData.theme_color }} /> CUSTOMIZE YOUR PROFILE
                </h2>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition text-gray-400"><X size={24} /></button>
              </div>

              <form onSubmit={handleUpdate} className="p-8 space-y-8 overflow-y-auto max-h-[75vh] no-scrollbar">
                
                {/* 🎨 VIBE SELECTOR */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Pick a Profile Theme Color</label>
                  <div className="flex flex-wrap gap-4">
                    {vibes.map((vibe) => (
                      <button
                        key={vibe.name}
                        type="button"
                        onClick={() => setFormData({...formData, theme_color: vibe.color})}
                        className={`w-12 h-12 rounded-2xl transition-all border-4 flex items-center justify-center ${formData.theme_color === vibe.color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-40'}`}
                        style={{ backgroundColor: vibe.color }}
                      >
                        {formData.theme_color === vibe.color && <Check size={20} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Media Section */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="relative h-36 w-full rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <img src={coverPreview} className="w-full h-full object-cover opacity-60" />
                    <label className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-black/20 transition-colors">
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)); }
                      }} />
                      <span className="bg-white text-black font-black px-4 py-2 rounded-xl text-xs shadow-xl uppercase">Change Cover</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 shadow-2xl shrink-0" style={{ borderColor: formData.theme_color }}>
                      <img src={avatarPreview} className="w-full h-full object-cover" />
                    </div>
                    <label className="cursor-pointer text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg transition-transform active:scale-95" style={{ backgroundColor: formData.theme_color }}>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
                      }} />
                      CHANGE PHOTO
                    </label>
                  </div>
                </div>

                {/* Info Inputs - ඔක්කොම Fields ටික මෙතන පිළිවෙළට තියෙනවා */}
                <div className="grid grid-cols-1 gap-5">
                 <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Display Name</label>
    <input 
      type="text" 
      value={formData.display_name} 
      onChange={(e) => setFormData({...formData, display_name: e.target.value})} 
      className="w-full bg-gray-100 dark:bg-gray-800/50 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-500 outline-none border border-transparent focus:border-gray-400 dark:focus:border-gray-700 transition-all" 
      placeholder="Enter your name" 
    />
  </div>

  <div className="space-y-2">
    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Bio</label>
    <textarea 
      value={formData.bio} 
      onChange={(e) => setFormData({...formData, bio: e.target.value})} 
      className="w-full bg-gray-100 dark:bg-gray-800/50 rounded-2xl px-5 py-4 text-gray-900 dark:text-white placeholder-gray-500 outline-none h-24 border border-transparent focus:border-gray-400 dark:focus:border-gray-700 transition-all resize-none" 
      placeholder="Tell us about yourself..." 
    />
  </div>

<div>
    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Birthday</label>
    <input
        type="date"
        value={formData.birthday}
        onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
        className="w-full bg-[#0F172A] border border-gray-800 text-white rounded-2xl px-4 py-3 mt-2 focus:outline-none focus:border-emerald-500 transition-all"
    />
</div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="relative">
       <MapPin className="absolute left-4 top-4 text-gray-500" size={20} />
       <input 
         type="text" 
         value={formData.location} 
         onChange={(e) => setFormData({...formData, location: e.target.value})} 
         className="w-full bg-gray-100 dark:bg-gray-800/50 rounded-2xl pl-12 pr-5 py-4 text-gray-900 dark:text-white placeholder-gray-500 outline-none border border-transparent focus:border-gray-400 dark:focus:border-gray-700 transition-all" 
         placeholder="Location" 
       />
    </div>
    <div className="relative">
       <Briefcase className="absolute left-4 top-4 text-gray-500" size={20} />
       <input 
         type="text" 
         value={formData.work} 
         onChange={(e) => setFormData({...formData, work: e.target.value})} 
         className="w-full bg-gray-100 dark:bg-gray-800/50 rounded-2xl pl-12 pr-5 py-4 text-gray-900 dark:text-white placeholder-gray-500 outline-none border border-transparent focus:border-gray-400 dark:focus:border-gray-700 transition-all" 
         placeholder="Work" 
       />
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="relative">
       <GraduationCap className="absolute left-4 top-4 text-gray-500" size={20} />
       <input 
         type="text" 
         value={formData.education} 
         onChange={(e) => setFormData({...formData, education: e.target.value})} 
         className="w-full bg-gray-100 dark:bg-gray-800/50 rounded-2xl pl-12 pr-5 py-4 text-gray-900 dark:text-white placeholder-gray-500 outline-none border border-transparent focus:border-gray-400 dark:focus:border-gray-700 transition-all" 
         placeholder="Education" 
       />
    </div>
    <div className="relative">
       <Globe className="absolute left-4 top-4 text-gray-500" size={20} />
       <input 
         type="text" 
         value={formData.website} 
         onChange={(e) => setFormData({...formData, website: e.target.value})} 
         className="w-full bg-gray-100 dark:bg-gray-800/50 rounded-2xl pl-12 pr-5 py-4 text-gray-900 dark:text-white placeholder-gray-500 outline-none border border-transparent focus:border-gray-400 dark:focus:border-gray-700 transition-all" 
         placeholder="Website URL" 
       />
    </div>
  </div>
</div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full py-5 rounded-[28px] font-black text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                  style={{ backgroundColor: formData.theme_color }}
                >
                  {loading ? (
                    <><Loader2 className="animate-spin" /> APPLYING VIBE...</>
                  ) : (
                    "APPLY VIBE & SAVE CHANGES"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}