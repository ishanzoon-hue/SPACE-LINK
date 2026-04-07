'use client'

import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function StoryViewer({ 
    userStories, 
    onClose 
}: { 
    userStories: any[], 
    onClose: () => void 
}) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [progress, setProgress] = useState(0)

    const story = userStories[currentIndex]

    // Setup auto-advance
    useEffect(() => {
        setProgress(0)
        const duration = 5000 // 5 seconds per story
        const intervalTime = 50 // Update progress every 50ms (smooth)

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(timer)
                    handleNext()
                    return 100
                }
                return prev + (100 / (duration / intervalTime))
            })
        }, intervalTime)

        return () => clearInterval(timer)
    }, [currentIndex])

    const handleNext = () => {
        if (currentIndex < userStories.length - 1) {
            setCurrentIndex(prev => prev + 1)
        } else {
            onClose() // Reached the end
        }
    }

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1)
        } else {
            setProgress(0) // Restart current if no prev
        }
    }

    if (!story) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-black text-white flex items-center justify-center">
            
            <div className="relative w-full max-w-md h-full sm:h-[90vh] sm:rounded-3xl overflow-hidden bg-gray-900 shadow-2xl flex flex-col">
                
                {/* Progress Bars */}
                <div className="absolute top-2 w-full flex gap-1 px-2 z-50">
                    {userStories.map((_, idx) => (
                        <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-white transition-all duration-[50ms] ease-linear"
                                style={{ 
                                    width: idx < currentIndex ? '100%' : idx === currentIndex ? `${progress}%` : '0%' 
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header Profile Info */}
                <div className="absolute top-6 left-4 flex items-center gap-3 z-50">
                    <img 
                        src={story.user?.avatar_url || 'https://via.placeholder.com/150'} 
                        className="w-10 h-10 rounded-full border border-white/20 object-cover" 
                    />
                    <div className="drop-shadow-md">
                        <p className="font-bold text-sm tracking-wide">{story.user?.display_name || 'User'}</p>
                        <p className="text-[10px] text-white/70">
                            {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
                        </p>
                    </div>
                </div>

                {/* Close Button */}
                <div className="absolute top-6 right-4 z-50">
                    <button onClick={onClose} className="p-2 hover:bg-black/20 rounded-full transition text-white">
                        <X size={24} className="drop-shadow-lg" />
                    </button>
                </div>

                {/* Main Story Content */}
                <div className="relative flex-1 bg-black flex items-center justify-center">
                    <img src={story.image_url} className="w-full h-full object-cover" />

                    {/* Left & Right invisible hit zones for clicking */}
                    <div className="absolute inset-y-0 left-0 w-1/3 z-20 cursor-pointer" onClick={handlePrev}></div>
                    <div className="absolute inset-y-0 right-0 w-2/3 z-20 cursor-pointer" onClick={handleNext}></div>
                </div>

                {/* Story Text Content / Caption */}
                {story.content && (
                    <div className="absolute bottom-10 left-0 w-full p-4 z-50 text-center">
                        <div className="inline-block bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-lg text-sm sm:text-base font-medium">
                            {story.content}
                        </div>
                    </div>
                )}

                {/* On Desktop - Show Chevron Buttons visible */}
                <div className="hidden sm:flex absolute inset-y-0 w-full justify-between items-center px-4 pointer-events-none z-10">
                    <button onClick={handlePrev} className="pointer-events-auto bg-black/40 p-2 rounded-full hover:bg-black/60 backdrop-blur transition"><ChevronLeft size={24} /></button>
                    <button onClick={handleNext} className="pointer-events-auto bg-black/40 p-2 rounded-full hover:bg-black/60 backdrop-blur transition"><ChevronRight size={24}/></button>
                </div>
            </div>
        </div>
    )
}
