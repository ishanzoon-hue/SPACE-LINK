'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Send, Rocket, Gift, Coins } from 'lucide-react'
import Link from 'next/link' // 🚀 Link එක අලුතින් Import කරා

export default function LiveChat({ currentUserId }: { currentUserId: string }) {
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [showTipMenu, setShowTipMenu] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        const fetchMessages = async () => {
            const { data } = await supabase
                .from('stream_messages')
                .select(`*, profiles(display_name, avatar_url, is_verified)`)
                .order('created_at', { ascending: true })
                .limit(50)
            
            if (data) setMessages(data)
            setLoading(false)
        }

        fetchMessages()

        const channel = supabase
            .channel('live-chat')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'stream_messages' },
                async (payload) => {
                    const { data: profileData } = await supabase
                        .from('profiles')
                        .select('display_name, avatar_url, is_verified')
                        .eq('id', payload.new.user_id)
                        .single()

                    const newMsg = { ...payload.new, profiles: profileData }
                    setMessages((prev) => [...prev, newMsg])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !currentUserId) return

        const textToSend = newMessage
        setNewMessage('') 

        await supabase.from('stream_messages').insert([
            { user_id: currentUserId, text: textToSend }
        ])
    }

    const sendTip = async (amount: number) => {
        if (!currentUserId) return
        setShowTipMenu(false) 

        try {
            const { data: success, error } = await supabase.rpc('send_stream_tip', {
                sender_uuid: currentUserId,
                tip_amount: amount
            })

            if (error || !success) {
                alert("ඔයාගේ Wallet එකේ ප්‍රමාණවත් LMO බැලන්ස් එකක් නෑ! 🥲 ඩිපොසිට් කරන්න.")
                return
            }

            await supabase.from('stream_messages').insert([
                { 
                    user_id: currentUserId, 
                    text: `Sent a ${amount} LMO Tip! 🚀`, 
                    is_tip: true, 
                    tip_amount: amount 
                }
            ])
        } catch (err) {
            console.error("Tip Error:", err)
            alert("Tip එක යවන්න බැරි වුණා. ආයෙත් ට්‍රයි කරන්න.")
        }
    }

    return (
        <div className="flex flex-col h-[500px] xl:h-full w-full bg-[#0F172A]/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
            
            {/* Header */}
            <div className="bg-gray-900/50 p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <h3 className="font-bold text-white uppercase tracking-wider text-sm">Live Orbit Chat</h3>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {loading ? (
                    <p className="text-center text-emerald-500 text-xs tracking-widest uppercase animate-pulse mt-10">Connecting to orbit...</p>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className="animate-in fade-in slide-in-from-bottom-2">
                            
                            {/* 🌟 TIP MESSAGE DESIGN */}
                            {msg.is_tip ? (
                                <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30 p-3 rounded-2xl flex items-center gap-3 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                                    <div className="bg-yellow-500/20 p-2 rounded-full border border-yellow-500/50 shrink-0">
                                        <Coins size={24} className="text-yellow-400" />
                                    </div>
                                    <div>
                                        {/* 🔗 නම උඩ ක්ලික් කරාම Profile එකට යනවා */}
                                        <p className="font-black text-yellow-400 text-sm flex items-center gap-1 flex-wrap">
                                            <Link href={`/profile/${msg.user_id}`} className="hover:underline hover:text-yellow-300 transition-colors">
                                                {msg.profiles?.display_name || 'Explorer'}
                                            </Link>
                                            <span>tipped {msg.tip_amount} LMO! 🎉</span>
                                        </p>
                                        <p className="text-yellow-200/70 text-xs font-bold mt-0.5">{msg.text}</p>
                                    </div>
                                </div>
                            ) : (
                                /* 💬 NORMAL MESSAGE DESIGN */
                                <div className="flex gap-3 text-sm">
                                    {/* 🔗 ෆොටෝ එක උඩ ක්ලික් කරාම Profile එකට යනවා */}
                                    <Link href={`/profile/${msg.user_id}`} className="shrink-0">
                                        <img 
                                            src={msg.profiles?.avatar_url || '/default-avatar.png'} 
                                            className="w-8 h-8 rounded-full object-cover border border-white/10 hover:ring-2 hover:ring-emerald-500 transition-all cursor-pointer"
                                            alt="avatar"
                                        />
                                    </Link>
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            {/* 🔗 නම උඩ ක්ලික් කරාම Profile එකට යනවා */}
                                            <Link href={`/profile/${msg.user_id}`}>
                                                <span className="font-bold text-gray-200 hover:text-emerald-400 hover:underline transition-colors cursor-pointer">
                                                    {msg.profiles?.display_name || 'Explorer'}
                                                </span>
                                            </Link>
                                            {msg.profiles?.is_verified && (
                                                <span className="text-emerald-400 text-[10px]">✔</span>
                                            )}
                                        </div>
                                        <p className="text-gray-400 leading-relaxed bg-white/5 p-2 rounded-xl rounded-tl-none inline-block">
                                            {msg.text}
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 🎁 TIP MENU POPUP */}
            {showTipMenu && (
                <div className="absolute bottom-20 right-4 bg-gray-900 border border-yellow-500/30 p-3 rounded-2xl shadow-2xl flex gap-2 animate-in slide-in-from-bottom-2">
                    <button onClick={() => sendTip(10)} className="bg-white/5 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-4 py-2 rounded-xl font-black transition-colors flex items-center gap-1.5 text-sm">
                        10 LMO
                    </button>
                    <button onClick={() => sendTip(50)} className="bg-white/5 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-4 py-2 rounded-xl font-black transition-colors flex items-center gap-1.5 text-sm">
                        50 LMO
                    </button>
                    <button onClick={() => sendTip(100)} className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-xl font-black transition-colors flex items-center gap-1.5 text-sm shadow-[0_0_10px_rgba(234,179,8,0.4)]">
                        100 LMO
                    </button>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-gray-900/50 border-t border-white/5 relative">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    
                    <button 
                        type="button"
                        onClick={() => setShowTipMenu(!showTipMenu)}
                        className={`p-3 rounded-xl transition-all ${showTipMenu ? 'bg-yellow-500 text-black' : 'bg-white/5 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/30'}`}
                    >
                        <Gift size={18} />
                    </button>

                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Transmit message..."
                        className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                    <button 
                        type="submit" 
                        disabled={!newMessage.trim()}
                        className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black p-3 rounded-xl transition-all active:scale-95"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    )
}