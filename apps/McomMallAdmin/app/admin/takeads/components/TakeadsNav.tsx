'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart3,
    BadgePercent,
    Globe,
    Settings,
    Store,
    Ticket,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
    { href: '/admin/takeads', label: 'Overview', icon: Globe, exact: true },
    { href: '/admin/takeads/merchants', label: 'Merchants', icon: Store },
    { href: '/admin/takeads/coupons', label: 'Coupons', icon: Ticket },
    { href: '/admin/takeads/offers', label: 'Offers', icon: BadgePercent },
    { href: '/admin/takeads/reports', label: 'Reports', icon: BarChart3 },
    { href: '/admin/takeads/settings', label: 'Settings', icon: Settings },
] as const;

export function TakeadsNav() {
    const pathname = usePathname();

    return (
        <nav
            aria-label="TakeAds sections"
            className="mb-6 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3"
        >
            {tabs.map((tab) => {
                const active =
                    'exact' in tab && tab.exact
                        ? pathname === tab.href
                        : pathname === tab.href ||
                          pathname.startsWith(`${tab.href}/`);
                const Icon = tab.icon;

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
                            active
                                ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                        )}
                    >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
}
