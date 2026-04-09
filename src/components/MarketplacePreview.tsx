'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { ShoppingBag, ArrowRight, Tag } from 'lucide-react'

export default function MarketplacePreview() {
    const fallbackItems = [
        { id: 'f1', title: 'LMO Token Bundle', price_lmo: 250, image_url: null },
        { id: 'f2', title: 'Premium Badge', price_lmo: 100, image_url: null },
        { id: 'f3', title: 'Space Pass NFT', price_lmo: 500, image_url: null },
    ]
    const [items, setItems] = useState<any[]>(fallbackItems)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true)
            const { data, error } = await supabase
                .from('marketplace_items')
                .select(`*, seller:profiles!seller_id(display_name, avatar_url)`)
                .order('created_at', { ascending: false })
                .limit(3)

            if (!error && data && data.length > 0) {
                setItems(data)
            }
            setLoading(false)
        }

        fetchItems()
    }, [])

    // Always use items (already has fallback as default state)
    const displayItems = items

    return (
        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-gray-800 dark:text-white flex items-center gap-2">
                    <ShoppingBag size={20} className="text-purple-500" />
                    Marketplace
                </h3>
                <Link href="/marketplace" className="text-xs font-bold text-purple-500 hover:underline flex items-center gap-1">
                    Shop <ArrowRight size={12} />
                </Link>
            </div>

            <div className="space-y-3">
                {loading ? (
                    [1, 2].map(i => (
                        <div key={i} className="flex gap-3 animate-pulse">
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                            <div className="flex-1 space-y-2 py-1">
                                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
                                <div className="h-2 bg-gray-50 dark:bg-gray-800/50 rounded w-1/4"></div>
                            </div>
                        </div>
                    ))
                ) : (
                    displayItems.map((item) => (
                        <Link 
                            key={item.id} 
                            href="/marketplace"
                            className="flex items-center gap-3 p-2 -mx-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group/item"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-900 overflow-hidden shrink-0 relative">
                                {item.image_url ? (
                                    <img src={item.image_url} alt="" className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <ShoppingBag size={20} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 truncate group-hover/item:text-purple-500 transition-colors">
                                    {item.title}
                                </h4>
                                <div className="flex items-center gap-1 text-[11px] font-black text-emerald-500 mt-0.5">
                                    <Tag size={10} />
                                    {item.price_lmo} LMO
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
