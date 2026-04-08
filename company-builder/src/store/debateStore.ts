import { create } from 'zustand';
import type { Debate, DebateMessage, ResearchSource } from '@/types';
import { appEvents } from '@/lib/events';

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
  /** Live streaming content for the currently speaking mind */
  streamingContent: string;
  /** Abort controller for cancelling active debate */
  abortController: AbortController | null;
  /** Whether research phase is in progress */
  isResearching: boolean;
  /** Accumulated research briefing text */
  researchBriefing: string;
  /** Sources discovered during research */
  researchSources: ResearchSource[];
  /** Uploaded document contents */
  documents: string[];
  /** Whether convergence synthesis is in progress */
  isConverging: boolean;
  /** Accumulated convergence text */
  convergenceContent: string;

  // Actions
  startDebate: (debate: Debate) => void;
  addMessage: (message: DebateMessage) => void;
  appendStreamingChunk: (text: string) => void;
  resetStreamingContent: () => void;
  completeDebate: () => void;
  cancelDebate: () => void;
  failDebate: () => void;
  setSpeakingMind: (mindId: string | null) => void;
  setAbortController: (controller: AbortController | null) => void;
  setResearching: (value: boolean) => void;
  setResearchBriefing: (text: string) => void;
  appendResearchChunk: (text: string) => void;
  setResearchSources: (sources: ResearchSource[]) => void;
  setDocuments: (docs: string[]) => void;
  setConverging: (value: boolean) => void;
  appendConvergenceChunk: (text: string) => void;
  setConvergenceContent: (text: string) => void;
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
  streamingContent: '',
  abortController: null,
  isResearching: false,
  researchBriefing: '',
  researchSources: [],
  documents: [],
  isConverging: false,
  convergenceContent: '',

  startDebate: (debate) => {
    set({
      activeDebate: debate,
      debatePanelOpen: true,
      isDebateRunning: true,
      speakingMindId: null,
      isResearching: false,
      researchBriefing: '',
      researchSources: [],
      isConverging: false,
      convergenceContent: '',
    });
    appEvents.emit('debate.started', { debateId: debate.id, topic: debate.topic, participants: debate.participantArchetypeIds });
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
    appEvents.emit('debate.message', { mindId: message.mindId, archetypeId: message.archetypeId, round: message.round });
  },

  appendStreamingChunk: (text) => {
    set((state) => ({ streamingContent: state.streamingContent + text }));
  },

  resetStreamingContent: () => {
    set({ streamingContent: '' });
  },

  cancelDebate: () => {
    const { abortController, activeDebate, convergenceContent } = get();
    if (abortController) {
      abortController.abort();
    }
    if (activeDebate) {
      const cancelled: Debate = {
        ...activeDebate,
        status: 'complete',
        completedAt: new Date().toISOString(),
        convergenceSynthesis: convergenceContent || undefined,
      };
      set((state) => ({
        activeDebate: cancelled,
        isDebateRunning: false,
        speakingMindId: null,
        streamingContent: '',
        abortController: null,
        debateHistory: cancelled.messages.length > 0 ? [cancelled, ...state.debateHistory] : state.debateHistory,
      }));
      if (cancelled.messages.length > 0) {
        saveDebatesToStorage(get().debateHistory);
      }
      appEvents.emit('debate.cancelled', { debateId: activeDebate.id });
    }
  },

  setAbortController: (controller) => {
    set({ abortController: controller });
  },

  completeDebate: () => {
    const { activeDebate, convergenceContent } = get();
    if (!activeDebate) return;

    const completed: Debate = {
      ...activeDebate,
      status: 'complete',
      completedAt: new Date().toISOString(),
      convergenceSynthesis: convergenceContent || undefined,
    };

    set((state) => ({
      activeDebate: completed,
      isDebateRunning: false,
      speakingMindId: null,
      debateHistory: [completed, ...state.debateHistory],
    }));

    // Persist
    saveDebatesToStorage(get().debateHistory);
    appEvents.emit('debate.ended', { debateId: activeDebate.id, messageCount: completed.messages.length });
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

  setResearching: (value) => {
    set({ isResearching: value });
  },

  setResearchBriefing: (text) => {
    set({ researchBriefing: text });
  },

  appendResearchChunk: (text) => {
    set((state) => ({ researchBriefing: state.researchBriefing + text }));
  },

  setResearchSources: (sources) => {
    set({ researchSources: sources });
  },

  setDocuments: (docs) => {
    set({ documents: docs });
  },

  setConverging: (value) => {
    set({ isConverging: value });
  },

  appendConvergenceChunk: (text) => {
    set((state) => ({ convergenceContent: state.convergenceContent + text }));
  },

  setConvergenceContent: (text) => {
    set({ convergenceContent: text });
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
      convergenceContent: debate.convergenceSynthesis || '',
      isConverging: false,
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
