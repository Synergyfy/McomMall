import { useGetCashbackRules } from '@/service/cashback/hook';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ShoppingBag, Globe, Share2, Award } from 'lucide-react';

const IconMap: Record<string, any> = {
  'PURCHASE': ShoppingBag,
  'REFERRAL': Share2,
  'SIGNUP': Award,
  'PLATFORM': Globe,
  'DEFAULT': Zap
};

export const CashbackRules = () => {
  const { data: rules, isLoading } = useGetCashbackRules();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!rules || rules.length === 0) {
    return (
        <Card className="border-none bg-slate-50 text-slate-400 text-center py-12 rounded-3xl">
            <CardContent>
              <Zap className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold">No active earning rules found.</p>
              <p className="text-sm mt-1">We're cooking up new rewards for you!</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">Earning Opportunities</h3>
        <div className="h-px flex-1 bg-slate-100" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {rules.map((rule) => {
          const Icon = IconMap[rule.eventType] || IconMap.DEFAULT;
          return (
            <Card key={rule.id} className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden bg-white rounded-3xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 rounded-2xl bg-slate-50 group-hover:bg-blue-600 transition-colors duration-500">
                    <Icon className="h-6 w-6 text-slate-400 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Platform</p>
                    <p className="text-xs font-bold text-slate-900 capitalize">{rule.platform.toLowerCase().replace(/_/g, ' ')}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-black text-slate-900 capitalize leading-tight">
                      {rule.eventType.toLowerCase().replace(/_/g, ' ')}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-1">Reward for platform activity</p>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-blue-600 tracking-tighter">
                        {rule.rewardType === 'PERCENTAGE'
                            ? `${rule.rewardValue}%`
                            : formatCurrency(rule.rewardValue)
                        }
                      </span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Back</span>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Zap className="h-4 w-4 text-blue-600 fill-blue-600" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};