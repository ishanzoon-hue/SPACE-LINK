'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSent, setIsSent] = useState(false)
    const supabase = createClient()

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return toast.error("Please enter your email!")

        setLoading(true)
        
        // Supabase එකෙන් Password Reset ලින්ක් එක ඊමේල් එකට යවනවා
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        })

        if (error) {
            toast.error(error.message)
        } else {
            toast.success('Reset link sent to your email! 📧')
            setIsSent(true)
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-[#020817] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#0F172A] p-8 rounded-3xl border border-gray-800 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                        <Sparkles className="text-blue-500 w-8 h-8" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">Reset Password</h2>
                    <p className="text-gray-400">Enter your email to receive a reset link.</p>
                </div>

                {isSent ? (
                    <div className="text-center space-y-6">
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                            <p className="text-green-400 font-bold">We've sent a password reset link to <br/> <span className="text-white">{email}</span></p>
                            <p className="text-sm text-gray-400 mt-2">Please check your inbox (and spam folder) and click the link to reset your password.</p>
                        </div>
                        <Link href="/login" className="block w-full py-4 bg-gray-800 text-white rounded-2xl font-bold hover:bg-gray-700 transition-colors">
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleReset} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-300 mb-2">Email Address</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#020817] border border-gray-700 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="ishan@example.com"
                                required
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 text-white rounded-2xl py-4 font-bold hover:bg-blue-500 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Sending Link...' : 'Send Reset Link'}
                        </button>

                        <div className="text-center">
                            <Link href="/login" className="text-gray-400 hover:text-white text-sm font-bold transition-colors">
                                Remembered your password? Log in
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}