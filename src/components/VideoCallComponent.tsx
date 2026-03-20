'use client'

import * as React from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function VideoCallComponent({ friendId }: { friendId: string }) {
    const [user, setUser] = useState<any>(null);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) setUser(user);
        };
        getUser();
    }, [supabase]);

    const myMeeting = (element: HTMLDivElement | null) => {
        if (!element || !user || !friendId) return;

        const initZego = async () => {
            const appID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID); 
            const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET as string; 
            
            const roomID = [user.id, friendId].sort().join("_");
            
            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                appID, serverSecret, roomID, user.id, user.user_metadata?.display_name || "User"
            );

            const zp = ZegoUIKitPrebuilt.create(kitToken);

            // යාලුවා ආන්සර් කළාද කියලා බලන්න Variable එකක්
            let hasFriendJoined = false;

            zp.joinRoom({
                container: element,
                showPreJoinView: false,
                scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
                showScreenSharingButton: true,
                
                // 🟢 යාලුවා කෝල් එකට ආවම මේක රන් වෙනවා
                onUserJoin: (users) => {
                    const friendJoined = users.some(u => u.userID === friendId);
                    if (friendJoined) {
                        hasFriendJoined = true;
                    }
                },

                // 🔴 කෝල් එක කට් කරද්දී මේක රන් වෙනවා
                onLeaveRoom: async () => {
                    // යාලුවා කෝල් එකට ආවේ නැත්නම් (Missed Call)
                    if (!hasFriendJoined) {
                        await supabase.from('notifications').insert([{
                            user_id: friendId, // යාලුවට නොටිෆිකේෂන් එක යන්නේ
                            from_user_id: user.id, // කෝල් කළේ ඔයා
                            type: 'missed_call'
                        }]);
                    }
                    
                    // ඊට පස්සේ චැට් එකට Redirect වෙනවා
                    window.location.href = `/chat/${friendId}`;
                }
            });
        };

        initZego();
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