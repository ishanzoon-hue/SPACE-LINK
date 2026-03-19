'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext<any>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  // Default values
  const [vibeColor, setVibeColor] = useState('#10b981')
  const [fontFamily, setFontFamily] = useState('font-sans')
  const [language, setLanguage] = useState('en')

  // Load from local storage
  useEffect(() => {
    const savedColor = localStorage.getItem('vibeColor')
    const savedFont = localStorage.getItem('fontFamily')
    const savedLang = localStorage.getItem('language')
    if (savedColor) setVibeColor(savedColor)
    if (savedFont) setFontFamily(savedFont)
    if (savedLang) setLanguage(savedLang)
  }, [])

  const updateVibeColor = (color: string) => {
    setVibeColor(color)
    localStorage.setItem('vibeColor', color)
  }

  const updateFont = (font: string) => {
    setFontFamily(font)
    localStorage.setItem('fontFamily', font)
  }

  const updateLang = (lang: string) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <SettingsContext.Provider value={{ vibeColor, updateVibeColor, fontFamily, updateFont, language, updateLang }}>
      <div className={fontFamily} style={{ '--vibe-color': vibeColor } as any}>
        {children}
      </div>
    </SettingsContext.Provider>
  )
}

export const useSettings = () => useContext(SettingsContext)