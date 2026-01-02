'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStorage } from '@/lib/storage';

export default function SetupPage() {
  const router = useRouter();
  const { switchMode } = useStorage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLocalSetup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await switchMode({ mode: 'local' });
      document.cookie = 'storage-mode=local; path=/; max-age=31536000';
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to initialize local storage:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to initialize local storage'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Welcome to FinanceControll</h1>
          <p className="text-muted-foreground">
            Your data, your control. Choose how to store your financial data.
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Card className="border-2 hover:border-primary cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Local Only
                <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 px-2 py-1 rounded">
                  Recommended
                </span>
              </CardTitle>
              <CardDescription>
                Data stays on this device. No account needed. Works offline.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleLocalSetup}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Initializing...' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardHeader>
              <CardTitle>Connect Your Database</CardTitle>
              <CardDescription>
                Bring your own Postgres or Supabase. You control the
                infrastructure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled variant="outline" className="w-full">
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="opacity-60">
            <CardHeader>
              <CardTitle>Use Hosted Service</CardTitle>
              <CardDescription>
                We manage everything. Create an account to sync across devices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button disabled variant="outline" className="w-full">
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Your financial data never leaves your device with local storage.
        </p>
      </div>
    </div>
  );
}
