'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStorage } from '@/lib/storage';

export default function DashboardPage() {
  const { mode, isLoading } = useStorage();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to FinanceControll. Your privacy-first investment tracker.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Storage Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold capitalize">{mode || 'Unknown'}</p>
            <p className="text-xs text-muted-foreground">
              {mode === 'local' && 'Data stored locally on this device'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Portfolios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">
              Create your first portfolio to get started
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-</p>
            <p className="text-xs text-muted-foreground">Add assets to see your total value</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            FinanceControll helps you track investments in startups, funds, state obligations,
            crypto, and other assets.
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
            <li>Create portfolios to organize your investments</li>
            <li>Add assets and track their valuations over time</li>
            <li>Record transactions to calculate cost basis</li>
            <li>View performance with built-in analytics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
