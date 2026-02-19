'use client';

import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/service/gift-card/types';

export const TransactionTypeBadge = ({ type }: { type: string }) => {
    switch (type) {
        case 'PURCHASE':
            return (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-semibold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                    Purchase
                </Badge>
            );
        case 'REDEEM':
            return (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 font-semibold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                    Redeem
                </Badge>
            );
        case 'REFUND':
            return (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-semibold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                    Refund
                </Badge>
            );
        default:
            return (
                <Badge variant="secondary" className="font-semibold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                    {type}
                </Badge>
            );
    }
};
