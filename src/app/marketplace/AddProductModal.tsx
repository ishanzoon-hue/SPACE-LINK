'use client'

import { useState, useRef } from 'react'
import { PlusCircle, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import toast from 'react-hot-toast'
import imageCompression from 'browser-image-compression'

import { useRouter } from 'next/navigation'

interface AddProductModalProps {
    userId: string;
}

export default function AddProductModal({ userId }: AddProductModalProps) {
    const router = useRouter()
    const supabase = createClient()
    const [isOpen, setIsOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [priceLmo, setPriceLmo] = useState<number | "">("")
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        const objectUrl = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectUrl);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim() || !description.trim() || priceLmo === "") return toast.error("Please fill all fields")

        setIsUploading(true)
        try {
            let imageUrl = null;

            if (file) {
                // Compress image before uploading
                const options = { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true }
                const compressedBlob = await imageCompression(file, options)
                const compressedFile = new File([compressedBlob], file.name, { type: file.type })

                const fileExt = compressedFile.name.split('.').pop()
                const fileName = `market_${userId}_${Math.random()}.${fileExt}`
                
                const { error: uploadError } = await supabase.storage
                    .from('post-images')
                    .upload(fileName, compressedFile)
                
                if (uploadError) throw uploadError

                const { data: publicUrlData } = supabase.storage
                    .from('post-images')
                    .getPublicUrl(fileName)
                    
                imageUrl = publicUrlData.publicUrl
            }

            const { error: insertError } = await supabase.from('marketplace_items').insert({
                seller_id: userId,
                title,
                description,
                price_lmo: priceLmo,
                image_url: imageUrl,
                status: 'available'
            })

            if (insertError) throw insertError

            toast.success("Item listed successfully! 🛒")
            setIsOpen(false)
            setTitle("")
            setDescription("")
            setPriceLmo("")
            setFile(null)
            setPreviewUrl(null)
            router.refresh()

        } catch (error) {
            console.error(error)
            toast.error("Failed to list item")
        } finally {
            setIsUploading(false)
        }
    }

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-600/30 w-full sm:w-auto justify-center"
            >
                <PlusCircle size={20} />
                Sell Item
            </button>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex justify-center items-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-[#0F172A] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl relative my-8 border border-gray-200 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white">What are you selling?</h2>
                    <button onClick={() => setIsOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Item Title</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. iPhone 13 Pro Max"
                                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Price (LMO)</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={priceLmo}
                                    onChange={(e) => setPriceLmo(Number(e.target.value))}
                                    placeholder="0"
                                    min="0"
                                    className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-12 pr-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-black text-lg"
                                    required
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-500 font-black">LMO</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the item condition, features, etc..."
                                className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium h-24 resize-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Item Photo</label>
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleFileSelect}
                            />
                            
                            {previewUrl ? (
                                <div className="relative rounded-xl overflow-hidden group w-full h-48 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700">
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => { setFile(null); setPreviewUrl(null); }}
                                        className="absolute top-2 right-2 bg-black/60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full h-32 border-2 border-dashed border-purple-300 dark:border-purple-500/30 rounded-xl flex flex-col items-center justify-center text-purple-500 dark:text-purple-400 hover:bg-purple-50 flex-col items-center justify-center transition-colors dark:hover:bg-purple-900/10"
                                >
                                    <ImageIcon size={32} className="mb-2" />
                                    <span className="font-bold">Add Photo</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="mt-8">
                        <button 
                            type="submit" 
                            disabled={isUploading}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/30 text-lg"
                        >
                            {isUploading ? <><Loader2 size={24} className="animate-spin" /> Publishing...</> : "List Item"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
