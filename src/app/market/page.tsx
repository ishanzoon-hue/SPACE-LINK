import { TrendingUp } from 'lucide-react'

export default function MarketPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto pt-6 px-4">
      {/* Page Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-blue-900/40 to-black p-6 rounded-3xl border border-blue-500/20">
        <TrendingUp className="text-blue-400" size={36} />
        <div>
          <h1 className="text-2xl font-black text-white italic tracking-tighter">LMO LIVE MARKET 📊</h1>
          <p className="text-sm text-gray-400">Track BNB/USDT Real-time data</p>
        </div>
      </div>

      {/* TradingView Chart */}
      <div className="w-full h-[600px] bg-black/40 rounded-[32px] overflow-hidden border border-blue-500/20 shadow-xl relative">
        <iframe
          src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_1&symbol=BINANCE%3ABNBUSDT&interval=60&hidesidetoolbar=1&hidetoptoolbar=1&symboledit=1&saveimage=0&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=3&timezone=Etc%2FUTC&studies_overrides=%7B%7D&overrides=%7B%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en"
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Live Market Chart"
        ></iframe>
      </div>
    </div>
  )
}