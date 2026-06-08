'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldCheck, ShieldAlert, BadgeCheck, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface VerificationStatusCardProps {
  isVerified: boolean;
  isClaimed: boolean;
  isGoogleVerified: boolean;
}

export const VerificationStatusCard: React.FC<VerificationStatusCardProps> = ({
  isVerified,
  isClaimed,
  isGoogleVerified,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Ownership Verification */}
      <Card className="border-gray-200/60 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-5 flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50/70 text-amber-600'
          }`}>
            {isVerified ? <BadgeCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Ownership Status</h4>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-base font-bold text-gray-950">
                {isVerified ? 'Verified Account' : 'Unverified Owner'}
              </span>
              {isVerified ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <Clock className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed pt-1">
              {isVerified 
                ? 'Your ownership of this business listing has been verified by the MCOM team.'
                : 'Ownership has not been confirmed yet. Submit business registration details to verify.'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 2. Google Business Connection */}
      <Card className="border-gray-200/60 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-5 flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isGoogleVerified ? 'bg-blue-50 text-blue-600' : 'bg-red-50/50 text-red-500'
          }`}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Google Profile</h4>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-base font-bold text-gray-950">
                {isGoogleVerified ? 'Google Connected' : 'Not Connected'}
              </span>
              {isGoogleVerified ? (
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed pt-1">
              {isGoogleVerified 
                ? 'Your listing is synced with your Google Business Profile. Reviews sync automatically.'
                : 'Connect your Google Profile to import reviews and confirm matching location details.'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Claim Status */}
      <Card className="border-gray-200/60 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-5 flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isClaimed ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'
          }`}>
            <BadgeCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Listing Claim Status</h4>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-base font-bold text-gray-950">
                {isClaimed ? 'Listing Claimed' : 'Unclaimed Listing'}
              </span>
              {isClaimed ? (
                <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed pt-1">
              {isClaimed 
                ? 'This listing is fully claimed by your merchant user account.'
                : 'Listing needs to be claimed. Unclaimed listings have restricted features.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
