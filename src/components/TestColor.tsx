'use client' // බ්‍රවුසර් එකේ වැඩ කරන නිසා මේක ඕනේ

import { useState } from 'react'

export default function TestColor() {
  // 1. මතකය හදනවා (Default පාට Emerald)
  const [vibe, setVibe] = useState('bg-emerald-500')

  return (
    <div className="p-10 flex flex-col items-center gap-5">
      {/* 2. මේ කොටුවේ පාට 'vibe' එක අනුව වෙනස් වෙනවා */}
      <div className={`w-20 h-20 rounded-2xl shadow-lg transition-all duration-500 ${vibe}`} />

      <h2 className="font-bold text-lg">Change My Vibe! ✨</h2>

      <div className="flex gap-3">
        {/* 3. බට්න් එක එබුවම setVibe එකෙන් පාට මාරු කරනවා */}
        <button 
          onClick={() => setVibe('bg-blue-500')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Blue
        </button>

        <button 
          onClick={() => setVibe('bg-rose-500')}
          className="px-4 py-2 bg-rose-500 text-white rounded-lg"
        >
          Rose
        </button>

        <button 
          onClick={() => setVibe('bg-amber-500')}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg"
        >
          Amber
        </button>
      </div>
    </div>
  )
}