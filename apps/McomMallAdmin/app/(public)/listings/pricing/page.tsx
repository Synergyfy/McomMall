// app/pricing/page.tsx

'use client';

import { useState, useEffect } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/navigation';

// --- TYPE DEFINITIONS ---
// Defines the structure for a single benefit item
interface Benefit {
  text: string;
}

// Defines a group of benefits, often under a subtitle
interface BenefitGroup {
  title: string;
  benefits: Benefit[];
}

// Defines the overall structure for a pricing plan
interface Plan {
  id: 'PAYG' | 'COBRANDED';
  name: string;
  tierType: string;
  description: string;
  benefitGroups: BenefitGroup[];
}

// --- DATA ---
// An array containing the details for the two plans
const plans: Plan[] = [
  {
    id: 'PAYG',
    name: 'PAY-AS-YOU-GO (PAYG) BUSINESS OWNER',
    tierType: 'Lowest tier, seasonal package: 90, 180, or 270 days',
    description:
      'Basic Access to MCOM Ecosystem – Limited to services in the purchased seasonal package (Winter, Spring, Summer, Autumn).',
    benefitGroups: [
      {
        title: 'Benefits & Access',
        benefits: [
          {
            text: 'External Evergreen Reward Programme QR Code – One code for the main store; additional codes can be purchased.',
          },
          {
            text: 'Directory Listing – Business listing on 247GBS Business Directories & MCOM Lead Traffic Hub.',
          },
          {
            text: 'MCOM Wallet Access – Limited features for payment acceptance & reward credits.',
          },
          {
            text: 'Seasonal Campaign Participation – Eligible to join network-wide promotions.',
          },
          {
            text: 'Spare Capacity & Stock Audit Tool – Use to identify excess stock and create simple offers.',
          },
          {
            text: 'Basic Consumer Rewards – Offer rewards via the Evergreen Programme (run by 247GBS, not customisable).',
          },
          {
            text: '7-day, 15-day, or 21-day Challenges – Opportunity to earn credits to reduce future subscription costs.',
          },
          {
            text: 'Referral Credits – Limited ability to refer other businesses and earn credits.',
          },
          {
            text: 'Access to Smart Money Solutions – Limited package (VoIP, POS devices, Elavon payment solutions).',
          },
          {
            text: 'Marketing Exposure – Inclusion in seasonal directory promotions.',
          },
        ],
      },
    ],
  },
  {
    id: 'COBRANDED',
    name: 'CO-BRANDED BUSINESS OWNER',
    tierType: 'Highest tier – Standard, Pro, or Plus',
    description:
      'With the Plus sub-tier, all features are activated, providing comprehensive access and control.',
    benefitGroups: [
      {
        title: 'Core Co-Branded Access (All Tiers)',
        benefits: [
          {
            text: 'All PAYG Benefits – Full access without seasonal limitation.',
          },
          {
            text: 'Customisable Rewards & Loyalty Program – Internal loyalty program setup.',
          },
          {
            text: 'White-Label Branding – Loyalty cards, eGift cards, and marketing materials in your own brand.',
          },
          {
            text: 'Multiple QR Codes – For multiple branches, departments, or partner locations.',
          },
          {
            text: 'Cross-Selling Network Access – Sell other businesses’ products via your loyalty system.',
          },
          {
            text: 'Full Dashboard Access – Advanced analytics, customer insights, and management tools.',
          },
          {
            text: 'eGift Card Creation & Sale – Create and sell pre-purchased physical or digital cards.',
          },
          {
            text: 'Integration with MCOMECARD – Load rewards and cashback directly onto the consumer’s card.',
          },
          {
            text: 'Run Independent Campaigns – Market and advertise with or without 247GBS support.',
          },
          {
            text: 'Product & Service Sales Rights – Sell 247GBS products independently or as a licensed agent.',
          },
        ],
      },
      {
        title: 'Extra for Co-Branded Pro',
        benefits: [
          {
            text: 'Priority Marketing Campaigns – Access to 247GBS traffic leads and campaign packages.',
          },
          {
            text: 'Advanced Stock Audit Integration – AI-powered DealMachine integration.',
          },
          {
            text: 'Hyper-Local Partnerships – Partner with local stalls, events, and services for joint loyalty programs.',
          },
        ],
      },
      {
        title: 'Extra for Co-Branded Plus (Full Access)',
        benefits: [
          { text: 'All Features Activated – No restrictions.' },
          {
            text: 'Hyper Local Hub Partnership Eligibility – Bid to run physical MCOM Hyper Local Support Hubs.',
          },
          {
            text: 'Complete Automation – Seasonal preset campaigns auto-activated.',
          },
          {
            text: 'National & Regional Campaign Control – Lead and manage campaigns in assigned territories.',
          },
          {
            text: 'Unlimited Consumer Rewards – No cap on loyalty members or rewards.',
          },
          {
            text: 'AI & BOT Marketing Automation – Seasonal templates and predictive consumer offers.',
          },
        ],
      },
    ],
  },
];

