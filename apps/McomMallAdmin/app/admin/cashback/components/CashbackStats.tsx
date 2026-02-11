'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, TrendingUp, Users, Loader2 } from 'lucide-react';
import { cashbackApi } from '@/service/cashback/api';

export function CashbackStats() {
    const { data: totalGiven, isLoading } = useQuery({
        queryKey: ['cashback-total-given'],
        queryFn: cashbackApi.getTotalCashbackGiven,
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100">
                            <Coins className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">
                                {isLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    `£${totalGiven || '0.00'}`
                                )}
                            </p>
                            <p className="text-xs text-slate-500 font-medium lowercase">Total Cashback Given</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {/* The other stats remain static/mock for now as per instructions only for total balance */}
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">1,245</p>
                            <p className="text-xs text-slate-500 font-medium lowercase">Total Transactions</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100">
                            <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">850</p>
                            <p className="text-xs text-slate-500 font-medium lowercase">Unique Users</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
