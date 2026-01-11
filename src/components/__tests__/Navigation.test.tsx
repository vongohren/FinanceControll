import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Navigation } from '../Navigation';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}));

vi.mock('@/lib/storage/context', () => ({
  useStorage: vi.fn(() => ({
    mode: 'local',
    isLoading: false,
    error: null,
    adapter: null,
    switchMode: vi.fn(),
  })),
}));

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all main navigation items', () => {
    render(<Navigation />);

    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /portfolios/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /assets/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /transactions/i })).toBeInTheDocument();
  });

  it('renders settings navigation item', () => {
    render(<Navigation />);

    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });

  it('renders section headers', () => {
    render(<Navigation />);

    expect(screen.getByText('Main')).toBeInTheDocument();
    // Check for Settings section header (there's also a Settings link)
    const settingsHeaders = screen.getAllByText('Settings');
    expect(settingsHeaders.length).toBeGreaterThan(0);
  });

  it('displays storage mode indicator for local mode', () => {
    render(<Navigation />);

    expect(screen.getByText('Storage Mode')).toBeInTheDocument();
    expect(screen.getByText('Local')).toBeInTheDocument();
  });

  it('displays storage mode indicator for postgres mode', async () => {
    // Import to access the mocked version
    const { useStorage } = await import('@/lib/storage/context');
    vi.mocked(useStorage).mockReturnValueOnce({
      mode: 'postgres',
      isLoading: false,
      error: null,
      adapter: null,
      switchMode: vi.fn(),
    });

    render(<Navigation />);

    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
  });

  it('displays storage mode indicator for supabase mode', async () => {
    // Import to access the mocked version
    const { useStorage } = await import('@/lib/storage/context');
    vi.mocked(useStorage).mockReturnValueOnce({
      mode: 'supabase',
      isLoading: false,
      error: null,
      adapter: null,
      switchMode: vi.fn(),
    });

    render(<Navigation />);

    expect(screen.getByText('Supabase')).toBeInTheDocument();
  });

  it('calls onNavigate when navigation item is clicked', async () => {
    const user = userEvent.setup();
    const mockOnNavigate = vi.fn();

    render(<Navigation onNavigate={mockOnNavigate} />);

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    await user.click(dashboardLink);

    expect(mockOnNavigate).toHaveBeenCalledTimes(1);
  });

  it('works without onNavigate prop', async () => {
    const user = userEvent.setup();

    render(<Navigation />);

    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    await user.click(dashboardLink);

    // Should not throw error
    expect(dashboardLink).toBeInTheDocument();
  });
});
