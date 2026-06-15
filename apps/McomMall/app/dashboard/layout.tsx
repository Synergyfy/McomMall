// app/dashboard/layout.tsx

'use client';

import { useGetTrialStatus } from '@/service/payments/hooks';
import TrialCountdownTimer from '@/components/TrialCountdownTimer';
import { SubscriptionStatusEnum } from '@/service/payments/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Plus, Minus, Building2, MapPin, Compass, Globe } from 'lucide-react';

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
import { GeoProvider, useGeoContext } from '@/context/GeoContext';
import GeographicDashboard from '@/components/dashboard/GeographicDashboard';
import { CustomerPointsProvider } from '@/context/CustomerPointsContext';
import CustomerBottomNav from './component/customer/CustomerBottomNav';

function ProximityHeaderBadge() {
  const geoContext = useGeoContext();
  const badge = geoContext?.badge;
  const distanceToHighStreet = geoContext?.distanceToHighStreet;

  const storedTier = typeof window !== 'undefined' ? localStorage.getItem('businessProximityTier') : null;
  const storedDistance = typeof window !== 'undefined' ? localStorage.getItem('businessProximityDistance') : null;

  const currentTier = badge ? {
    'HIGH_STREET': 'high_street',
    'HYPERLOCAL': 'hyper_local',
    'NEARBY': 'nearby',
    'REMOTE': 'national'
  }[badge] : storedTier;

  const currentDistance = distanceToHighStreet !== undefined && distanceToHighStreet !== null
    ? distanceToHighStreet
    : storedDistance ? parseFloat(storedDistance) : null;

  if (!currentTier) return null;

  const theme = {
    high_street: {
      bg: 'bg-amber-50/80 border border-amber-200/80 text-amber-700 shadow-amber-100/40',
      dot: 'bg-amber-500',
      icon: <Building2 className="w-3.5 h-3.5 text-amber-600" />,
      label: 'High Street Verified',
    },
    hyper_local: {
      bg: 'bg-orange-50/80 border border-orange-200/80 text-orange-700 shadow-orange-100/40',
      dot: 'bg-orange-500',
      icon: <MapPin className="w-3.5 h-3.5 text-orange-600" />,
      label: `Hyper Local (${currentDistance !== null ? `${currentDistance.toFixed(1)}mi` : '<5mi'})`,
    },
    nearby: {
      bg: 'bg-emerald-50/80 border border-emerald-200/80 text-emerald-700 shadow-emerald-100/40',
      dot: 'bg-emerald-500',
      icon: <Compass className="w-3.5 h-3.5 text-emerald-600" />,
      label: `Nearby (${currentDistance !== null ? `${currentDistance.toFixed(1)}mi` : '5-10mi'})`,
    },
    national: {
      bg: 'bg-blue-50/80 border border-blue-200/80 text-blue-700 shadow-blue-100/40',
      dot: 'bg-blue-500',
      icon: <Globe className="w-3.5 h-3.5 text-blue-600" />,
      label: `National (${currentDistance !== null ? `${currentDistance.toFixed(0)}mi+` : '>10mi'})`,
    },
  }[currentTier as 'high_street' | 'hyper_local' | 'nearby' | 'national'] || {
    bg: 'bg-gray-50/80 border border-gray-200/80 text-gray-700 shadow-gray-100/40',
    dot: 'bg-gray-500',
    icon: <Globe className="w-3.5 h-3.5 text-gray-500" />,
    label: 'Community Member',
  };

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm transition-all select-none animate-fade-in shrink-0 backdrop-blur-sm ${theme.bg}`}
    >
      {theme.icon}
      <span>{theme.label}</span>
      <span className={`w-1.5 h-1.5 rounded-full animate-pulse shrink-0 ${theme.dot}`} />
    </span>
  );
}

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

  const pathname = usePathname();
  const isLocalMall = pathname === '/dashboard/localmall';
  const isEngagement = pathname.startsWith('/dashboard/engagement');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <GeoProvider>
      <CustomerPointsProvider>
        <AuthRedirect />
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
        <main className="flex-grow flex flex-col min-h-0 w-full min-w-0 max-w-full overflow-x-hidden">
          <header className="flex items-center justify-between w-full h-14 py-2 px-4 border-b border-gray-200 bg-white shadow-sm transition-all duration-300">
            {isEngagement ? (
              /* --- ENGAGEMENT HEADER --- */
              <>
                <div className="flex items-center gap-2">
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white font-black text-sm">M</span>
                    </div>
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <ProximityHeaderBadge />
                  <ActivityTimerBadge />
                  <UserNav align="end" />
                </div>
              </>
            ) : (
              /* --- DEFAULT HEADER --- */
              <>
                {/* --- LEFT SIDE: Hamburger + Desktop collapse button --- */}
                <div className="flex items-center gap-2">
                  {/* Mobile hamburger menu */}
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

                  {/* Desktop sidebar collapse toggle */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:flex hover:bg-gray-100"
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  >
                    <Menu className="h-5 w-5 text-gray-700" />
                  </Button>
                </div>

                {/* --- RIGHT SIDE: Membership, Activity Timer & User Nav (desktop only) --- */}
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="hidden sm:flex items-center gap-2 sm:gap-4">
                    <MembershipBadge />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {trialStatus?.isActive && (
                      <TrialCountdownTimer trialStatus={trialStatus} />
                    )}
                    <ProximityHeaderBadge />
                  </div>

                  {/* UserNav — compact avatar on mobile, full on desktop */}
                  <UserNav align="end" />
                </div>
              </>
            )}
          </header>

          {/* Page Content */}
          <div className={`overflow-y-auto flex-1 min-w-0 min-h-0 w-full max-w-full overflow-x-hidden ${userRole === 'customer' ? 'p-4 pb-20 md:p-6 md:pb-6' : 'sm:p-5 p-2 pb-20 sm:pb-5'}`}>
            <ProtectedRoute>
              <GeographicDashboard>
                {children}
              </GeographicDashboard>
            </ProtectedRoute>
          </div>
          
          {/* Bottom Navigation (Mobile Only) */}
          {!(pathname.includes('/add-product') || pathname.includes('/add-service') || pathname.includes('/add-listing') || pathname.includes('/events/new')) && (
            userRole === 'customer' ? (
              <CustomerBottomNav />
            ) : (
              <BottomNav onMenuClick={() => setIsSideMenuOpen(true)} />
            )
          )}
        </main>
      </section>
      </CustomerPointsProvider>
    </GeoProvider>
  );
}
