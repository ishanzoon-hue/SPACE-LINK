'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import imageCompression from 'browser-image-compression'
import { Loader2, Plus, X, Image as ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AddStoryModal({ currentUser, onClose }: { currentUser: any, onClose: () => void }) {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [content, setContent] = useState('')
    const fileRef = useRef<HTMLInputElement>(null)
    const supabase = createClient()
    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (selected) {
            setFile(selected)
            setPreview(URL.createObjectURL(selected))
        }
    }

    const handleUpload = async () => {
        if (!file || !currentUser) return
        setLoading(true)
        try {
            // Compress Image
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true }
            const compressed = await imageCompression(file, options)

            const fileExt = compressed.name.split('.').pop() || 'jpg'
            const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
            const filePath = `${currentUser.id}/${fileName}`

            // Ensure bucket exists (or use posts bucket if stories doesn't exist)
            const { error: uploadError } = await supabase.storage.from('posts').upload(filePath, compressed)
            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage.from('posts').getPublicUrl(filePath)

            // Insert to stories table
            const { error: dbError } = await supabase.from('stories').insert({
                user_id: currentUser.id,
                image_url: publicUrl,
                content: content
            })

            if (dbError) throw dbError

            router.refresh()
            onClose()
        } catch (error: any) {
            alert('Upload failed: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#0F172A] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="font-bold text-lg dark:text-white">Add Story</h3>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:text-red-500 transition"><X size={20}/></button>
                </div>

                <div className="p-4 flex flex-col gap-4">
                    {preview ? (
                        <div className="relative aspect-[9/16] bg-black rounded-2xl overflow-hidden shadow-inner w-full max-h-[50vh]">
                           <img src={preview} className="w-full h-full object-cover" />
                           <button onClick={() => { setFile(null); setPreview(null) }} className="absolute top-2 right-2 bg-black/60 p-2 rounded-full text-white backdrop-blur">
                               <X size={16} />
                           </button>
                        </div>
                    ) : (
                        <div onClick={() => fileRef.current?.click()} className="aspect-[9/16] bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition w-full max-h-[50vh]">
                            <div className="p-4 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full mb-3 shadow-sm">
                                <ImageIcon size={32} />
                            </div>
                            <p className="font-bold text-gray-500 text-sm">Select a Photo</p>
                        </div>
                    )}
                    
                    <input type="file" accept="image/*" className="hidden" ref={fileRef} onChange={handleFileChange} />

                    <input 
                        type="text" 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Add a caption... (optional)"
                        className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-emerald-500/50 dark:text-white"
                        maxLength={100}
                    />

                    <button 
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition shadow-lg shadow-emerald-500/20"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                        Post Story
                    </button>
                </div>
            </div>
        </div>
    )
}
