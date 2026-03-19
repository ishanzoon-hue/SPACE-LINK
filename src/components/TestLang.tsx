'use client'

import { useState } from 'react'

export default function TestLang() {
  // 1. භාෂාව මතක තියාගන්න (Default 'en')
  const [lang, setLang] = useState('en')

  return (
    <div className="p-10 flex flex-col items-center gap-6 bg-gray-50 dark:bg-gray-900 rounded-3xl mt-5">
      
      {/* 2. භාෂාව අනුව මෙතන අකුරු මාරු වෙනවා */}
      <h2 className="text-2xl font-bold">
        {lang === 'en' ? 'Welcome to Space Link! 🚀' : 'ස්පේස් ලින්ක් වෙත සාදරයෙන් පිළිගනිමු! 🚀'}
      </h2>

      <p className="text-gray-500">
        {lang === 'en' ? 'Customize your experience.' : 'ඔබට රිසි සේ වෙනස් කරගන්න.'}
      </p>

      {/* 3. භාෂාව මාරු කරන බට්න් එක */}
      <button 
        onClick={() => setLang(lang === 'en' ? 'si' : 'en')}
        className="px-8 py-3 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all"
      >
        {lang === 'en' ? 'සිංහල බසට මාරු වන්න' : 'Switch to English'}
      </button>

    </div>
  )
}