'use client';

import { useStorage } from '@/lib/storage/context';

export default function SettingsPage() {
  const { mode } = useStorage();

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-4 text-3xl font-bold">Settings</h1>
      <div className="space-y-6">
        <div>
          <h2 className="mb-2 text-xl font-semibold">Current Storage Mode</h2>
          <p className="text-muted-foreground">
            You are currently using:{' '}
            <span className="font-medium text-foreground">
              {mode === 'local'
                ? 'Local Storage (IndexedDB)'
                : mode === 'postgres'
                  ? 'PostgreSQL'
                  : 'Supabase'}
            </span>
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">
            Additional settings functionality coming in future updates. This page will allow you to
            configure preferences, manage data, and switch storage modes.
          </p>
        </div>
      </div>
    </div>
  );
}
