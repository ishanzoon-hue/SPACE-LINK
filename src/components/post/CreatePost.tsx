'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import imageCompression from 'browser-image-compression'
import { ImagePlus, Loader2, X, Send, Video } from 'lucide-react'

interface CreatePostProps {
    user: any;
}

export default function CreatePost({ user }: CreatePostProps) {
    const [content, setContent] = useState('')
    const [image, setImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    
    const [videoUrl, setVideoUrl] = useState('')
    const [showVideoInput, setShowVideoInput] = useState(false)
    
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    const supabase = createClient()

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImage(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    const removeImage = () => {
        setImage(null)
        setPreviewUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handlePost = async () => {
        if (!content.trim() && !image && !videoUrl.trim()) return
        setLoading(true)

        try {
            let imageUrl = null

            if (image) {
                // Compress the image
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                    useWebWorker: true
                }
                const compressedFile = await imageCompression(image, options)

                const fileExt = image.name.split('.').pop() || 'jpg'
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
                
                // ✅ Fix: user.Id -> user.id
                const filePath = `${user.id}/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('posts')
                    .upload(filePath, compressedFile)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('posts')
                    .getPublicUrl(filePath)
                
                imageUrl = publicUrl
            }

            // ✅ Fix: user.Id -> user.id
            const { error } = await supabase.from('posts').insert({
                content: content,
                user_id: user.id, 
                image_url: imageUrl,
                video_url: videoUrl.trim() || null 
            })

            if (error) throw error

            setContent('')
            removeImage()
            setVideoUrl('')
            setShowVideoInput(false)
            alert("Post shared successfully! 🚀")
            
            window.location.reload()

        } catch (error) {
            console.error('Error sharing post:', error)
            alert("Error sharing post. Make sure the database table has 'video_url' column.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all">
            <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0" />
                
                <div className="flex-1">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full p-2 bg-transparent border-none focus:ring-0 text-gray-800 dark:text-white placeholder-gray-400 resize-none text-lg"
                        rows={2}
                    />

                    {previewUrl && (
                        <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                            <img src={previewUrl} alt="Preview" className="w-full max-h-80 object-cover" />
                            <button onClick={removeImage} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    {showVideoInput && (
                        <div className="mt-3 relative">
                            <input
                                type="text"
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                placeholder="Paste YouTube or TikTok link here..."
                                className="w-full bg-gray-50 dark:bg-[#1E293B] border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 transition-all"
                            />
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 dark:border-gray-800/50">
                        <div className="flex gap-2">
                            <label className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                                <ImagePlus size={22} />
                                <span className="text-sm font-medium hidden sm:inline">Photo</span>
                                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>

                            <button
                                type="button"
                                onClick={() => setShowVideoInput(!showVideoInput)}
                                className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-all ${showVideoInput ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                            >
                                <Video size={22} />
                                <span className="text-sm font-medium hidden sm:inline">Video</span>
                            </button>
                        </div>

                        <button
                            onClick={handlePost}
                            disabled={loading || (!content.trim() && !image && !videoUrl.trim())}
                            className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}