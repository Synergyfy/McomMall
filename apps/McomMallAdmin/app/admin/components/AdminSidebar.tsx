'use client';

import { useEffect, useState } from 'react';
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
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { navGroups, navItems } from '../data/navigation';

interface AdminSidebarProps {
    collapsed?: boolean;
    onCollapsedChange?: (collapsed: boolean) => void;
}

function isNavItemActive(href: string, pathname: string): boolean {
    const path = href.split('?')[0];
    if (path === '/admin') return pathname === '/admin';
    return pathname === path || pathname.startsWith(`${path}/`);
}

export function AdminSidebar({ collapsed = false, onCollapsedChange }: AdminSidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(collapsed);
    const [openGroup, setOpenGroup] = useState<string | null>(() => {
        const activeGroup = navGroups.find((group) =>
            group.items.some((item) => isNavItemActive(item.href, pathname))
        );
        return activeGroup?.id ?? null;
    });

    useEffect(() => {
        const activeGroup = navGroups.find((group) =>
            group.items.some((item) => isNavItemActive(item.href, pathname))
        );
        if (activeGroup) setOpenGroup(activeGroup.id);
    }, [pathname]);

    const handleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        onCollapsedChange?.(newState);
    };

    const visibleNavItems = navItems.filter((item) => !item.hiddenFromSidebar);

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
                        {isCollapsed ? (
                            visibleNavItems.map((item) => {
                                const isActive = isNavItemActive(item.href, pathname);
                                return (
                                    <Tooltip key={item.href}>
                                        <TooltipTrigger asChild>
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    'flex items-center justify-center px-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                                                    isActive
                                                        ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/10 text-orange-400 border-l-2 border-orange-500'
                                                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                                )}
                                            >
                                                <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-orange-400')} />
                                            </Link>
                                        </TooltipTrigger>
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
                            })
                        ) : (
                            navGroups.map((group) => {
                                const groupActive = group.items.some((item) => isNavItemActive(item.href, pathname));
                                const isOpen = openGroup === group.id;

                                return (
                                    <div key={group.id} className="space-y-0.5">
                                        <button
                                            type="button"
                                            onClick={() => setOpenGroup((previous) => previous === group.id ? null : group.id)}
                                            aria-expanded={isOpen}
                                            className={cn(
                                                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                                groupActive
                                                    ? 'bg-slate-700/40 text-orange-300'
                                                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                            )}
                                        >
                                            <group.icon className={cn('h-5 w-5 flex-shrink-0', groupActive && 'text-orange-400')} />
                                            <span className="flex-1 text-left">{group.title}</span>
                                            <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform duration-200', isOpen && 'rotate-180')} />
                                        </button>

                                        {isOpen && (
                                            <div className="space-y-0.5 pl-5">
                                                {group.items
                                                    .filter((item) => !item.hiddenFromSidebar)
                                                    .map((item) => {
                                                        const isActive = isNavItemActive(item.href, pathname);
                                                        return (
                                                            <Link
                                                                key={item.href}
                                                                href={item.href}
                                                                className={cn(
                                                                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200',
                                                                    isActive
                                                                        ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/10 text-orange-400 border-l-2 border-orange-500'
                                                                        : 'text-slate-400 hover:bg-slate-700/40 hover:text-white'
                                                                )}
                                                            >
                                                                <item.icon className={cn('h-4 w-4 flex-shrink-0', isActive && 'text-orange-400')} />
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
                                                            </Link>
                                                        );
                                                    })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
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
