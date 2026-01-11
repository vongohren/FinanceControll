import type { ReactNode } from 'react';
import { Sidebar } from '@/components/Sidebar';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="px-4 pt-20 md:pl-64 md:pt-8">{children}</main>
    </div>
  );
}
