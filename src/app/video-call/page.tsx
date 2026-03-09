'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video } from 'lucide-react';

export default function VideoCallLanding() {
    const [roomCode, setRoomCode] = useState('');
    const router = useRouter();

    const startNewMeeting = () => {
        // අහඹු ID එකක් හදනවා (උදා: abc123)
        const randomId = Math.random().toString(36).substring(2, 9);
        router.push(`/video-call/${randomId}`);
    };

    const joinMeeting = () => {
        if (roomCode.trim()) {
            router.push(`/video-call/${roomCode.trim()}`);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
            <div className="bg-white dark:bg-[#0F172A] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 max-w-md w-full text-center">
                <div className="bg-spl-green bg-opacity-10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Video className="w-10 h-10 text-spl-green" />
                </div>
                <h1 className="text-2xl font-bold mb-2 text-spl-black dark:text-white">Video Meeting</h1>
                <p className="text-gray-500 mb-8 text-sm">Start a new meeting or join an existing one.</p>
                
                <div className="space-y-4">
                    <button onClick={startNewMeeting} className="w-full bg-spl-green text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all">
                        Start New Meeting
                    </button>
                    <div className="flex items-center gap-2">
                        <input 
                            type="text" 
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value)}
                            placeholder="Enter Code" 
                            className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg py-3 px-4 bg-transparent dark:text-white"
                        />
                        <button onClick={joinMeeting} className="bg-gray-100 dark:bg-gray-800 py-3 px-6 rounded-lg font-semibold dark:text-white">
                            Join
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}