'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSubmitAudit } from '@/service/audits/hooks';
import { 
  ArrowLeft, 
  ArrowRight, 
  Lightbulb, 
  Sparkles, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuestionStep {
  id: string;
  question: string;
  field: string;
  tip: string;
  options: {
    value: string;
    label: string;
    description: string;
  }[];
}

const steps: QuestionStep[] = [
  {
    id: 'campaigns',
    question: 'How often do you run or update active campaigns?',
    field: 'campaignFrequency',
    tip: 'Stores that refresh advertising campaigns at least weekly receive 3.5x higher search impressions in local search results.',
    options: [
      { value: 'daily', label: 'Daily', description: 'We post daily deals or coordinate flash sales.' },
      { value: 'weekly', label: 'Weekly', description: 'We cycle promotional campaign listings weekly.' },
      { value: 'monthly', label: 'Monthly', description: 'We update seasonal flyers or offers monthly.' },
      { value: 'rarely', label: 'Rarely / Never', description: 'We rarely publish campaigns or have none.' },
    ],
  },
  {
    id: 'loyalty',
    question: 'Do you have active loyalty vouchers or reward points configured?',
    field: 'hasLoyalty',
    tip: 'Configuring loyalty points or welcome vouchers generates a 22% increase in returning customer visits within the first 30 days.',
    options: [
      { value: 'yes', label: 'Yes, Active', description: 'We reward repeat purchases via points or stamps.' },
      { value: 'no', label: 'No Active Rewards', description: 'We do not have point-transacting loyalty tools active.' },
    ],
  },
  {
    id: 'google',
    question: 'Is your Google Place / Google Business profile verified and synced?',
    field: 'googleVerified',
    tip: 'Verified Google places are boosted in McomMall proximity grids, increasing mapping reach by up to 30%.',
    options: [
      { value: 'yes', label: 'Yes, Verified', description: 'Our Google Business Profile is synced and verified.' },
      { value: 'no', label: 'Unverified / Unsynced', description: 'Not verified on Google or not linked to McomMall.' },
    ],
  },
  {
    id: 'catalog',
    question: 'How complete is your storefront product/service metadata catalog?',
    field: 'profileComplete',
    tip: 'Adding descriptions and high-resolution images to at least 5 products increases profile checkout conversion rates.',
    options: [
      { value: 'yes', label: 'Complete Catalog', description: 'Logo, banner, and multiple products are set up.' },
      { value: 'no', label: 'Incomplete / Pending', description: 'Partially set up, missing listings, or placeholders.' },
    ],
  },
];

export default function ShortAuditWizard() {
  const router = useRouter();
  const submitAuditMutation = useSubmitAudit();
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const currentStep = steps[currentStepIdx];
  const progressPercent = Math.round(((currentStepIdx + 1) / steps.length) * 100);

  const handleSelectOption = (value: string) => {
    setResponses(prev => ({
      ...prev,
      [currentStep.field]: value,
    }));
  };

  const handleNext = async () => {
    if (!responses[currentStep.field]) return;

    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else {
      // Submit the audit questionnaire to NestJS backend API
      try {
        await submitAuditMutation.mutateAsync({
          type: 'short',
          responses,
          businessId: undefined, // Will be resolved by the logged-in user's listing on the backend
        });
        // On success redirect to the results analysis screen
        router.push('/dashboard/membership-audits/audits/results');
      } catch (err) {
        console.error('Audit submission failed:', err);
      }
    }
  };

  const handleBack = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const isSelected = (value: string) => responses[currentStep.field] === value;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Wizard Top Nav */}
      <div className="flex justify-between items-center border-b pb-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/dashboard/membership-audits/audits')}
            className="hover:bg-gray-150 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Short Storefront Audit</h2>
            <p className="text-xs text-gray-500">Step {currentStepIdx + 1} of {steps.length}</p>
          </div>
        </div>
        
        <Button 
          variant="ghost"
          onClick={() => router.push('/dashboard/membership-audits/audits')}
          className="text-xs font-semibold text-gray-400 hover:text-gray-650"
        >
          Cancel & Exit
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-400 font-medium">
          <span>Diagnostics Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden shadow-inner">
          <div 
            className="bg-[#ff6900] h-full rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Form Box */}
      <div className="bg-white border border-gray-250 rounded-3xl p-6 shadow-sm space-y-8 min-h-[360px] flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-black uppercase text-[#ff6900] bg-orange-50 px-2 py-0.5 rounded-md">
            Question {currentStepIdx + 1}
          </span>
          <h3 className="text-xl font-extrabold text-gray-900 mt-3.5 leading-snug">
            {currentStep.question}
          </h3>

          {/* Selectable Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {currentStep.options.map((opt) => {
              const active = isSelected(opt.value);
              return (
                <div
                  key={opt.value}
                  onClick={() => handleSelectOption(opt.value)}
                  className={`border rounded-2xl p-4 cursor-pointer transition-all flex flex-col justify-between text-left select-none ${
                    active
                      ? 'border-[#ff6900] bg-[#fcf8f6]/50 shadow-inner'
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
                  }`}
                >
                  <div>
                    <h4 className={`font-bold text-sm ${active ? 'text-[#ff6900]' : 'text-gray-800'}`}>
                      {opt.label}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                  {active && (
                    <div className="mt-3 self-end text-[#ff6900]">
                      <CheckCircle className="w-4 h-4 fill-[#ff6900] text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Action Buttons */}
        <div className="flex justify-between items-center border-t pt-5">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStepIdx === 0}
            className="text-xs font-semibold text-gray-500 disabled:opacity-30 hover:bg-gray-50 rounded-xl px-4 py-2"
          >
            ← Back
          </Button>

          <Button
            onClick={handleNext}
            disabled={!responses[currentStep.field] || submitAuditMutation.isPending}
            className="bg-[#ff6900] hover:bg-[#a14000] text-white flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-orange-600/10"
          >
            {submitAuditMutation.isPending ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : currentStepIdx === steps.length - 1 ? (
              <>
                <span>Submit & View Results</span>
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Context Pro-Tip Box */}
      <div className="bg-gradient-to-r from-orange-50/20 to-red-50/20 border border-orange-100/40 rounded-2xl p-5 flex gap-4">
        <div className="w-8 h-8 rounded-full bg-orange-100/60 text-[#ff6900] flex items-center justify-center shrink-0">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <h4 className="font-bold text-xs text-gray-800 flex items-center gap-1">
            Growth Advisor Tip
          </h4>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            {currentStep.tip}
          </p>
        </div>
      </div>
    </div>
  );
}
