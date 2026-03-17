'use client'

import { useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function VideoCallPage() {
    const { id } = useParams() // URL එකේ තියෙන ID එක ගන්නවා
    const router = useRouter()
    const jitsiContainerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Jitsi Script එක load කිරීම
        const script = document.createElement('script')
        script.src = 'https://8x8.vc/external_api.js'
        script.async = true
        document.body.appendChild(script)

        script.onload = () => {
            if (window.JitsiMeetExternalAPI && jitsiContainerRef.current) {
                const domain = '8x8.vc'
                const options = {
                    roomName: `vpaas-magic-cookie-38d5e8/${id}`, // රූම් එකේ නම
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

                // කෝල් එක ඉවර කළ විට ආපසු හෝම් පේජ් එකට යැවීම
                api.addEventListener('videoConferenceLeft', () => {
                    router.push('/')
                })
            }
        }

        return () => {
            document.body.removeChild(script)
        }
    }, [id, router])

    return (
        <div className="flex flex-col h-screen bg-black">
            {/* Header කොටස */}
            <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
                <h1 className="font-bold">Elimeno Video Meeting</h1>
                <button 
                    onClick={() => router.push('/')}
                    className="bg-red-500 px-4 py-2 rounded-lg text-sm font-bold"
                >
                    Leave Call
                </button>
            </div>

            {/* වීඩියෝ එක පේන තැන */}
            <div className="flex-1 w-full overflow-hidden" ref={jitsiContainerRef}></div>
        </div>
    )
}

// Jitsi සඳහා TypeScript interface එකක්
declare global {
    interface Window {
        JitsiMeetExternalAPI: any;
    }
}