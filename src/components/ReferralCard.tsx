'use client'

import { useState } from 'react'
import { Copy, CheckCircle2, Gift } from 'lucide-react'

export default function ReferralCard({ userId }: { userId: string }) {
    const [copied, setCopied] = useState(false)
    
    // 🔗 ඔයාගේ සයිට් එකේ ඇත්තම ලින්ක් එක (elimeno.live)
    const referralLink = `https://elimeno.live/signup?ref=${userId}`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000) // තත්පර 2කින් ආයේ පරණ අයිකන් එකට එනවා
    }

    return (
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 p-5 rounded-3xl relative overflow-hidden group shadow-[0_0_20px_rgba(52,211,153,0.05)]">
            
            {/* Background Glow Effect */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-emerald-500/20 w-24 h-24 rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-emerald-500/20 p-2.5 rounded-xl text-emerald-500 border border-emerald-500/30">
                        <Gift size={24} className="animate-pulse" />
                    </div>
                    <h3 className="font-black text-lg text-gray-900 dark:text-white">Invite & Earn LMO</h3>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    Get <span className="font-bold text-emerald-500">50 LMO</span> for every friend who joins using your link! They get 50 LMO too. 🚀
                </p>
                
                {/* Link & Copy Button */}
                <div className="flex items-center gap-2 bg-white dark:bg-[#0F172A] p-1.5 rounded-xl border border-emerald-500/20">
                    <input 
                        type="text" 
                        readOnly 
                        value={referralLink} 
                        className="flex-1 bg-transparent border-none text-xs text-gray-500 dark:text-gray-400 outline-none px-2 truncate font-mono"
                    />
                    <button 
                        onClick={copyToClipboard}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black p-2 rounded-lg transition-all active:scale-95 shrink-0"
                        title="Copy Link"
                    >
                        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    </button>
                </div>
            </div>
        </div>
    )
}