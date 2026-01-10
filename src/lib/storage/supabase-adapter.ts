import type { DrizzleDatabase, ExportedData, StorageAdapter, StorageMode } from './types';

export class SupabaseAdapter implements StorageAdapter {
  private connected = false;
  private _db: DrizzleDatabase | null = null;

  constructor(
    private supabaseUrl: string,
    private supabaseAnonKey: string,
  ) {
    // Credentials stored for future use
    void this.supabaseUrl;
    void this.supabaseAnonKey;
  }

  get db(): DrizzleDatabase {
    if (!this._db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this._db;
  }

  async connect(): Promise<void> {
    // TODO: Implement in Phase 5
    throw new Error('SupabaseAdapter not implemented yet');
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this._db = null;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getMode(): StorageMode {
    return 'supabase';
  }

  async migrate(): Promise<void> {
    // TODO: Implement in Phase 5
    throw new Error('SupabaseAdapter not implemented yet');
  }

  async exportData(): Promise<ExportedData> {
    // TODO: Implement in Phase 5
    throw new Error('SupabaseAdapter not implemented yet');
  }

  async importData(_data: ExportedData): Promise<void> {
    // TODO: Implement in Phase 5
    throw new Error('SupabaseAdapter not implemented yet');
  }

  async ping(): Promise<boolean> {
    return this.connected;
  }
}
