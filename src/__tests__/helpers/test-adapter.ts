import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import type { StorageAdapter, StorageMode, ExportedData } from '@/lib/storage/types';
import * as schema from '@/lib/db/schema';
import { migrations } from '@/lib/db/migrations';

/**
 * In-memory PGlite adapter for testing.
 * Uses memory instead of idb:// to avoid IndexedDB dependency.
 */
export class TestPGliteAdapter implements StorageAdapter {
  private client: PGlite | null = null;
  private _db: ReturnType<typeof drizzle> | null = null;

  get db() {
    if (!this._db) {
      throw new Error('Database not connected');
    }
    return this._db;
  }

  async connect(): Promise<void> {
    // In-memory database - no IndexedDB required
    this.client = new PGlite();
    this._db = drizzle(this.client, { schema });
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this._db = null;
    }
  }

  isConnected(): boolean {
    return this.client !== null;
  }

  getMode(): StorageMode {
    return 'local';
  }

  async migrate(): Promise<void> {
    if (!this.client) throw new Error('Not connected');
    await this.client.exec(migrations);
  }

  async exportData(): Promise<ExportedData> {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      portfolios: [],
      assets: [],
      transactions: [],
      valuations: [],
      exchangeRates: [],
    };
  }

  async importData(_data: ExportedData): Promise<void> {}

  async ping(): Promise<boolean> {
    if (!this.client) return false;
    try {
      await this.client.exec('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Creates a fresh test adapter with migrations applied.
 */
export async function createTestAdapter(): Promise<TestPGliteAdapter> {
  const adapter = new TestPGliteAdapter();
  await adapter.connect();
  await adapter.migrate();
  return adapter;
}
