'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Search,
    Bell,
    Menu,
    LogOut,
    User,
    Settings,
    Moon,
    Sun,
    ChevronDown,
    AlertCircle,
    CheckCircle,
    Clock,
    MessageSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { navItems } from '../data/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/service/store/store';
import { useLogout } from '@/service/auth/hook';
import { useGetNotifications, useMarkNotificationsAsSeen } from '@/service/notifications/hook';
import type { Notification } from '@/service/notifications/types';

function getNotificationTitle(n: Notification): string {
    switch (n.type) {
        case 'new_order':
            return 'New Order Placed';
        case 'new_booking':
            return 'New Booking Received';
        case 'new_message':
            return n.sender?.name ? `Message from ${n.sender.name}` : 'New Message';
        case 'broadcast_alert':
            return 'Broadcast Announcement';
        case 'event_invite':
            return 'Event Invitation';
        default:
            return 'System Notification';
    }
}

function getNotificationMessage(n: Notification): string {
    switch (n.type) {
        case 'new_order':
            return `Order #${n.entityId?.slice(0, 8) || ''} is awaiting fulfillment`;
        case 'new_booking':
            return `Booking #${n.entityId?.slice(0, 8) || ''} scheduled`;
        case 'new_message':
            return 'New customer inquiry in chat inbox';
        case 'broadcast_alert':
            return 'Platform broadcast published to audience';
        case 'event_invite':
            return 'You have been invited to a borough event';
        default:
            return `Update on item #${n.entityId?.slice(0, 8) || ''}`;
    }
}

function formatRelativeTime(dateStr: string): string {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    if (isNaN(diffMs) || diffMs < 0) return 'Just now';
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} min ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
}

function getNotificationIcon(type: Notification['type']) {
    switch (type) {
        case 'new_order':
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'new_booking':
            return <Clock className="h-4 w-4 text-blue-500" />;
        case 'broadcast_alert':
            return <AlertCircle className="h-4 w-4 text-orange-500" />;
        case 'new_message':
            return <MessageSquare className="h-4 w-4 text-purple-500" />;
        default:
            return <Clock className="h-4 w-4 text-blue-500" />;
    }
}

interface AdminHeaderProps {
    onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const { notifications = [], unseenIds = [], isLoading } = useGetNotifications();
    const markSeenMutation = useMarkNotificationsAsSeen();
    const { userName, userRole } = useSelector((state: RootState) => state.auth);
    const logout = useLogout();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const unreadCount = unseenIds.length;

    const getPageTitle = () => {
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length === 1) return 'Dashboard';
        const lastSegment = segments[segments.length - 1];
        return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
    };

    const markAsRead = (id: string) => {
        markSeenMutation.mutate({ notificationIds: [id] });
    };

    const markAllAsRead = () => {
        if (unseenIds.length > 0) {
            markSeenMutation.mutate({ notificationIds: unseenIds });
        }
    };

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-white/80 backdrop-blur-lg px-4 md:px-6 shadow-sm">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={onMenuClick}
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Page Title */}
                <div className="hidden sm:block">
                    <h1 className="text-lg font-semibold text-slate-900">{getPageTitle()}</h1>
                    <p className="text-xs text-slate-500">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>
            </div>

            {/* Center - Search Trigger */}
            <div className="flex-1 max-w-md mx-4">
                <Button
                    variant="outline"
                    className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 bg-slate-50 border-slate-200 hover:bg-slate-100 transition-colors"
                    onClick={() => setOpen(true)}
                >
                    <Search className="mr-2 h-4 w-4" />
                    <span>Search admin pages...</span>
                    <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-white px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                </Button>
            </div>

            {/* Search Dialog */}
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Pages">
                        {navItems.map((item) => (
                            <CommandItem
                                key={item.href}
                                value={item.title}
                                onSelect={() => {
                                    runCommand(() => router.push(item.href));
                                }}
                                className="flex items-center gap-3 p-2 cursor-pointer group"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 group-aria-selected:bg-orange-100 transition-colors">
                                    <item.icon className="h-4 w-4 text-slate-600 group-aria-selected:text-orange-600" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium">{item.title}</span>
                                    {item.description && (
                                        <span className="text-xs text-muted-foreground line-clamp-1">
                                            {item.description}
                                        </span>
                                    )}
                                </div>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>

            {/* Right Section */}
            <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDark(!isDark)}
                    className="text-slate-500 hover:text-slate-900"
                >
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-900">
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                                >
                                    {unreadCount}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="flex items-center justify-between">
                            <span>Notifications</span>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    disabled={markSeenMutation.isPending}
                                    className="text-xs text-orange-500 hover:text-orange-600 h-auto p-0"
                                >
                                    Mark all as read
                                </Button>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-80 overflow-y-auto">
                            {isLoading ? (
                                <div className="p-4 text-center text-xs text-slate-400">Loading notifications…</div>
                            ) : notifications.length === 0 ? (
                                <div className="p-4 text-center text-xs text-slate-400">No notifications yet</div>
                            ) : (
                                notifications.map((notification) => {
                                    const isUnread = !notification.seen;
                                    return (
                                        <DropdownMenuItem
                                            key={notification.id}
                                            className={cn(
                                                'flex items-start gap-3 p-3 cursor-pointer',
                                                isUnread && 'bg-orange-50/60'
                                            )}
                                            onClick={() => {
                                                if (isUnread) markAsRead(notification.id);
                                            }}
                                        >
                                            <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn('text-sm font-medium', isUnread ? 'text-slate-900 font-semibold' : 'text-slate-700')}>
                                                    {getNotificationTitle(notification)}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">{getNotificationMessage(notification)}</p>
                                                <p className="text-xs text-slate-400 mt-1">{formatRelativeTime(notification.createdAt)}</p>
                                            </div>
                                            {isUnread && (
                                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                                            )}
                                        </DropdownMenuItem>
                                    );
                                })
                            )}
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => router.push('/admin/notifications')}
                            className="text-center text-sm text-orange-500 hover:text-orange-600 justify-center cursor-pointer"
                        >
                            View all notifications
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-xs font-bold">
                                    {(userName || 'Admin').slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-slate-900">{userName || 'Admin'}</p>
                                <p className="text-xs text-slate-500 capitalize">{userRole || 'Super Admin'}</p>
                            </div>
                            <ChevronDown className="hidden md:block h-4 w-4 text-slate-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium">{userName || 'Admin'}</p>
                                <p className="text-xs text-slate-500 capitalize">{userRole || 'Super Admin'}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push('/admin/team')} className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            Team & Access
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/admin/settings')} className="cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
