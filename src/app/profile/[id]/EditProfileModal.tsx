'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { X, Save, Camera, Image as ImageIcon, Check, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function EditProfileModal({ profile }: { profile: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    location: profile.location || '',
    theme_color: profile.theme_color || '#10b981'
  })
  
  // 📸 පින්තූර දෙකට වෙන වෙනම States
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState(profile.cover_url || '')
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url || '')

  const supabase = createClient()
  const router = useRouter()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let finalCoverUrl = profile.cover_url
      let finalAvatarUrl = profile.avatar_url

      // 1. Banner එක Upload කිරීම
      if (coverFile) {
        const fileName = `cover-${profile.id}-${Date.now()}`
        const { data, error } = await supabase.storage.from('avatars').upload(fileName, coverFile)
        if (data) {
          finalCoverUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl
        }
      }

      // 2. Profile Picture එක Upload කිරීම
      if (avatarFile) {
        const fileName = `avatar-${profile.id}-${Date.now()}`
        const { data, error } = await supabase.storage.from('avatars').upload(fileName, avatarFile)
        if (data) {
          finalAvatarUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl
        }
      }

      // 3. Profiles ටේබල් එක Update කිරීම
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
        setIsOpen(false)
        router.refresh()
      }
    } catch (err) {
      alert("Something went wrong!")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-black/40 hover:bg-black/60 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 backdrop-blur-md transition-all active:scale-95 border border-white/20 shadow-lg"
      >
        <Camera size={18} /> Edit Profile
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-[#0F172A] w-full max-w-xl rounded-[32px] shadow-2xl overflow-hidden border dark:border-gray-800"
            >
              <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h2 className="text-xl font-black dark:text-white uppercase tracking-tighter">Edit Profile</h2>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition"><X size={20} /></button>
              </div>

              <form onSubmit={handleUpdate} className="p-8 space-y-8 overflow-y-auto max-h-[75vh]">
                
                {/* 📸 1. BANNER PHOTO SECTION */}
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">1. Cover Photo (Banner)</label>
                  <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-gray-800 group border-2 border-dashed border-gray-700">
                    <img src={coverPreview || 'https://via.placeholder.com/800x200'} className="w-full h-full object-cover" />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)); }
                        }} 
                      />
                      <div className="bg-white text-black font-bold px-4 py-2 rounded-lg flex items-center gap-2 text-xs">
                        <ImageIcon size={16} /> Change Banner
                      </div>
                    </label>
                  </div>
                </div>

                {/* 👤 2. PROFILE PHOTO SECTION */}
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">2. Profile Picture (Avatar)</label>
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-500 shadow-xl bg-gray-700">
                      <img src={avatarPreview || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                    </div>
                    
                    <label className="cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-lg flex items-center gap-2">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
                        }} 
                      />
                      <Camera size={18} /> Upload New Photo
                    </label>
                  </div>
                </div>

                {/* INFO INPUTS */}
                <div className="space-y-4 pt-4 border-t dark:border-gray-800">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase">Your Name</label>
                    <input 
                      type="text" 
                      value={formData.display_name} 
                      onChange={(e) => setFormData({...formData, display_name: e.target.value})} 
                      className="w-full bg-gray-100 dark:bg-gray-800 border-none rounded-2xl px-5 py-4 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full py-5 rounded-[24px] font-black text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3"
                  style={{ backgroundColor: formData.theme_color }}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <><Save size={22} /> SAVE PROFILE</>
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