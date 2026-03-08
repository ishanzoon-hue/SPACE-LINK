'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function EditProfileModal({ profile }: { profile: any }) {
    const [isOpen, setIsOpen] = useState(false)
    const [displayName, setDisplayName] = useState(profile.display_name || '')
    const [bio, setBio] = useState(profile.bio || '')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(profile.avatar_url)
    const [isSubmitting, setIsSubmitting] = useState(false)

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
        if (!displayName.trim()) {
            alert('Display name cannot be empty')
            return
        }

        setIsSubmitting(true)

        try {
            let avatar_url = profile.avatar_url

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop()
                const fileName = `avatar_${profile.id}_${Math.random()}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(`${profile.id}/${fileName}`, imageFile)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(`${profile.id}/${fileName}`)

                avatar_url = publicUrl
            }

            const { error } = await supabase
                .from('profiles')
                .update({ display_name: displayName, bio, avatar_url })
                .eq('id', profile.id)

            if (error) throw error

            setIsOpen(false)
            router.refresh()
        } catch (err: any) {
            console.error('Error updating profile:', err)
            alert('Failed to update profile: ' + err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="bg-white border-2 border-spl-blue text-spl-blue px-6 py-2 rounded-full font-medium hover:bg-spl-blue hover:text-white transition-colors"
            >
                Edit Profile
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 transition-opacity">
                    <div className="bg-white dark:bg-[#0F172A] rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 border dark:border-gray-800">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-spl-black dark:text-gray-200">Edit Profile</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-24 h-24 rounded-full bg-spl-green bg-opacity-10 flex items-center justify-center text-spl-green font-bold text-3xl overflow-hidden relative border-2 border-gray-100">
                                    {imagePreview ? (
                                        <Image src={imagePreview} alt="Avatar Preview" fill className="object-cover" unoptimized={true} />
                                    ) : (
                                        displayName?.charAt(0).toUpperCase() || 'U'
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="avatar-upload"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                    <label
                                        htmlFor="avatar-upload"
                                        className="cursor-pointer text-sm font-medium text-spl-blue hover:text-spl-blue-dark transition-colors px-4 py-2 border border-spl-blue rounded-full"
                                    >
                                        Change Avatar
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-spl-gray-dark dark:text-gray-400 mb-1">Display Name</label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-spl-black dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-spl-blue focus:border-transparent outline-none transition-all"
                                        placeholder="Your Name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-spl-gray-dark dark:text-gray-400 mb-1">Bio</label>
                                    <textarea
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-spl-black dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-spl-blue focus:border-transparent outline-none transition-all min-h-[100px] resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-6 py-2 rounded-lg font-medium text-spl-gray-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 rounded-lg font-medium bg-spl-blue text-white hover:bg-spl-blue-dark transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
