'use client';

import React, { useState } from 'react';
import { useGetUserListings } from '@/service/listings/hook';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  Chrome,
  BadgeCheck,
  FileText,
  Loader2,
  ChevronRight,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { VerificationStatusCard } from './components/VerificationStatusCard';
import { GoogleConnectionPanel } from './components/GoogleConnectionPanel';
import { OwnershipVerificationFlow } from './components/OwnershipVerificationFlow';
import { DocumentUploader } from './components/DocumentUploader';

export default function StorefrontVerificationPage() {
  const router = useRouter();

  // Fetch listing data
  const { data: listingsData, isLoading: isLoadingListing } = useGetUserListings(1, 1);
  const listing = listingsData?.data?.[0];

  const [activeTab, setActiveTab] = useState<'overview' | 'ownership' | 'google' | 'documents'>('overview');

  if (isLoadingListing) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6 shadow-md border-orange-200">
          <CardContent className="space-y-4">
            <h2 className="text-2xl font-bold">No Storefront Found</h2>
            <p className="text-gray-500">Create a business profile first to manage verification.</p>
            <Button className="w-full bg-orange-600" onClick={() => router.push('/dashboard/add-listing')}>
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans pb-20">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/storefront')}
            className="text-gray-500 hover:text-gray-900 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>Storefront</span>
              <ChevronRight className="w-3 h-3" />
              <span>Verification</span>
            </div>
            <h1 className="text-lg font-bold text-gray-950 font-sans">Business Verification</h1>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Status badges summary panel */}
        <VerificationStatusCard
          isVerified={listing.isVerified}
          isClaimed={listing.isClaimed}
          isGoogleVerified={listing.isGoogleVerified}
        />

        {/* Tabbed layout */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[400px]">
          {/* Left panel tabs */}
          <div className="md:w-56 border-r border-gray-150 bg-gray-50/50 flex flex-row md:flex-col p-2 gap-1 overflow-x-auto shrink-0 md:overflow-x-visible">
            {[
              { id: 'overview', label: 'Verification Info', icon: <ShieldCheck className="w-4 h-4" /> },
              { id: 'ownership', label: 'Owner Verification', icon: <BadgeCheck className="w-4 h-4" /> },
              { id: 'google', label: 'Google Connection', icon: <Chrome className="w-4 h-4" /> },
              { id: 'documents', label: 'Official Documents', icon: <FileText className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-all shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-orange-50 text-orange-700 font-bold'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Right panel content */}
          <div className="flex-grow p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Why verify your business?</h3>
                  <p className="text-xs text-gray-500">MCOM Mall runs on trust. Verifying unlocks critical discovery features.</p>
                </div>

                <div className="grid gap-4 text-xs text-gray-600">
                  <div className="p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                    <h4 className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                      ✓ Search & Discovery Boost
                    </h4>
                    <p className="text-gray-500 leading-relaxed mt-1">
                      Verified merchants receive up to <strong>3x higher ranking priority</strong> in both the Borough campaigns feed and Local Mall search page.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                    <h4 className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                      ✓ Verified Merchant Badge
                    </h4>
                    <p className="text-gray-500 leading-relaxed mt-1">
                      A visual checkmark icon is displayed beside your business logo on public storefront pages, boosting customer confidence and conversion rates by up to 22%.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                    <h4 className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                      ✓ Instant Spare Capacity Pushes
                    </h4>
                    <p className="text-gray-500 leading-relaxed mt-1">
                      Only verified merchants can launch instant spare capacity offers directly to the Local Mall live booking feed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ownership' && (
              <OwnershipVerificationFlow listing={listing} />
            )}

            {activeTab === 'google' && (
              <GoogleConnectionPanel listing={listing} />
            )}

            {activeTab === 'documents' && (
              <DocumentUploader listingId={listing.id} />
            )}
          </div>
        </div>

        {/* Contact Support widget */}
        <Card className="border-gray-200/60 shadow-sm bg-gradient-to-r from-orange-50/30 to-amber-50/10 p-5 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-orange-500" /> Need Help Verifying?
              </h4>
              <p className="text-xs text-gray-500 max-w-xl">
                If you are having trouble connecting your Google profile, or do not have the required registration certificates, contact our admin support team directly to request manual review.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard/support-tickets')}
              className="border-orange-200 hover:bg-orange-50/50 hover:text-orange-700 text-orange-600 font-semibold text-xs shrink-0 self-start sm:self-center"
              id="support-ticket-btn"
            >
              Open Support Ticket
            </Button>
          </div>
        </Card>

      </main>
    </div>
  );
}
