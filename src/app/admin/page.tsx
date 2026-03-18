'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Image as ImageIcon, Link as LinkIcon, Building, Save, Trash2 } from 'lucide-react'

export default function AdminAdsPage() {
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState('')
    const [formData, setFormData] = useState({
        title: 'Elimeno - The Future of Socializing',
        description: 'Connect with your vibe, share your world, and chat with friends in a brand new way. Join Elimeno today!',
        link_url: 'https://space-link-one.vercel.app/',
        company_name: 'Elimeno Official'
    })

    const supabase = createClient()
    const router = useRouter()

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return alert("Please select an image!")
        
        setLoading(true)

        try {
            const fileName = `ad-${Date.now()}`
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(fileName, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(fileName)

            const { error: dbError } = await supabase
                .from('ads')
                .insert([{
                    ...formData,
                    image_url: publicUrl
                }])

            if (dbError) throw dbError

            alert("Ad published successfully! 🔥")
            router.refresh()
            setFormData({ title: '', description: '', link_url: '', company_name: '' })
            setFile(null)
            setPreview('')

        } catch (err: any) {
            alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#020817] text-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
                    <Plus className="text-emerald-500" /> CREATE NEW AD
                </h1>

                <form onSubmit={handleUpload} className="bg-[#0F172A] p-8 rounded-[32px] border border-gray-800 shadow-2xl space-y-6">
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Ad Banner</label>
                        <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-gray-900 border-2 border-dashed border-gray-700 group">
                            {preview ? (
                                <img src={preview} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                    <ImageIcon size={40} />
                                    <p className="text-sm mt-2">Click to select ad image</p>
                                </div>
                            )}
                            <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer" 
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) { setFile(file); setPreview(URL.createObjectURL(file)) }
                                }}
                            />
                        </div>
                    </div>

                    <div className="grid gap-4">
                        <input 
                            type="text" 
                            className="w-full bg-gray-800/50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                        <textarea 
                            className="w-full bg-gray-800/50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 h-24"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                        <input 
                            type="url" 
                            className="w-full bg-gray-800/50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.link_url}
                            onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                            required
                        />
                        <input 
                            type="text" 
                            className="w-full bg-gray-800/50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.company_name}
                            onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                        />
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 py-5 rounded-2xl font-black text-white shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        {loading ? "Publishing..." : <><Save size={20} /> PUBLISH AD</>}
                    </button>
                </form>
            </div>
        </div>
    )
}