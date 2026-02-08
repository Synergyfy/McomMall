import { useGetCashbackRules } from '@/service/cashback/hook';
import { formatCurrency } from '@/lib/utils';

export const CashbackRules = () => {
  const { data: rules, isLoading } = useGetCashbackRules();

  if (isLoading) {
    return <div className="h-32 bg-gray-100 rounded animate-pulse w-full" />;
  }

  if (!rules || rules.length === 0) {
    return (
        <div className="p-6 border rounded-xl bg-gray-50 text-gray-500 text-center">
            No active cashback rules at the moment. Check back later!
        </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">How to Earn Cashback</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rules.map((rule) => (
          <div key={rule.id} className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
            <div>
                <h4 className="font-semibold text-gray-900 mb-1 capitalize">{rule.eventType.toLowerCase().replace(/_/g, ' ')}</h4>
                <p className="text-xs text-gray-500 uppercase tracking-wide">On {rule.platform.replace(/_/g, ' ')}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-baseline">
                 <span className="text-3xl font-bold text-green-600 mr-1">
                    {rule.rewardType === 'PERCENTAGE'
                        ? `${rule.rewardValue}%`
                        : formatCurrency(rule.rewardValue)
                    }
                 </span>
                 <span className="text-sm text-gray-500 font-medium">Cashback</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
