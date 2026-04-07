'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { BellRing, X } from 'lucide-react'

// Helper function to decode VAPID
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

export default function PushProvider() {
    const [showPrompt, setShowPrompt] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        // Only run in browser
        if (typeof window === 'undefined') return;
        
        async function checkSubscription() {
            if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
            
            const registration = await navigator.serviceWorker.register('/sw.js')
            const existingSub = await registration.pushManager.getSubscription()
            
            // If they haven't explicitly blocked it and we don't have a subscription, ask!
            if (Notification.permission === 'default' && !existingSub) {
                // Show a nice custom UI before the ugly browser prompt
                setShowPrompt(true)
            } else if (Notification.permission === 'granted' && !existingSub) {
                // Background subscribe if already granted
                subscribeToPush()
            }
        }
        
        checkSubscription()
    }, [])

    const subscribeToPush = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setShowPrompt(false)
                return
            }

            const registration = await navigator.serviceWorker.ready
            
            const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
            if (!vapidKey) return

            const convertedVapidKey = urlBase64ToUint8Array(vapidKey)
            
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            })

            const subData = JSON.parse(JSON.stringify(subscription))

            // Save to database
            await supabase.from('push_subscriptions').insert({
                user_id: user.id,
                endpoint: subData.endpoint,
                p256dh: subData.keys.p256dh,
                auth: subData.keys.auth
            })

            setShowPrompt(false)
            
        } catch (error) {
            console.error('Failed to subscribe to push', error)
            setShowPrompt(false)
        }
    }

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:w-96 bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-2xl z-50 animate-in slide-in-from-bottom-10 flex flex-col gap-4">
            <div className="absolute top-4 right-4 cursor-pointer text-gray-400 hover:text-gray-900 dark:hover:text-white" onClick={() => setShowPrompt(false)}>
                <X size={20} />
            </div>
            
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-1">
                <BellRing size={24} className="animate-bounce" />
            </div>
            
            <div>
                <h3 className="font-bold text-lg dark:text-white">Never miss a message!</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    Enable notifications to know when friends message or call you, even when Space Link is closed.
                </p>
            </div>
            
            <button 
                onClick={subscribeToPush}
                className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all text-white font-bold py-3.5 rounded-xl mt-2 shadow-lg shadow-emerald-500/20"
            >
                Enable Notifications
            </button>
        </div>
    )
}
