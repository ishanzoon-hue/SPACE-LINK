'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { X, Save, User, MapPin, Globe, AlignLeft, Camera, Image as ImageIcon, Palette, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion' // ✨ අලුත් තාක්ෂණය: Framer Motion

export default function EditProfileModal({ profile }: { profile: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    theme_color: profile.theme_color || '#10b981' // 👈 Vibe Color
  })
  
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState(profile.cover_url || '')

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

    let finalCoverUrl = profile.cover_url
    if (coverFile) {
      const fileName = `${profile.id}-cover-${Date.now()}`
      const { data } = await supabase.storage.from('avatars').upload(fileName, coverFile)
      if (data) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
        finalCoverUrl = publicUrl
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        ...formData,
        cover_url: finalCoverUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (!error) {
      setIsOpen(false)
      router.refresh()
    }
    setLoading(false)
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-[#0F172A] w-full max-w-2xl rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] border dark:border-gray-800"
            >
              <div className="flex items-center justify-between p-6 border-b dark:border-gray-800 sticky top-0 bg-white dark:bg-[#0F172A] z-10">
                <h2 className="text-2xl font-black dark:text-white flex items-center gap-2">
                  <Palette className="text-emerald-500" /> PROFILE SETTINGS
                </h2>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-8">
                
                {/* 🎨 NEW: SELECT YOUR VIBE (Theme Color) */}
                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    Select Your Vibe <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded">NEW</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {vibes.map((vibe) => (
                      <button
                        key={vibe.name}
                        type="button"
                        onClick={() => setFormData({...formData, theme_color: vibe.color})}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div 
                          className={`w-12 h-12 rounded-full border-4 transition-all flex items-center justify-center shadow-lg ${formData.theme_color === vibe.color ? 'border-white scale-110 shadow-emerald-500/20' : 'border-transparent opacity-60'}`}
                          style={{ backgroundColor: vibe.color }}
                        >
                          {formData.theme_color === vibe.color && <Check size={20} className="text-white" />}
                        </div>
                        <span className="text-[10px] font-bold dark:text-gray-400 group-hover:text-white transition-colors">{vibe.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cover Photo Section */}
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Cover Photo</label>
                  <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 group border-2 border-dashed border-gray-300 dark:border-gray-700">
                    <img src={coverPreview || 'https://via.placeholder.com/800x200'} className="w-full h-full object-cover" />
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)); }
                      }} />
                      <div className="bg-white text-black font-bold px-4 py-2 rounded-lg flex items-center gap-2">
                        <Camera size={20} /> Change
                      </div>
                    </label>
                  </div>
                </div>

                {/* Inputs: Display Name, Bio, etc. (කලින් තිබුණ ටික) */}
                <div className="space-y-5">
                   {/* ... (දැනට තියෙන Input fields ටික මෙතනට දාන්න) ... */}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                  style={{ backgroundColor: formData.theme_color }} // 👈 බට්න් එකේ පාටත් vibe එකටම හැදෙනවා
                >
                  {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save size={20} /> SAVE CHANGES</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}