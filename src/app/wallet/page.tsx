'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation' // 👈 රෙෆරල් ලින්ක් එක කියවන්න මේක ඕනේ
import { ethers } from 'ethers'
import { Wallet, Gift, Loader2, PlusCircle, Copy, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

// 💡 වොලට් එකේ ඇතුළත වැඩ කරන කොටස (Internal Content)
function WalletContent() {
    const searchParams = useSearchParams()
    const referrer = searchParams.get('ref') // 👈 URL එකේ තියෙන ?ref=... එක මෙතනට එනවා
    
    const [account, setAccount] = useState<string | null>(null)
    const [balance, setBalance] = useState<string>("0")
    const [claiming, setClaiming] = useState(false)

    const LMO_CONTRACT_ADDRESS = "0xf177c2903f88021C409bE1b4653b576cCb3b32c8"
    const LMO_ABI = ["function balanceOf(address owner) view returns (uint256)"]

    // බැලන්ස් එක චෙක් කරන හැටි
    const fetchBalance = useCallback(async (address: string) => {
        try {
            const rpcProvider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
            const contract = new ethers.Contract(LMO_CONTRACT_ADDRESS, LMO_ABI, rpcProvider);
            const rawBalance = await contract.balanceOf(address);
            setBalance(ethers.formatUnits(rawBalance, 18));
        } catch (e) { console.error(e); }
    }, []);

    // වොලට් කනෙක්ට් කිරීම
    const connectWallet = async () => {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            setAccount(accounts[0]);
            fetchBalance(accounts[0]);
        }
    }

    // 🚀 CLAIM කරන කොටස (Referrer එකත් එක්ක)
    const handleClaimBonus = async () => {
        if (!account) return;
        try {
            setClaiming(true);
            toast.loading("Processing Bonus...", { id: 'claim' });

            const response = await fetch('/api/claim-bonus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    userAddress: account, 
                    referrerAddress: referrer // 👈 මෙන්න අපි අර URL එකෙන් ගත්ත ඇඩ්‍රස් එක API එකට යවනවා
                }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success("Bonus Claimed! + Referral processed.", { id: 'claim' });
                fetchBalance(account);
            } else {
                toast.error(data.error, { id: 'claim' });
            }
        } catch (error) {
            toast.error("Failed to claim.", { id: 'claim' });
        } finally {
            setClaiming(false);
        }
    }

    // තමන්ගේ රෙෆරල් ලින්ක් එක කොපි කිරීම
    const copyRefLink = () => {
        const link = `${window.location.origin}/wallet?ref=${account}`;
        navigator.clipboard.writeText(link);
        toast.success("Referral Link Copied! 🚀");
    }

    return (
        <div className="space-y-6 max-w-xl mx-auto pt-10 px-4">
            {!account ? (
                <button onClick={connectWallet} className="w-full bg-blue-600 py-4 rounded-2xl font-bold">CONNECT WALLET</button>
            ) : (
                <div className="space-y-6">
                    {/* බැලන්ස් කාඩ් එක */}
                    <div className="bg-gradient-to-br from-blue-900 to-black p-8 rounded-[40px] border border-blue-500/30">
                        <p className="text-blue-400 text-[10px] font-bold uppercase">LMO Mainnet Balance</p>
                        <h2 className="text-5xl font-bold tracking-tighter">{parseFloat(balance).toLocaleString()} LMO</h2>
                        
                        {/* 🔗 Referral Link Section */}
                        <div className="mt-8 p-4 bg-black/40 rounded-2xl border border-dashed border-blue-500/20">
                            <p className="text-[10px] text-gray-400 mb-2 uppercase">Your Referral Link (Earn 50 LMO per friend)</p>
                            <div className="flex gap-2">
                                <input readOnly value={`${window.location.origin}/wallet?ref=${account}`} className="bg-transparent text-[10px] flex-1 outline-none text-blue-300" />
                                <button onClick={copyRefLink} className="text-blue-500 hover:text-white transition-colors"><Copy size={16}/></button>
                            </div>
                        </div>
                    </div>

                    {/* Claim Button */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-[32px] p-6 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold">Claim 100 LMO ⚡</h3>
                            {referrer && <p className="text-[10px] text-green-400">Referrer detected: {referrer.slice(0,6)}...</p>}
                        </div>
                        <button onClick={handleClaimBonus} disabled={claiming} className="bg-blue-600 px-6 py-3 rounded-xl font-black transition-all active:scale-95">
                            {claiming ? <Loader2 className="animate-spin" /> : "CLAIM"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

// 💡 Main Page Component (අනිවාර්යයෙන්ම Suspense එකක් ඇතුළේ තියෙන්න ඕනේ)
export default function WalletPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>}>
            <WalletContent />
        </Suspense>
    )
}