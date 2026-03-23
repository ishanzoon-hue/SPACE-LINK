import React from 'react';

export default function Leaderboard() {
  // දැනට අපි ඩිසයින් එක බලාගන්න මේ බොරු දත්ත (Mock Data) ටික පාවිච්චි කරමු
  // මම ඔයාගේ කලින් ස්ක්‍රීන්ෂොට් එකේ හිටපු යූසර්ස්ලාවම මේකට දැම්මා! 😎
  const topUsers = [
    { id: 1, name: 'Ishan (CEO)', points: 1500, avatar: '👑' },
    { id: 2, name: 'Niro', points: 850, avatar: '🚀' },
    { id: 3, name: 'Chamath', points: 620, avatar: '🔥' },
    { id: 4, name: 'Sandaruwan', points: 410, avatar: '⭐️' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0F172A] text-gray-900 dark:text-gray-100 p-8 pt-24">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
            Top Creators Leaderboard 🏆
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Earn points by posting, commenting, and staying active!
          </p>
        </div>

        {/* Leaderboard List */}
        <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-slate-700">
          {topUsers.map((user, index) => (
            <div 
              key={user.id} 
              className="flex items-center justify-between p-4 mb-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 hover:scale-[1.02] transition-transform"
            >
              <div className="flex items-center gap-4">
                {/* Rank Number */}
                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-full text-xl font-bold text-emerald-500">
                  {index + 1}
                </div>
                {/* Avatar & Name */}
                <div className="text-2xl">{user.avatar}</div>
                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-xs text-gray-400">Rank #{index + 1}</p>
                </div>
              </div>
              {/* Points */}
              <div className="text-right">
                <span className="text-2xl font-bold text-emerald-500">{user.points}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">PTS</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}