'use client'

import React, { useEffect, useRef, useState } from 'react';
import { useCall } from '@/context/CallContext';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Maximize2, Minimize2 } from 'lucide-react';
import Image from 'next/image';

export default function GlobalCallOverlay() {
    const { callState, acceptCall, rejectCall, endCall, toggleMute, toggleVideo, localStream, remoteStream } = useCall();
    
    const [isMinimized, setIsMinimized] = useState(false);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Bind streams
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, callState.status]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current.play().catch(e => console.log('play block', e));
        }
    }, [remoteStream, callState.status]);

    const { status, peerProfile, type, isMuted, isVideoOff } = callState;

    if (status === 'idle') return null;

    const displayName = peerProfile?.display_name || 'Unknown';
    const avatar = peerProfile?.avatar_url;

    // ----- RINGING (Incoming) -----
    if (status === 'ringing') {
        return (
            <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] w-[340px] shadow-2xl rounded-[32px] overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1E293B] animate-in slide-in-from-top-10 fade-in duration-300">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <div className="w-32 h-32 rounded-full border-2 border-white animate-ping"></div>
                    </div>
                    <div className="relative z-10 text-center flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full border-4 border-white/30 shadow-xl overflow-hidden animate-bounce mb-3 bg-white flex items-center justify-center">
                            {avatar ? (
                                <img src={avatar} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <span className="text-3xl font-black text-emerald-500">{displayName[0]}</span>
                            )}
                        </div>
                        <h2 className="text-xl font-black text-white mb-1 uppercase tracking-tight">{displayName}</h2>
                        <p className="text-white/80 text-xs font-bold animate-pulse uppercase tracking-widest">
                            Incoming {type} Call...
                        </p>
                    </div>
                </div>
                <div className="p-6 flex items-center justify-center gap-10">
                    <button onClick={rejectCall} className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95">
                        <PhoneOff size={24} className="text-white" />
                    </button>
                    <button onClick={acceptCall} className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 animate-pulse">
                        <Phone size={24} className="text-white" />
                    </button>
                </div>
            </div>
        );
    }

    // ----- MINIMIZED WIDGET -----
    if (isMinimized && status === 'active') {
        return (
            <div className="fixed bottom-6 right-6 z-[9999] w-48 h-64 bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border-2 border-emerald-500 group">
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                
                {/* Expand Button */}
                <button onClick={() => setIsMinimized(false)} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Maximize2 size={16} />
                </button>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-3">
                    <button onClick={endCall} className="p-2 bg-red-500 rounded-full text-white shadow-lg"><PhoneOff size={16} /></button>
                </div>
            </div>
        );
    }

    // ----- FULLSCREEN / BIG OVERLAY (Calling or Active) -----
    return (
        <div className="fixed inset-0 z-[9990] bg-black/80 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`relative ${type === 'video' ? 'w-full h-full md:w-[80vw] md:h-[85vh] md:rounded-3xl overflow-hidden bg-gray-900' : 'w-[400px] h-[500px] rounded-3xl bg-gray-900'} shadow-2xl border border-gray-800`}>
                
                {/* Minimize Button */}
                {status === 'active' && (
                    <button onClick={() => setIsMinimized(true)} className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
                        <Minimize2 size={24} />
                    </button>
                )}

                {/* Video Streams */}
                {type === 'video' ? (
                    <>
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
                        
                        {/* Local Video Picture in Picture */}
                        <div className={`absolute bottom-28 right-6 w-32 h-48 bg-gray-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl transition-opacity ${isVideoOff ? 'opacity-0' : 'opacity-100'}`}>
                            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="w-32 h-32 rounded-full border-4 border-emerald-500/50 mb-6 overflow-hidden">
                             {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-emerald-500 flex items-center justify-center text-4xl text-white font-bold">{displayName[0]}</div>}
                        </div>
                        <h2 className="text-3xl font-black text-white">{displayName}</h2>
                        <p className="text-emerald-400 mt-2 font-mono">
                            {status === 'calling' ? 'Calling...' : '00:00'} {/* Optional: add a real timer */}
                        </p>
                    </div>
                )}

                {/* Calling Banner */}
                {status === 'calling' && type === 'video' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-30">
                        <div className="w-24 h-24 rounded-full border border-white/20 mb-4 overflow-hidden">
                            {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-700"></div>}
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Calling {displayName}...</h2>
                    </div>
                )}

                {/* Controls */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-gray-800/80 p-4 rounded-[32px] backdrop-blur-md z-40 border border-gray-700/50">
                    <button onClick={toggleMute} className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-orange-500/20 text-orange-500' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                        {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                    </button>
                    <button onClick={endCall} className="p-5 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg transition-transform hover:scale-105">
                        <PhoneOff size={28} />
                    </button>
                    {type === 'video' && (
                        <button onClick={toggleVideo} className={`p-4 rounded-full transition-colors ${isVideoOff ? 'bg-orange-500/20 text-orange-500' : 'bg-gray-700 text-white hover:bg-gray-600'}`}>
                            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
