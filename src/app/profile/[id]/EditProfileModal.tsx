'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { X, Save, Camera, Image as ImageIcon, Check, Palette } from 'lucide-react'
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

      if (coverFile) {
        const fileName = `cover-${profile.id}-${Date.now()}`
        const { data } = await supabase.storage.from('avatars').upload(fileName, coverFile)
        if (data) finalCoverUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl
      }

      if (avatarFile) {
        const fileName = `avatar-${profile.id}-${Date.now()}`
        const { data } = await supabase.storage.from('avatars').upload(fileName, avatarFile)
        if (data) finalAvatarUrl = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl
      }

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
      alert("Error updating profile")
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
              className="bg-white dark:bg-[#0F172A] w-full max-w-xl rounded-[32px] overflow-hidden shadow-2xl border dark:border-gray-800"
            >
              <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-black dark:text-white flex items-center gap-2 uppercase tracking-tighter">
                   <Palette className="text-emerald-500" /> SELECT YOUR VIBE
                </h2>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><X size={20} /></button>
              </div>

              <form onSubmit={handleUpdate} className="p-8 space-y-8 overflow-y-auto max-h-[75vh]">
                
                {/* 🎨 VIBE SELECTOR (මේක තමයි පේන්නේ නැතුව ඇති) */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pick a Profile Theme</label>
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
                  <div className="relative h-32 w-full rounded-2xl overflow-hidden bg-gray-800 border-2 border-dashed border-gray-700">
                    <img src={coverPreview} className="w-full h-full object-cover opacity-50" />
                    <label className="absolute inset-0 flex items-center justify-center cursor-pointer">
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)); }
                      }} />
                      <span className="bg-white text-black font-bold px-3 py-1.5 rounded-lg text-xs">Change Banner</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 shadow-lg" style={{ borderColor: formData.theme_color }}>
                      <img src={avatarPreview} className="w-full h-full object-cover" />
                    </div>
                    <label className="cursor-pointer text-white px-4 py-2 rounded-xl font-bold text-sm" style={{ backgroundColor: formData.theme_color }}>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
                      }} />
                      Change Photo
                    </label>
                  </div>
                </div>

                {/* Info Inputs */}
                <div className="space-y-4">
                  <input type="text" value={formData.display_name} onChange={(e) => setFormData({...formData, display_name: e.target.value})} className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-4 dark:text-white outline-none" placeholder="Name" />
                  <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-gray-100 dark:bg-gray-800 rounded-2xl px-5 py-4 dark:text-white outline-none h-24" placeholder="Bio" />
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full py-5 rounded-[24px] font-black text-white shadow-2xl transition-all active:scale-95"
                  style={{ backgroundColor: formData.theme_color }}
                >
                  {loading ? "Saving..." : "APPLY VIBE & SAVE"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}