import { TerminalCashbackConfig, TerminalCashbackClaim } from '@/service/terminal-cashback/types';

export const mockTerminalConfigs: TerminalCashbackConfig[] = [
    {
        businessId: 'biz-1',
        businessName: 'Urban Eats Restaurant',
        level: 1,
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=mcom.app/claim/biz-1',
        claimUrl: 'mcom.app/claim/biz-1',
        autoApprovalHours: 48,
        isEnabled: true,
        ranges: [
            { id: 'r1', minSpend: 10, maxSpend: 20, rewardValue: 1, isActive: true },
            { id: 'r2', minSpend: 21, maxSpend: 50, rewardValue: 2.5, isActive: true },
            { id: 'r3', minSpend: 51, maxSpend: 100, rewardValue: 5, isActive: true },
        ],
        limits: {
            maxPerDay: 500,
            maxPerCustomer: 50,
            maxPerReceipt: 10,
            monthlyBudget: 5000,
            maxClaimsPerUser: 3,
        }
    },
    {
        businessId: 'biz-2',
        businessName: 'TechHub Electronics',
        level: 2,
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=mcom.app/claim/biz-2',
        claimUrl: 'mcom.app/claim/biz-2',
        autoApprovalHours: 24,
        isEnabled: true,
        ranges: [],
        fixedRewardValue: 2.00,
        limits: {
            maxPerDay: 200,
            maxPerCustomer: 20,
            maxPerReceipt: 2,
            monthlyBudget: 2000,
            maxClaimsPerUser: 1,
        }
    }
];

export const mockTerminalClaims: TerminalCashbackClaim[] = [
    {
        id: 'claim-1',
        userId: 'user-1',
        userName: 'John Smith',
        businessId: 'biz-1',
        businessName: 'Urban Eats Restaurant',
        amountRange: '£10 - £20',
        amount: 1.00,
        proofUrl: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=400',
        status: 'pending',
        submittedAt: new Date(Date.now() - 3600000).toISOString(),
        meta: {
            gps: { lat: 40.7128, lng: -74.0060 },
            deviceId: 'iPhone 13, iOS 15.4',
        }
    },
    {
        id: 'claim-2',
        userId: 'user-5',
        userName: 'David Brown',
        businessId: 'biz-1',
        businessName: 'Urban Eats Restaurant',
        amountRange: '£51 - £100',
        amount: 5.00,
        proofUrl: 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=400',
        status: 'approved',
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
        reviewedAt: new Date(Date.now() - 82800000).toISOString(),
        meta: {
            gps: { lat: 40.7128, lng: -74.0060 },
            deviceId: 'Samsung S21, Android 12',
        }
    }
];