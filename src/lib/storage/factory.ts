import type { StorageAdapter, StorageConfig } from './types';

const STORAGE_MODE_KEY = 'financecontroll_storage_mode';

export async function createStorageAdapter(config: StorageConfig): Promise<StorageAdapter> {
  switch (config.mode) {
    case 'local': {
      const { PGliteAdapter } = await import('./pglite-adapter');
      return new PGliteAdapter();
    }
    case 'postgres': {
      const { PostgresAdapter } = await import('./postgres-adapter');
      if (!config.connectionString) {
        throw new Error('Connection string required for postgres mode');
      }
      return new PostgresAdapter(config.connectionString);
    }
    case 'supabase': {
      const { SupabaseAdapter } = await import('./supabase-adapter');
      if (!config.supabaseUrl || !config.supabaseAnonKey) {
        throw new Error('Supabase URL and anon key required for supabase mode');
      }
      return new SupabaseAdapter(config.supabaseUrl, config.supabaseAnonKey);
    }
    default:
      throw new Error(`Unknown storage mode: ${config.mode}`);
  }
}

export function getStoredMode(): StorageConfig | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(STORAGE_MODE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as StorageConfig;
  } catch {
    return null;
  }
}

export function setStoredMode(config: StorageConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_MODE_KEY, JSON.stringify(config));
}

export function clearStoredMode(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_MODE_KEY);
}
