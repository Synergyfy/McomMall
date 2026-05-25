// app/dashboard/layout.tsx

'use client';

import { useGetTrialStatus } from '@/service/payments/hooks';
import TrialCountdownTimer from '@/components/TrialCountdownTimer';
import { SubscriptionStatusEnum } from '@/service/payments/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState } from 'react';
import Link from 'next/link';
import { Menu, Plus, Minus } from 'lucide-react';

// Main Dashboard Menu Components
import SideMenu from './component/SideMenu';
import { MenuContent as SideMenuContent } from './component/MenuContent';
import { ActivityTimerBadge } from './component/ActivityTimerBadge';
import { MembershipBadge } from './component/MembershipBadge';
import { BottomNav } from './component/BottomNav';

// Top NavMenu Components
import { NavMenu } from '@/components/NavMenu';
import { NavMenuContent } from './component/NavMenuContent';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import UserNav from '@/components/UserNav';
import AuthRedirect from '@/components/AuthRedirect';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { data: trialStatus } = useGetTrialStatus();
  const { userRole } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <>
      <AuthRedirect />
      {trialStatus?.isActive && (
        <TrialCountdownTimer trialStatus={trialStatus} />
      )}
      <section className="fixed inset-0 flex w-full h-full overflow-hidden bg-[#F6F6F6]">
        {/* --- DESKTOP SIDEBAR (Left) --- */}
        <div className={`hidden md:block p-5 transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-[19rem]'}`}>
          <div className="flex flex-col h-full">
            <Link
              href="/"
              className={`flex items-center space-x-2 mb-5 h-[5rem] ${isSidebarCollapsed ? 'justify-center' : ''}`}
            >
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              {!isSidebarCollapsed && (
                <div className="flex flex-col">
                  <span className="text-2xl font-semibold whitespace-nowrap">McomMall</span>
                  <span className="text-[10px] font-medium uppercase bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full self-start">
                    {userRole === 'owner' ? 'Business' : 'Customer'}
                  </span>
                </div>
              )}
            </Link>
            <div className="flex-grow min-h-0 overflow-y-auto">
              <SideMenu isCollapsed={isSidebarCollapsed} />
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 flex flex-col">
          <header className="flex items-center justify-between w-full h-20 py-3 px-5 border-b border-gray-200 bg-white shadow-sm">
            {/* --- LEFT SIDE: MOBILE MENU TRIGGER & COLLAPSE TRIGGER --- */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex hover:bg-gray-100"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </Button>
              <div className="md:hidden">
                <Sheet open={isSideMenuOpen} onOpenChange={setIsSideMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:bg-gray-100"
                    >
                      <Menu className="h-5 w-5 text-gray-700" />
                    </Button>
                  </SheetTrigger>                  <SheetContent side="left" className="p-0 w-[18rem] flex flex-col h-full">
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
                          {isQuickActionsOpen ? (
                            <Minus className="h-4 w-4 transition-transform" />
                          ) : (
                            <Plus className="h-4 w-4 transition-transform" />
                          )}
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

            {/* --- RIGHT SIDE: Membership, Activity Timer & User Nav --- */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2 sm:gap-4">
                <MembershipBadge />
                <ActivityTimerBadge />
              </div>
              <UserNav align="end" />
            </div>
          </header>

          {/* Page Content */}
          <div className="sm:p-5 p-2 pb-20 sm:pb-5 overflow-y-auto flex-1 min-h-0">
            <ProtectedRoute>{children}</ProtectedRoute>
          </div>
          
          {/* Bottom Navigation (Mobile Only) */}
          <BottomNav onMenuClick={() => setIsSideMenuOpen(true)} />
        </main>
      </section>
    </>
  );
}
