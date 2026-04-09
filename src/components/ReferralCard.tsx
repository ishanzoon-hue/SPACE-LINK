'use client'

import { useState } from 'react'
import { Copy, CheckCircle2, Gift } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function ReferralCard({ userId }: { userId: string }) {
    const { t } = useTranslation()
    const [copied, setCopied] = useState(false)

    const referralLink = `https://elimeno.live/signup?ref=${userId}`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(referralLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/30 p-7 rounded-3xl relative overflow-hidden group shadow-[0_0_20px_rgba(52,211,153,0.05)] min-h-[460px]">

            {/* Background Glow Effect */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 bg-emerald-500/20 w-24 h-24 rounded-full blur-2xl"></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="bg-emerald-500/20 p-2.5 rounded-xl text-emerald-500 border border-emerald-500/30">
                        <Gift size={24} className="animate-pulse" />
                    </div>
                    <h3 className="font-black text-lg text-gray-900 dark:text-white">{t('home.invite_earn')}</h3>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
                    Get <span className="font-bold text-emerald-500">50 LMO</span> for every friend who joins using your link! They get 50 LMO too. 🚀
                </p>

                {/* Stats Row */}
                <div className="flex gap-3 mb-5">
                    <div className="flex-1 bg-emerald-500/10 rounded-2xl p-3 text-center border border-emerald-500/20">
                        <p className="text-emerald-500 font-black text-xl">50</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">LMO / Invite</p>
                    </div>
                    <div className="flex-1 bg-teal-500/10 rounded-2xl p-3 text-center border border-teal-500/20">
                        <p className="text-teal-500 font-black text-xl">∞</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">No Limit</p>
                    </div>
                </div>

                {/* Link & Copy Button */}
                <div className="flex items-center gap-2 bg-white dark:bg-[#0F172A] p-1.5 rounded-xl border border-emerald-500/20 mb-5">
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

                {/* Share Buttons */}
                <div className="flex gap-2">
                    <a
                        href={`https://wa.me/?text=Join%20Elimeno%20and%20earn%20LMO%20tokens!%20${encodeURIComponent(referralLink)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 py-2.5 rounded-xl text-xs font-black transition-all"
                    >
                        <span>📱</span> WhatsApp
                    </a>
                    <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] border border-[#1877F2]/30 py-2.5 rounded-xl text-xs font-black transition-all"
                    >
                        <span>📘</span> Facebook
                    </a>
                </div>
            </div>
        </div>
    )
}