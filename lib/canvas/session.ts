import type { CanvasConnection } from '../redux/services/canvasApi';

const storageKey = 'moodio-interview-connection';
type SessionStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function getSessionSnapshot(storage?: SessionStorage): string | null {
  try {
    const target = storage ?? (typeof window === 'undefined' ? null : window.sessionStorage);
    return target?.getItem(storageKey) ?? null;
  } catch {
    return null;
  }
}

export function rememberConnection(connection: CanvasConnection, storage?: SessionStorage): void {
  try {
    const target = storage ?? (typeof window === 'undefined' ? null : window.sessionStorage);
    target?.setItem(storageKey, JSON.stringify(connection));
  } catch {
    // The current connection still works in memory if browser storage is unavailable.
  }
}

export function parseStoredConnection(snapshot: string | null): CanvasConnection | null {
  if (!snapshot) return null;
  try {
    const value: unknown = JSON.parse(snapshot);
    if (!value || typeof value !== 'object' || !('apiUrl' in value) || !('token' in value)) return null;
    if (typeof value.apiUrl !== 'string' || typeof value.token !== 'string' || !value.token.trim()) return null;
    const url = new URL(value.apiUrl);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return { apiUrl: value.apiUrl, token: value.token };
  } catch {
    return null;
  }
}
