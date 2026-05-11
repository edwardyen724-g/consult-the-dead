import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/events', () => ({
  appEvents: {
    emit: vi.fn(),
  },
}));
import { generateConnectionId, generatePlacementId, useCompanyStore } from './companyStore';
import { type Connection, type PlacedMind } from '@/types';

const BASE_COMPANY = {
  name: 'Untitled Company',
  mission: 'Define your mission...',
};

const BASE_HISTORY = { undo: null, redo: null } as const;

function createLocalStorageMock() {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  } as Storage;
}

function seedStore(overrides: Partial<ReturnType<typeof useCompanyStore.getState>> = {}) {
  useCompanyStore.setState({
    company: { ...BASE_COMPANY },
    placedMinds: [],
    connections: [],
    history: { ...BASE_HISTORY },
    selectedMindId: null,
    justPlacedIds: new Set<string>(),
    isDraggingFromSidebar: false,
    draggedArchetypeId: null,
    hoveredSidebarArchetypeId: null,
    saveIndicatorVisible: false,
    hydrated: false,
    connectionContextMenu: null,
    justCreatedConnectionIds: new Set<string>(),
    ...overrides,
  });
}

function readPersistedState() {
  const raw = localStorage.getItem('greatmind-company-builder');
  expect(raw).not.toBeNull();
  return JSON.parse(raw as string) as Record<string, unknown>;
}

function createMind(id: string, position: { x: number; y: number }, role: PlacedMind['role'] = null): PlacedMind {
  return {
    id,
    archetypeId: `arch-${id}`,
    role,
    position,
  };
}

