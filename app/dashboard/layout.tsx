// app/dashboard/layout.tsx

'use client';

import { useGetSubscriptionStatus } from '@/service/payments/hook';
import TrialCountdownTimer from '@/components/TrialCountdownTimer';
import { SubscriptionStatusEnum } from '@/service/payments/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';

// Main Dashboard Menu Components
import SideMenu from './component/SideMenu';
import { MenuContent as SideMenuContent } from './component/MenuContent';

// Top NavMenu Components
import { NavMenu } from '@/components/NavMenu';
import { NavMenuContent } from './component/NavMenuContent';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { UserAvatar } from './component/UserAvatar';
import AuthRedirect from '@/components/AuthRedirect';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const { data: subscriptionStatus } = useGetSubscriptionStatus();

  return (
    <>
      <AuthRedirect />
      {subscriptionStatus?.status === SubscriptionStatusEnum.TRIAL_ACTIVE &&
        subscriptionStatus.trialEndDate && (
          <TrialCountdownTimer
            trialEndDate={subscriptionStatus.trialEndDate}
            isPaused={subscriptionStatus.isPaused}
            isTrialPausable={subscriptionStatus.isTrialPausable}
          />
        )}
      <section className="flex w-screen h-screen overflow-hidden bg-[#F6F6F6]">
        {/* --- DESKTOP SIDEBAR (Left) --- */}
        <div className="hidden md:block w-[19rem] p-5">
          <div className="flex flex-col h-full">
            <Link
              href="/"
              className="flex items-center space-x-2 mb-5 h-[5rem]"
            >
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-3xl font-semibold">McomMall</span>
            </Link>
            <div className="flex-grow h-calc[(100vh-5rem)] overflow-y-auto">
              <SideMenu />
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 flex flex-col">
          <header className="flex items-center justify-between w-full h-20 py-3 px-5 border-b bg-slate-800">
            {/* --- LEFT SIDE: MOBILE MENU TRIGGER (for SideMenu) --- */}
            <div className="md:hidden">
              <Sheet open={isSideMenuOpen} onOpenChange={setIsSideMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-fit border-0 shadow-none"
                  >
                    <div className="flex gap-2 items-center">
                      <Menu className="h-5 w-5" />
                      <p>Dashbaord Menu</p>
                    </div>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[18rem]">
                  <div className="p-5 border-b">
                    <Link href="/" className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">M</span>
                      </div>
                      <span className="text-xl font-semibold">McomMall</span>
                    </Link>
                  </div>
                  <div className="p-4 overflow-y-auto">
                    <SideMenuContent
                      onLinkClick={() => setIsSideMenuOpen(false)}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* --- CENTER: DESKTOP NAV MENU --- */}
            <div className="flex-grow flex justify-center">
              <NavMenu />
            </div>

            {/* --- RIGHT SIDE: User Avatar & Mobile Nav Trigger --- */}
            <div className="flex items-center gap-4">
              <div className="hidden md:block">
                <UserAvatar />
              </div>
              <div className="md:hidden">
                <Sheet open={isNavMenuOpen} onOpenChange={setIsNavMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="p-4 w-[18rem] overflow-y-auto"
                  >
                    <NavMenuContent
                      onLinkClick={() => setIsNavMenuOpen(false)}
                    />
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="sm:p-5 p-2 overflow-y-auto flex-grow">
            <ProtectedRoute>{children}</ProtectedRoute>
          </div>
        </main>
      </section>
    </>
  );
}
