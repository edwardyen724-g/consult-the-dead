'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import MindLibrary from '@/components/sidebar/MindLibrary';
import CompanyBar from '@/components/company/CompanyBar';
import DetailPanel from '@/components/panels/DetailPanel';
import DebatePanel from '@/components/panels/DebatePanel';
import DebateHistory from '@/components/panels/DebateHistory';
import CommandPalette from '@/components/shared/CommandPalette';
import ApiKeyIndicator from '@/components/shared/ApiKeyIndicator';
import ApiKeyModal from '@/components/shared/ApiKeyModal';
import ErrorBoundary from '@/components/shared/ErrorBoundary';
import { useCompanyStore } from '@/store/companyStore';
import { useDebateStore } from '@/store/debateStore';

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
  const companyHydrated = useCompanyStore((s) => s.hydrated);
  const debateHydrated = useDebateStore((s) => s.hydrated);
  const shellReady = companyHydrated && debateHydrated;
  const [showShellBanner, setShowShellBanner] = useState(true);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  useEffect(() => {
    if (!shellReady) return;
    const timer = window.setTimeout(() => setShowShellBanner(false), 1800);
    return () => window.clearTimeout(timer);
  }, [shellReady]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const bridge = window as Window & {
      __CTD_OPEN_API_KEY_MODAL__?: () => void;
      __CTD_CLOSE_API_KEY_MODAL__?: () => void;
    };

    bridge.__CTD_OPEN_API_KEY_MODAL__ = () => setShowApiKeyModal(true);
    bridge.__CTD_CLOSE_API_KEY_MODAL__ = () => setShowApiKeyModal(false);

    return () => {
      delete bridge.__CTD_OPEN_API_KEY_MODAL__;
      delete bridge.__CTD_CLOSE_API_KEY_MODAL__;
    };
  }, []);

  return (
    <main
      className="h-screen w-screen flex overflow-hidden"
      style={{ background: '#0a0a0f' }}
      aria-busy={!shellReady}
    >
      {showShellBanner && (
        <div
          className="pointer-events-none fixed left-1/2 top-4 z-40 -translate-x-1/2"
          aria-hidden="true"
        >
          <div
            className="glass-panel rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.18em] animate-pulse"
            style={{
              color: 'rgba(255,255,255,0.42)',
              fontFamily: 'var(--font-jetbrains-mono), monospace',
            }}
          >
            Rehydrating company memory...
          </div>
        </div>
      )}

      {/* Left sidebar: Mind Library */}
      <ErrorBoundary section="Mind Library">
        <MindLibrary />
      </ErrorBoundary>

      {/* Canvas area */}
      <div className="flex-1 relative">
        <ErrorBoundary section="Canvas">
          <Canvas />
        </ErrorBoundary>
        <CompanyBar />
      </div>

      {/* Right panel: Mind Detail */}
      <ErrorBoundary section="Detail Panel">
        <DetailPanel />
      </ErrorBoundary>

      {/* Bottom panel: Debate */}
      <ErrorBoundary section="Debate Panel">
        <DebatePanel />
      </ErrorBoundary>

      {/* Right panel: Debate History */}
      <ErrorBoundary section="Debate History">
        <DebateHistory />
      </ErrorBoundary>

      {/* Command Palette (Cmd+K) */}
      <CommandPalette />
      <ApiKeyIndicator onOpen={() => setShowApiKeyModal(true)} />
      <ApiKeyModal open={showApiKeyModal} onClose={() => setShowApiKeyModal(false)} />
    </main>
  );
}
