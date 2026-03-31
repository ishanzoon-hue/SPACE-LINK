import React from 'react'
import { LucideIcon } from 'lucide-react'

interface SecurityCardProps {
    icon: LucideIcon
    title: string
    desc: string
    children: React.ReactNode
    variant?: 'default' | 'danger'
}

export function SecurityCard({ icon: Icon, title, desc, children, variant = 'default' }: SecurityCardProps) {
    return (
        <div className={`p-6 rounded-[32px] border transition-all ${
            variant === 'danger' 
            ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' 
            : 'bg-gray-50/50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800 hover:border-emerald-500/20'
        }`}>
            <div className="flex items-center gap-4 mb-6">
                <div className={`p-3 rounded-2xl ${
                    variant === 'danger' ? 'bg-red-500/10' : 'bg-emerald-500/10'
                }`}>
                    <Icon size={24} className={variant === 'danger' ? 'text-red-500' : 'text-emerald-500'} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">{desc}</p>
                </div>
            </div>
            
            <div className="space-y-4">
                {children}
            </div>
        </div>
    )
}
