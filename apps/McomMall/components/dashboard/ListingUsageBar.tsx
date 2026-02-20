'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGetCapabilityUsage } from '@/service/system/hook';
import { Progress } from '@/components/ui/progress';
import { LayoutGrid, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ListingUsageBar = () => {
    const { data, isLoading, isError } = useGetCapabilityUsage();

    if (isLoading) {
        return (
            <div className="w-full h-24 bg-gray-100/50 animate-pulse rounded-2xl border border-gray-100 mb-8" />
        );
    }

    if (isError || !data?.quotas?.listings) {
        return null;
    }

    const { used, limit, remaining } = data.quotas.listings;
    const isUnlimited = limit === -1;
    const isLimitReached = !isUnlimited && used >= limit;
    const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);

    return (
        <div className="mb-8 w-full">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#f48c25]/10 overflow-hidden relative group">
                {/* Subtle Background Pattern */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                    <LayoutGrid size={80} />
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[#f48c25] text-[10px] font-black uppercase tracking-[0.2em]">Listing Capacity</span>
                            {isLimitReached && (
                                <div className="bg-red-100 text-red-600 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase">Limit Reached</div>
                            )}
                        </div>
                        <h3 className="text-gray-900 text-lg font-black tracking-tight">
                            {used} <span className="text-gray-400 font-medium">/ {isUnlimited ? 'Unlimited' : limit} Listings Used</span>
                        </h3>
                    </div>

                    <div className="text-right">
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Remaining</div>
                        <div className={`text-xl font-black ${!isUnlimited && remaining <= 1 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {isUnlimited ? 'Unlimited' : remaining}
                        </div>
                    </div>
                </div>

                <div className="relative h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`absolute top-0 left-0 h-full rounded-full transition-colors duration-500 ${percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-orange-500' : 'bg-[#f48c25]'
                            }`}
                    />
                </div>

                <p className="text-[10px] text-gray-500 font-medium">
                    {isUnlimited
                        ? "You have unlimited listing capacity on your current plan."
                        : percentage >= 100
                            ? "You have reached your listing limit. Upgrade your plan to add more."
                            : `You can create ${remaining} more listing${remaining === 1 ? '' : 's'} on your current plan.`
                    }
                </p>
            </div>

            {isLimitReached && (
                <Alert variant="destructive" className="mt-4 rounded-xl border-red-100 bg-red-50/50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-xs font-bold uppercase tracking-wider">Note</AlertTitle>
                    <AlertDescription className="text-sm font-medium">
                        Your account has reached its maximum listing capacity. To publish new business storefronts, please consider upgrading your subscription or managing existing listings.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};

export default ListingUsageBar;
