'use client';

import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Navigation } from './Navigation';

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Open navigation menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 bg-sidebar p-0">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Navigate between different sections of the application
            </SheetDescription>
            <div className="flex h-full flex-col">
              <div className="border-b border-sidebar-border px-6 py-4">
                <h1 className="text-lg font-semibold text-sidebar-foreground">FinanceControll</h1>
              </div>
              <Navigation onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-sidebar-border bg-sidebar md:block">
        <div className="flex h-full flex-col">
          <div className="border-b border-sidebar-border px-6 py-4">
            <h1 className="text-lg font-semibold text-sidebar-foreground">FinanceControll</h1>
          </div>
          <Navigation />
        </div>
      </aside>
    </>
  );
}
