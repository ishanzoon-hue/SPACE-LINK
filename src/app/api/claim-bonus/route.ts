import { NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { createClient } from '@supabase/supabase-js';

// Supabase Setup
// 💡 මතක ඇතුව ඔයාගේ .env.local එකේ මේ Keys දෙක තියෙන්න ඕනේ
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const LMO_CONTRACT_ADDRESS = "0xf177c2903f88021C409bE1b4653b576cCb3b32c8";
const LMO_ABI = ["function transfer(address to, uint256 amount) public returns (bool)"];

export async function POST(request: Request) {
    try {
        const { userAddress } = await request.json();
        
        if (!userAddress) {
            return NextResponse.json({ error: "Wallet address එකක් අවශ්‍යයි!" }, { status: 400 });
        }

        const addressLower = userAddress.toLowerCase();

        // 1. කලින් අරන් තියෙනවද කියලා Database එකේ චෙක් කරනවා
        const { data: existingUser, error: fetchError } = await supabase
            .from('claimed_users')
            .select('wallet_address')
            .eq('wallet_address', addressLower)
            .maybeSingle(); // .single() වෙනුවට .maybeSingle() පාවිච්චි කරමු Error නොවෙන්න

        if (existingUser) {
            return NextResponse.json({ error: "ඔයා දැනටමත් බෝනස් එක අරන් තියෙන්නේ! 🚫" }, { status: 400 });
        }

        // 2. Blockchain Transfer එක කරනවා
        const ownerPrivateKey = process.env.LMO_OWNER_PRIVATE_KEY;
        
        // Binance Smart Chain Mainnet RPC
        const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org/");
        const ownerWallet = new ethers.Wallet(ownerPrivateKey!, provider);
        const lmoContract = new ethers.Contract(LMO_CONTRACT_ADDRESS, LMO_ABI, ownerWallet);

        const amountToSend = ethers.parseUnits("100", 18); // 100 LMO
        
        const tx = await lmoContract.transfer(userAddress, amountToSend);
        await tx.wait(); // Transaction එක Confirm වන තෙක් ඉන්නවා

        // 3. සාර්ථකව යැව්වට පස්සේ Database එකට ඇඩ් කරනවා
        const { error: insertError } = await supabase
            .from('claimed_users')
            .insert([{ wallet_address: addressLower }]);

        if (insertError) {
            console.error("DB Insert Error:", insertError);
            // සල්ලි ගියා නම් DB එකට නොවැටුණත් සාර්ථකයි කියලා යවනවා, හැබැයි පස්සේ මේක හදන්න ඕනේ
        }

        return NextResponse.json({ 
            success: true, 
            txHash: tx.hash,
            message: "100 LMO සාර්ථකව යැව්වා! 🚀" 
        });

    } catch (error: any) {
        console.error("CLAIM ERROR:", error);
        
        // ට්‍රාන්සැක්ෂන් එක ෆේල් වුණොත් එන Error එක යවනවා
        let errorMessage = error.message;
        if (errorMessage.includes("insufficient funds")) {
            errorMessage = "Owner wallet එකේ BNB (Gas fee) මදි!";
        }

        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}