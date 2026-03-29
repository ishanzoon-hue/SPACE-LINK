'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Wallet, ArrowUpRight, ArrowDownLeft, Coins, ShieldCheck, ExternalLink, Loader2 } from 'lucide-react'

export default function WalletPage() {
    const [balance, setBalance] = useState(0)
    const [walletAddress, setWalletAddress] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [isConnecting, setIsConnecting] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase
                .from('profiles')
                .select('lmo_balance, wallet_address')
                .eq('id', user.id)
                .single()
            
            if (data) {
                setBalance(data.lmo_balance || 0)
                setWalletAddress(data.wallet_address)
            }
        }
        setLoading(false)
    }

    // 🦊 MetaMask Connect කිරීමේ මැජික් එක
    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            setIsConnecting(true)
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
                const address = accounts[0]
                
                // ඩේටාබේස් එකට Wallet Address එක සේව් කරනවා
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    await supabase
                        .from('profiles')
                        .update({ wallet_address: address })
                        .eq('id', user.id)
                    
                    setWalletAddress(address)
                }
            } catch (err) {
                console.error("Wallet connection failed", err)
            } finally {
                setIsConnecting(false)
            }
        } else {
            alert("කරුණාකර MetaMask Install කරගන්න! 🦊")
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center dark:bg-[#020817]">
            <Loader2 className="animate-spin text-emerald-500" size={40} />
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020817] text-gray-900 dark:text-white p-4 md:p-8 transition-colors">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* 💳 Main Wallet Card */}
                <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                        <div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Total LMO Balance</p>
                            <h1 className="text-5xl md:text-7xl font-black text-white flex items-center gap-4">
                                <Coins className="text-yellow-500" size={48} /> {balance}
                            </h1>
                            <p className="text-emerald-400 mt-2 font-medium flex items-center gap-2">
                                <ShieldCheck size={18} /> Available for Withdrawal
                            </p>
                        </div>

                        <div className="flex flex-col justify-end">
                            {!walletAddress ? (
                                <button 
                                    onClick={connectWallet}
                                    disabled={isConnecting}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-black px-8 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center gap-2"
                                >
                                    {isConnecting ? <Loader2 className="animate-spin" size={20} /> : <Wallet size={20} />}
                                    Connect MetaMask
                                </button>
                            ) : (
                                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                    <p className="text-xs text-gray-500 font-bold mb-1 uppercase">Linked Wallet</p>
                                    <code className="text-emerald-400 text-sm">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</code>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 🚀 Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm hover:border-emerald-500/50 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-500/20 p-4 rounded-2xl text-emerald-500"><ArrowUpRight size={24} /></div>
                            <div className="text-left">
                                <h4 className="font-bold">Withdraw Tokens</h4>
                                <p className="text-xs text-gray-500">Transfer LMO to MetaMask</p>
                            </div>
                        </div>
                        <ExternalLink size={20} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
                    </button>

                    <button className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-gray-200 dark:border-white/5 shadow-sm hover:border-yellow-500/50 transition-all flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="bg-yellow-500/20 p-4 rounded-2xl text-yellow-500"><ArrowDownLeft size={24} /></div>
                            <div className="text-left">
                                <h4 className="font-bold">Buy LMO</h4>
                                <p className="text-xs text-gray-500">Add tokens via Crypto</p>
                            </div>
                        </div>
                        <ExternalLink size={20} className="text-gray-400 group-hover:text-yellow-500 transition-colors" />
                    </button>
                </div>

            </div>
        </div>
    )
}