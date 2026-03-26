'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Lock, Eye, EyeOff } from 'lucide-react'

export default function UpdatePassword() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password.length < 6) {
            return toast.error("Password must be at least 6 characters!")
        }

        if (password !== confirmPassword) {
            return toast.error("Passwords do not match!")
        }

        setLoading(true)

        try {
            // 🚀 මෙතනින් තමයි අලුත් පාස්වර්ඩ් එක සේව් වෙන්නේ
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            toast.success("Password updated successfully! 🎉")
            
            // වැඩේ හරි ගියාම Home එකට යවනවා
            router.push('/') 
        } catch (error: any) {
            toast.error(error.message || "Failed to update password")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0F172A] p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-[32px] p-8 shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden">
                
                {/* Background Glow Effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>

                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Create New Password</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Enter your new password below to regain access to your account.</p>
                </div>

                <form onSubmit={handleUpdatePassword} className="space-y-5">
                    {/* New Password Input */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">New Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:text-white transition-all outline-none"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Confirm New Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-11 pr-12 py-3.5 bg-gray-50 dark:bg-[#0F172A] border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:text-white transition-all outline-none"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !password || !confirmPassword}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 mt-6"
                    >
                        {loading ? (
                            <span className="animate-pulse flex items-center gap-2">
                                <Lock size={20} className="animate-bounce" /> Updating...
                            </span>
                        ) : (
                            "Update Password"
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}