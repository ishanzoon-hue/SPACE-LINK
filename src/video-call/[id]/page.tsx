'use client'

import * as React from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { use } from 'react';

export default function VideoCallPage({ params }: { params: Promise<{ id: string }> }) {
    // Next.js 15 සඳහා params විසඳා ගැනීම
    const resolvedParams = use(params);
    const roomID = resolvedParams.id;

    const myMeeting = async (element: HTMLDivElement) => {
        // වැදගත්: ඔයාගේ ZegoCloud AppID සහ ServerSecret මෙතනට දාන්න
        const appID = 123456789; // මෙතනට ඔයාගේ ID එක දාන්න
        const serverSecret = "ඔයාගේ_සර්වර්_සීක්‍රට්_එක_මෙතනට"; 
        
        const kitToken =  ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID, 
            serverSecret, 
            roomID,  
            Date.now().toString(),  
            "Ishan" // මෙතනට ඕනෑම නමක් දෙන්න පුළුවන්
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