import { createClient } from '@/utils/supabase/server'
import { Store } from 'lucide-react'
import AddProductModal from './AddProductModal'
import MarketplaceGrid from './MarketplaceGrid' // Client component for interactivity

export default async function MarketplacePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Fetch available items
    const { data: items } = await supabase
        .from('marketplace_items')
        .select(`
            *,
            seller:profiles!seller_id(display_name, avatar_url, is_verified)
        `)
        .eq('status', 'available')
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-gray-900 dark:text-white pb-20">
            {/* Header */}
            <div className="bg-purple-900 text-white py-12 px-4 shadow-lg border-b border-purple-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-30 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-xl">
                            <Store size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Marketplace</h1>
                            <p className="text-purple-200 font-medium mt-1">Buy and sell digital & physical goods with LMO.</p>
                        </div>
                    </div>
                    
                    {user && <AddProductModal userId={user.id} />}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <MarketplaceGrid initialItems={items || []} currentUserId={user?.id} />
            </div>
        </div>
    )
}
