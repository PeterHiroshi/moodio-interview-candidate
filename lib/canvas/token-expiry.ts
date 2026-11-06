export function readTokenExpiry(token: string): number | null {
  const parts = token.split('.');
  if (parts.length !== 2 || !parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))) return null;
  try {
    const encoded = parts[0].replace(/-/g, '+').replace(/_/g, '/');
    const payload: unknown = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')));
    if (!payload || typeof payload !== 'object' || !('exp' in payload)) return null;
    const expiry = payload.exp;
    return typeof expiry === 'number' && Number.isSafeInteger(expiry) && expiry > 0 ? expiry : null;
  } catch {
    return null;
  }
}

export function remainingTime(expiresAt: number, now: number): string {
  const seconds = Math.max(0, Math.ceil((expiresAt - now) / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const tail = `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  return hours > 0 ? `${String(hours).padStart(2, '0')}:${tail}` : tail;
}