// --- ICONS ---
const CheckmarkIcon = () => (
  <svg
    className="h-5 w-5 flex-shrink-0 text-green-500"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM9.29 16.29L5.7 12.7a1 1 0 011.42-1.42l2.18 2.18 5.29-5.3a1 1 0 111.42 1.42l-6 6a1 1 0 01-1.42 0z"
    />
  </svg>
);

const CollapseIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    className={`h-6 w-6 text-gray-500 transition-transform duration-300 ${
      isOpen ? 'rotate-180' : ''
    }`}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M7.41 8.59L12 13.17L16.59 8.59L18 10L12 16L6 10L7.41 8.59Z" />
  </svg>
);

const PricingPage: NextPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<Plan['id'] | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const router = useRouter();

  // Set the default open section. Only the first section of the first plan is open.
  useEffect(() => {
    const initialOpenState: Record<string, boolean> = {};
    if (plans.length > 0 && plans[0].benefitGroups.length > 0) {
      const firstSectionId = `${plans[0].id}-${plans[0].benefitGroups[0].title}`;
      initialOpenState[firstSectionId] = true;
    }
    setOpenSections(initialOpenState);
  }, []);

  const handleSelectPlan = (planId: Plan['id']) => {
    setSelectedPlan(planId);
  };

  const handleToggleSection = (sectionId: string) => {
    setOpenSections(prevState => ({
      ...prevState,
      [sectionId]: !prevState[sectionId],
    }));
  };

  const handleContinue = () => {
    if (selectedPlan) {
      console.log(`Continue button clicked. Selected plan: ${selectedPlan}`);
      router.push('/dashboard');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-700">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <header className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Select a package to unlock benefits and grow your business with our
            ecosystem.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`bg-white rounded-xl shadow-lg p-6 sm:p-8 border-2 transition-all duration-300 cursor-pointer h-full flex flex-col ${
                selectedPlan === plan.id
                  ? 'border-red-500 ring-2 ring-red-500/50'
                  : 'border-transparent hover:border-gray-300'
              }`}
              onClick={() => handleSelectPlan(plan.id)}
            >
              <div className="flex-grow">
                <div className="mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {plan.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{plan.tierType}</p>
                </div>
                <p className="text-gray-600 pb-6 border-b border-gray-200">
                  {plan.description}
                </p>

                <div className="space-y-6 mt-6">
                  {plan.benefitGroups.map(group => {
                    const sectionId = `${plan.id}-${group.title}`;
                    const isSectionOpen = !!openSections[sectionId];
                    return (
                      <div key={group.title}>
                        <h3
                          className="text-lg font-semibold text-gray-800 flex justify-between items-center cursor-pointer select-none"
                          onClick={e => {
                            e.stopPropagation();
                            handleToggleSection(sectionId);
                          }}
                        >
                          <span>{group.title}</span>
                          <CollapseIcon isOpen={isSectionOpen} />
                        </h3>
                        {isSectionOpen && (
                          <ul className="mt-4 space-y-3 pl-1">
                            {group.benefits.map((benefit, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-3"
                              >
                                <CheckmarkIcon />
                                <span className="text-gray-600">
                                  {benefit.text}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedPlan && (
          <div className="mt-12 text-center">
            <button
              className="bg-gray-800 text-white font-bold text-lg py-3 px-10 rounded-lg shadow-md hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-800/50"
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingPage;
