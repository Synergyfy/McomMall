export interface IntegrationSettings {
    id: string;
    businessId: string;
    googleConnected: boolean;
    stripeConnected: boolean;
    bookingsConnected: boolean;
    googleProfileId?: string;
    stripeAccountId?: string;
}

export interface UpdateIntegrationSettingsDto {
    googleConnected?: boolean;
    stripeConnected?: boolean;
    bookingsConnected?: boolean;
    googleProfileId?: string;
    stripeAccountId?: string;
}

export interface BillingPlan {
    name: string;
    planType: string;
    expiresAt?: string;
    isActive: boolean;
    isTrial: boolean;
}

export interface PaymentMethod {
    id: string;
    provider: string;
    brand?: string;
    last4?: string;
    expMonth?: number;
    expYear?: number;
    isDefault: boolean;
}

export interface BillingInvoice {
    id: string;
    amount?: number;
    status?: string;
    created_at?: string;
    [key: string]: unknown;
}

export interface BillingSummary {
    plan: BillingPlan | null;
    defaultPaymentMethod: PaymentMethod | null;
    paymentMethods: PaymentMethod[];
    invoices: BillingInvoice[];
}
