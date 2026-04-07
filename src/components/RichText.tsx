'use client'

import React from 'react'
import Link from 'next/link'

interface RichTextProps {
    content: string;
}

export default function RichText({ content }: RichTextProps) {
    if (!content) return null

    // Regex to match hashtags and mentions loosely separated by spaces or punctuation
    // e.g. #Web3, @Ishan
    const regex = /(#[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+)/g;
    
    // Split the text based on the regex. Capturing groups in split() keeps the matched separators in the array!
    const parts = content.split(regex);

    return (
        <span className="whitespace-pre-wrap">
            {parts.map((part, index) => {
                if (part.startsWith('#')) {
                    const tag = part.substring(1);
                    return (
                        <Link 
                            key={index} 
                            href={`/explore?hashtag=${encodeURIComponent(tag)}`}
                            className="text-emerald-500 font-bold hover:underline"
                        >
                            {part}
                        </Link>
                    )
                }
                
                if (part.startsWith('@')) {
                    const username = part.substring(1);
                    return (
                        <Link 
                            key={index} 
                            href={`/explore?user=${encodeURIComponent(username)}`}
                            className="text-blue-500 font-bold hover:underline"
                        >
                            {part}
                        </Link>
                    )
                }

                // Normal text
                return <span key={index}>{part}</span>
            })}
        </span>
    )
}
