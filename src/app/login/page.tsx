'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) return toast.error('Please fill all fields')

        setLoading(true)
        
        const { error } = await supabase.auth.signInWithPassword({ email, password })

        if (error) {
            toast.error(error.message)
            setLoading(false)
        } else {
            toast.success('Welcome back to Elimen! 🚀')
            // ✅ මෙතන තමයි වෙනස් කළේ (Full Reload එකක් දීලා Home එකට යවනවා)
            window.location.href = '/' 
        }
    }

    return (
        <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#020817] flex items-center justify-center p-4 transition-colors">
            <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-center">
                
                {/* ⬅️ වම් පැත්ත: Brand & Text (Facebook Style) */}
                <div className="text-center md:text-left space-y-4 pb-6 md:pb-0">
                    <h1 className="text-5xl md:text-6xl font-black text-blue-600 dark:text-blue-500 tracking-tighter">
                        Elimeno
                    </h1>
                    <p className="text-2xl text-gray-700 dark:text-gray-300 font-medium leading-snug max-w-md mx-auto md:mx-0">
                        Connect with the Web3 universe and share your journey with friends.
                    </p>
                </div>

                {/* ➡️ දකුණු පැත්ත: Login Box */}
                <div className="bg-white dark:bg-[#0F172A] p-6 md:p-8 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 max-w-md w-full mx-auto">
                    <form onSubmit={handleLogin} className="space-y-4">
                        
                        {/* Email Input */}
                        <div>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email address"
                                className="w-full bg-white dark:bg-[#020817] border border-gray-300 dark:border-gray-700 rounded-md px-4 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition-all"
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full bg-white dark:bg-[#020817] border border-gray-300 dark:border-gray-700 rounded-md px-4 py-3.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg transition-all"
                                required
                            />
                        </div>
                        
                        {/* Login Button with Loading Spinner */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 text-white rounded-md py-3.5 font-bold text-xl hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="animate-spin" size={24} />}
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>

                        {/* Forgot Password Link */}
                        <div className="text-center pt-2 border-b border-gray-200 dark:border-gray-700 pb-6">
                            <Link href="/forgot-password" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                Forgotten password?
                            </Link>
                        </div>

                        {/* Create Account Button */}
                        <div className="pt-6 text-center">
                            <Link href="/register" className="inline-block bg-[#42b72a] text-white font-bold text-lg rounded-md px-6 py-3.5 hover:bg-[#36a420] transition-colors">
                                Create new account
                            </Link>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    )
}