import React from 'react';
import { CampaignCashback, CampaignStatus, CampaignUnlockMode } from '@/service/campaign-cashback/types';
import { Info, Lock } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface ValueProps {
    label: string;
    balance: number;
    isLocked: boolean;
    colorClass: string;
    bgClass: string;
    title: string;
    description: string;
    usageText: string;
}

const ValueBlock: React.FC<ValueProps> = ({ label, balance, isLocked, colorClass, bgClass, title, description, usageText }) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className={`
          relative flex flex-col p-4 rounded-xl border-2 transition-all cursor-help
          ${isLocked ? 'border-gray-200 bg-gray-50 opacity-60' : `border-transparent ${bgClass}`}
          hover:shadow-sm
        `}>
                    {isLocked && (
                        <div className="absolute top-2 right-2 text-gray-400">
                            <Lock className="w-4 h-4" />
                        </div>
                    )}
                    {!isLocked && (
                        <div className={`absolute top-2 right-2 ${colorClass}`}>
                            <Info className="w-4 h-4" />
                        </div>
                    )}
                    <span className={`text-sm font-semibold mb-1 ${isLocked ? 'text-gray-500' : colorClass}`}>
                        {label}
                    </span>
                    <span className={`text-2xl font-bold ${isLocked ? 'text-gray-700' : 'text-gray-900'}`}>
                        £{balance.toFixed(2)}
                    </span>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 overflow-hidden shadow-xl border-0">
                <div className={`p-4 ${isLocked ? 'bg-gray-100' : bgClass}`}>
                    <h4 className={`text-lg font-bold mb-1 ${isLocked ? 'text-gray-800' : colorClass}`}>
                        {title || label}
                    </h4>
                    <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                        {description || 'No description provided.'}
                    </p>
                    <div className="bg-white/80 rounded-lg p-3 border border-white/40">
                        <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Where to spend</span>
                        <p className="text-sm font-medium text-gray-800">
                            {usageText || 'No usage restrictions set.'}
                        </p>
                    </div>
                    {isLocked && (
                        <div className="mt-3 bg-red-50 text-red-700 text-xs font-semibold px-3 py-2 rounded border border-red-100 flex items-center gap-2">
                            <Lock className="w-3 h-3" />
                            Contribution required to activate this value.
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export const CampaignValueSection: React.FC<{ campaign: CampaignCashback }> = ({ campaign }) => {
    // Logic to determine locks based on unlockMode and contributionPaid
    const { unlockMode, contributionPaid } = campaign;
    let isValue1Locked = false;
    let isValue2Locked = false;
    let isValue3Locked = true; // Contribution value is inherently locked if contributionPaid is false

    if (!contributionPaid) {
        if (unlockMode === CampaignUnlockMode.REQUIRE_FULL_UNLOCK) {
            isValue1Locked = true;
            isValue2Locked = true;
            isValue3Locked = true;
        } else if (unlockMode === CampaignUnlockMode.ALLOW_PRELOADED_USAGE) {
            isValue1Locked = false;
            isValue2Locked = false;
            isValue3Locked = true;
        }
    } else {
        isValue1Locked = false;
        isValue2Locked = false;
        isValue3Locked = false;
    }

    // Value 1 & 2 are Green, Value 3 is Blue
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <ValueBlock
                label="247GBS Credit"
                balance={campaign.levelValue}
                isLocked={isValue1Locked}
                colorClass="text-orange-700"
                bgClass="bg-orange-50 hover:bg-orange-100/80"
                title={campaign.value1Title}
                description={campaign.value1Description}
                usageText={campaign.value1UsageText}
            />
            <ValueBlock
                label="System Credit"
                balance={campaign.levelValue}
                isLocked={isValue2Locked}
                colorClass="text-orange-700"
                bgClass="bg-orange-50 hover:bg-orange-100/80"
                title={campaign.value2Title}
                description={campaign.value2Description}
                usageText={campaign.value2UsageText}
            />
            <ValueBlock
                label="Your Contribution"
                balance={campaign.levelValue}
                isLocked={isValue3Locked}
                colorClass="text-orange-600"
                bgClass="bg-orange-100/50 hover:bg-orange-200/50"
                title={campaign.value3Title}
                description={campaign.value3Description}
                usageText={campaign.value3UsageText}
            />
        </div>
    );
};
