import { create } from 'zustand';
import { PlacedMind, RoleId, Company } from '@/types';

interface CompanyState {
  company: Company;
  placedMinds: PlacedMind[];
  /** IDs of minds that were just placed (for entrance animation). Cleared after animation. */
  justPlacedIds: Set<string>;
  /** Whether a mind is currently being dragged from the sidebar */
  isDraggingFromSidebar: boolean;
  setCompanyName: (name: string) => void;
  setCompanyMission: (mission: string) => void;
  addMind: (mind: PlacedMind) => void;
  removeMind: (id: string) => void;
  updateMindRole: (id: string, role: RoleId | null) => void;
  updateMindPosition: (id: string, position: { x: number; y: number }) => void;
  clearJustPlaced: (id: string) => void;
  setDraggingFromSidebar: (dragging: boolean) => void;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  company: {
    name: 'Untitled Company',
    mission: 'Define your mission...',
  },
  placedMinds: [],
  justPlacedIds: new Set(),
  isDraggingFromSidebar: false,

  setCompanyName: (name) =>
    set((state) => ({ company: { ...state.company, name } })),

  setCompanyMission: (mission) =>
    set((state) => ({ company: { ...state.company, mission } })),

  addMind: (mind) =>
    set((state) => ({
      placedMinds: [...state.placedMinds, mind],
      justPlacedIds: new Set([...state.justPlacedIds, mind.id]),
    })),

  removeMind: (id) =>
    set((state) => ({
      placedMinds: state.placedMinds.filter((m) => m.id !== id),
    })),

  updateMindRole: (id, role) =>
    set((state) => ({
      placedMinds: state.placedMinds.map((m) =>
        m.id === id ? { ...m, role } : m
      ),
    })),

  updateMindPosition: (id, position) =>
    set((state) => ({
      placedMinds: state.placedMinds.map((m) =>
        m.id === id ? { ...m, position } : m
      ),
    })),

  clearJustPlaced: (id) =>
    set((state) => {
      const next = new Set(state.justPlacedIds);
      next.delete(id);
      return { justPlacedIds: next };
    }),

  setDraggingFromSidebar: (dragging) =>
    set({ isDraggingFromSidebar: dragging }),
}));
