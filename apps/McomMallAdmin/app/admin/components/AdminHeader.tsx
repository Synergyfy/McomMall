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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { navItems } from '../data/navigation';

interface Notification {
    id: string;
    type: 'alert' | 'success' | 'info';
    title: string;
    message: string;
    time: string;
    read: boolean;
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'alert',
        title: 'Fraud Alert',
        message: '3 suspicious transactions detected',
        time: '2 min ago',
        read: false,
    },
    {
        id: '2',
        type: 'success',
        title: 'Payout Complete',
        message: '£12,500 sent to Luxury Hotels Inc',
        time: '15 min ago',
        read: false,
    },
    {
        id: '3',
        type: 'info',
        title: 'New Business Signup',
        message: 'TechHub Electronics joined the platform',
        time: '1 hour ago',
        read: true,
    },
    {
        id: '4',
        type: 'alert',
        title: 'Verification Pending',
        message: '8 verifications awaiting review',
        time: '2 hours ago',
        read: true,
    },
];

interface AdminHeaderProps {
    onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState(mockNotifications);
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

    const unreadCount = notifications.filter((n) => !n.read).length;

    const getPageTitle = () => {
        const segments = pathname.split('/').filter(Boolean);
        if (segments.length === 1) return 'Dashboard';
        const lastSegment = segments[segments.length - 1];
        return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ');
    };

    const markAsRead = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'alert':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            default:
                return <Clock className="h-4 w-4 text-blue-500" />;
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
                                    className="text-xs text-orange-500 hover:text-orange-600 h-auto p-0"
                                >
                                    Mark all as read
                                </Button>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.map((notification) => (
                                <DropdownMenuItem
                                    key={notification.id}
                                    className={cn(
                                        'flex items-start gap-3 p-3 cursor-pointer',
                                        !notification.read && 'bg-orange-50'
                                    )}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className={cn('text-sm font-medium', !notification.read && 'text-slate-900')}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">{notification.message}</p>
                                        <p className="text-xs text-slate-400 mt-1">{notification.time}</p>
                                    </div>
                                    {!notification.read && (
                                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-center text-sm text-orange-500 hover:text-orange-600 justify-center">
                            View all notifications
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" />
                                <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white text-xs">
                                    SA
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-slate-900">Super Admin</p>
                                <p className="text-xs text-slate-500">Super Admin</p>
                            </div>
                            <ChevronDown className="hidden md:block h-4 w-4 text-slate-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium">Super Admin</p>
                                <p className="text-xs text-slate-500">admin@mcommall.com</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <User className="mr-2 h-4 w-4" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
