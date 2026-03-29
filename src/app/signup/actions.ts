'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const displayName = formData.get('displayName') as string
    const refCode = formData.get('ref') as string // 🎁 1. Referral ID එක අල්ලගන්නවා

    if (!email || !password || !displayName) {
        redirect('/signup?error=All fields are required')
    }

    const supabase = await createClient()

    // 1. Sign up the user (Profile Trigger එකට ඕන වෙන විස්තර ටික යවනවා)
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                display_name: displayName,
                avatar_url: '/default-avatar.png',
                referred_by: refCode || null, // කවුද Invite කරේ කියන එක සේව් කරනවා
            }
        }
    })

    if (error) {
        redirect(`/signup?error=${encodeURIComponent(error.message)}`)
    }

    // 2. 🎁 Referral එකක් තියෙනවා නම් දෙන්නටම 50 LMO දෙනවා!
    if (refCode && data.user) {

        // අලුත් යූසර්ට 50 LMO දෙනවා (Trigger එකෙන් Profile එක හැදුනට පස්සේ බැලන්ස් එක අප්ඩේට් කරනවා)
        await supabase
            .from('profiles')
            .update({ lmo_balance: 50 })
            .eq('id', data.user.id);

        // යාළුවට (Invite කරපු කෙනාට) 50 LMO දෙනවා (SQL Function එක කෝල් කරනවා)
        await supabase.rpc('reward_referrer', {
            referrer_id: refCode
        });
    }

    revalidatePath('/', 'layout')
    redirect('/')
}