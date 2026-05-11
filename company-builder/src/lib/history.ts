import type { HistoryState } from '../types';

export function createHistoryState<T>(present: T): HistoryState<T> {
  return {
    past: [],
    present,
    future: [],
  };
}

export function canUndo<T>(history: HistoryState<T>): boolean {
  return history.past.length > 0;
}

export function canRedo<T>(history: HistoryState<T>): boolean {
  return history.future.length > 0;
}

export function commitHistory<T>(history: HistoryState<T>, nextPresent: T): HistoryState<T> {
  if (Object.is(history.present, nextPresent)) {
    return history;
  }

  return {
    past: [...history.past, history.present],
    present: nextPresent,
    future: [],
  };
}

export function undoHistory<T>(history: HistoryState<T>): HistoryState<T> {
  if (!canUndo(history)) {
    return history;
  }

  const past = history.past.slice();
  const previous = past.pop() as T;

  return {
    past,
    present: previous,
    future: [history.present, ...history.future],
  };
}

export function redoHistory<T>(history: HistoryState<T>): HistoryState<T> {
  if (!canRedo(history)) {
    return history;
  }

  const [nextPresent, ...future] = history.future;

  return {
    past: [...history.past, history.present],
    present: nextPresent,
    future,
  };
}

export function resetHistory<T>(present: T): HistoryState<T> {
  return createHistoryState(present);
}
