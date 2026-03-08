'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const searchUsers = async () => {
            if (!query.trim()) {
                setResults([])
                setIsSearching(false)
                return
            }

            setIsSearching(true)
            const { data, error } = await supabase
                .from('profiles')
                .select('id, display_name, avatar_url')
                .ilike('display_name', `%${query}%`)
                .limit(5)

            if (!error && data) {
                setResults(data)
            }
            setIsSearching(false)
        }

        const debounceTimer = setTimeout(searchUsers, 300)
        return () => clearTimeout(debounceTimer)
    }, [query, supabase])

    const handleSelect = (userId: string) => {
        setShowDropdown(false)
        setQuery('')
        setResults([])
        router.push(`/profile/${userId}`)
    }

    return (
        <div className="relative w-full max-w-sm" ref={dropdownRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setShowDropdown(true)
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-800 rounded-full bg-spl-gray dark:bg-gray-800 focus:bg-white dark:focus:bg-[#0F172A] focus:ring-2 focus:ring-spl-blue focus:border-transparent outline-none transition-all text-sm text-spl-black dark:text-gray-200 placeholder-gray-400"
                />
            </div>

            {showDropdown && (query.trim().length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 rounded-xl shadow-lg overflow-hidden z-50">
                    {isSearching ? (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">Searching...</div>
                    ) : results.length > 0 ? (
                        <ul className="max-h-64 overflow-y-auto">
                            {results.map((user) => (
                                <li key={user.id}>
                                    <button
                                        onClick={() => handleSelect(user.id)}
                                        className="w-full flex items-center px-4 py-3 hover:bg-spl-gray dark:hover:bg-gray-800 transition-colors text-left"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-spl-green bg-opacity-10 flex items-center justify-center text-spl-green font-bold text-sm overflow-hidden relative shrink-0 mr-3">
                                            {user.avatar_url ? (
                                                <Image src={user.avatar_url} alt="avatar" fill className="object-cover" unoptimized={true} />
                                            ) : (
                                                user.display_name?.charAt(0).toUpperCase() || 'U'
                                            )}
                                        </div>
                                        <div className="flex-1 truncate">
                                            <p className="text-sm font-medium text-spl-black dark:text-gray-200 truncate">{user.display_name}</p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">No users found for "{query}"</div>
                    )}
                </div>
            )}
        </div>
    )
}
