'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Users, Puzzle, CreditCard, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Navigation tab groups
  const tabs = [
    {
      name: 'Account',
      icon: User,
      href: '/dashboard/settings/account',
      isActive: pathname.startsWith('/dashboard/settings/account') || 
                pathname.startsWith('/dashboard/settings/password') || 
                pathname.startsWith('/dashboard/settings/notifications'),
    },
    {
      name: 'Team Access',
      icon: Users,
      href: '/dashboard/settings/team',
      isActive: pathname.startsWith('/dashboard/settings/team'),
    },
    {
      name: 'Apps Hub',
      icon: Puzzle,
      href: '/dashboard/settings/apps',
      isActive: pathname.startsWith('/dashboard/settings/apps'),
    },
    {
      name: 'Billing & Invoices',
      icon: CreditCard,
      href: '/dashboard/settings/billing',
      isActive: pathname.startsWith('/dashboard/settings/billing') ||
                pathname.startsWith('/dashboard/settings/payment-method') ||
                pathname.startsWith('/dashboard/settings/invoices'),
    },
  ];

  const showBackButton = pathname !== '/dashboard/settings';

  return (
    <div className="flex flex-col min-h-full pb-10 bg-[#FAF8FF] dark:bg-gray-950 font-body-md text-gray-900 dark:text-gray-100">
      {/* Top Header / App Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard/settings')}
              className="rounded-full hover:bg-orange-50 dark:hover:bg-gray-800 text-[#ff6900] active:scale-95 transition-all"
              aria-label="Back to settings home"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold text-[#ff6900] tracking-tight">
              Business Settings
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Manage accounts, permissions, integrations and billing
            </p>
          </div>
        </div>
      </header>

      {/* Settings Navigation Tabs (Desktop Sub-navbar) */}
      <div className="hidden md:block border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-2 sticky top-[57px] z-20 shadow-sm">
        <div className="max-w-4xl mx-auto flex space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  tab.isActive
                    ? 'bg-orange-50 dark:bg-orange-950/20 text-[#ff6900] border-b-2 border-[#ff6900]'
                    : 'text-gray-600 dark:text-gray-400 hover:text-[#ff6900] dark:hover:text-orange-400 hover:bg-orange-50/30'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 md:px-6 md:py-8">
        {children}
      </main>

      {/* Bottom Tabs Navigation (Mobile Viewports Only) */}
      <nav className="fixed bottom-0 left-0 w-full z-40 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-lg flex justify-around items-center h-16 pb-safe md:hidden">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all active:scale-95 ${
                tab.isActive
                  ? 'text-[#ff6900]'
                  : 'text-gray-500 dark:text-gray-400 hover:text-orange-400'
              }`}
            >
              <Icon className={`h-5.5 w-5.5 ${tab.isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className="text-[10px] font-semibold mt-1">{tab.name.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
