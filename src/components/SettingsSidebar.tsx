'use client'

import { useSettings } from "@/context/SettingsContext"
import { X, Palette, Type, Languages, Check } from "lucide-react"

export default function SettingsSidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { vibeColor, updateVibeColor, fontFamily, updateFont, language, updateLang } = useSettings()

  if (!isOpen) return null

  const colors = [
    { name: 'Emerald', value: '#10b981' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Violet', value: '#8b5cf6' },
  ]

  const fonts = [
    { id: 'font-sans', name: 'Modern' },
    { id: 'font-serif', name: 'Classic' },
    { id: 'font-mono', name: 'Tech' },
  ]

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* 🌑 Background Overlay */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />

      {/* 🎨 Settings Panel */}
      <div className="relative w-80 h-full bg-white dark:bg-[#0F172A] shadow-2xl p-6 border-l border-gray-100 dark:border-gray-800 animate-in slide-in-from-right duration-300">
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Settings <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-emerald-500">Vibe 2.0</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-8">
          
          {/* 1. තේමා වර්ණය (Theme Color) */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-gray-500">
              <Palette size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">{language === 'en' ? 'Theme Color' : 'තේමා වර්ණය'}</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {colors.map((c) => (
                <button
                  key={c.value}
                  onClick={() => updateVibeColor(c.value)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 shadow-sm"
                  style={{ backgroundColor: c.value }}
                >
                  {vibeColor === c.value && <Check size={20} className="text-white" />}
                </button>
              ))}
            </div>
          </section>

          {/* 2. අකුරු රටාව (Font Family) */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-gray-500">
              <Type size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">{language === 'en' ? 'Font Style' : 'අකුරු රටාව'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {fonts.map((f) => (
                <button
                  key={f.id}
                  onClick={() => updateFont(f.id)}
                  className={`py-2 text-xs rounded-xl border-2 transition-all ${
                    fontFamily === f.id 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' 
                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-200'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </section>

          {/* 3. භාෂාව (Language) */}
          <section>
            <div className="flex items-center gap-2 mb-4 text-gray-500">
              <Languages size={18} />
              <span className="text-sm font-bold uppercase tracking-wider">{language === 'en' ? 'Language' : 'භාෂාව'}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateLang('en')}
                className={`flex-1 py-3 rounded-2xl font-bold transition-all ${language === 'en' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-gray-800'}`}
              >
                English
              </button>
              <button
                onClick={() => updateLang('si')}
                className={`flex-1 py-3 rounded-2xl font-bold transition-all ${language === 'si' ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 dark:bg-gray-800'}`}
              >
                සිංහල
              </button>
            </div>
          </section>

        </div>

        <div className="absolute bottom-8 left-6 right-6">
           <p className="text-[10px] text-center opacity-40 uppercase font-bold tracking-[3px]">Space Link Personalization</p>
        </div>

      </div>
    </div>
  )
}