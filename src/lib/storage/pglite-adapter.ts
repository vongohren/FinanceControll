import type { StorageAdapter, StorageMode, ExportedData, DrizzleDatabase } from './types';

export class PGliteAdapter implements StorageAdapter {
  private connected = false;
  private _db: DrizzleDatabase | null = null;

  get db(): DrizzleDatabase {
    if (!this._db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this._db;
  }

  async connect(): Promise<void> {
    // TODO: Implement in Task 3
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this._db = null;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getMode(): StorageMode {
    return 'local';
  }

  async migrate(): Promise<void> {
    // TODO: Implement in Task 3
  }

  async exportData(): Promise<ExportedData> {
    // TODO: Implement in Phase 3
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
    // TODO: Implement in Phase 3
  }

  async ping(): Promise<boolean> {
    return this.connected;
  }
}
