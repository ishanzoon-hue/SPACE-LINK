'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client' // යූසර්ව හඳුනා ගැනීමට
import OnlineFriends from '@/components/OnlineFriends' // අපි කලින් හදපු කෝල් ලිස්ට් එක

export default function VideoCallPage() {
    const { id } = useParams()
    const router = useRouter()
    const jitsiContainerRef = useRef<HTMLDivElement>(null)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        // 1. දැනට ලොග් වී ඉන්න යූසර්ගේ ID එක ලබා ගැනීම
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) setCurrentUserId(user.id)
        }
        getUser()

        // 2. Jitsi Script එක load කිරීම
        const script = document.createElement('script')
        script.src = 'https://8x8.vc/external_api.js'
        script.async = true
        document.body.appendChild(script)

        script.onload = () => {
            if (window.JitsiMeetExternalAPI && jitsiContainerRef.current) {
                const domain = '8x8.vc'
                const options = {
                    roomName: `vpaas-magic-cookie-38d5e8/${id}`,
                    width: '100%',
                    height: '100%',
                    parentNode: jitsiContainerRef.current,
                    interfaceConfigOverwrite: {
                        TILE_VIEW_MAX_COLUMNS: 2,
                    },
                    configOverwrite: {
                        startWithAudioMuted: false,
                        startWithVideoMuted: false,
                    },
                }
                const api = new window.JitsiMeetExternalAPI(domain, options)

                api.addEventListener('videoConferenceLeft', () => {
                    router.push('/')
                })
            }
        }

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script)
            }
        }
    }, [id, router, supabase])

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-[#020817]">
            
            {/* වම් පැත්ත: වීඩියෝ කෝල් එක පෙනෙන ප්‍රධාන කොටස */}
            <div className="flex-1 flex flex-col relative border-r border-gray-800">
                {/* Header */}
                <div className="p-4 bg-gray-900/50 backdrop-blur-md text-white flex justify-between items-center border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <h1 className="font-bold text-sm uppercase tracking-widest">Elimeno Live Call</h1>
                    </div>
                    <button 
                        onClick={() => router.push('/')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-600/20"
                    >
                        End Meeting
                    </button>
                </div>

                {/* වීඩියෝ කන්ටේනරය */}
                <div className="flex-1 w-full bg-black" ref={jitsiContainerRef}></div>
            </div>

            {/* දකුණු පැත්ත: Follow ලිස්ට් එක (Online Friends) */}
            <aside className="w-full lg:w-80 bg-[#0F172A] p-4 overflow-y-auto border-l border-gray-800">
                <div className="mb-6">
                    <h2 className="text-white font-bold text-lg mb-1">Quick Call</h2>
                    <p className="text-gray-500 text-xs">Switch to another friend instantly.</p>
                </div>
                
                {/* අපි කලින් හදපු OnlineFriends component එක */}
                {currentUserId ? (
                    <OnlineFriends currentUserId={currentUserId} />
                ) : (
                    <div className="animate-pulse flex space-y-4 flex-col">
                        <div className="h-10 bg-gray-800 rounded-xl w-full"></div>
                        <div className="h-10 bg-gray-800 rounded-xl w-full"></div>
                    </div>
                )}
            </aside>
        </div>
    )
}

// Jitsi TypeScript interface
declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}