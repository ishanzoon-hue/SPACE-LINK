import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Admin client to bypass RLS for fetching subscriptions
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // For production, use SERVICE_ROLE_KEY here
)

export async function POST(req: Request) {
    try {
        // Initialize web-push inside the handler to prevent Vercel build-time errors
        if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
            webpush.setVapidDetails(
                'mailto:test@example.com',
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
                process.env.VAPID_PRIVATE_KEY
            )
        } else {
            console.warn("VAPID keys not configured!")
        }

        const { receiverId, title, body, url } = await req.json()

        if (!receiverId || !title) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
        }

        // Fetch all active push subscriptions for the receiver
        const { data: subscriptions, error } = await supabaseAdmin
            .from('push_subscriptions')
            .select('*')
            .eq('user_id', receiverId)

        if (error) {
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        if (!subscriptions || subscriptions.length === 0) {
            return NextResponse.json({ message: 'User has no registered devices.' }, { status: 200 })
        }

        const payload = JSON.stringify({
            title,
            body,
            url: url || '/'
        })

        // Send notifications to all devices/browsers registered by this user
        const promises = subscriptions.map(sub => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    auth: sub.auth,
                    p256dh: sub.p256dh
                }
            }

            return webpush.sendNotification(pushSubscription, payload).catch(err => {
                // If a subscription is expired or invalid, we can capture the error here
                if (err.statusCode === 410 || err.statusCode === 404) {
                    console.log('Subscription expired. Deleting from database...')
                    // Delete dead subscription
                    supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id).then()
                } else {
                    console.error('Error sending push: ', err)
                }
            })
        })

        await Promise.all(promises)

        return NextResponse.json({ success: true, deliveries: subscriptions.length })

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
