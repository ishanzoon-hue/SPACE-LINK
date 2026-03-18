import { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

// Next.js 16 වල proxy එකට කෙලින්ම request එක pass කරමු
export async function proxy(request: any) {
    return await updateSession(request)
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}