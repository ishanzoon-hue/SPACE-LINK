'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ImagePlus, Loader2, X, Send, Video } from 'lucide-react' // 👈 Video icon එක ඇඩ් කළා

interface CreatePostProps {
    userId: string;
}

export default function CreatePost({ userId }: CreatePostProps) {
    const [content, setContent] = useState('')
    const [image, setImage] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    
    // 🎬 අලුත් Video State දෙක
    const [videoUrl, setVideoUrl] = useState('')
    const [showVideoInput, setShowVideoInput] = useState(false)
    
    const [loading, setLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    const supabase = createClient()

    // පින්තූරයක් තෝරාගත් විට එය පෙන්වීමට (Preview)
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImage(file)
            setPreviewUrl(URL.createObjectURL(file))
        }
    }

    // තෝරාගත් පින්තූරය අයින් කිරීමට
    const removeImage = () => {
        setImage(null)
        setPreviewUrl(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const handlePost = async () => {
        // 🛠️ පින්තූරයක්, ලින්ක් එකක් හෝ අකුරු මුකුත් නැත්නම් return වෙන්න
        if (!content.trim() && !image && !videoUrl.trim()) return
        setLoading(true)

        try {
            let imageUrl = null

            // 1. පින්තූරයක් තිබේ නම් එය Storage එකට Upload කිරීම
            if (image) {
                const fileExt = image.name.split('.').pop()
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
                const filePath = `${userId}/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('posts')
                    .upload(filePath, image)

                if (uploadError) throw uploadError

                // පින්තූරයේ Public URL එක ලබා ගැනීම
                const { data: { publicUrl } } = supabase.storage
                    .from('posts')
                    .getPublicUrl(filePath)
                
                imageUrl = publicUrl
            }

            // 2. පෝස්ට් එකේ දත්ත Database (posts table) එකේ සේව් කිරීම
            const { error } = await supabase.from('posts').insert({
                content,
                user_id: userId,
                image_url: imageUrl,
                video_url: videoUrl.trim() || null // 👈 Video URL එක මෙතනින් යනවා
            })

            if (error) throw error

            // සාර්ථක නම් සියල්ල Reset කිරීම
            setContent('')
            removeImage()
            setVideoUrl('')
            setShowVideoInput(false)
            alert("Post shared successfully! 🚀")
            
            // පේජ් එක refresh කිරීමට
            window.location.reload()

        } catch (error) {
            console.error('Error sharing post:', error)
            alert("Error sharing post. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all">
            <div className="flex gap-4">
                {/* Profile Placeholder */}
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0" />
                
                <div className="flex-1">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind?"
                        className="w-full p-2 bg-transparent border-none focus:ring-0 text-gray-800 dark:text-white placeholder-gray-400 resize-none text-lg"
                        rows={2}
                    />

                    {/* Image Preview Area */}
                    {previewUrl && (
                        <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                            <img 
                                src={previewUrl} 
                                alt="Preview" 
                                className="w-full max-h-80 object-cover"
                            />
                            <button 
                                onClick={removeImage}
                                className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    )}

                    {/* 🎬 Video Input Area */}
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
                            {/* Photo Button */}
                            <label className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-blue-500 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                                <ImagePlus size={22} />
                                <span className="text-sm font-medium hidden sm:inline">Photo</span>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>

                            {/* 🎬 Video Button */}
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
                            disabled={loading || (!content.trim() && !image && !videoUrl.trim())} // 👈 Video URL එකත් චෙක් කරනවා
                            className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={18} />
                            ) : (
                                <Send size={18} />
                            )}
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}