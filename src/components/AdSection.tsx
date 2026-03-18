'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ExternalLink } from 'lucide-react'

export default function AdSection() {
    const [ad, setAd] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchAd = async () => {
            // දැනට තියෙන දැන්වීම් වලින් එකක් අහඹු ලෙස (Random) ගන්නවා
            const { data } = await supabase.from('ads').select('*').limit(1)
            if (data && data.length > 0) setAd(data[0])
        }
        fetchAd()
    }, [])

    if (!ad) return null // දැන්වීම් නැත්නම් පෙන්වන්නේ නැහැ

    return (
        <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sponsored</span>
                <button className="text-gray-400 hover:text-white"><ExternalLink size={12} /></button>
            </div>

            <a href={ad.link_url} target="_blank" className="block group">
                <div className="relative h-32 w-full rounded-xl overflow-hidden mb-3">
                    <img 
                        src={ad.image_url} 
                        alt={ad.title} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                    />
                </div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 group-hover:text-emerald-500 transition-colors">
                    {ad.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 italic">
                    {ad.description}
                </p>
                <p className="text-[10px] text-emerald-500 font-bold mt-2 uppercase tracking-tighter">
                    {ad.company_name || 'Visit Website'}
                </p>
            </a>
        </div>
    )
}