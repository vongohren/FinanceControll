import type { StorageAdapter } from '@/lib/storage/types';

// Generic CRUD repository interface
export interface Repository<T, CreateT, UpdateT = Partial<CreateT>> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: CreateT): Promise<T>;
  update(id: string, data: UpdateT): Promise<T>;
  delete(id: string): Promise<void>;
}

// Base repository class with adapter
export abstract class BaseRepository {
  constructor(protected adapter: StorageAdapter) {}

  protected get db() {
    return this.adapter.db;
  }
}
