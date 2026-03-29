'use client'

import { signup } from './actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { Suspense, useState, useEffect } from 'react' // useEffect සහ useState ඇඩ් කරා Hydration වලට
import { Loader2, Mail, Lock, User as UserIcon, Rocket, Sparkles, ShieldCheck, Gift } from 'lucide-react' // ✅ Gift icon එක ඇඩ් කරා

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black py-3.5 rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(52,211,153,0.3)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
        >
            {pending ? (
                <><Loader2 className="animate-spin" size={20} /> Launching Orbit...</>
            ) : (
                <><Rocket size={20} /> Create Account</>
            )}
        </button>
    )
}

function SignupForm() {
    const searchParams = useSearchParams()
    const error = searchParams.get('error')
    const refCode = searchParams.get('ref')

    return (
        <form action={signup} className="space-y-4">
            {refCode && <input type="hidden" name="ref" value={refCode} />}

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl text-sm text-center font-bold flex items-center justify-center gap-2">
                    {error}
                </div>
            )}

            {refCode && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs text-center font-bold flex items-center justify-center gap-2 mb-4">
                    <Gift size={16} /> You've been invited! You will get a 50 LMO bonus. 🎉
                </div>
            )}

            <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Display Name</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserIcon size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        name="displayName"
                        required
                        placeholder="Space Explorer"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="email"
                        name="email"
                        required
                        placeholder="you@orbit.com"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Password</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock size={18} className="text-gray-400" />
                    </div>
                    <input
                        type="password"
                        name="password"
                        required
                        placeholder="••••••••"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                    />
                </div>
            </div>

            <SubmitButton />
        </form>
    )
}

export default function SignupPage() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null // ✅ Hydration mismatch එක වළක්වන්න

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#020817] p-4 relative overflow-hidden transition-colors" suppressHydrationWarning>
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-md w-full bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-gray-100 dark:border-white/10 p-8 relative z-10">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-emerald-500/30 transform rotate-3">
                        <Sparkles size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Join Antigravity</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium flex items-center justify-center gap-1.5">
                        <ShieldCheck size={16} className="text-emerald-500" /> Secure Web3 Orbit
                    </p>
                </div>

                <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-emerald-500" size={32} /></div>}>
                    <SignupForm />
                </Suspense>

                <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 font-medium border-t border-gray-100 dark:border-white/5 pt-6">
                    Already an explorer?{' '}
                    <Link href="/login" className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-bold transition-colors hover:underline">
                        Log in here
                    </Link>
                </div>
            </div>
        </div>
    )
}