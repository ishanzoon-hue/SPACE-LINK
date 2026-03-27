'use client'

import { useEffect, useState } from 'react'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts'
import { TrendingUp, Users } from 'lucide-react'

interface Stat {
    date: string
    followers_count: number
    following_count: number
}

export default function FollowingChart() {
    const [data, setData] = useState<Stat[]>([])
    const [loading, setLoading] = useState(true)
    const [activeMetric, setActiveMetric] = useState<'followers' | 'following'>('followers')

    useEffect(() => {
        fetch('/api/follower-stats')
            .then(res => res.json())
            .then(data => {
                setData(data)
                setLoading(false)
            })
            .catch(err => {
                console.error('Failed to load chart data', err)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                    <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
            </div>
        )
    }

    if (!data.length) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 text-center border border-gray-200 dark:border-gray-800">
                <Users size={40} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No follower stats yet. Check back tomorrow!</p>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-800">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                <div className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-emerald-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Growth Chart</h3>
                </div>

                {/* Toggle Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveMetric('followers')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            activeMetric === 'followers'
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        Followers
                    </button>
                    <button
                        onClick={() => setActiveMetric('following')}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            activeMetric === 'following'
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                    >
                        Following
                    </button>
                </div>
            </div>

            {/* Chart */}
            <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorFollowing" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            tickFormatter={(value) => {
                                const date = new Date(value)
                                return `${date.getMonth() + 1}/${date.getDate()}`
                            }}
                        />
                        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '12px',
                                fontSize: '12px',
                            }}
                            labelFormatter={(label) => {
                                const date = new Date(label)
                                return date.toLocaleDateString()
                            }}
                        />
                        <Legend />
                        {activeMetric === 'followers' ? (
                            <Area
                                type="monotone"
                                dataKey="followers_count"
                                name="Followers"
                                stroke="#10b981"
                                strokeWidth={2}
                                fill="url(#colorFollowers)"
                                activeDot={{ r: 6 }}
                            />
                        ) : (
                            <Area
                                type="monotone"
                                dataKey="following_count"
                                name="Following"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#colorFollowing)"
                                activeDot={{ r: 6 }}
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Current</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {activeMetric === 'followers'
                            ? data[data.length - 1]?.followers_count ?? 0
                            : data[data.length - 1]?.following_count ?? 0}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">Change (30d)</p>
                    <p className={`text-xl font-bold ${getChangeColor(activeMetric, data)}`}>
                        {getChange(activeMetric, data)}
                    </p>
                </div>
            </div>
        </div>
    )
}

// Helper functions
function getChange(metric: 'followers' | 'following', data: Stat[]): string {
    if (data.length < 2) return '0'
    const first = data[0][metric === 'followers' ? 'followers_count' : 'following_count']
    const last = data[data.length - 1][metric === 'followers' ? 'followers_count' : 'following_count']
    const change = last - first
    const sign = change > 0 ? '+' : ''
    return `${sign}${change}`
}

function getChangeColor(metric: 'followers' | 'following', data: Stat[]): string {
    const change = parseInt(getChange(metric, data))
    if (change > 0) return 'text-emerald-600 dark:text-emerald-400'
    if (change < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
}