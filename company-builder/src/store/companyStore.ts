import { create } from 'zustand';
import { PlacedMind, RoleId, Company, Connection, ConnectionType, SaveState, Debate } from '@/types';

let placementCounter = 0;

/** Generate a unique placement ID -- never collides even with rapid placement */
export function generatePlacementId(archetypeId: string): string {
  placementCounter++;
  return `${archetypeId}-${Date.now()}-${placementCounter}`;
}

/** Generate a unique connection ID */
export function generateConnectionId(sourceId: string, targetId: string): string {
  return `conn-${sourceId}-${targetId}-${Date.now()}`;
}

/* ---- localStorage persistence ---- */
const STORAGE_KEY = 'greatmind-company-builder';
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

function saveToLocalStorage(state: CompanyState) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    try {
      const saveState: SaveState = {
        version: 1,
        company: state.company,
        placedMinds: state.placedMinds,
        connections: state.connections,
        debates: [],  // debates persisted separately via debateStore
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveState));
      // Trigger save indicator
      useCompanyStore.getState().showSaveIndicator();
    } catch {
      // localStorage might be full or unavailable -- silently fail
    }
  }, 500);
}

function loadFromLocalStorage(): Partial<CompanyState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved: SaveState = JSON.parse(raw);
    if (saved.version !== 1) return null;
    return {
      company: saved.company,
      placedMinds: saved.placedMinds,
      connections: saved.connections,
    };
  } catch {
    return null;
  }
}

interface CompanyState {
  company: Company;
  placedMinds: PlacedMind[];
  connections: Connection[];
  /** ID of the currently selected mind node for detail panel */
  selectedMindId: string | null;
  /** IDs of minds that were just placed (for entrance animation). Cleared after animation. */
  justPlacedIds: Set<string>;
  /** Whether a mind is currently being dragged from the sidebar */
  isDraggingFromSidebar: boolean;
  /** The archetype ID of the mind being dragged from sidebar (for ghost constellation) */
  draggedArchetypeId: string | null;
  /** The archetype ID being hovered in sidebar (to highlight on canvas) */
  hoveredSidebarArchetypeId: string | null;
  /** Whether the save indicator is visible */
  saveIndicatorVisible: boolean;
  /** Whether state has been loaded from localStorage */
  hydrated: boolean;
  /** Context menu for connection deletion */
  connectionContextMenu: { connectionId: string; x: number; y: number } | null;

  setCompanyName: (name: string) => void;
  setCompanyMission: (mission: string) => void;
  addMind: (mind: PlacedMind) => void;
  removeMind: (id: string) => void;
  updateMindRole: (id: string, role: RoleId | null) => void;
  updateMindPosition: (id: string, position: { x: number; y: number }) => void;
  clearJustPlaced: (id: string) => void;
  setDraggingFromSidebar: (dragging: boolean) => void;
  setDraggedArchetypeId: (id: string | null) => void;
  setHoveredSidebarArchetypeId: (id: string | null) => void;
  setSelectedMindId: (id: string | null) => void;

  // Connection actions
  addConnection: (sourceId: string, targetId: string, type: ConnectionType) => void;
  removeConnection: (connectionId: string) => void;
  toggleConnectionType: (connectionId: string) => void;
  setConnectionContextMenu: (menu: { connectionId: string; x: number; y: number } | null) => void;

  // Persistence actions
  showSaveIndicator: () => void;
  hydrateFromLocalStorage: () => void;
  exportToJSON: () => void;
  importFromJSON: (json: string) => void;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  company: {
    name: 'Untitled Company',
    mission: 'Define your mission...',
  },
  placedMinds: [],
  connections: [],
  selectedMindId: null,
  justPlacedIds: new Set(),
  isDraggingFromSidebar: false,
  draggedArchetypeId: null,
  hoveredSidebarArchetypeId: null,
  saveIndicatorVisible: false,
  hydrated: false,
  connectionContextMenu: null,

  setCompanyName: (name) => {
    set((state) => ({ company: { ...state.company, name } }));
    saveToLocalStorage(get());
  },

  setCompanyMission: (mission) => {
    set((state) => ({ company: { ...state.company, mission } }));
    saveToLocalStorage(get());
  },

  addMind: (mind) => {
    set((state) => ({
      placedMinds: [...state.placedMinds, mind],
      justPlacedIds: new Set([...state.justPlacedIds, mind.id]),
    }));
    saveToLocalStorage(get());
  },

