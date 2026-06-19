'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Award, ClipboardCheck, Ticket, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MembershipAuditsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    { name: 'Overview', href: '/dashboard/membership-audits', icon: Home, exact: true },
    { name: 'Membership', href: '/dashboard/membership-audits/membership', icon: Award },
    { name: 'Audits', href: '/dashboard/membership-audits/audits', icon: ClipboardCheck },
    { name: 'Vouchers & Credits', href: '/dashboard/membership-audits/vouchers', icon: Ticket },
    { name: 'Reports', href: '/dashboard/membership-audits/reports', icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col space-y-6 w-full min-h-screen pb-12">
      {/* Sub Header */}
      <div className="flex flex-col gap-1 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-[#0b1c30]">
          Growth Support & Guidance
        </h1>
        <p className="text-sm text-gray-500">
          Manage your membership tier, audit your digital storefront, and claim promotional growth credits.
        </p>
      </div>

      {/* Tabbed sub-nav */}
      <div className="bg-white border border-gray-200 rounded-xl p-1.5 flex flex-wrap gap-1 shadow-sm max-w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.exact 
            ? pathname === tab.href 
            : pathname.startsWith(tab.href);
          
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all select-none border border-transparent",
                isActive
                  ? "bg-[#fcf8f6] text-[#ff6900] shadow-sm border-[#ff6900]/10"
                  : "text-gray-500 hover:text-[#ff6900] hover:bg-gray-50/80"
              )}
            >
              <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-[#ff6900]" : "text-gray-400")} />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex-grow w-full min-w-0">
        {children}
      </div>
    </div>
  );
}
