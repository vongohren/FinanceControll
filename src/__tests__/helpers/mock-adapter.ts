import { vi } from 'vitest';
import type { ExportedData, StorageAdapter, StorageMode } from '@/lib/storage/types';

/**
 * Fully mocked adapter for component tests.
 * Use when you don't need real database operations.
 */
export function createMockAdapter(overrides: Partial<StorageAdapter> = {}): StorageAdapter {
  return {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    isConnected: vi.fn().mockReturnValue(true),
    getMode: vi.fn().mockReturnValue('local' as StorageMode),
    db: {} as StorageAdapter['db'],
    migrate: vi.fn().mockResolvedValue(undefined),
    exportData: vi.fn().mockResolvedValue({
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      portfolios: [],
      assets: [],
      transactions: [],
      valuations: [],
      exchangeRates: [],
    } satisfies ExportedData),
    importData: vi.fn().mockResolvedValue(undefined),
    ping: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
}