  removeMind: (id) => {
    set((state) => ({
      placedMinds: state.placedMinds.filter((m) => m.id !== id),
      // Also remove any connections involving this mind
      connections: state.connections.filter(
        (c) => c.sourceId !== id && c.targetId !== id
      ),
      selectedMindId: state.selectedMindId === id ? null : state.selectedMindId,
    }));
    saveToLocalStorage(get());
  },

  updateMindRole: (id, role) => {
    set((state) => ({
      placedMinds: state.placedMinds.map((m) =>
        m.id === id ? { ...m, role } : m
      ),
    }));
    saveToLocalStorage(get());
  },

  updateMindPosition: (id, position) => {
    set((state) => ({
      placedMinds: state.placedMinds.map((m) =>
        m.id === id ? { ...m, position } : m
      ),
    }));
    saveToLocalStorage(get());
  },

  clearJustPlaced: (id) =>
    set((state) => {
      const next = new Set(state.justPlacedIds);
      next.delete(id);
      return { justPlacedIds: next };
    }),

  setDraggingFromSidebar: (dragging) =>
    set({ isDraggingFromSidebar: dragging }),

  setDraggedArchetypeId: (id) =>
    set({ draggedArchetypeId: id }),

  setHoveredSidebarArchetypeId: (id) =>
    set({ hoveredSidebarArchetypeId: id }),

  setSelectedMindId: (id) =>
    set({ selectedMindId: id }),

  // Connection actions
  addConnection: (sourceId, targetId, type) => {
    // Prevent duplicate connections between the same two nodes
    const existing = get().connections.find(
      (c) =>
        (c.sourceId === sourceId && c.targetId === targetId) ||
        (c.sourceId === targetId && c.targetId === sourceId)
    );
    if (existing) return;

    const connection: Connection = {
      id: generateConnectionId(sourceId, targetId),
      sourceId,
      targetId,
      type,
    };
    set((state) => ({
      connections: [...state.connections, connection],
    }));
    saveToLocalStorage(get());
  },

  removeConnection: (connectionId) => {
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== connectionId),
      connectionContextMenu: null,
    }));
    saveToLocalStorage(get());
  },

  toggleConnectionType: (connectionId) => {
    set((state) => ({
      connections: state.connections.map((c) =>
        c.id === connectionId
          ? { ...c, type: c.type === 'reporting' ? 'collaboration' : 'reporting' }
          : c
      ),
    }));
    saveToLocalStorage(get());
  },

  setConnectionContextMenu: (menu) =>
    set({ connectionContextMenu: menu }),

  // Persistence
  showSaveIndicator: () => {
    set({ saveIndicatorVisible: true });
    setTimeout(() => {
      set({ saveIndicatorVisible: false });
    }, 1500);
  },

  hydrateFromLocalStorage: () => {
    const saved = loadFromLocalStorage();
    if (saved) {
      set({
        ...saved,
        hydrated: true,
        justPlacedIds: new Set(),
      });
    } else {
      set({ hydrated: true });
    }
  },

  exportToJSON: () => {
    const state = get();
    // Try to get debates from debate store
    let debates: Debate[] = [];
    try {
      const debateRaw = localStorage.getItem('greatmind-debates');
      if (debateRaw) debates = JSON.parse(debateRaw);
    } catch { /* ignore */ }
    const saveState: SaveState = {
      version: 1,
      company: state.company,
      placedMinds: state.placedMinds,
      connections: state.connections,
      debates,
      savedAt: new Date().toISOString(),
    };
    const json = JSON.stringify(saveState, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug = state.company.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `${slug || 'company'}-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importFromJSON: (json) => {
    try {
      const saved: SaveState = JSON.parse(json);
      if (saved.version !== 1) throw new Error('Unsupported version');
      set({
        company: saved.company,
        placedMinds: saved.placedMinds,
        connections: saved.connections || [],
        selectedMindId: null,
        justPlacedIds: new Set(),
        connectionContextMenu: null,
      });
      // Also save debates if present
      if (saved.debates && saved.debates.length > 0) {
        try {
          localStorage.setItem('greatmind-debates', JSON.stringify(saved.debates));
        } catch { /* ignore */ }
      }
      // Also save to localStorage
      saveToLocalStorage(useCompanyStore.getState());
    } catch {
      console.error('Failed to import JSON');
    }
  },
}));
