import type { ClubData } from '../components/ClubEditModal';

export const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const CACHE_KEY = 'golf-shot-distances:clubs:v1';

interface ClubsCacheEntry {
  savedAt: number;
  clubs: ClubData[];
}

function isClubData(value: unknown): value is ClubData {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ClubData).Club === 'string'
  );
}

function isValidEntry(value: unknown): value is ClubsCacheEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as ClubsCacheEntry;
  return (
    typeof entry.savedAt === 'number' &&
    Array.isArray(entry.clubs) &&
    entry.clubs.every(isClubData)
  );
}

export function readClubsCache(): ClubsCacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isValidEntry(parsed)) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed;
  } catch {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {
      // ignore quota / private-mode errors on cleanup
    }
    return null;
  }
}

export function writeClubsCache(clubs: ClubData[]): void {
  try {
    const entry: ClubsCacheEntry = { savedAt: Date.now(), clubs };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // ignore quota / private-mode errors
  }
}

export function clearClubsCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // ignore
  }
}
