import { useGetCashbackBalance } from '@/service/cashback/hook';
import { Coins, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from "@/components/ui/card";

export const CashbackSummary = () => {
  const { data, isLoading } = useGetCashbackBalance();

  if (isLoading) {
    return (
      <div className="bg-slate-100 h-40 w-full md:max-w-md rounded-3xl animate-pulse" />
    );
  }

  const balance = data?.balance ? parseFloat(data.balance) : 0;

  return (
    <Card className="relative overflow-hidden border-none shadow-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white w-full md:max-w-md h-48 rounded-3xl group">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
        <Coins className="h-32 w-32 rotate-12" />
      </div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 blur-[80px] rounded-full" />
      
      <CardContent className="p-8 h-full flex flex-col justify-between relative">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Total Balance</span>
            <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
              <Coins className="h-4 w-4 text-amber-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 pt-2">
            <p className="text-5xl font-black tracking-tight">{formatCurrency(balance).split('.')[0]}</p>
            <p className="text-xl font-bold opacity-60">.{formatCurrency(balance).split('.')[1] || '00'}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-xs font-bold">
            <TrendingUp className="h-3 w-3" />
            <span>Ready to spend</span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Platform Wallet</p>
        </div>
      </CardContent>
    </Card>
  );
};