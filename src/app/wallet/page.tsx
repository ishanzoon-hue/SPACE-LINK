'use client'

import { useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'
import { Wallet, Coins, Link as LinkIcon, Loader2, Gift, Zap, PlusCircle } from 'lucide-react'
import toast from 'react-hot-toast'

// 💡 මෙතන Quotes ("") අනිවාර්යයි!
const LMO_CONTRACT_ADDRESS = "0xf177c2903f88021C409bE1b4653b576cCb3b32c8";
const LMO_PRICE_USD = 0.01; 

const LMO_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export default function WalletPage() {
    const [account, setAccount] = useState<string | null>(null)
    const [balance, setBalance] = useState<string>("0")
    const [loading, setLoading] = useState(false)
    const [claiming, setClaiming] = useState(false)

    // 💰 බැලන්ස් එක ගන්න හැටි - වඩාත් ශක්තිමත් කර ඇත
    const fetchBalance = useCallback(async (address: string) => {
        try {
            // 💡 MetaMask මොන නෙට්වර්ක් එකේ තිබුණත් බැලන්ස් එක පෙන්නන්න අපි කෙලින්ම BSC RPC එක පාවිච්චි කරනවා
            const rpcProvider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
            const contract = new ethers.Contract(LMO_CONTRACT_ADDRESS, LMO_ABI, rpcProvider);
            
            const rawBalance = await contract.balanceOf(address);
            const formattedBalance = ethers.formatUnits(rawBalance, 18);
            
            console.log("Success! Balance for", address, ":", formattedBalance);
            setBalance(formattedBalance);
        } catch (e) {
            console.error("Balance fetch error:", e);
            // Error එකක් ආවොත් බැලන්ස් එක 0 කරන්න එපා, පරණ එකම තියන්න
        }
    }, []);

    // 🦊 Wallet කනෙක්ට් කරන හැටි
    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                setLoading(true)
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                setAccount(accounts[0]);
                await fetchBalance(accounts[0]);
                toast.success("Connected to LMO Mainnet!");
            } catch (error) {
                toast.error("Connection failed!");
            } finally {
                setLoading(false)
            }
        } else {
            toast.error("Please install MetaMask!");
        }
    }

    // ➕ LMO කොයින් එක MetaMask එකට ඇඩ් කරන්න
    const addTokenToMetaMask = async () => {
        if (!window.ethereum) return;
        try {
            await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC20',
                    options: {
                        address: LMO_CONTRACT_ADDRESS,
                        symbol: 'LMO',
                        decimals: 18,
                        image: `${window.location.origin}/icon.png`,
                    },
                },
            });
            toast.success("LMO added to MetaMask!");
        } catch (error) {
            toast.error("Failed to add token.");
        }
    }

    // 🔄 වොලට් එකේ වෙනස්කම් නිරීක්ෂණය කිරීම
    useEffect(() => {
        const init = async () => {
            if (window.ethereum) {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    fetchBalance(accounts[0]);
                }
                
                window.ethereum.on('accountsChanged', (accs: any) => {
                    if (accs.length > 0) {
                        setAccount(accs[0]);
                        fetchBalance(accs[0]);
                    } else {
                        setAccount(null);
                        setBalance("0");
                    }
                });
            }
        };
        init();
    }, [fetchBalance]);

    const handleClaimBonus = async () => {
        if (!account) return;
        try {
            setClaiming(true);
            toast.loading("Processing LMO Bonus...", { id: 'claim' });

            const response = await fetch('/api/claim-bonus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userAddress: account }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success("100 LMO Claimed Successfully!", { id: 'claim' });
                setTimeout(() => fetchBalance(account), 3000);
            } else {
                toast.error(`Error: ${data.error}`, { id: 'claim' });
            }
        } catch (error) {
            toast.error("Network error. Try again.", { id: 'claim' });
        } finally {
            setClaiming(false);
        }
    }

    const usdValue = (parseFloat(balance) * LMO_PRICE_USD).toLocaleString(undefined, { minimumFractionDigits: 2 });

    return (
        <div className="min-h-screen bg-[#020617] text-white pt-10 pb-20 px-4">
            <div className="max-w-xl mx-auto space-y-6">
                
                <div className="flex items-center justify-between pb-4 border-b border-gray-800">
                    <h1 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                        <img src="/icon.png" alt="LMO" className="h-8 w-auto rounded-full bg-blue-500/10 p-1" />
                        ELIMEN LMO MAINNET
                    </h1>
                </div>

                {!account ? (
                    <div className="bg-white/5 border border-gray-800 rounded-[40px] p-10 text-center space-y-6">
                        <button onClick={connectWallet} className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-transform active:scale-95">
                            {loading ? <Loader2 className="animate-spin" /> : <LinkIcon />}
                            CONNECT WALLET
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* 💳 Balance Card */}
                        <div className="bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#020617] p-8 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group">
                            <img src="/logo.png" alt="Logo" className="absolute -right-10 -top-10 h-64 w-64 opacity-10" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <p className="text-blue-400 font-bold uppercase tracking-[0.2em] text-[10px]">REAL-WORLD ASSETS</p>
                                    <button onClick={addTokenToMetaMask} className="flex items-center gap-1 text-[10px] bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30 transition-all">
                                        <PlusCircle size={12} /> ADD TO METAMASK
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-blue-500/20 rounded-full border border-blue-500/30">
                                            <img src="/icon.png" alt="LMO" className="h-10 w-10" />
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <h2 className="text-5xl font-bold tracking-tighter tabular-nums">
                                                {parseFloat(balance).toLocaleString()}
                                            </h2>
                                            <span className="text-xl font-black text-blue-500 italic">LMO</span>
                                        </div>
                                    </div>
                                    <p className="text-2xl font-medium text-gray-400 pl-16">≈ ${usdValue}</p>
                                </div>
                                <div className="mt-12 grid grid-cols-2 gap-4">
                                    <button className="bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-black border border-white/5 transition-all">Deposit</button>
                                    <button className="bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black shadow-lg shadow-blue-900/40 transition-all">Swap</button>
                                </div>
                            </div>
                        </div>

                        {/* 🎁 Bonus Section */}
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-[32px] p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600 rounded-2xl text-white">
                                    <Gift size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">Signup Bonus! 🚀</h3>
                                    <p className="text-xs text-blue-400 font-bold uppercase">100 LMO Coins waiting</p>
                                </div>
                            </div>
                            <button onClick={handleClaimBonus} disabled={claiming} className="px-6 py-3 bg-blue-600 rounded-xl font-black hover:scale-105 active:scale-95 transition-all">
                                {claiming ? "Working..." : "CLAIM ⚡"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}