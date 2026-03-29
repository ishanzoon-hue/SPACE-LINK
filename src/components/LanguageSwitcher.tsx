'use client'
import { useSettings } from '@/context/SettingsContext'
import { Languages, Check, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
    { code: 'ta', name: 'தமிழ்', flag: '🇱🇰' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
]

export default function LanguageSwitcher() {
    const { language, updateLang } = useSettings()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const currentLang = languages.find(l => l.code === language) || languages[0]

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-2 sm:p-2.5 rounded-full text-gray-500 dark:text-gray-400 hover:bg-emerald-50 dark:hover:bg-gray-800 hover:text-emerald-500 transition-all shrink-0 cursor-pointer min-h-[44px] min-w-[44px]"
            >
                <Languages size={20} />
                <span className="hidden lg:block text-xs font-bold uppercase tracking-wider">{currentLang.code}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-2 z-[150] backdrop-blur-xl bg-opacity-95 dark:bg-opacity-95"
                    >
                        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 mb-1">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Select Language</p>
                        </div>

                        <div className="space-y-1">
                            {languages.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        updateLang(lang.code)
                                        setIsOpen(false)
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${language === lang.code
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                            : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{lang.flag}</span>
                                        <span className="font-bold text-sm">{lang.name}</span>
                                    </div>
                                    {language === lang.code && (
                                        <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                                            <Check size={12} className="text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
