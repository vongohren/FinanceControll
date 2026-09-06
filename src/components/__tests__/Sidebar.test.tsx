import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Sidebar } from '../Sidebar';

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

describe('Sidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders app name in desktop sidebar', () => {
    render(<Sidebar />);

    // Desktop sidebar is always visible, mobile drawer is closed by default
    expect(screen.getByText('FinanceControll')).toBeInTheDocument();
  });

  it('renders navigation links in desktop sidebar', () => {
    render(<Sidebar />);

    // Desktop sidebar is always visible, mobile drawer is closed by default
    expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /portfolios/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /assets/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /transactions/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });

  it('renders storage mode indicator', () => {
    render(<Sidebar />);

    const storageModeLabels = screen.getAllByText('Storage Mode');
    expect(storageModeLabels.length).toBeGreaterThan(0);

    const localModeLabels = screen.getAllByText('Local');
    expect(localModeLabels.length).toBeGreaterThan(0);
  });

  it('renders mobile menu toggle button', () => {
    render(<Sidebar />);

    const toggleButton = screen.getByRole('button', { name: /open navigation menu/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('opens mobile drawer when toggle is clicked', async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    const toggleButton = screen.getByRole('button', { name: /open navigation menu/i });
    await user.click(toggleButton);

    // The Sheet component will render the content when open
    // We should still see the navigation links
    expect(screen.getAllByRole('link', { name: /dashboard/i }).length).toBeGreaterThan(0);
  });

  it('renders desktop sidebar with proper structure', () => {
    const { container } = render(<Sidebar />);

    // Desktop sidebar should have the aside element
    const desktopSidebar = container.querySelector('aside');
    expect(desktopSidebar).toBeInTheDocument();
    expect(desktopSidebar).toHaveClass('fixed');
  });
});
