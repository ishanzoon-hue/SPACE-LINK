'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Edit2, ExternalLink, Loader2, X, Check, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

interface AdParams {
    id: number
    title: string
    description: string
    image_url: string
    link_url: string
}

export default function AdvertisementWidget({ isAdmin }: { isAdmin: boolean }) {
    const [ad, setAd] = useState<AdParams | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState<AdParams | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchAd()
    }, [])

    const fetchAd = async () => {
        setIsLoading(true)
        const { data, error } = await supabase
            .from('advertisements')
            .select('*')
            .eq('id', 1)
            .single()

        if (data) {
            setAd(data)
            setEditForm(data)
        }
        setIsLoading(false)
    }

    const handleSave = async () => {
        if (!editForm) return
        setIsSaving(true)
        const { error } = await supabase
            .from('advertisements')
            .update({
                title: editForm.title,
                description: editForm.description,
                image_url: editForm.image_url,
                link_url: editForm.link_url,
                updated_at: new Date().toISOString()
            })
            .eq('id', 1)

        if (!error) {
            setAd(editForm)
            setIsEditing(false)
        } else {
            alert("Error saving advertisement. Ensure you ran the SQL setup.")
        }
        setIsSaving(false)
    }

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm animate-pulse h-48 w-full"></div>
        )
    }

    if (!ad) {
        return isAdmin ? (
            <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-4 border border-dashed border-gray-300 dark:border-gray-700 text-center flex flex-col items-center justify-center h-32">
                <p className="text-sm font-medium text-gray-500 mb-2">Ad block empty. Edit to add one.</p>
                <button
                    onClick={() => {
                        setEditForm({ id: 1, title: '', description: '', image_url: '', link_url: '' })
                        setIsEditing(true)
                    }}
                    className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold"
                >
                    Create Ad
                </button>
            </div>
        ) : null
    }

    return (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm relative group w-full shrink-0">

            {/* Admin Edit Button */}
            {isAdmin && !isEditing && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 z-10 backdrop-blur-sm shadow-md"
                >
                    <Edit2 size={16} />
                </button>
            )}

            {isEditing && editForm ? (
                <div className="p-4 space-y-3 relative z-20">
                    <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm border-b border-gray-100 dark:border-gray-800 pb-2 mb-2">Edit Advertisement</h3>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Title</label>
                        <input
                            type="text"
                            className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            value={editForm.title}
                            onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Description</label>
                        <textarea
                            rows={3}
                            className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            value={editForm.description}
                            onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Image URL</label>
                        <div className="flex gap-2">
                            <span className="shrink-0 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500"><ImageIcon size={16} /></span>
                            <input
                                type="url"
                                className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white"
                                value={editForm.image_url}
                                onChange={e => setEditForm({ ...editForm, image_url: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Target Link URL</label>
                        <div className="flex gap-2">
                            <span className="shrink-0 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500"><ExternalLink size={16} /></span>
                            <input
                                type="url"
                                className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white"
                                value={editForm.link_url}
                                onChange={e => setEditForm({ ...editForm, link_url: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            disabled={isSaving}
                            onClick={() => {
                                setIsEditing(false)
                                setEditForm(ad)
                            }}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
                        >
                            <X size={14} /> Cancel
                        </button>
                        <button
                            disabled={isSaving || !editForm.title || !editForm.description}
                            onClick={handleSave}
                            className="px-4 py-1.5 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Save Ad
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col">
                    <div className="relative h-40 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                        {ad.image_url ? (
                            <img src={ad.image_url} alt="Advertisement" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={32} /></div>
                        )}
                        <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white/90 text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm">Sponsored</span>
                    </div>

                    <div className="p-4">
                        <h4 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-1">{ad.title}</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-[13px] leading-snug line-clamp-3 mb-3">{ad.description}</p>

                        <Link href={ad.link_url} target="_blank" className="w-full flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                            Learn More <ExternalLink size={14} />
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
