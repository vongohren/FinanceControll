import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock the useStorage hook at module level
vi.mock('@/lib/storage', () => ({
  useStorage: vi.fn(() => ({
    adapter: null,
    isLoading: false,
    error: null,
    mode: 'local',
    switchMode: vi.fn(),
  })),
}));

import DashboardPage from '../page';
import { useStorage } from '@/lib/storage';

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    vi.mocked(useStorage).mockReturnValue({
      adapter: null,
      isLoading: true,
      error: null,
      mode: null,
      switchMode: vi.fn(),
    });

    render(<DashboardPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays storage mode when loaded', () => {
    vi.mocked(useStorage).mockReturnValue({
      adapter: null,
      isLoading: false,
      error: null,
      mode: 'local',
      switchMode: vi.fn(),
    });

    render(<DashboardPage />);
    // Text is lowercase 'local', CSS capitalize makes it display as 'Local'
    expect(screen.getByText('local')).toBeInTheDocument();
  });

  it('displays dashboard heading when loaded', () => {
    vi.mocked(useStorage).mockReturnValue({
      adapter: null,
      isLoading: false,
      error: null,
      mode: 'local',
      switchMode: vi.fn(),
    });

    render(<DashboardPage />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('displays portfolios card with zero count', () => {
    vi.mocked(useStorage).mockReturnValue({
      adapter: null,
      isLoading: false,
      error: null,
      mode: 'local',
      switchMode: vi.fn(),
    });

    render(<DashboardPage />);
    expect(screen.getByText('Portfolios')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
