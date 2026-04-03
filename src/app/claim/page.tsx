'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'; // Client-side supabase එක ගන්න
import { useRouter } from 'next/navigation';
import { Zap, CheckCircle } from 'lucide-react';

const ClaimRewards = () => {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [claimed, setClaimed] = useState(false);
    const [user, setUser] = useState<any>(null);

    // 1. මුලින්ම ලොග් වෙලා ඉන්න යූසර්ව ගන්නවා
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login'); // ලොග් වෙලා නැත්නම් ලොගින් එකට යවනවා
            } else {
                setUser(user);
                // දැනටමත් Claim කරලද කියලා බලන්න profile එක චෙක් කරනවා
                const { data: profile } = await supabase.from('profiles').select('has_claimed_airdrop').eq('id', user.id).single();
                if (profile?.has_claimed_airdrop) setClaimed(true);
            }
        };
        fetchUser();
    }, []);

    // 2. Claim බටන් එක එබුවම වෙන දේ
    const handleClaim = async () => {
        if (!user || claimed) return;
        setLoading(true);

        try {
            // යූසර්ගේ lmo_balance එකට 100ක් එකතු කරලා, airdrop එක ගත්තා කියලා මාර්ක් කරනවා
            const { error } = await supabase
                .from('profiles')
                .update({ 
                    lmo_balance: 100, // දැනට තියෙන එකට +100 කරන්න (SQL function එකක් පස්සේ ලියමු)
                    has_claimed_airdrop: true 
                })
                .eq('id', user.id);

            if (error) throw error;
            
            setClaimed(true);
            alert("Congratulations! 100 LMO added to your wallet! 🚀");
        } catch (error) {
            console.error("Error claiming:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a1a] text-white flex flex-col items-center justify-center p-6">
            <div className="text-center mb-10">
                <h1 className="text-5xl font-black mb-4 italic text-blue-400">MISSION: REWARDS 🪐</h1>
                <p className="text-gray-400">Claim your early bird LMO token airdrop today.</p>
            </div>

            <div className="bg-[#0F172A] border-2 border-blue-500/30 rounded-[40px] p-10 shadow-[0_0_50px_rgba(59,130,246,0.1)] text-center w-full max-w-md">
                <div className="bg-blue-600/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/50">
                    <Zap className="text-blue-400" size={40} />
                </div>
                
                <h2 className="text-6xl font-black mb-2">100 <span className="text-xl text-gray-500">LMO</span></h2>
                <p className="text-blue-400 font-bold mb-8 uppercase tracking-widest text-xs">Pioneer Bonus</p>

                <button 
                    onClick={handleClaim}
                    disabled={loading || claimed}
                    className={`w-full py-5 rounded-2xl font-black text-lg transition-all transform active:scale-95 shadow-xl ${
                        claimed 
                        ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 cursor-default' 
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:scale-105 text-white'
                    }`}
                >
                    {loading ? "PROCESSING..." : claimed ? "CLAIMED SUCCESSFULLY ✅" : "CLAIM 100 LMO NOW 🚀"}
                </button>

                {claimed && (
                    <p className="mt-6 text-gray-500 text-sm animate-fade-in">
                        Tokens are now synced with your Space Wallet. 
                        <br/><span onClick={() => router.push('/dashboard')} className="text-blue-400 cursor-pointer underline">Back to Command Center</span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default ClaimRewards;