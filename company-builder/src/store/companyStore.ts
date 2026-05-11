import { create } from 'zustand';
import { PlacedMind, RoleId, Company, Connection, ConnectionType, SaveState, Debate } from '@/types';
import { appEvents } from '@/lib/events';

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
type CanvasSnapshot = {
  company: Company;
  placedMinds: PlacedMind[];
  connections: Connection[];
  selectedMindId: string | null;
};

type HistoryState = {
  undo: CanvasSnapshot | null;
  redo: CanvasSnapshot | null;
};

type PersistedCompanyBuilderState = Omit<SaveState, 'version'> & {
  version: 2;
  selectedMindId: string | null;
  history: HistoryState;
};

type PersistedCompanyBuilderPayload = Partial<Omit<PersistedCompanyBuilderState, 'version'>> & {
  version?: number;
};

const EMPTY_HISTORY: HistoryState = { undo: null, redo: null };

function cloneSnapshot(snapshot: CanvasSnapshot): CanvasSnapshot {
  return {
    company: { ...snapshot.company },
    placedMinds: snapshot.placedMinds.map((mind) => ({
      ...mind,
      position: { ...mind.position },
    })),
    connections: snapshot.connections.map((connection) => ({ ...connection })),
    selectedMindId: snapshot.selectedMindId,
  };
}

function captureSnapshot(state: Pick<CompanyState, 'company' | 'placedMinds' | 'connections' | 'selectedMindId'>): CanvasSnapshot {
  return cloneSnapshot({
    company: state.company,
    placedMinds: state.placedMinds,
    connections: state.connections,
    selectedMindId: state.selectedMindId,
  });
}

function normalizeHistory(history?: Partial<HistoryState> | null): HistoryState {
  return {
    undo: history?.undo ? cloneSnapshot(history.undo) : null,
    redo: history?.redo ? cloneSnapshot(history.redo) : null,
  };
}

function loadFromLocalStorage(): Partial<CompanyState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as PersistedCompanyBuilderPayload;
    if (saved.version !== 1 && saved.version !== 2) return null;
    if (!saved.company || !saved.placedMinds || !saved.connections) return null;
    return {
      company: saved.company,
      placedMinds: saved.placedMinds,
      connections: saved.connections,
      selectedMindId: saved.version === 2 ? (saved.selectedMindId ?? null) : null,
      history: saved.version === 2 ? normalizeHistory(saved.history) : EMPTY_HISTORY,
    };
  } catch {
    return null;
  }
}

function saveToLocalStorage(state: CompanyState) {
  try {
    const saveState: PersistedCompanyBuilderState = {
      version: 2,
      company: state.company,
      placedMinds: state.placedMinds,
      connections: state.connections,
      selectedMindId: state.selectedMindId,
      history: normalizeHistory(state.history),
      debates: [],  // debates persisted separately via debateStore
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveState));
    // Trigger save indicator
    useCompanyStore.getState().showSaveIndicator();
  } catch {
    // localStorage might be full or unavailable -- silently fail
  }
}

function createHistoryState(before: CompanyState): HistoryState {
  return {
    undo: captureSnapshot(before),
    redo: null,
  };
}

interface CompanyState {
  company: Company;
  placedMinds: PlacedMind[];
  connections: Connection[];
  history: HistoryState;
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
  /** IDs of connections just created (for spark animation). Cleared after animation. */
  justCreatedConnectionIds: Set<string>;

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
  clearJustCreatedConnection: (connectionId: string) => void;

  // Persistence actions
  showSaveIndicator: () => void;
  hydrateFromLocalStorage: () => void;
  undo: () => void;
  redo: () => void;
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
  history: EMPTY_HISTORY,
  selectedMindId: null,
  justPlacedIds: new Set(),
  isDraggingFromSidebar: false,
  draggedArchetypeId: null,
  hoveredSidebarArchetypeId: null,
  saveIndicatorVisible: false,
  hydrated: false,
  connectionContextMenu: null,
  justCreatedConnectionIds: new Set(),

  setCompanyName: (name) => {
    const previous = createHistoryState(get());
    set((state) => ({
      company: { ...state.company, name },
      history: previous,
    }));
    saveToLocalStorage(get());
  },

  setCompanyMission: (mission) => {
    const previous = createHistoryState(get());
    set((state) => ({
      company: { ...state.company, mission },
      history: previous,
    }));
    saveToLocalStorage(get());
  },

  addMind: (mind) => {
    const previous = createHistoryState(get());
    set((state) => ({
      placedMinds: [...state.placedMinds, mind],
      justPlacedIds: new Set([...state.justPlacedIds, mind.id]),
      history: previous,
    }));
    saveToLocalStorage(get());
    appEvents.emit('mind.placed', { mindId: mind.id, archetypeId: mind.archetypeId });
  },

  removeMind: (id) => {
    const current = get();
    const mind = current.placedMinds.find((m) => m.id === id);
    if (!mind) return;
    const previous = createHistoryState(current);
    set((state) => ({
      placedMinds: state.placedMinds.filter((m) => m.id !== id),
      connections: state.connections.filter(
        (c) => c.sourceId !== id && c.targetId !== id
      ),
      selectedMindId: state.selectedMindId === id ? null : state.selectedMindId,
      history: previous,
    }));
    saveToLocalStorage(get());
    appEvents.emit('mind.removed', { mindId: id, archetypeId: mind?.archetypeId });
  },

