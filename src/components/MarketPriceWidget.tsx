'use client'

import React, { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Activity, Globe } from 'lucide-react'

export default function MarketPriceWidget() {
    const [prices, setPrices] = useState([
        { symbol: 'LMO', name: 'Elimen Link', price: '0.0042', change: '+12.5%', color: 'text-emerald-500', isUp: true },
        { symbol: 'BTC', name: 'Bitcoin', price: '64,210', change: '-1.2%', color: 'text-rose-500', isUp: false },
        { symbol: 'ETH', name: 'Ethereum', price: '3,450', change: '+2.1%', color: 'text-blue-500', isUp: true }
    ])

    return (
        <div className="bg-gradient-to-br from-gray-900 to-slate-900 p-5 rounded-3xl border border-gray-800 shadow-xl relative overflow-hidden group">
            {/* Animated Background Pulse */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[100px] animate-pulse"></div>
            
            <div className="flex items-center justify-between mb-5 relative z-10">
                <h3 className="font-black text-white flex items-center gap-2 text-sm uppercase tracking-widest">
                    <Activity size={18} className="text-emerald-400 animate-pulse" />
                    Market Watch
                </h3>
                <div className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">
                    <Globe size={10} />
                    Live
                </div>
            </div>

            <div className="space-y-4 relative z-10">
                {prices.map((coin) => (
                    <div key={coin.symbol} className="flex items-center justify-between group/coin">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-xl bg-gray-800 flex items-center justify-center font-black text-xs ${coin.color.replace('text-', 'text-opacity-80 ')} border border-gray-700 transition-transform group-hover/coin:scale-110`}>
                                {coin.symbol.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-white uppercase tracking-wider">{coin.symbol}</h4>
                                <p className="text-[10px] text-gray-500 font-medium">{coin.name}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-black text-white text-sm tracking-tight">${coin.price}</p>
                            <div className={`flex items-center justify-end gap-1 text-[10px] font-bold ${coin.color}`}>
                                {coin.isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {coin.change}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="mt-5 w-full bg-white/5 hover:bg-white/10 text-gray-400 py-2.5 rounded-2xl text-[11px] font-bold transition-all border border-white/5 hover:border-white/10 uppercase tracking-widest">
                Trade Now
            </button>
        </div>
    )
}
