import React from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
    label: string
    value: string | number
    icon: LucideIcon
    color: string
    trend?: string
}

export default function StatCard({ label, value, icon: Icon, color, trend }: StatCardProps) {
    return (
        <div className="bg-[#0F172A] p-6 rounded-[32px] border border-gray-800 hover:border-emerald-500/20 transition-all group overflow-hidden relative">
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-gray-900/50" style={{ color }}>
                        <Icon size={24} />
                    </div>
                    {trend && (
                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase italic">
                            {trend}
                        </span>
                    )}
                </div>
                <div>
                    <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{label}</h3>
                    <p className="text-3xl font-black text-white italic mt-1">{value}</p>
                </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-700" style={{ color }}>
                <Icon size={120} />
            </div>
        </div>
    )
}
