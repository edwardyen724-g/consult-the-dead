/**
 * Event emitter for sound design hooks (F16).
 * Emits structured events at key moments — mind placement, connection creation,
 * debate lifecycle. No audio ships; this is the wiring layer.
 *
 * In development mode, events are logged to the console with styled output.
 */

export type AppEventType =
  | 'mind.placed'
  | 'mind.removed'
  | 'mind.role_changed'
  | 'connection.created'
  | 'connection.removed'
  | 'debate.started'
  | 'debate.message'
  | 'debate.ended'
  | 'debate.cancelled'
  | 'command_palette.opened'
  | 'command_palette.closed';

export interface AppEvent {
  type: AppEventType;
  timestamp: number;
  payload?: Record<string, unknown>;
}

type EventListener = (event: AppEvent) => void;

class EventBus {
  private listeners: Map<AppEventType | '*', Set<EventListener>> = new Map();
  private isDev: boolean;

  constructor() {
    this.isDev = typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  }

  on(type: AppEventType | '*', listener: EventListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.get(type)?.delete(listener);
    };
  }

  off(type: AppEventType | '*', listener: EventListener): void {
    this.listeners.get(type)?.delete(listener);
  }

  emit(type: AppEventType, payload?: Record<string, unknown>): void {
    const event: AppEvent = {
      type,
      timestamp: Date.now(),
      payload,
    };

    // Dev mode console logging with styled output
    if (this.isDev) {
      const colors: Record<string, string> = {
        'mind': '#6C63FF',
        'connection': '#D4A853',
        'debate': '#26A69A',
        'command_palette': '#EC407A',
      };
      const category = type.split('.')[0];
      const color = colors[category] || '#a1a1aa';
      console.log(
        `%c[event] %c${type}`,
        'color: #52525b; font-size: 10px;',
        `color: ${color}; font-weight: bold; font-size: 11px;`,
        payload || ''
      );
    }

    // Notify specific listeners
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      typeListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (err) {
          console.error(`Event listener error for ${type}:`, err);
        }
      });
    }

    // Notify wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (err) {
          console.error(`Wildcard event listener error:`, err);
        }
      });
    }
  }
}

/** Singleton event bus for the application */
export const appEvents = new EventBus();
