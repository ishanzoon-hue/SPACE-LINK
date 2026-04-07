'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { ShoppingCart, MessageCircle, BadgeCheck, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface MarketplaceGridProps {
    initialItems: any[];
    currentUserId?: string;
}

export default function MarketplaceGrid({ initialItems, currentUserId }: MarketplaceGridProps) {
    const supabase = createClient()
    const router = useRouter()
    const [items, setItems] = useState<any[]>(initialItems)
    const [processingId, setProcessingId] = useState<string | null>(null)

    const handleBuy = async (item: any) => {
        if (!currentUserId) return toast.error("Please login to buy items")
        if (item.seller_id === currentUserId) return toast.error("You cannot buy your own item")
        
        if (!window.confirm(`Are you sure you want to buy "${item.title}" for ${item.price_lmo} LMO?`)) return;

        setProcessingId(item.id)
        
        try {
            // Using our secure RPC!
            const { data, error } = await supabase.rpc('buy_marketplace_item', {
                item_id: item.id,
                buyer_id: currentUserId
            })

            if (error) throw error
            
            // Checking the custom JSON response from the function
            const result = data as any;
            if (!result.success) {
                toast.error(result.message)
                return
            }

            toast.success("Purchase successful! 🎉")
            
            // Remove the sold item from UI optimistically
            setItems(prev => prev.filter(i => i.id !== item.id))
            
            // Tell layout to refresh to update wallet balance in navbar
            router.refresh()
            
            // Suggest messaging seller to arrange delivery
            setTimeout(() => {
                const message = window.confirm("Purchase complete! Do you want to message the seller to arrange delivery?")
                if (message) router.push(`/chat/${item.seller_id}`)
            }, 1000)

        } catch (error: any) {
            console.error(error)
            toast.error("An error occurred during purchase")
        } finally {
            setProcessingId(null)
        }
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-20 bg-white/50 dark:bg-[#0F172A]/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
                <ShoppingCart className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-bold mb-2">Marketplace is empty</h3>
                <p className="text-gray-500">Be the first to list an item for sale in LMO.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
                <div key={item.id} className="bg-white dark:bg-[#0F172A] rounded-[32px] overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col group hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-800 transition-all duration-300 hover:-translate-y-1">
                    {/* Item Image */}
                    <div className="w-full h-56 bg-gray-100 dark:bg-gray-900 overflow-hidden relative">
                        {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <ShoppingCart size={48} />
                            </div>
                        )}
                        <div className="absolute top-4 right-4 bg-yellow-500/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl font-black text-lg shadow-lg border border-yellow-400/50 flex items-center gap-1">
                            {item.price_lmo} <span className="text-[11px] uppercase tracking-wider opacity-80 mt-1">LMO</span>
                        </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex-1">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 line-clamp-2">{item.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4">{item.description}</p>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
                            {/* Seller Info */}
                            <div className="flex items-center gap-3 mb-4">
                                <Link href={`/profile/${item.seller_id}`} className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                    <img src={item.seller?.avatar_url || '/default-avatar.png'} alt="Seller" className="w-full h-full object-cover" />
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Seller</p>
                                    <Link href={`/profile/${item.seller_id}`}>
                                        <div className="flex items-center gap-1 hover:underline truncate text-sm font-bold">
                                            {item.seller?.display_name}
                                            {item.seller?.is_verified && <BadgeCheck size={14} className="text-emerald-500 shrink-0" />}
                                        </div>
                                    </Link>
                                </div>
                            </div>

                            {/* Actions */}
                            {currentUserId === item.seller_id ? (
                                <div className="w-full bg-gray-100 dark:bg-gray-800 text-gray-500 text-center py-3 rounded-xl font-bold text-sm">
                                    Your Listing
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        type="button"
                                        onClick={() => router.push(`/chat/${item.seller_id}`)}
                                        className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-xl font-bold flex flex-col items-center justify-center transition-colors text-sm"
                                    >
                                        <MessageCircle size={18} className="mb-0.5" />
                                        Message
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleBuy(item)}
                                        disabled={processingId === item.id}
                                        className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-3 rounded-xl font-bold flex flex-col items-center justify-center transition-shadow shadow-lg shadow-emerald-500/20 text-sm h-[60px]"
                                    >
                                        {processingId === item.id ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <>
                                                <ShoppingCart size={18} className="mb-0.5" />
                                                Buy Now
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