  updateMindRole: (id, role) => {
    const current = get();
    const existing = current.placedMinds.find((mind) => mind.id === id);
    if (!existing || existing.role === role) return;
    const previous = createHistoryState(get());
    set((state) => ({
      placedMinds: state.placedMinds.map((m) =>
        m.id === id ? { ...m, role } : m
      ),
      history: previous,
    }));
    saveToLocalStorage(get());
    appEvents.emit('mind.role_changed', { mindId: id, role });
  },

  updateMindPosition: (id, position) => {
    const current = get();
    const existing = current.placedMinds.find((mind) => mind.id === id);
    if (!existing || (existing.position.x === position.x && existing.position.y === position.y)) return;
    const previous = createHistoryState(get());
    set((state) => ({
      placedMinds: state.placedMinds.map((m) =>
        m.id === id ? { ...m, position } : m
      ),
      history: previous,
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

    const previous = createHistoryState(get());
    const connection: Connection = {
      id: generateConnectionId(sourceId, targetId),
      sourceId,
      targetId,
      type,
    };
    set((state) => ({
      connections: [...state.connections, connection],
      justCreatedConnectionIds: new Set([...state.justCreatedConnectionIds, connection.id]),
      history: previous,
    }));
    saveToLocalStorage(get());
    appEvents.emit('connection.created', { connectionId: connection.id, sourceId: sourceId, targetId: targetId });
  },

  removeConnection: (connectionId) => {
    const current = get();
    const connection = current.connections.find((item) => item.id === connectionId);
    if (!connection) return;
    const previous = createHistoryState(current);
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== connectionId),
      connectionContextMenu: null,
      history: previous,
    }));
    saveToLocalStorage(get());
    appEvents.emit('connection.removed', { connectionId });
  },

  toggleConnectionType: (connectionId) => {
    const current = get();
    const existing = current.connections.find((connection) => connection.id === connectionId);
    if (!existing) return;
    const previous = createHistoryState(current);
    set((state) => ({
      connections: state.connections.map((c) =>
        c.id === connectionId
          ? { ...c, type: c.type === 'reporting' ? 'collaboration' : 'reporting' }
          : c
      ),
      history: previous,
    }));
    saveToLocalStorage(get());
  },

  setConnectionContextMenu: (menu) =>
    set({ connectionContextMenu: menu }),

  clearJustCreatedConnection: (connectionId) =>
    set((state) => {
      const next = new Set(state.justCreatedConnectionIds);
      next.delete(connectionId);
      return { justCreatedConnectionIds: next };
    }),

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
        justCreatedConnectionIds: new Set(),
        connectionContextMenu: null,
        saveIndicatorVisible: false,
      });
    } else {
      set({ hydrated: true });
    }
  },

  undo: () => {
    const { history } = get();
    if (!history.undo) return;
    const redo = captureSnapshot(get());
    set({
      company: { ...history.undo.company },
      placedMinds: history.undo.placedMinds.map((mind) => ({
        ...mind,
        position: { ...mind.position },
      })),
      connections: history.undo.connections.map((connection) => ({ ...connection })),
      selectedMindId: history.undo.selectedMindId,
      history: {
        undo: null,
        redo,
      },
      justPlacedIds: new Set(),
      justCreatedConnectionIds: new Set(),
      connectionContextMenu: null,
      saveIndicatorVisible: false,
    });
    saveToLocalStorage(get());
  },

  redo: () => {
    const { history } = get();
    if (!history.redo) return;
    const undo = captureSnapshot(get());
    set({
      company: { ...history.redo.company },
      placedMinds: history.redo.placedMinds.map((mind) => ({
        ...mind,
        position: { ...mind.position },
      })),
      connections: history.redo.connections.map((connection) => ({ ...connection })),
      selectedMindId: history.redo.selectedMindId,
      history: {
        undo,
        redo: null,
      },
      justPlacedIds: new Set(),
      justCreatedConnectionIds: new Set(),
      connectionContextMenu: null,
      saveIndicatorVisible: false,
    });
    saveToLocalStorage(get());
  },

  exportToJSON: () => {
    const state = get();
    // Try to get debates from debate store
    let debates: Debate[] = [];
    try {
      const debateRaw = localStorage.getItem('greatmind-debates');
      if (debateRaw) debates = JSON.parse(debateRaw);
    } catch { /* ignore */ }
    const saveState: PersistedCompanyBuilderState = {
      version: 2,
      company: state.company,
      placedMinds: state.placedMinds,
      connections: state.connections,
      selectedMindId: state.selectedMindId,
      history: normalizeHistory(state.history),
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
      const saved = JSON.parse(json) as PersistedCompanyBuilderPayload;
      if (saved.version !== 1 && saved.version !== 2) throw new Error('Unsupported version');
      if (!saved.company || !saved.placedMinds || !saved.connections) {
        throw new Error('Malformed save payload');
      }
      set({
        company: saved.company,
        placedMinds: saved.placedMinds,
        connections: saved.connections || [],
        selectedMindId: saved.version === 2 ? (saved.selectedMindId ?? null) : null,
        history: saved.version === 2 ? normalizeHistory(saved.history) : EMPTY_HISTORY,
        justPlacedIds: new Set(),
        justCreatedConnectionIds: new Set(),
        connectionContextMenu: null,
        saveIndicatorVisible: false,
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
