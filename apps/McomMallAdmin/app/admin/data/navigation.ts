import {
    LayoutDashboard,
    Layers,
    Users,
    Building2,
    ShieldCheck,
    Package,
    Briefcase,
    Clock,
    CreditCard,
    QrCode,
    AlertTriangle,
    Ticket,
    Gift,
    LayoutTemplate,
    ShieldAlert,
    Award,
    GraduationCap,
    FileText,
    MessageSquare,
    Store,
    BarChart3,
    ScrollText,
    HeadphonesIcon,
    Handshake,
    Heart,
    BadgePercent,
    Megaphone,
    MousePointerClick,
} from 'lucide-react';

export type NavGroupId =
    | 'overview'
    | 'commerce'
    | 'payments'
    | 'people'
    | 'trust'
    | 'content';

export interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    description?: string;
    group: NavGroupId;
    hiddenFromSidebar?: boolean;
}

export interface NavGroup {
    id: NavGroupId;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    items: NavItem[];
}

export const navItems: NavItem[] = [
    { title: 'Dashboard', href: '/admin', icon: LayoutDashboard, description: 'Overview and key metrics', group: 'overview' },
    { title: 'Analytics', href: '/admin/analytics', icon: BarChart3, description: 'Deep dive into platform data', group: 'overview' },

    { title: 'Catalog Approvals', href: '/admin/moderation', icon: ShieldCheck, description: 'Approve gift cards, vouchers and coupons before they go live', group: 'commerce' },
    { title: 'Products', href: '/admin/products', icon: Package, description: 'Manage marketplace products', group: 'commerce' },
    { title: 'Services', href: '/admin/services', icon: Briefcase, description: 'Manage service listings', group: 'commerce' },
    { title: 'Promotional Offers', href: '/admin/promotional-offers', icon: BadgePercent, description: 'Admin-managed external products and services', group: 'commerce' },
    { title: 'Promotional Campaigns', href: '/admin/promotional-campaigns', icon: Megaphone, description: 'Campaigns available to selected businesses', group: 'commerce' },
    { title: 'Affiliate Reporting', href: '/admin/affiliate', icon: MousePointerClick, description: 'Clicks, transactions and commission attribution', group: 'commerce' },
    { title: 'Marketplace', href: '/admin/marketplace', icon: Store, description: 'Main marketplace settings', group: 'commerce' },
    { title: 'Coupons & Vouchers', href: '/admin/coupons-vouchers', icon: Ticket, description: 'Manage digital coupons and vouchers', group: 'commerce' },
    { title: 'Vouchers', href: '/admin/moderation?resource=voucher-products', icon: Ticket, description: 'Review and manage business vouchers', group: 'commerce' },

    { title: 'Plans', href: '/admin/plans', icon: Layers, description: 'Manage pricing and subscription plans', group: 'payments' },
    { title: 'Bookings', href: '/admin/bookings', icon: Clock, description: 'Manage service and product bookings', group: 'payments' },
    { title: 'Transactions', href: '/admin/transactions', icon: CreditCard, description: 'Financial transactions and payouts', group: 'payments' },
    { title: 'Terminal Cashback', href: '/admin/terminal-cashback', icon: QrCode, description: 'Manage QR-based terminal cashback', group: 'payments' },
    { title: 'Billing', href: '/admin/billing', icon: CreditCard, description: 'Subscription billing and invoices', group: 'payments' },
    { title: 'Loyalty Cashback', href: '/admin/campaign-cashback', icon: Gift, description: 'Manage loyalty reward programs', group: 'payments' },
    { title: 'Loyalty', href: '/admin/loyalty', icon: Heart, description: 'General loyalty settings', group: 'payments' },
    { title: 'Cashback', href: '/admin/cashback', icon: CreditCard, description: 'General cashback settings', group: 'payments' },

    { title: 'Users', href: '/admin/users', icon: Users, description: 'Manage platform users', group: 'people' },
    { title: 'Businesses', href: '/admin/businesses', icon: Building2, description: 'Manage registered businesses', group: 'people' },
    { title: 'Memberships', href: '/admin/memberships', icon: Users, description: 'VIP and community memberships', group: 'people' },
    { title: 'Partnerships', href: '/admin/partnerships', icon: Handshake, description: 'Manage B2B partnerships', group: 'people' },
    { title: 'Team', href: '/admin/team', icon: Users, description: 'Manage admin team and permissions', group: 'people' },

    { title: 'Support', href: '/admin/support', icon: HeadphonesIcon, description: 'Customer support dashboard', group: 'trust' },
    { title: 'Disputes', href: '/admin/disputes', icon: AlertTriangle, description: 'Handle customer and business disputes', group: 'trust' },
    { title: 'Compliance', href: '/admin/compliance', icon: ShieldAlert, description: 'Regulatory and safety compliance', group: 'trust' },
    { title: 'Quality Assurance', href: '/admin/quality', icon: Award, description: 'Quality control and standards', group: 'trust' },
    { title: 'Reviews', href: '/admin/reviews', icon: MessageSquare, description: 'Manage user ratings and reviews', group: 'trust' },
    { title: 'History', href: '/admin/history', icon: ScrollText, description: 'System audit and history logs', group: 'trust' },
    { title: 'Verifications', href: '/admin/verifications', icon: ShieldCheck, description: 'Identity and business verification', group: 'trust', hiddenFromSidebar: true },

    { title: 'Templates', href: '/admin/templates', icon: LayoutTemplate, description: 'Email and document templates', group: 'content' },
    { title: 'Training Hub', href: '/admin/training', icon: GraduationCap, description: 'Staff and user training materials', group: 'content' },
    { title: 'Content', href: '/admin/content', icon: FileText, description: 'CMS and static content management', group: 'content' },
];

export const navGroups: NavGroup[] = [
    { id: 'overview', title: 'Overview & Insights', icon: LayoutDashboard, items: navItems.filter((item) => item.group === 'overview') },
    { id: 'commerce', title: 'Commerce & Catalog', icon: Store, items: navItems.filter((item) => item.group === 'commerce') },
    { id: 'payments', title: 'Bookings & Payments', icon: CreditCard, items: navItems.filter((item) => item.group === 'payments') },
    { id: 'people', title: 'People & Relationships', icon: Users, items: navItems.filter((item) => item.group === 'people') },
    { id: 'trust', title: 'Support & Trust', icon: ShieldCheck, items: navItems.filter((item) => item.group === 'trust') },
    { id: 'content', title: 'Content & Training', icon: FileText, items: navItems.filter((item) => item.group === 'content') },
];
