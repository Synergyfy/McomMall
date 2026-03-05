'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    LayoutDashboard,
    Layers,
    Users,
    Building2,
    ListChecks,
    Package,
    Briefcase,
    CreditCard,
    ShieldCheck,
    AlertTriangle,
    Megaphone,
    FileText,
    BarChart3,
    HeadphonesIcon,
    Settings,
    ScrollText,
    Plug,
    ChevronLeft,
    ChevronRight,
    Gift,
    Heart,
    Bell,
    Handshake,
    Ticket,
    QrCode,
    Store,
    LayoutTemplate,
    ShieldAlert,
    Award,
    GraduationCap,
    Clock,
    MessageSquare,
} from 'lucide-react';

interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
}

const navItems: NavItem[] = [
    { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { title: 'Tiers', href: '/admin/tiers', icon: Layers },
    { title: 'Users', href: '/admin/users', icon: Users },
    { title: 'Businesses', href: '/admin/businesses', icon: Building2 },
    { title: 'Listings', href: '/admin/listings', icon: ListChecks },
    { title: 'Products', href: '/admin/products', icon: Package },
    { title: 'Services', href: '/admin/services', icon: Briefcase },
    { title: 'Bookings', href: '/admin/bookings', icon: Clock },
    { title: 'Transactions', href: '/admin/transactions', icon: CreditCard },
    { title: 'Terminal Cashback', href: '/admin/terminal-cashback', icon: QrCode },
    { title: 'Verifications', href: '/admin/verifications', icon: ShieldCheck },
    { title: 'Disputes', href: '/admin/disputes', icon: AlertTriangle },
    { title: 'Marketing', href: '/admin/marketing', icon: Megaphone },
    { title: 'Coupons & Vouchers', href: '/admin/coupons-vouchers', icon: Ticket },
    { title: 'Loyalty Cashback', href: '/admin/campaign-cashback', icon: Gift },
    { title: 'Templates', href: '/admin/templates', icon: LayoutTemplate },
    { title: 'Activity Timers', href: '/admin/activity-timer', icon: Clock },
    { title: 'Compliance', href: '/admin/compliance', icon: ShieldAlert },
    { title: 'Quality Assurance', href: '/admin/quality', icon: Award },
    { title: 'Training Hub', href: '/admin/training', icon: GraduationCap },
    { title: 'Content', href: '/admin/content', icon: FileText },
    { title: 'Reviews', href: '/admin/reviews', icon: MessageSquare },
    { title: 'Marketplace', href: '/admin/marketplace', icon: Store },
    { title: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { title: 'Support', href: '/admin/support', icon: HeadphonesIcon },
    { title: 'Partnerships', href: '/admin/partnerships', icon: Handshake },
    { title: 'Loyalty', href: '/admin/loyalty', icon: Heart },
    { title: 'Cashback', href: '/admin/cashback', icon: CreditCard },
    { title: 'Notifications', href: '/admin/notifications', icon: Bell },
    { title: 'Settings', href: '/admin/settings', icon: Settings },
    { title: 'Audit Log', href: '/admin/audit', icon: ScrollText },
    { title: 'Roles', href: '/admin/roles', icon: ShieldCheck },
    { title: 'Integrations', href: '/admin/integrations', icon: Plug },
];

interface AdminSidebarProps {
    collapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
}

export function AdminSidebar({ collapsed = false, onCollapsedChange }: AdminSidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(collapsed);

    const handleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        onCollapsedChange?.(newState);
    };

    return (
        <TooltipProvider delayDuration={0}>
            <aside
                className={cn(
                    'relative flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white transition-all duration-300 ease-in-out',
                    isCollapsed ? 'w-[70px]' : 'w-[260px]'
                )}
            >
                {/* Logo Section */}
                <div className={cn(
                    'flex items-center h-16 px-4 border-b border-slate-700/50',
                    isCollapsed ? 'justify-center' : 'justify-between'
                )}>
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <span className="text-white font-bold text-lg">M</span>
                        </div>
                        {!isCollapsed && (
                            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                                Admin
                            </span>
                        )}
                    </Link>
                    {!isCollapsed && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCollapse}
                            className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700/50"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Expand Button (when collapsed) */}
                {isCollapsed && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCollapse}
                        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 z-10"
                    >
                        <ChevronRight className="h-3 w-3" />
                    </Button>
                )}

                {/* Navigation */}
                <ScrollArea className="flex-1 py-4">
                    <nav className="space-y-1 px-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href !== '/admin' && pathname.startsWith(item.href));

                            const NavLink = (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                        isActive
                                            ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/10 text-orange-400 border-l-2 border-orange-500'
                                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50',
                                        isCollapsed && 'justify-center px-2'
                                    )}
                                >
                                    <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-orange-400')} />
                                    {!isCollapsed && (
                                        <>
                                            <span className="flex-1">{item.title}</span>
                                            {item.badge && (
                                                <span className={cn(
                                                    'px-2 py-0.5 text-xs font-semibold rounded-full',
                                                    isActive
                                                        ? 'bg-orange-500/20 text-orange-400'
                                                        : 'bg-slate-700 text-slate-300'
                                                )}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </Link>
                            );

                            if (isCollapsed) {
                                return (
                                    <Tooltip key={item.href}>
                                        <TooltipTrigger asChild>{NavLink}</TooltipTrigger>
                                        <TooltipContent side="right" className="flex items-center gap-2">
                                            {item.title}
                                            {item.badge && (
                                                <span className="px-1.5 py-0.5 text-xs font-semibold rounded-full bg-orange-500 text-white">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            }

                            return NavLink;
                        })}
                    </nav>
                </ScrollArea>

                {/* Footer */}
                <div className={cn(
                    'border-t border-slate-700/50 p-4',
                    isCollapsed && 'flex justify-center'
                )}>
                    {!isCollapsed ? (
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-bold">
                                SA
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">Super Admin</p>
                                <p className="text-xs text-slate-400 truncate">admin@mcommall.com</p>
                            </div>
                        </div>
                    ) : (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-xs font-bold cursor-pointer">
                                    SA
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p className="font-medium">Super Admin</p>
                                <p className="text-xs text-muted-foreground">admin@mcommall.com</p>
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
            </aside>
        </TooltipProvider>
    );
}

// Add ScrollArea component if not exists
