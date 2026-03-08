import { signup } from './actions'
import Link from 'next/link'

export default async function SignupPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>
}) {
    const error = (await searchParams)?.error
    return (
        <div className="min-h-screen flex items-center justify-center bg-spl-gray dark:bg-[#020817] p-4 transition-colors">
            <div className="max-w-md w-full bg-white dark:bg-[#0F172A] rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 transition-colors">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-spl-green mb-2">Elimeno</h1>
                    <p className="text-spl-gray-dark dark:text-gray-400">Join the conversation today</p>
                </div>

                <form action={signup} className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-spl-black dark:text-gray-200 mb-1">
                            Display Name
                        </label>
                        <input
                            type="text"
                            name="displayName"
                            required
                            placeholder="e.g. John Doe"
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-spl-black dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-spl-blue focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-spl-black dark:text-gray-200 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="you@example.com"
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-spl-black dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-spl-blue focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-spl-black dark:text-gray-200 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-spl-black dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-spl-blue focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-spl-green hover:bg-spl-green-dark text-white font-medium py-2.5 rounded-lg transition-colors focus:ring-4 focus:ring-green-100"
                    >
                        Create Account
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-spl-gray-dark dark:text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-spl-blue hover:text-spl-blue-dark font-medium transition-colors">
                        Log in here
                    </Link>
                </div>
            </div>
        </div>
    )
}
