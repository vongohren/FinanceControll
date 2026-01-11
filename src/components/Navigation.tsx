'use client';

import { Briefcase, Coins, LayoutDashboard, Settings, TrendingUp } from 'lucide-react';
import { useStorage } from '@/lib/storage/context';
import { NavigationItem } from './NavigationItem';

interface NavigationProps {
  onNavigate?: () => void;
}

export function Navigation({ onNavigate }: NavigationProps) {
  const { mode } = useStorage();

  return (
    <nav className="flex flex-col gap-4 px-4 py-6">
      {/* Main Navigation Section */}
      <div className="space-y-1">
        <p className="mb-2 px-3 text-xs font-semibold uppercase text-sidebar-foreground/70">Main</p>
        <NavigationItem
          href="/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
          onClick={onNavigate}
        />
        <NavigationItem
          href="/portfolios"
          icon={Briefcase}
          label="Portfolios"
          onClick={onNavigate}
        />
        <NavigationItem href="/assets" icon={Coins} label="Assets" onClick={onNavigate} />
        <NavigationItem
          href="/transactions"
          icon={TrendingUp}
          label="Transactions"
          onClick={onNavigate}
        />
      </div>

      {/* Separator */}
      <div className="h-px bg-sidebar-border" />

      {/* Settings Section */}
      <div className="space-y-1">
        <p className="mb-2 px-3 text-xs font-semibold uppercase text-sidebar-foreground/70">
          Settings
        </p>
        <NavigationItem href="/settings" icon={Settings} label="Settings" onClick={onNavigate} />
      </div>

      {/* Storage Mode Indicator */}
      <div className="mt-auto pt-4">
        <div className="rounded-lg bg-sidebar-accent px-3 py-2">
          <p className="text-xs text-sidebar-foreground/70">Storage Mode</p>
          <p className="text-sm font-medium text-sidebar-foreground">
            {mode === 'local' ? 'Local' : mode === 'postgres' ? 'PostgreSQL' : 'Supabase'}
          </p>
        </div>
      </div>
    </nav>
  );
}
