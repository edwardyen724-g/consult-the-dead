'use client';

import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';

export default function ApiKeyIndicator() {
  const apiKey = useSettingsStore((s) => s.apiKey);
  const openModal = useSettingsStore((s) => s.openApiKeyModal);
  const freeRemaining = useSettingsStore((s) => s.getFreeDebatesRemaining)();

  const label = apiKey
    ? `key ····${apiKey.slice(-4)}`
    : `${freeRemaining}/3 free`;

  const dotColor = apiKey
    ? 'rgba(74,222,128,0.6)'
    : freeRemaining > 0
      ? 'rgba(212,165,116,0.7)'
      : 'rgba(239,68,68,0.6)';

  const textColor = apiKey
    ? 'rgba(255,255,255,0.3)'
    : freeRemaining > 0
      ? 'rgba(212,165,116,0.7)'
      : 'rgba(239,68,68,0.6)';

  const title = apiKey
    ? 'API key set — click to change'
    : freeRemaining > 0
      ? `${freeRemaining} free debate${freeRemaining !== 1 ? 's' : ''} remaining today — click for unlimited`
      : 'Free debates used up — click to add your API key';

  return (
    <button
      onClick={openModal}
      className="fixed bottom-3 right-3 z-50 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider transition-colors"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        color: textColor,
        fontFamily: 'var(--font-jetbrains-mono), monospace',
      }}
      title={title}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ background: dotColor }}
      />
      {label}
    </button>
  );
}
