// Admin Dashboard Types

// ============== User Types ==============
export interface AdminUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    accountType: 'customer' | 'business' | 'admin';
    signupDate: string;
    lastLogin: string;
    status: 'active' | 'suspended' | 'banned' | 'pending';
    walletBalance: number;
    avatar?: string;
    verified: boolean;
    notes?: string;
}

// ============== Business Types ==============
export interface Business {
    id: string;
    name: string;
    owner: string;
    ownerId: string;
    sector: string;
    category: string;
    subcategory?: string;
    address: string;
    phone: string;
    email: string;
    status: 'active' | 'pending' | 'suspended';
    verified: boolean;
    rating: number;
    reviewCount: number;
    listingCount: number;
    createdAt: string;
    logo?: string;
}

// ============== Listing Types ==============
export interface Listing {
    id: string;
    title: string;
    description: string;
    businessId: string;
    businessName: string;
    sector: string;
    category: string;
    subcategory?: string;
    location: string;
    price: number;
    pricingModel: 'fixed' | 'hourly' | 'per_person';
    status: 'pending' | 'approved' | 'rejected' | 'draft';
    featured: boolean;
    verified: boolean;
    rating: number;
    reviewCount: number;
    images: string[];
    createdAt: string;
}

// ============== Product Types ==============
export interface Product {
    id: string;
    name: string;
    description: string;
    businessId: string;
    businessName: string;
    category: string;
    price: number;
    stock: number;
    status: 'active' | 'inactive' | 'out_of_stock';
    images: string[];
    createdAt: string;
}

// ============== Service Types ==============
export interface Service {
    id: string;
    name: string;
    description: string;
    businessId: string;
    businessName: string;
    category: string;
    price: number;
    duration: number; // in minutes
    status: 'active' | 'inactive';
    images: string[];
    createdAt: string;
}

// ============== Transaction Types ==============
export interface Transaction {
    id: string;
    date: string;
    amount: number;
    fees: number;
    payerId: string;
    payerName: string;
    payeeId: string;
    payeeName: string;
    paymentMethod: 'card' | 'bank' | 'wallet' | 'paypal';
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    orderId?: string;
    listingId?: string;
    type: 'payment' | 'refund' | 'payout';
}

// ============== Verification Types ==============
export interface Verification {
    id: string;
    userId: string;
    userName: string;
    type: 'identity' | 'business' | 'listing';
    documentType: string;
    documentUrl: string;
    status: 'pending' | 'approved' | 'rejected' | 'more_info_needed';
    submittedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    notes?: string;
}

// ============== Dispute Types ==============
export interface Dispute {
    id: string;
    orderId: string;
    customerId: string;
    customerName: string;
    businessId: string;
    businessName: string;
    reason: 'not_received' | 'not_as_described' | 'defective' | 'wrong_item' | 'seller_unresponsive' | 'other';
    description: string;
    amount: number;
    status: 'new' | 'under_review' | 'mediated' | 'resolved' | 'escalated';
    priority: 'low' | 'medium' | 'high';
    evidence?: string[];
    createdAt: string;
    updatedAt: string;
    assignedTo?: string;
}

// ============== Support Ticket Types ==============
export interface SupportTicket {
    id: string;
    userId: string;
    userName: string;
    type: 'complaint' | 'question' | 'verification_help' | 'refund' | 'other';
    subject: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
    assignedTo?: string;
    createdAt: string;
    updatedAt: string;
    slaDeadline: string;
}

// ============== Coupon Types ==============
export interface Coupon {
    id: string;
    title: string;
    publicName: string;
    code: string;
    description: string;
    type: 'percentage' | 'fixed' | 'free_shipping' | 'bogo';
    value: number;
    appliesTo: 'all' | 'specific_listings' | 'categories' | 'businesses';
    startDate: string;
    endDate: string;
    maxUses: number;
    usesCount: number;
    perUserLimit: number;
    minPurchase: number;
    status: 'draft' | 'active' | 'paused' | 'expired';
    showOnHomepage: boolean;
    showInBusinessDashboard: boolean;
    showInCustomerDashboard: boolean;
}

// ============== Gift Card Types ==============
export interface GiftCard {
    id: string;
    code: string;
    amount: number;
    balance: number;
    expiryDate: string;
    status: 'active' | 'redeemed' | 'expired';
    purchasedBy?: string;
    redeemedBy?: string;
    createdAt: string;
}

// ============== Voucher Types ==============
export interface Voucher {
    id: string;
    code: string;
    title: string;
    description: string;
    value: number;
    type: 'percentage' | 'fixed';
    allocatedTo?: string;
    allocatedToType?: 'customer' | 'business';
    status: 'available' | 'claimed' | 'used' | 'expired';
    expiryDate: string;
    createdAt: string;
}

// ============== Sector/Category Types ==============
export interface Sector {
    id: string;
    name: string;
    shortDescription: string;
    longDescription?: string;
    icon?: string;
    visibility: 'public' | 'private';
    order: number;
    categoryCount: number;
}

export interface Category {
    id: string;
    sectorId: string;
    sectorName: string;
    name: string;
    shortDescription: string;
    image?: string;
    showInSignup: boolean;
    allowedListingTypes: ('product' | 'service' | 'booking')[];
    subcategoryCount: number;
    order: number;
}

export interface Subcategory {
    id: string;
    categoryId: string;
    categoryName: string;
    name: string;
    description: string;
    image?: string;
    order: number;
}

// ============== Audit Log Types ==============
export interface AuditLog {
    id: string;
    adminId: string;
    adminName: string;
    action: string;
    targetType: 'user' | 'business' | 'listing' | 'transaction' | 'coupon' | 'setting';
    targetId: string;
    details: string;
    timestamp: string;
    ipAddress: string;
}

// ============== Admin Role Types ==============
export interface AdminRole {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    userCount: number;
}

// ============== Partnership Types ==============
export interface Partnership {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    startDate: string;
    endDate?: string;
    status: 'active' | 'inactive' | 'expired';
    plaqueIds: string[];
    promotionIds: string[];
    notes?: string;
}

// ============== Dashboard Stats Types ==============
export interface DashboardStats {
    pendingListings: number;
    newSignups24h: number;
    openTickets: number;
    transactionsToday: number;
    pendingRefunds: number;
    revenueToday: number;
    activeUsers: number;
    totalBusinesses: number;
}

export interface AlertItem {
    id: string;
    type: 'fraud' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: string;
    actionUrl?: string;
}

export interface ActivityItem {
    id: string;
    type: 'listing' | 'user' | 'transaction' | 'refund' | 'verification';
    action: string;
    actor: string;
    target: string;
    timestamp: string;
}

// ============== Navigation Types ==============
export interface NavItem {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    children?: NavItem[];
}
