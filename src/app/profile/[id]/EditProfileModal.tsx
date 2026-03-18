'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { X, Save, User, MapPin, Globe, AlignLeft, Camera, Image as ImageIcon } from 'lucide-react'

export default function EditProfileModal({ profile }: { profile: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    display_name: profile.display_name || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
  })
  
  // 📸 අලුත් Banner/Avatar සේව් කරන්න
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState(profile.cover_url || '')

  const supabase = createClient()
  const router = useRouter()

  // ඉමේජ් එකක් තෝරද්දී Preview එක පෙන්වන්න
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    let finalCoverUrl = profile.cover_url

    // 1. ඉමේජ් එකක් තෝරා ඇත්නම් ඒක Supabase Storage එකට අප්ලෝඩ් කරනවා
    if (coverFile) {
      const fileExt = coverFile.name.split('.').pop()
      const fileName = `${profile.id}-cover-${Math.random()}.${fileExt}`
      
      const { error: uploadError, data } = await supabase.storage
        .from('avatars') // 👈 ඔයාගේ bucket නම මෙතන දාන්න
        .upload(fileName, coverFile)

      if (uploadError) {
        alert("Cover upload failed: " + uploadError.message)
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)
        finalCoverUrl = publicUrl
      }
    }

    // 2. Profile දත්ත ටික Database එකේ update කරනවා
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: formData.display_name,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        cover_url: finalCoverUrl, // 👈 අලුත් Banner එකේ ලින්ක් එක
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (error) {
      alert("Update failed: " + error.message)
    } else {
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
        <Camera size={18} />
        Edit Profile
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0F172A] w-full max-w-2xl rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] border border-gray-100 dark:border-gray-800">
            
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-800 sticky top-0 bg-white dark:bg-[#0F172A] z-10">
              <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">Profile Settings</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              
              {/* 📸 COVER PHOTO EDIT SECTION */}
              <div className="space-y-3">
                <label className="text-sm font-black text-gray-500 uppercase tracking-widest">Cover Photo</label>
                <div className="relative h-40 w-full rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 group border-2 border-dashed border-gray-300 dark:border-gray-700">
                  {coverPreview ? (
                    <img src={coverPreview} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <ImageIcon size={40} />
                      <span className="text-xs mt-2">No Cover Photo</span>
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    <div className="flex items-center gap-2 text-white font-bold bg-emerald-500 px-4 py-2 rounded-lg shadow-lg">
                      <Camera size={20} /> Change Banner
                    </div>
                  </label>
                </div>
              </div>

              {/* Display Name */}
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500 uppercase tracking-widest">Display Name</label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-[#1e2738] border dark:border-gray-700 rounded-xl px-4 py-3 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Ishan Chanuka"
                  required
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-500 uppercase tracking-widest">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-[#1e2738] border dark:border-gray-700 rounded-xl px-4 py-3 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
                  placeholder="Add a bio..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-500 uppercase tracking-widest">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-[#1e2738] border dark:border-gray-700 rounded-xl px-4 py-3 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Dubai, UAE"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-500 uppercase tracking-widest">Website</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-[#1e2738] border dark:border-gray-700 rounded-xl px-4 py-3 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-white font-black py-4 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {loading ? (
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={20} /> Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}