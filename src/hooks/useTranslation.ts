'use client'
import { useSettings } from '@/context/SettingsContext'
import en from '@/translations/en.json'
import si from '@/translations/si.json'
import ta from '@/translations/ta.json'
import hi from '@/translations/hi.json'

const translations: any = { en, si, ta, hi }

export function useTranslation() {
    const { language } = useSettings()

    const t = (path: string) => {
        const keys = path.split('.')
        let result = translations[language] || translations['en']

        for (const key of keys) {
            if (result[key] === undefined) {
                // Fallback to English if key missing in current language
                let fallback = translations['en']
                for (const fKey of keys) {
                    if (fallback[fKey] === undefined) return path
                    fallback = fallback[fKey]
                }
                return fallback
            }
            result = result[key]
        }

        return result
    }

    return { t, language }
}
