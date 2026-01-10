'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { createStorageAdapter, getStoredMode, setStoredMode } from './factory';
import type { StorageAdapter, StorageConfig, StorageContextValue, StorageMode } from './types';

const StorageContext = createContext<StorageContextValue | null>(null);

interface StorageProviderProps {
  children: ReactNode;
}

export function StorageProvider({ children }: StorageProviderProps) {
  const [adapter, setAdapter] = useState<StorageAdapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mode, setMode] = useState<StorageMode | null>(null);

  // Initialize adapter from stored config on mount
  useEffect(() => {
    async function init() {
      try {
        const storedConfig = getStoredMode();
        if (storedConfig) {
          const newAdapter = await createStorageAdapter(storedConfig);
          await newAdapter.connect();
          setAdapter(newAdapter);
          setMode(storedConfig.mode);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize storage'));
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, []);

  const switchMode = useCallback(
    async (config: StorageConfig) => {
      setIsLoading(true);
      setError(null);

      try {
        // Disconnect existing adapter
        if (adapter) {
          await adapter.disconnect();
        }

        // Create and connect new adapter
        const newAdapter = await createStorageAdapter(config);
        await newAdapter.connect();
        await newAdapter.migrate();

        // Persist the mode
        setStoredMode(config);

        setAdapter(newAdapter);
        setMode(config.mode);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to switch storage mode'));
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [adapter],
  );

  const value: StorageContextValue = {
    adapter,
    isLoading,
    error,
    mode,
    switchMode,
  };

  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
}

export function useStorage(): StorageContextValue {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}