describe('company store persistence and undo/redo', () => {
  const localStorageMock = createLocalStorageMock();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('localStorage', localStorageMock);
    localStorageMock.clear();
    seedStore();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    localStorageMock.clear();
    seedStore();
  });

  it('hydrates legacy version 1 saves and version 2 snapshots', () => {
    const legacyMind = createMind('mind-1', { x: 100, y: 200 }, 'ceo');
    localStorage.setItem(
      'greatmind-company-builder',
      JSON.stringify({
        version: 1,
        company: {
          name: 'Legacy Co',
          mission: 'ship quickly',
        },
        placedMinds: [legacyMind],
        connections: [],
        debates: [],
        savedAt: '2026-05-10T00:00:00.000Z',
      })
    );

    useCompanyStore.getState().hydrateFromLocalStorage();

    expect(useCompanyStore.getState().hydrated).toBe(true);
    expect(useCompanyStore.getState().company).toEqual({
      name: 'Legacy Co',
      mission: 'ship quickly',
    });
    expect(useCompanyStore.getState().placedMinds).toEqual([legacyMind]);
    expect(useCompanyStore.getState().history).toEqual(BASE_HISTORY);
    expect(useCompanyStore.getState().selectedMindId).toBeNull();

    const snapshot = {
      undo: {
        company: {
          name: 'Undo Co',
          mission: 'undo mission',
        },
        placedMinds: [createMind('mind-undo', { x: 25, y: 50 }, 'cto')],
        connections: [{
          id: 'conn-undo',
          sourceId: 'mind-undo',
          targetId: 'mind-1',
          type: 'reporting' as const,
        }],
        selectedMindId: 'mind-undo',
      },
      redo: {
        company: {
          name: 'Redo Co',
          mission: 'redo mission',
        },
        placedMinds: [createMind('mind-redo', { x: 300, y: 400 }, 'cfo')],
        connections: [],
        selectedMindId: 'mind-redo',
      },
    };

    localStorage.setItem(
      'greatmind-company-builder',
      JSON.stringify({
        version: 2,
        company: {
          name: 'Versioned Co',
          mission: 'versioned mission',
        },
        placedMinds: [createMind('mind-2', { x: 10, y: 20 }, 'coo')],
        connections: [],
        selectedMindId: 'mind-2',
        history: snapshot,
        debates: [],
        savedAt: '2026-05-10T01:00:00.000Z',
      })
    );

    useCompanyStore.getState().hydrateFromLocalStorage();

    expect(useCompanyStore.getState().company).toEqual({
      name: 'Versioned Co',
      mission: 'versioned mission',
    });
    expect(useCompanyStore.getState().selectedMindId).toBe('mind-2');
    expect(useCompanyStore.getState().history).toEqual(snapshot);
  });

  it('captures undo/redo snapshots and ignores no-op edits', () => {
    const alice = createMind('mind-alice', { x: 25, y: 50 }, 'ceo');
    const bob = createMind('mind-bob', { x: 400, y: 320 }, 'cto');
    const connection: Connection = {
      id: 'conn-mind-alice-mind-bob',
      sourceId: alice.id,
      targetId: bob.id,
      type: 'reporting',
    };

    seedStore({
      company: {
        name: 'Acme',
        mission: 'make things',
      },
      placedMinds: [alice, bob],
      connections: [connection],
      selectedMindId: bob.id,
    });

    useCompanyStore.getState().updateMindRole(alice.id, alice.role);
    useCompanyStore.getState().updateMindPosition(alice.id, alice.position);
    useCompanyStore.getState().addConnection(bob.id, alice.id, 'collaboration');
    useCompanyStore.getState().removeConnection('missing-connection');
    useCompanyStore.getState().toggleConnectionType('missing-connection');

    expect(useCompanyStore.getState().connections).toEqual([connection]);
    expect(useCompanyStore.getState().history).toEqual(BASE_HISTORY);

    useCompanyStore.getState().setCompanyName('Acme Labs');
    useCompanyStore.getState().setCompanyMission('ship the product');
    useCompanyStore.getState().updateMindRole(alice.id, 'cto');
    useCompanyStore.getState().updateMindPosition(alice.id, { x: 100, y: 120 });
    useCompanyStore.getState().addConnection(alice.id, bob.id, 'collaboration');
    useCompanyStore.getState().toggleConnectionType(connection.id);
    useCompanyStore.getState().removeMind(bob.id);

    expect(useCompanyStore.getState().company).toEqual({
      name: 'Acme Labs',
      mission: 'ship the product',
    });
    expect(useCompanyStore.getState().placedMinds).toEqual([
      {
        ...alice,
        role: 'cto',
        position: { x: 100, y: 120 },
      },
    ]);
    expect(useCompanyStore.getState().connections).toEqual([]);
    expect(useCompanyStore.getState().selectedMindId).toBeNull();
    expect(useCompanyStore.getState().history.undo).toEqual({
      company: {
        name: 'Acme Labs',
        mission: 'ship the product',
      },
      placedMinds: [
        {
          ...alice,
          role: 'cto',
          position: { x: 100, y: 120 },
        },
        bob,
      ],
      connections: [
        {
          id: 'conn-mind-alice-mind-bob',
          sourceId: alice.id,
          targetId: bob.id,
          type: 'collaboration',
        },
      ],
      selectedMindId: bob.id,
    });

    const persistedAfterRemove = readPersistedState();
    expect(persistedAfterRemove.version).toBe(2);
    expect((persistedAfterRemove.history as { undo: unknown; redo: unknown }).redo).toBeNull();

    useCompanyStore.getState().undo();

    expect(useCompanyStore.getState().company).toEqual({
      name: 'Acme Labs',
      mission: 'ship the product',
    });
    expect(useCompanyStore.getState().placedMinds).toEqual([
      {
        ...alice,
        role: 'cto',
        position: { x: 100, y: 120 },
      },
      bob,
    ]);
    expect(useCompanyStore.getState().connections).toEqual([
      {
        id: 'conn-mind-alice-mind-bob',
        sourceId: alice.id,
        targetId: bob.id,
        type: 'collaboration',
      },
    ]);
    expect(useCompanyStore.getState().selectedMindId).toBe(bob.id);
    expect(useCompanyStore.getState().history.redo).toEqual({
      company: {
        name: 'Acme Labs',
        mission: 'ship the product',
      },
      placedMinds: [
        {
          ...alice,
          role: 'cto',
          position: { x: 100, y: 120 },
        },
      ],
      connections: [],
      selectedMindId: null,
    });

    useCompanyStore.getState().redo();

    expect(useCompanyStore.getState().company.name).toBe('Acme Labs');
    expect(useCompanyStore.getState().placedMinds).toEqual([
      {
        ...alice,
        role: 'cto',
        position: { x: 100, y: 120 },
      },
    ]);
    expect(useCompanyStore.getState().connections).toEqual([]);
    expect(useCompanyStore.getState().selectedMindId).toBeNull();
  });

  it('exports version 2 saves and rejects malformed imports', async () => {
    seedStore({
      company: {
        name: 'Northstar Labs',
        mission: 'ship a focused product',
      },
      placedMinds: [createMind('mind-export', { x: 12, y: 34 }, 'advisor')],
      connections: [],
      selectedMindId: 'mind-export',
    });

    const appendChild = vi.fn();
    const removeChild = vi.fn();
    const click = vi.fn();
    const anchor = {
      href: '',
      download: '',
      click,
    } as HTMLAnchorElement;
    const createElement = vi.fn(() => anchor);
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockImplementation((blob: Blob) => {
      void blob;
      return 'blob:company-export';
    });
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const documentMock = {
      body: {
        appendChild,
        removeChild,
      },
      createElement,
    } as unknown as Document;
    vi.stubGlobal('document', documentMock);

    useCompanyStore.getState().exportToJSON();

    expect(createElement).toHaveBeenCalledWith('a');
    expect(click).toHaveBeenCalledTimes(1);
    expect(anchor.download).toMatch(/^northstar-labs-\d{4}-\d{2}-\d{2}\.json$/);
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:company-export');
    expect(appendChild).toHaveBeenCalledWith(anchor);
    expect(removeChild).toHaveBeenCalledWith(anchor);

    const exportedJson = await (createObjectURL.mock.calls[0]?.[0] as Blob).text();
    const exported = JSON.parse(exportedJson) as {
      version: number;
      company: { name: string; mission: string };
      selectedMindId: string | null;
      history: { undo: unknown; redo: unknown };
      debates: unknown[];
    };
    expect(exported.version).toBe(2);
    expect(exported.company).toEqual({
      name: 'Northstar Labs',
      mission: 'ship a focused product',
    });
    expect(exported.selectedMindId).toBe('mind-export');
    expect(exported.history).toEqual(BASE_HISTORY);
    expect(exported.debates).toEqual([]);

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    useCompanyStore.getState().importFromJSON('{"version":99}');
    useCompanyStore.getState().importFromJSON('{not-json');

    expect(consoleError).toHaveBeenCalledTimes(2);
    consoleError.mockRestore();
  });

  it('covers utility setters, storage failure fallback, and import branches', () => {
    const extraMind = createMind('mind-extra', { x: 1, y: 2 }, 'advisor');
    const throwingStorage = {
      get length() {
        return 0;
      },
      key() {
        return null;
      },
      getItem() {
        return null;
      },
      setItem() {
        throw new Error('quota exceeded');
      },
      removeItem() {
        return undefined;
      },
      clear() {
        return undefined;
      },
    } as Storage;

    expect(generatePlacementId('arch')).toMatch(/^arch-\d+-\d+$/);
    expect(generateConnectionId('alpha', 'beta')).toMatch(/^conn-alpha-beta-\d+$/);

    useCompanyStore.getState().undo();
    useCompanyStore.getState().redo();
    useCompanyStore.getState().clearJustPlaced('missing');
    useCompanyStore.getState().clearJustCreatedConnection('missing');

    useCompanyStore.getState().setDraggingFromSidebar(true);
    useCompanyStore.getState().setDraggedArchetypeId('arch-1');
    useCompanyStore.getState().setHoveredSidebarArchetypeId('arch-2');
    useCompanyStore.getState().setSelectedMindId('mind-selected');
    useCompanyStore.getState().setConnectionContextMenu({
      connectionId: 'conn-1',
      x: 12,
      y: 24,
    });
    useCompanyStore.getState().addMind(extraMind);
    useCompanyStore.getState().clearJustPlaced(extraMind.id);
    useCompanyStore.getState().removeMind('missing-mind');

    expect(useCompanyStore.getState().isDraggingFromSidebar).toBe(true);
    expect(useCompanyStore.getState().draggedArchetypeId).toBe('arch-1');
    expect(useCompanyStore.getState().hoveredSidebarArchetypeId).toBe('arch-2');
    expect(useCompanyStore.getState().selectedMindId).toBe('mind-selected');
    expect(useCompanyStore.getState().connectionContextMenu).toEqual({
      connectionId: 'conn-1',
      x: 12,
      y: 24,
    });
    expect(useCompanyStore.getState().placedMinds).toEqual([extraMind]);
    expect(useCompanyStore.getState().justPlacedIds.has(extraMind.id)).toBe(false);
    vi.runOnlyPendingTimers();

    localStorageMock.clear();
    seedStore();
    useCompanyStore.getState().hydrateFromLocalStorage();
    expect(useCompanyStore.getState().hydrated).toBe(true);
    expect(useCompanyStore.getState().company).toEqual(BASE_COMPANY);

    const sourceMind = createMind('mind-source', { x: 10, y: 10 }, 'ceo');
    const targetMind = createMind('mind-target', { x: 40, y: 40 }, 'cto');
    seedStore({
      placedMinds: [sourceMind, targetMind],
      selectedMindId: sourceMind.id,
    });

    useCompanyStore.getState().addConnection(sourceMind.id, targetMind.id, 'reporting');
    const createdConnectionId = useCompanyStore.getState().connections[0]?.id;
    expect(createdConnectionId).toMatch(/^conn-mind-source-mind-target-\d+$/);
    useCompanyStore.getState().undo();
    useCompanyStore.getState().redo();
    expect(useCompanyStore.getState().connections).toHaveLength(1);
    useCompanyStore.getState().removeConnection(createdConnectionId as string);
    expect(useCompanyStore.getState().connections).toEqual([]);
    vi.runOnlyPendingTimers();

    vi.stubGlobal('localStorage', throwingStorage);
    useCompanyStore.getState().setCompanyName('Fallback Co');
    expect(useCompanyStore.getState().company.name).toBe('Fallback Co');
    expect(useCompanyStore.getState().saveIndicatorVisible).toBe(false);

    vi.stubGlobal('localStorage', localStorageMock);
    localStorageMock.clear();
    seedStore();

    const importedMind = createMind('mind-import', { x: 77, y: 88 }, 'ceo');
    const importedDebates = [
      {
        id: 'deb-1',
        topic: 'Should we expand?',
        participantIds: ['mind-import'],
        participantArchetypeIds: ['arch-mind-import'],
        messages: [],
        status: 'complete' as const,
        startedAt: '2026-05-10T00:00:00.000Z',
        completedAt: '2026-05-10T00:01:00.000Z',
        companyName: 'Imported Co',
        companyMission: 'ship with focus',
        researchBriefing: 'briefing',
        researchSources: [],
        documents: [],
      },
    ];

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    useCompanyStore.getState().importFromJSON(JSON.stringify({
      version: 1,
      company: {
        name: 'Imported Legacy',
        mission: 'legacy mission',
      },
      placedMinds: [importedMind],
      connections: [],
      debates: importedDebates,
      savedAt: '2026-05-10T01:00:00.000Z',
    }));

    expect(useCompanyStore.getState().company).toEqual({
      name: 'Imported Legacy',
      mission: 'legacy mission',
    });
    expect(useCompanyStore.getState().selectedMindId).toBeNull();
    expect(useCompanyStore.getState().history).toEqual(BASE_HISTORY);
    expect(JSON.parse(localStorage.getItem('greatmind-debates') as string)).toEqual(importedDebates);

    useCompanyStore.getState().importFromJSON(JSON.stringify({
      version: 2,
      company: {
        name: 'Imported Modern',
        mission: 'modern mission',
      },
      placedMinds: [importedMind],
      connections: [],
      selectedMindId: 'mind-import',
      history: {
        undo: null,
        redo: null,
      },
      debates: [],
      savedAt: '2026-05-10T02:00:00.000Z',
    }));

    expect(useCompanyStore.getState().selectedMindId).toBe('mind-import');

    useCompanyStore.getState().importFromJSON(JSON.stringify({
      version: 2,
      company: {
        name: 'Broken',
        mission: 'broken mission',
      },
      placedMinds: [importedMind],
    }));

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
