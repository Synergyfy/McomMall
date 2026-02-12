// app/dashboard/layout.tsx

'use client';

import { useGetTrialStatus } from '@/service/payments/hooks';
import HeaderTimer from '@/components/HeaderTimer';
import { SubscriptionStatusEnum } from '@/service/payments/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import AuthRedirect from '../../components/AuthRedirect';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Menu, ChevronDown, Zap } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

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
import { useGetMyMembership } from '@/service/membership/hooks';


function DashboardRedirect({
  mounted,
  userRole,
  membership,
  isMembershipLoading
}: {
  mounted: boolean;
  userRole: string | null;
  membership: any;
  isMembershipLoading: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    if (mounted && !isMembershipLoading && userRole === 'owner') {
      const hasActiveMembership = !!membership?.isActive;
      const normalizedPath = pathname.toLowerCase();
      const isSubscriptionFlow = normalizedPath.includes('/my-subscription');
      const isSuccessRedirect = searchParams.get('success') === 'true';

      if (!hasActiveMembership && !isSubscriptionFlow && !isSuccessRedirect) {
        router.push('/dashboard/my-subscription');
      }
    }
  }, [mounted, userRole, membership, isMembershipLoading, pathname, router, searchParams]);

  return null;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const { data: trialStatus } = useGetTrialStatus();

  const { userRole, packageInfo } = useSelector((state: RootState) => state.auth);
  const { data: membership, isLoading: isMembershipLoading } = useGetMyMembership();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Zap className="w-8 h-8 text-orange-600 animate-pulse" /></div>}>
      <AuthRedirect />
      <DashboardRedirect
        mounted={mounted}
        userRole={userRole}
        membership={membership}
        isMembershipLoading={isMembershipLoading}
      />
      <section className="fixed inset-0 flex w-full h-full overflow-hidden bg-[#F6F6F6]">
        {/* ... existing section content ... */}
        <div className="hidden md:block w-[19rem] p-5">
          <div className="flex flex-col h-full">
            <Link
              href="/"
              className="flex items-center space-x-2 mb-5 h-[5rem]"
            >
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-semibold leading-tight">McomMall</span>
              </div>
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

            {/* --- RIGHT SIDE: User Nav & Timer --- */}
            <div className="flex items-center gap-4">
              {userRole === 'owner' && membership?.tier && (
                <div className="hidden sm:flex items-center px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl mr-2 group hover:border-orange-500/30 transition-all">
                  <div className="flex flex-col items-end">
                    <span className="text-[12px] text-gray-400 uppercase font-black tracking-[0.2em] group-hover:text-orange-400 transition-colors">Current Membership</span>
                    <span className="text-xl font-bold text-white group-hover:text-orange-500 transition-colors">{membership.tier.name}</span>
                  </div>
                  <div className="ml-3 p-1.5 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                    <Zap className="w-4 h-4 text-orange-500" />
                  </div>
                </div>
              )}
              <HeaderTimer />
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
    </Suspense>
  );
}
