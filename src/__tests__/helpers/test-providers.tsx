import { type RenderOptions, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import type { StorageContextValue } from '@/lib/storage/types';
import { createMockAdapter } from './mock-adapter';

interface TestProvidersProps {
  children: ReactNode;
  storageValue?: Partial<StorageContextValue>;
}

/**
 * Wrapper component with all necessary providers for testing.
 */
export function TestProviders({ children, storageValue }: TestProvidersProps) {
  // For now, just render children directly
  // The storage context is typically mocked at the module level in component tests
  // This wrapper can be extended in the future for other providers
  void storageValue; // Acknowledge the parameter for future use
  return <>{children}</>;
}

/**
 * Default mock storage context value for testing.
 */
export function createMockStorageContext(
  overrides: Partial<StorageContextValue> = {},
): StorageContextValue {
  return {
    adapter: createMockAdapter(),
    isLoading: false,
    error: null,
    mode: 'local',
    switchMode: async () => {},
    ...overrides,
  };
}

/**
 * Custom render function that wraps components with test providers.
 */
export function renderWithProviders(
  ui: ReactNode,
  options?: {
    storageValue?: Partial<StorageContextValue>;
    renderOptions?: Omit<RenderOptions, 'wrapper'>;
  },
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <TestProviders storageValue={options?.storageValue}>{children}</TestProviders>
    ),
    ...options?.renderOptions,
  });
}
