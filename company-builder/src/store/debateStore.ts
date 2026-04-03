import { create } from 'zustand';
import type { Debate, DebateMessage } from '@/types';

const STORAGE_KEY = 'greatmind-debates';

function saveDebatesToStorage(debates: Debate[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(debates));
  } catch {
    // silently fail
  }
}

function loadDebatesFromStorage(): Debate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

interface DebateState {
  /** Currently active debate (being generated or just completed) */
  activeDebate: Debate | null;
  /** All past debates */
  debateHistory: Debate[];
  /** Whether the debate panel is open */
  debatePanelOpen: boolean;
  /** Whether the debate history panel is open */
  historyPanelOpen: boolean;
  /** Whether a debate is currently streaming */
  isDebateRunning: boolean;
  /** The currently speaking mind ID (for canvas ambience) */
  speakingMindId: string | null;
  /** Whether state has been hydrated */
  hydrated: boolean;

  // Actions
  startDebate: (debate: Debate) => void;
  addMessage: (message: DebateMessage) => void;
  completeDebate: () => void;
  failDebate: () => void;
  setSpeakingMind: (mindId: string | null) => void;
  openDebatePanel: () => void;
  closeDebatePanel: () => void;
  toggleHistoryPanel: () => void;
  closeHistoryPanel: () => void;
  loadHistoricalDebate: (debate: Debate) => void;
  hydrateDebates: () => void;
  clearHistory: () => void;
}

export const useDebateStore = create<DebateState>((set, get) => ({
  activeDebate: null,
  debateHistory: [],
  debatePanelOpen: false,
  historyPanelOpen: false,
  isDebateRunning: false,
  speakingMindId: null,
  hydrated: false,

  startDebate: (debate) => {
    set({
      activeDebate: debate,
      debatePanelOpen: true,
      isDebateRunning: true,
      speakingMindId: null,
    });
  },

  addMessage: (message) => {
    set((state) => {
      if (!state.activeDebate) return state;
      return {
        activeDebate: {
          ...state.activeDebate,
          messages: [...state.activeDebate.messages, message],
        },
      };
    });
  },

  completeDebate: () => {
    const { activeDebate } = get();
    if (!activeDebate) return;

    const completed: Debate = {
      ...activeDebate,
      status: 'complete',
      completedAt: new Date().toISOString(),
    };

    set((state) => ({
      activeDebate: completed,
      isDebateRunning: false,
      speakingMindId: null,
      debateHistory: [completed, ...state.debateHistory],
    }));

    // Persist
    saveDebatesToStorage(get().debateHistory);
  },

  failDebate: () => {
    set((state) => ({
      activeDebate: state.activeDebate
        ? { ...state.activeDebate, status: 'error' as const }
        : null,
      isDebateRunning: false,
      speakingMindId: null,
    }));
  },

  setSpeakingMind: (mindId) => {
    set({ speakingMindId: mindId });
  },

  openDebatePanel: () => {
    set({ debatePanelOpen: true });
  },

  closeDebatePanel: () => {
    set({ debatePanelOpen: false });
  },

  toggleHistoryPanel: () => {
    set((state) => ({ historyPanelOpen: !state.historyPanelOpen }));
  },

  closeHistoryPanel: () => {
    set({ historyPanelOpen: false });
  },

  loadHistoricalDebate: (debate) => {
    set({
      activeDebate: debate,
      debatePanelOpen: true,
      isDebateRunning: false,
      historyPanelOpen: false,
    });
  },

  hydrateDebates: () => {
    const debates = loadDebatesFromStorage();
    set({
      debateHistory: debates,
      hydrated: true,
    });
  },

  clearHistory: () => {
    set({ debateHistory: [] });
    saveDebatesToStorage([]);
  },
}));
