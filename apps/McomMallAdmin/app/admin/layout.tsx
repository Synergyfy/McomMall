'use client';

import { useState } from 'react';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <AdminSidebar
                    collapsed={sidebarCollapsed}
                    onCollapsedChange={setSidebarCollapsed}
                />
            </div>

            {/* Mobile Sidebar Sheet */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent side="left" className="p-0 w-[260px]">
                    <AdminSidebar />
                </SheetContent>
            </Sheet>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <AdminHeader onMenuClick={() => setMobileMenuOpen(true)} />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
