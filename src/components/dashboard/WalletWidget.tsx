'use client'
import React from 'react'
import { Wallet, ArrowUpRight, Plus, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WalletWidget({ balance, refCode }: { balance: number, refCode: string }) {
    const handleCopy = () => {
        const link = `${window.location.origin}/signup?ref=${refCode}`
        navigator.clipboard.writeText(link)
        toast.success('Referral link copied! 🛰️')
    }

    return (
        <div className="space-y-6">
            {/* LMO Balance Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 rounded-[40px] shadow-2xl shadow-emerald-500/20 relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                            <Wallet className="text-white" size={24} />
                        </div>
                        <span className="text-xs font-black text-white/80 uppercase tracking-widest">Available Balance</span>
                    </div>
                    <div className="flex items-end gap-3 mb-8">
                        <h2 className="text-5xl font-black text-white italic tracking-tighter">{balance.toLocaleString()}</h2>
                        <span className="text-2xl font-black text-white/60 italic pb-1">LMO</span>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex-1 bg-white text-emerald-600 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all">
                             Withdraw <ArrowUpRight size={18} />
                        </button>
                        <button className="p-4 bg-emerald-400/30 text-white rounded-2xl hover:bg-emerald-400/40 transition-all">
                            <Plus size={24} />
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                    <Wallet size={180} className="text-white" />
                </div>
            </div>

            {/* Referral Widget */}
            <div className="bg-[#0F172A] p-8 rounded-[40px] border border-gray-800 relative z-10">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Referral Rewards</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                    Invite friends to Elimeno and earn <span className="text-emerald-500 font-bold">50 LMO</span> for every successful signup!
                </p>
                <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-800 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-gray-600 uppercase mb-1">Your Referral Code</p>
                        <p className="font-mono text-emerald-500 font-bold">{refCode}</p>
                    </div>
                    <button 
                        onClick={handleCopy}
                        className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500/20 transition-all flex items-center gap-2 font-bold text-xs"
                    >
                        <Copy size={16} /> Copy
                    </button>
                </div>
            </div>
        </div>
    )
}
