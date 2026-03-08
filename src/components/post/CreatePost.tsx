'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function CreatePost({ user }: { user: any }) {
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const supabase = createClient()
    const router = useRouter()

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim() && !imageFile) return
        setIsSubmitting(true)

        try {
            let image_url = null

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const { data, error } = await supabase.storage
                    .from('post-images')
                    .upload(`${user.id}/${fileName}`, imageFile)

                if (error) throw error

                const { data: { publicUrl } } = supabase.storage
                    .from('post-images')
                    .getPublicUrl(`${user.id}/${fileName}`)

                image_url = publicUrl
            }

            const { error } = await supabase.from('posts').insert({
                content,
                user_id: user.id,
                image_url,
            })

            if (error) throw error

            setContent('')
            setImageFile(null)
            setImagePreview(null)
            router.refresh()
        } catch (err) {
            console.error('Error creating post:', err)
            alert('Failed to create post.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden mb-6 transition-colors">
            <form onSubmit={handleSubmit} className="p-5">
                <div className="flex space-x-4">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Share what's on your mind, Captain..."
                        className="w-full bg-transparent min-h-[100px] border-none focus:ring-0 resize-none outline-none text-spl-black dark:text-gray-200 placeholder:text-gray-400 text-lg"
                    />
                </div>

                {imagePreview && (
                    <div className="relative w-full h-48 md:h-64 mt-3 mb-4 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800">
                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                        <button
                            type="button"
                            onClick={() => {
                                setImageFile(null)
                                setImagePreview(null)
                            }}
                            className="absolute top-2 right-2 bg-gray-900 bg-opacity-60 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-80 transition"
                        >
                            &times;
                        </button>
                    </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div>
                        <input
                            type="file"
                            accept="image/*"
                            id="image-upload"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                        <label
                            htmlFor="image-upload"
                            className="cursor-pointer flex items-center space-x-2 text-spl-blue hover:text-spl-blue-dark transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm font-medium">Add Image</span>
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || (!content.trim() && !imageFile)}
                        className="bg-spl-green hover:bg-spl-green-dark text-white px-6 py-2 rounded-full font-medium transition-colors focus:ring-4 focus:ring-green-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    )
}
