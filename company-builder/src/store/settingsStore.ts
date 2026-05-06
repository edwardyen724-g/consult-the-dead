'use client';

import { create } from 'zustand';

const FREE_DEBATE_LIMIT = 3;

interface SettingsState {
  apiKey: string | null;
  showApiKeyModal: boolean;
  freeDebatesUsed: number;
  setApiKey: (key: string | null) => void;
  openApiKeyModal: () => void;
  closeApiKeyModal: () => void;
  canUseFreeDebate: () => boolean;
  incrementFreeDebateCount: () => void;
  getFreeDebatesRemaining: () => number;
}

// Load from localStorage on init (client-side only)
function loadApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('ctd_anthropic_api_key');
  } catch {
    return null;
  }
}

function getTodayKey(): string {
  const d = new Date();
  return `ctd_free_debates_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function loadFreeDebatesUsed(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const val = localStorage.getItem(getTodayKey());
    return val ? parseInt(val, 10) : 0;
  } catch {
    return 0;
  }
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  apiKey: loadApiKey(),
  showApiKeyModal: false,
  freeDebatesUsed: loadFreeDebatesUsed(),
  setApiKey: (key) => {
    if (typeof window !== 'undefined') {
      if (key) {
        localStorage.setItem('ctd_anthropic_api_key', key);
      } else {
        localStorage.removeItem('ctd_anthropic_api_key');
      }
    }
    set({ apiKey: key, showApiKeyModal: false });
  },
  openApiKeyModal: () => set({ showApiKeyModal: true }),
  closeApiKeyModal: () => set({ showApiKeyModal: false }),
  canUseFreeDebate: () => get().freeDebatesUsed < FREE_DEBATE_LIMIT,
  incrementFreeDebateCount: () => {
    const next = get().freeDebatesUsed + 1;
    if (typeof window !== 'undefined') {
      localStorage.setItem(getTodayKey(), String(next));
    }
    set({ freeDebatesUsed: next });
  },
  getFreeDebatesRemaining: () => FREE_DEBATE_LIMIT - get().freeDebatesUsed,
}));
