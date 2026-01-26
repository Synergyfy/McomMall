// app/dashboard/layout.tsx

'use client';

import { useGetTrialStatus } from '@/service/payments/hook';
import TrialCountdownTimer from '@/components/TrialCountdownTimer';
import { SubscriptionStatusEnum } from '@/service/payments/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, ChevronDown } from 'lucide-react';

// Main Dashboard Menu Components
import SideMenu from './component/SideMenu';
import { MenuContent as SideMenuContent } from './component/MenuContent';

// Top NavMenu Components
import { NavMenu } from '@/components/NavMenu';
import { NavMenuContent } from './component/NavMenuContent';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import UserNav from '@/components/UserNav';
import AuthRedirect from '@/components/AuthRedirect';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const { data: trialStatus } = useGetTrialStatus();

  return (
    <>
      <AuthRedirect />
      {trialStatus?.isActive && (
        <TrialCountdownTimer trialStatus={trialStatus} />
      )}
      <section className="fixed inset-0 flex w-full h-full overflow-hidden bg-[#F6F6F6]">
        {/* --- DESKTOP SIDEBAR (Left) --- */}
        <div className="hidden md:block w-[19rem] p-5">
          <div className="flex flex-col h-full">
            <Link
              href="/"
              className="flex items-center space-x-2 mb-5 h-[5rem]"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-3xl font-semibold">McomMall</span>
            </Link>
            <div className="flex-grow min-h-0 overflow-y-auto">
              <SideMenu />
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 flex flex-col">
          <header className="flex items-center justify-between w-full h-20 py-3 px-5 border-b bg-slate-800">
            {/* --- LEFT SIDE: MOBILE MENU TRIGGER --- */}
            <div className="flex items-center gap-4">
              <div className="md:hidden">
                <Sheet open={isSideMenuOpen} onOpenChange={setIsSideMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-0 shadow-none"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-[18rem] flex flex-col h-full">
                    <div className="p-5 border-b shrink-0">
                      <Link href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">M</span>
                        </div>
                        <span className="text-xl font-semibold">McomMall</span>
                      </Link>
                    </div>
                    <div className="p-4 overflow-y-auto flex-1">
                      <SideMenuContent
                        onLinkClick={() => setIsSideMenuOpen(false)}
                      />
                      <div className="mt-4 border-t pt-4">
                        <button
                          onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                          className="flex w-full items-center justify-between px-2 py-3 text-sm font-semibold text-gray-500 uppercase bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <span>Quick Actions</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${isQuickActionsOpen ? 'rotate-180' : ''}`}
                          />
                        </button>
                        {isQuickActionsOpen && (
                          <div className="mt-1 pl-1">
                            <NavMenuContent onLinkClick={() => setIsSideMenuOpen(false)} />
                          </div>
                        )}
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            {/* --- RIGHT SIDE: User Nav --- */}
            <div className="flex items-center gap-4">
              {/* User Nav (Visible on all screens, Right Aligned) */}
              <UserNav align="end" />
            </div>
          </header>

          {/* Page Content */}
          <div className="sm:p-5 p-2 overflow-y-auto flex-1 min-h-0">
            <ProtectedRoute>{children}</ProtectedRoute>
          </div>
        </main>
      </section>
    </>
  );
}
