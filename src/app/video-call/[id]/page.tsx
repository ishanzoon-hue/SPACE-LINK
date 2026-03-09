'use client'

import * as React from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { use } from 'react';

export default function VideoCallPage({ params }: { params: Promise<{ id: string }> }) {
    // Next.js 15 සඳහා params විසඳා ගැනීම
    const resolvedParams = use(params);
    const roomID = resolvedParams.id;

    const myMeeting = (element: HTMLDivElement | null) => {
        if (!element) return;

        // දැන් රහස්‍ය කේත තියෙන්නේ ආරක්ෂිතව .env ෆයිල් එක ඇතුළේ
        const appID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID); 
        const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET as string; 
        
        // App ID එක හරි Secret එක හරි නැත්නම් කෝල් එක පටන් ගන්නේ නැහැ
        if (!appID || !serverSecret) {
            console.error("ZegoCloud credentials are missing!");
            return;
        }

        const kitToken =  ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID, 
            serverSecret, 
            roomID,  
            Date.now().toString(),  
            "Ishan" 
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zp.joinRoom({
            container: element,
            sharedLinks: [
                {
                    name: 'Personal link',
                    url: window.location.origin + '/video-call/' + roomID,
                },
            ],
            scenario: {
                mode: ZegoUIKitPrebuilt.OneONoneCall,
            },
            showScreenSharingButton: true,
        });
    };

    return (
        <div className="w-full h-screen bg-black">
            <div
                ref={myMeeting}
                style={{ width: '100%', height: '100%' }}
            ></div>
        </div>
    );
}