'use client'

import { X, Download, ZoomIn, ZoomOut } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ImagePreviewModalProps {
    imageUrl: string;
    onClose: () => void;
}

export default function ImagePreviewModal({ imageUrl, onClose }: ImagePreviewModalProps) {
    const [isZoomed, setIsZoomed] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Prevent scrolling when modal is open
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    const handleDownload = async () => {
        try {
            const response = await fetch(imageUrl)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `elimeno-image-${Date.now()}.png`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        } catch (error) {
            console.error('Download failed:', error)
            // Fallback: open in new tab
            window.open(imageUrl, '_blank')
        }
    }

    if (!mounted) return null

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-200">
            {/* Backdrop with heavy blur */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-2xl transition-all cursor-zoom-out"
                onClick={onClose}
            />

            {/* Controls */}
            <div className="absolute top-6 right-6 flex items-center gap-4 z-10">
                <button 
                    onClick={handleDownload}
                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hover:scale-110 active:scale-95 border border-white/10"
                    title="Download Image"
                >
                    <Download size={24} />
                </button>
                <button 
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hover:scale-110 active:scale-95 border border-white/10 hidden sm:flex"
                    title="Toggle Zoom"
                >
                    {isZoomed ? <ZoomOut size={24} /> : <ZoomIn size={24} />}
                </button>
                <button 
                    onClick={onClose}
                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hover:scale-110 active:scale-95 border border-white/10"
                    title="Close"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Image Container */}
            <div className="relative max-w-full max-h-full flex items-center justify-center z-0">
                <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className={`
                        transition-all duration-500 ease-in-out rounded-xl shadow-2xl
                        ${isZoomed ? 'scale-125 cursor-zoom-out' : 'scale-100 max-h-[85vh] w-auto cursor-zoom-in'}
                        animate-in zoom-in-95 duration-300
                    `}
                    onClick={() => setIsZoomed(!isZoomed)}
                />
            </div>
            
            {/* Instructions */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs font-medium tracking-widest uppercase pointer-events-none hidden sm:block">
                Click image to zoom • Click background to close
            </div>
        </div>
    )
}
