'use client'

import React from 'react'
import { Share2, Copy, Send, Zap, Gift, Stars } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useTranslation } from '@/hooks/useTranslation'

interface PromotionalBannerProps {
    refCode: string
}

export default function PromotionalBanner({ refCode }: PromotionalBannerProps) {
    const { t } = useTranslation()
    const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${refCode}`

    const handleCopy = () => {
        navigator.clipboard.writeText(referralLink)
        toast.success('Link copied! Go share it! 🚀')
    }

    const shareWhatsApp = () => {
        const text = `Hey! Join Elimeno Social and let's earn LMO Tokens together! Use my link to get 50 LMO instantly: ${referralLink}`
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    }

    const shareFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank')
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative overflow-hidden group bg-gradient-to-br from-emerald-600 to-teal-800 p-8 rounded-[40px] shadow-2xl shadow-emerald-500/20 text-white mb-10"
        >
            {/* Background Animations */}
            <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-1000 pointer-events-none">
                <Gift size={240} className="text-white" />
            </div>
            
            <motion.div 
                animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-20 -bottom-20 w-80 h-80 bg-emerald-400 rounded-full blur-[100px] pointer-events-none"
            />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-xs font-black uppercase tracking-widest">
                        <Stars size={14} className="text-yellow-400 animate-pulse" />
                        Airdrop Live
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-[0.9]">
                        Invite <span className="text-emerald-300 underline underline-offset-8 decoration-emerald-400/50">5 Friends</span> <br />
                        <span className="text-white">Earn 250 LMO Tokens!</span>
                    </h2>
                    
                    <p className="text-emerald-100/80 text-sm md:text-base font-medium max-w-xl">
                        Share your unique link with friends. For every successful signup, both of you receive 50 LMO tokens. Complete 5 invites to claim your massive 250 LMO reward!
                    </p>
                </div>

                <div className="flex flex-col gap-4 w-full md:w-auto shrink-0">
                    <div className="grid grid-cols-2 gap-3">
                        {/* WhatsApp Share */}
                        <button 
                            onClick={shareWhatsApp}
                            className="bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-emerald-900/40"
                        >
                            {/* WhatsApp SVG Path */}
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="currentColor" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-whatsapp">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7 8.38 8.38 0 0 1 3.8.9L21 3z"></path>
                                <path d="M15.5 14a2.9 2.9 0 0 1-1.4 1.4c-.6.3-1.3.4-2.1.2-1.3-.3-2.6-1-3.6-1.9a10.8 10.8 0 0 1-1.9-3.6 2.9 2.9 0 0 1 .2-2.1c.3-.6.8-1.1 1.4-1.4.3-.1.6-.2.9-.2.3 0 .6.1.8.4l1.2 1.4c.1.2.2.4.2.6s-.1.4-.2.6l-.5.6c-.1.1-.1.3 0 .4.4.9 1.1 1.6 2 2 .1.1.3.1.4 0l.6-.5c.2-.1.4-.2.6-.2.2 0 .4.1.6.2l1.4 1.2c.3.2.4.5.4.8 0 .3-.1.6-.2.9z"></path>
                            </svg>
                            WhatsApp
                        </button>

                        {/* Facebook Share */}
                        <button 
                            onClick={shareFacebook}
                            className="bg-[#1877F2] hover:bg-[#0C63D1] text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-blue-900/40"
                        >
                            {/* Facebook SVG Path */}
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="currentColor" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook">
                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                            </svg>
                            Facebook
                        </button>
                    </div>

                    {/* Copy Link Button */}
                    <button 
                        onClick={handleCopy}
                        className="w-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/30 text-white font-black py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-widest text-xs"
                    >
                        <Copy size={16} /> 
                        Copy Referral Link
                    </button>
                </div>
            </div>

            {/* Bottom Progress Indicator (Visual decoration) */}
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-emerald-100/50">
                <span className="flex items-center gap-2">
                    <Zap size={12} className="text-yellow-400" /> Reward Tier 1 Active
                </span>
                <span className="flex items-center gap-2">
                    Bonus: +10% Staking Boost <Share2 size={12} />
                </span>
            </div>
        </motion.div>
    )
}
