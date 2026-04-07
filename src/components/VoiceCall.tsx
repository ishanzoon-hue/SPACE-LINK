'use client'

import { useCall } from '@/context/CallContext'
import { Phone } from 'lucide-react'

export default function VoiceCall({ callerId, receiverId }: { callerId: string, receiverId: string }) {
    const { startCall } = useCall()

    return (
        <button 
            onClick={() => startCall(receiverId, 'voice')} 
            className="bg-gray-200 dark:bg-gray-800 p-3 rounded-xl ml-2 hover:bg-emerald-100 transition-colors"
        >
            <Phone size={20} className="text-emerald-500" />
        </button>
    )
}