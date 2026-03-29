'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { BadgeCheck, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function VerifyButton({ userId, isVerified }: { userId: string, isVerified: boolean }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // දැනටමත් Verified නම් මේ බටන් එක පෙන්වන්න ඕනේ නෑනේ
    if (isVerified) return null; 

    const handleVerify = async () => {
        const confirmed = window.confirm("100 LMO දීලා Premium Verified Badge එක ගන්නවද? 🚀")
        if (!confirmed) return

        setLoading(true)
        
        // අර අපි හැදුව Supabase Function එක කෝල් කරනවා
        const { data: success, error } = await supabase.rpc('buy_verification', {
            user_uuid: userId
        })

        if (error || !success) {
            alert("ඔයාගේ එකවුන්ට් එකේ 100 LMO නෑ! 🥲 තව හොයාගෙන එන්න.")
        } else {
            alert("සුභ පැතුම්! 🎉 ඔයා දැන් Verified Space Explorer කෙනෙක්! (100 LMO කැපුණා)")
            router.refresh() // පේජ් එක රිෆ්‍රෙෂ් කරනවා ටික් එක පේන්න
        }
        
        setLoading(false)
    }

    return (
        <button
            onClick={handleVerify}
            disabled={loading}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black px-6 py-3 rounded-xl font-black flex items-center gap-2 transition-all hover:-translate-y-1 shadow-[0_0_15px_rgba(52,211,153,0.4)] disabled:opacity-50"
        >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <BadgeCheck size={20} />}
            GET VERIFIED (100 LMO)
        </button>
    )
}