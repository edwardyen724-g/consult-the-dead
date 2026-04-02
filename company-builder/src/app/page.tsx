'use client';

import dynamic from 'next/dynamic';
import MindLibrary from '@/components/sidebar/MindLibrary';
import CompanyBar from '@/components/company/CompanyBar';

// Dynamic import to avoid SSR issues with React Flow
const Canvas = dynamic(() => import('@/components/canvas/Canvas'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center" style={{ background: '#0a0a0f' }}>
      <div
        className="text-[11px] uppercase tracking-[0.2em]"
        style={{
          color: 'rgba(255,255,255,0.15)',
          fontFamily: 'monospace',
        }}
      >
        Initializing command center...
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="h-screen w-screen flex overflow-hidden" style={{ background: '#0a0a0f' }}>
      {/* Left sidebar: Mind Library */}
      <MindLibrary />

      {/* Canvas area */}
      <div className="flex-1 relative">
        <Canvas />
        <CompanyBar />
      </div>
    </main>
  );
}
