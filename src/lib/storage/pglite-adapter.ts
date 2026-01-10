import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrations } from '../db/migrations';
import * as schema from '../db/schema';
import type { DrizzleDatabase, ExportedData, StorageAdapter, StorageMode } from './types';

const DB_NAME = 'idb://financecontroll';

export class PGliteAdapter implements StorageAdapter {
  private client: PGlite | null = null;
  private _db: DrizzleDatabase | null = null;

  get db(): DrizzleDatabase {
    if (!this._db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this._db;
  }

  async connect(): Promise<void> {
    try {
      // Check if IndexedDB is available
      if (typeof window !== 'undefined' && !window.indexedDB) {
        throw new Error('IndexedDB is not available. This may happen in private/incognito mode.');
      }

      // Use IndexedDB for persistence in browser
      this.client = new PGlite(DB_NAME);
      this._db = drizzle(this.client, { schema });
    } catch (error) {
      // Handle storage quota exceeded or other errors
      if (error instanceof Error) {
        if (error.name === 'QuotaExceededError') {
          throw new Error(
            'Storage quota exceeded. Please free up some space or clear browser data.',
          );
        }
        throw error;
      }
      throw new Error('Failed to connect to local database');
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this._db = null;
    }
  }

  isConnected(): boolean {
    return this.client !== null && this._db !== null;
  }

  getMode(): StorageMode {
    return 'local';
  }

  async migrate(): Promise<void> {
    if (!this.client) {
      throw new Error('Database not connected. Call connect() first.');
    }

    // Run migrations to create all tables
    await this.client.exec(migrations);
  }

  async exportData(): Promise<ExportedData> {
    // TODO: Implement in Phase 3 after schema is complete
    // This will query all tables and return structured data
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

  async importData(_data: ExportedData): Promise<void> {
    // TODO: Implement in Phase 3 after schema is complete
    // This will clear existing data and import in a transaction
  }

  async ping(): Promise<boolean> {
    if (!this.client) {
      return false;
    }
    try {
      await this.client.exec('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
