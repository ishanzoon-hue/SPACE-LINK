'use client'

import { signup } from './actions'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { Suspense, useState, useEffect } from 'react'
import { Loader2, Gift, Stars } from 'lucide-react'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-[#42b72a] hover:bg-[#36a420] text-white font-bold text-xl py-3.5 rounded-md transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
        >
            {pending ? (
                <><Loader2 className="animate-spin" size={24} /> Signing up...</>
            ) : (
                'Sign Up'
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
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center font-semibold">
                    {error}
                </div>
            )}

            {refCode && (
                <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm text-center font-semibold flex items-center justify-center gap-2 mb-4">
                    <Gift size={18} /> You've been invited! You will get a 50 LMO bonus. 🎉
                </div>
            )}

            <div>
                <input
                    type="text"
                    name="displayName"
                    required
                    placeholder="Full name"
                    className="w-full bg-white dark:bg-[#020817] border border-gray-300 dark:border-gray-700 rounded-md px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition-all"
                />
            </div>

            <div>
                <input
                    type="email"
                    name="email"
                    required
                    placeholder="Email address"
                    className="w-full bg-white dark:bg-[#020817] border border-gray-300 dark:border-gray-700 rounded-md px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition-all"
                />
            </div>

            <div>
                <input
                    type="password"
                    name="password"
                    required
                    placeholder="New password"
                    className="w-full bg-white dark:bg-[#020817] border border-gray-300 dark:border-gray-700 rounded-md px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition-all"
                />
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-justify">
                By clicking Sign Up, you agree to our Terms, Privacy Policy and Cookies Policy. You may receive SMS notifications from us and can opt out at any time.
            </p>

            <SubmitButton />
        </form>
    )
}

export default function SignupPage() {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#020817] flex items-center justify-center p-4 transition-colors" suppressHydrationWarning>
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-center">
                
                {/* ⬅️ Left Side: Brand & Text */}
                <div className="text-center md:text-left space-y-6 pb-6 md:pb-0">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-black text-blue-600 dark:text-blue-500 tracking-tighter mb-4">
                            Elimeno
                        </h1>
                        <p className="text-2xl text-gray-700 dark:text-gray-300 font-medium leading-snug max-w-md mx-auto md:mx-0">
                            Connect with the Web3 universe and share your journey with friends.
                        </p>
                    </div>

                    {/* ✅ LMO Airdrop Banner */}
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-6 rounded-2xl shadow-xl text-white max-w-md mx-auto md:mx-0 relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 opacity-20 pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                            <Gift size={150} />
                        </div>
                        <div className="relative z-10 flex items-start gap-4 text-left">
                            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md shrink-0">
                                <Stars className="text-yellow-400" size={32} />
                            </div>
                            <div>
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                                    <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(250,204,21,0.8)]"></span>
                                    Airdrop Live
                                </div>
                                <h3 className="text-3xl font-black uppercase italic leading-tight mb-1 tracking-tight">
                                    Sign Up Bonus!
                                </h3>
                                <p className="text-sm text-emerald-50 font-medium leading-relaxed">
                                    Create a new account today and receive <span className="font-black text-yellow-300 text-base">50 LMO Tokens</span> instantly. Start earning immediately!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ➡️ Right Side: Signup Box */}
                <div className="bg-white dark:bg-[#0F172A] p-6 md:p-8 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-md w-full mx-auto relative mt-2 md:mt-0">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create a new account</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">It's quick and easy.</p>
                    </div>

                    <hr className="mb-6 border-gray-200 dark:border-gray-800" />

                    <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" size={32} /></div>}>
                        <SignupForm />
                    </Suspense>

                    <div className="mt-6 text-center pt-4 border-t border-gray-200 dark:border-gray-800">
                        <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-lg">
                            Already have an account?
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    )
}