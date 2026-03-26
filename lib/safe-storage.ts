// Safe localStorage wrapper — prevents crashes when storage is blocked
// (incognito mode in some browsers, storage quota exceeded, etc.)

export function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage full or blocked — silently fail
  }
}

export function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {}
}
