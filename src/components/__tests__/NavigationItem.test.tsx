import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { LayoutDashboard } from 'lucide-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NavigationItem } from '../NavigationItem';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/dashboard'),
}));

describe('NavigationItem', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders link with icon and label', () => {
    render(<NavigationItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />);

    const link = screen.getByRole('link', { name: /dashboard/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('applies active styles when pathname matches href', () => {
    // Default mock returns '/dashboard', which matches this test
    render(<NavigationItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />);

    const link = screen.getByRole('link', { name: /dashboard/i });
    expect(link).toHaveClass('bg-sidebar-primary');
    expect(link).toHaveClass('text-sidebar-primary-foreground');
  });

  it('does not apply active styles when pathname does not match', () => {
    // Default mock returns '/dashboard', so '/portfolios' won't match
    render(<NavigationItem href="/portfolios" icon={LayoutDashboard} label="Portfolios" />);

    const link = screen.getByRole('link', { name: /portfolios/i });
    expect(link).not.toHaveClass('bg-sidebar-primary');
    expect(link).toHaveClass('text-sidebar-foreground');
  });

  it('calls onClick when link is clicked', async () => {
    const user = userEvent.setup();

    render(
      <NavigationItem
        href="/dashboard"
        icon={LayoutDashboard}
        label="Dashboard"
        onClick={mockOnClick}
      />,
    );

    const link = screen.getByRole('link', { name: /dashboard/i });
    await user.click(link);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('works without onClick prop', async () => {
    const user = userEvent.setup();

    render(<NavigationItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />);

    const link = screen.getByRole('link', { name: /dashboard/i });
    await user.click(link);

    // Should not throw error
    expect(link).toBeInTheDocument();
  });
});
