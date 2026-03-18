'use client'

import * as React from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function VideoCallComponent({ friendId }: { friendId: string }) {
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const getUser =  () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUser(user);
        };
        getUser();
    }, []);

    const myMeeting = async (element: HTMLDivElement | null) => {
        if (!element || !user || !friendId) return;

        // 💡 දෙන්නාටම පොදු Room ID එකක් හදනවා. මෙතනදී තමයි "Undefined" ලෙඩේ හැදෙන්නේ.
        // දෙන්නාගෙම IDs Sort කරලා එකතු කරාම දෙන්නාටම ලැබෙන්නේ එකම ID එකක්.
        const roomID = [user.id, friendId].sort().join("_");

        const appID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID); 
        const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET as string; 
        
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID, 
            serverSecret, 
            roomID,
            user.id,
            user.user_metadata?.display_name || "Space Link User"
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zp.joinRoom({
            container: element,
            showPreJoinView: false, // 👈 මේක false කරාම WhatsApp වගේ කෙලින්ම කෝල් එකට යනවා
            scenario: {
                mode: ZegoUIKitPrebuilt.OneONoneCall,
            },
            showScreenSharingButton: true,
            onLeaveRoom: () => {
                window.location.href = `/chat/${friendId}`; // කෝල් එක ඉවර වුණාම චැට් එකට යනවා
            }
        });
    };

    return (
        <div className="w-full h-screen bg-[#0f172a] flex items-center justify-center">
            {!friendId ? (
                <p className="text-white">Invalid Call ID</p>
            ) : (
                <div ref={myMeeting} className="w-full h-full"></div>
            )}
        </div>
    );
}