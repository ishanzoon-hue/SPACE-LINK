'use client'

import { useState } from 'react'
import { Settings } from 'lucide-react'
import SettingsSidebar from './SettingsSidebar'

export default function SettingsToggle() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="p-1.5 text-gray-500 hover:text-emerald-500 dark:text-gray-400 transition-colors"
      >
        <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Sidebar එක */}
      <SettingsSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}