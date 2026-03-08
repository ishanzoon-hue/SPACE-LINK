import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function signup(formData: FormData) {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const displayName = formData.get('displayName') as string

    if (!email || !password || !displayName) {
        redirect('/signup?error=All fields are required')
    }

    const supabase = await createClient()

    // 1. Sign up the user
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        redirect(`/signup?error=${encodeURIComponent(error.message)}`)
    }

    // 2. We'll handle creating the profile in Phase 3 or via a Database Trigger
    // but for now we just redirect to home

    revalidatePath('/', 'layout')
    redirect('/')
}
