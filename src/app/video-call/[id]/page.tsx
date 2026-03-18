'use client'

import { use } from 'react';
import dynamic from 'next/dynamic';

// 👈 මෙන්න SSR ඕෆ් කරන මැජික් එක!
const VideoCallComponent = dynamic(
  () => import('@/components/VideoCallComponent'),
  { ssr: false }
);

export default function VideoCallPage({ params }: { params: Promise<{ id: string }> }) {
    // Next.js 15 පරාමිතීන් විසඳා ගැනීම
    const resolvedParams = use(params);
    const friendId = resolvedParams.id;

    return (
        <main>
            <VideoCallComponent friendId={friendId} />
        </main>
    );
}