import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase කනෙක්ට් කිරීම
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
    try {
        // Frontend එකෙන් එවන දත්ත (commentId, userId) ලබාගැනීම
        const body = await req.json();
        const { commentId, userId } = body;

        // 1. මේ යූසර් කලින් මේ කමෙන්ට් එකට Like කරලාද බලමු
        const { data: existingLike, error: fetchError } = await supabase
            .from('likes') // ඔයාගේ Table එකේ නම
            .select('*')
            .eq('comment_id', commentId)
            .eq('user_id', userId)
            .single();

        if (existingLike) {
            // 2. කලින් Like කරලා නම් ඒක අයින් කරමු (Unlike)
            await supabase
                .from('likes')
                .delete()
                .eq('comment_id', commentId)
                .eq('user_id', userId);
                
            return NextResponse.json({ message: "Unlike success!" });
        } else {
            // 3. Like කරලා නැත්නම් අලුත් Like එකක් දාමු
            await supabase
                .from('likes')
                .insert([{ comment_id: commentId, user_id: userId }]);
                
            return NextResponse.json({ message: "Like success!" });
        }
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}