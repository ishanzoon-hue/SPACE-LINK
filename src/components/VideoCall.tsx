'use client'

import { useCall } from '@/context/CallContext'
import { Video } from 'lucide-react'

export default function VideoCall({ callerId, receiverId }: { callerId: string, receiverId: string }) {
    const { startCall } = useCall()

    return (
        <button 
            onClick={() => startCall(receiverId, 'video')} 
            className="bg-gray-200 dark:bg-gray-800 p-3 rounded-xl ml-2 hover:bg-blue-100 transition-colors"
        >
            <Video size={20} className="text-blue-500" />
        </button>
    )
}