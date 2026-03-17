'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video, UserPlus, PhoneOutgoing } from 'lucide-react';

export default function VideoCallLanding() {
    const [roomCode, setRoomCode] = useState('');
    const [targetUserId, setTargetUserId] = useState(''); // Call කරන්න ඕන කෙනාගේ ID එක සඳහා
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

    // මේක තමයි කෙලින්ම කෙනෙක්ව Call කරන්න පාවිච්චි කරන්නේ
    const callDirectly = () => {
        if (targetUserId.trim()) {
            // ඒ කෙනාගේ ID එකම Room ID එක විදිහට පාවිච්චි කරලා එතනට යනවා
            router.push(`/video-call/${targetUserId.trim()}`);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
            <div className="bg-white dark:bg-[#0F172A] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 max-w-md w-full text-center">
                <div className="bg-spl-green bg-opacity-10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Video className="w-10 h-10 text-spl-green" />
                </div>
                <h1 className="text-2xl font-bold mb-2 text-spl-black dark:text-white">Video Meeting</h1>
                <p className="text-gray-500 mb-8 text-sm">Start a new meeting, join one, or call a friend directly.</p>
                
                <div className="space-y-6">
                    {/* අලුත් මීටින් එකක් පටන් ගැනීම */}
                    <button onClick={startNewMeeting} className="w-full bg-spl-green text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2">
                        <Video className="w-5 h-5" /> Start New Meeting
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100 dark:border-gray-800"></span></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-[#0F172A] px-2 text-gray-400">Or</span></div>
                    </div>

                    {/* Direct Call - කෙනෙක්ගේ ID එකට කෙලින්ම කෝල් ගැනීම */}
                    <div className="space-y-2">
                        <p className="text-left text-xs font-semibold text-gray-400 ml-1">CALL A FRIEND DIRECTLY</p>
                        <div className="flex items-center gap-2">
                            <input 
                                type="text" 
                                value={targetUserId}
                                onChange={(e) => setTargetUserId(e.target.value)}
                                placeholder="Enter Friend's ID" 
                                className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg py-3 px-4 bg-transparent dark:text-white outline-none focus:border-spl-green"
                            />
                            <button onClick={callDirectly} className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors">
                                <PhoneOutgoing className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* දැනට තියෙන එකකට Join වීම */}
                    <div className="space-y-2 pt-2">
                         <p className="text-left text-xs font-semibold text-gray-400 ml-1">JOIN WITH CODE</p>
                        <div className="flex items-center gap-2">
                            <input 
                                type="text" 
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value)}
                                placeholder="Enter Room Code" 
                                className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg py-3 px-4 bg-transparent dark:text-white outline-none focus:border-gray-400"
                            />
                            <button onClick={joinMeeting} className="bg-gray-100 dark:bg-gray-800 py-3 px-6 rounded-lg font-semibold dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                                Join
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}