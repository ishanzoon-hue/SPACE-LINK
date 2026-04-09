'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { TrendingUp, Hash } from 'lucide-react'

export default function TrendingTags() {
    const fallbackTags = [
        { name: '#elimeno', count: 24 },
        { name: '#lmo', count: 18 },
        { name: '#crypto', count: 15 },
        { name: '#web3', count: 10 },
        { name: '#spacelink', count: 7 },
    ]
    const [tags, setTags] = useState<{ name: string; count: number }[]>(fallbackTags)
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const fetchTrendingTags = async () => {
            setLoading(true)
            // Fetch recent posts to analyze hashtags
            const { data: posts, error } = await supabase
                .from('posts')
                .select('content')
                .order('created_at', { ascending: false })
                .limit(100)

            if (!error && posts) {
                const tagCounts: Record<string, number> = {}
                posts.forEach(post => {
                    const foundTags = post.content?.match(/#[\w\u0590-\u05ff]+/g)
                    if (foundTags) {
                        foundTags.forEach((tag: string) => {
                            const cleanTag = tag.toLowerCase()
                            tagCounts[cleanTag] = (tagCounts[cleanTag] || 0) + 1
                        })
                    }
                })

                const sortedTags = Object.entries(tagCounts)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)

                setTags(sortedTags.length > 0 ? sortedTags : fallbackTags)
            }
            setLoading(false)
        }

        fetchTrendingTags()
    }, [])

    // Always use tags (already has fallback as default state)
    const displayTags = tags

    return (
        <div className="bg-white dark:bg-[#0F172A] p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-gray-800 dark:text-white flex items-center gap-2">
                    <TrendingUp size={20} className="text-emerald-500" />
                    Trending Tags
                </h3>
                <Link href="/explore" className="text-xs font-bold text-emerald-500 hover:underline">View All</Link>
            </div>

            <div className="space-y-4">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="flex flex-col gap-2 animate-pulse">
                            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
                            <div className="h-3 bg-gray-50 dark:bg-gray-800/50 rounded w-1/3"></div>
                        </div>
                    ))
                ) : (
                    displayTags.map((tag) => (
                        <Link 
                            key={tag.name} 
                            href={`/explore?hashtag=${tag.name.replace('#', '')}`}
                            className="flex flex-col group/tag hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 -mx-2 rounded-xl transition-all"
                        >
                            <span className="font-bold text-gray-700 dark:text-gray-200 group-hover/tag:text-emerald-500 transition-colors">
                                {tag.name}
                            </span>
                            <span className="text-[11px] text-gray-400 font-medium">
                                {tag.count} post{tag.count !== 1 ? 's' : ''} today
                            </span>
                        </Link>
                    ))
                )}
            </div>
            
            {/* Background Decorative Element */}
            <Hash size={80} className="absolute -bottom-6 -right-6 text-gray-100 dark:text-gray-800/20 rotate-12 group-hover:rotate-45 transition-transform duration-1000 -z-0" />
        </div>
    )
}
