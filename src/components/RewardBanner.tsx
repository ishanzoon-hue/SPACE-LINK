import Link from 'next/link';

const RewardBanner = () => {
  return (
    <div className="w-full">
      <Link href="/claim">
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-900/40 via-purple-900/40 to-blue-900/40 border border-blue-500/30 rounded-[28px] p-4 lg:p-6 cursor-pointer hover:border-blue-400/60 transition-all group shadow-xl">
          
          {/* Background Glow Effect */}
          <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10 text-center sm:text-left">
            
            <div className="flex items-center gap-4">
              {/* Pulsing Icon */}
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-md animate-pulse opacity-50"></div>
                <div className="relative bg-blue-600 p-2.5 rounded-full text-xl text-white">
                  🎁
                </div>
              </div>

              <div>
                <h3 className="font-black text-white text-base lg:text-lg">New Reward Available! 🪐</h3>
                <p className="text-gray-400 text-xs lg:text-sm font-medium">Claim your early bird LMO tokens now!</p>
              </div>
            </div>

            {/* Claim Button in Banner */}
            <div className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-xl font-bold text-xs lg:text-sm transition-all border border-white/20 group-hover:scale-105 active:scale-95 whitespace-nowrap">
              Claim Now →
            </div>

          </div>

          {/* Animated "New" Tag */}
          <div className="absolute top-2 right-2">
             <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
          </div>

        </div>
      </Link>
    </div>
  );
};

export default RewardBanner;