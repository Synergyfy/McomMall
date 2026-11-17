export type DealKind =
    | 'standard_coupon'
    | 'coupon_voucher'
    | 'voucher_coupon'
    | 'voucher'
    | 'gift_card'
    | 'promotion';

export type DealSource =
    | 'coupon'
    | 'money_voucher'
    | 'voucher'
    | 'gift_card'
    | 'campaign'
    | 'definition';

export interface DealScope {
    mode: string;
    businessId?: string | null;
    listingIds?: string[];
    productIds?: string[];
    serviceIds?: string[];
}

export interface Deal {
    id: string;
    kind: DealKind;
    visualType: 'coupon' | 'voucher';
    functionalType: 'price_reducer' | 'spending_power' | null;
    title: string;
    description: string | null;
    code: string | null;
    faceValue: number | null;
    discountType: 'percentage' | 'fixed' | null;
    remainingValue: number | null;
    contributionRemaining?: number | null;
    status: string;
    scope: DealScope | null;
    businessId: string | null;
    businessName: string | null;
    expiresAt: string | null;
    createdAt: string | null;
    source: DealSource;
}

export interface DealsResponse {
    data: Deal[];
    meta: {
        total: number;
        page: number;
        limit: number;
        lastPage: number;
        nextPage: number | null;
        prevPage: number | null;
    };
}

export interface GetDealsParams {
    page?: number;
    limit?: number;
    kind?: DealKind;
    search?: string;
}
