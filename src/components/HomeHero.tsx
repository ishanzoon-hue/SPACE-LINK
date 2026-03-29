'use client'
import Link from 'next/link'
import { Wallet, ArrowRight } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'

export default function HomeHero() {
    const { t } = useTranslation()

    return (
        <div className="space-y-6">
            {/* 🎬 Intro Video */}
            <div className="w-full max-w-2xl mx-auto my-8 rounded-[40px] overflow-hidden border-4 border-blue-500/20 shadow-2xl shadow-blue-500/10">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                    <source src="/lmo-intro.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>

            {/* 💳 Wallet Button */}
            <div className="bg-gradient-to-r from-blue-900/40 to-black border border-blue-500/30 p-6 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-white italic tracking-tighter">{t('home.wallet_title')}</h2>
                    <p className="text-sm text-blue-400 font-bold uppercase">{t('home.wallet_sub')}</p>
                </div>
                <Link href="/wallet" target="_blank" rel="noopener noreferrer">
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-900/40">
                        <Wallet size={20} />
                        {t('home.open_wallet')}
                        <ArrowRight size={18} />
                    </button>
                </Link>
            </div>
        </div>
    )
}
