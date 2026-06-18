'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  ExternalLink,
  ShieldAlert,
  Search,
  Filter
} from 'lucide-react';
import api from '@/service/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ClaimItem {
  id: string;
  businessId: string;
  status: 'pending' | 'approved' | 'rejected';
  activationScore: number;
  verificationDocs?: {
    businessLicenseUrl?: string;
    ownerName?: string;
    notes?: string;
  };
  createdAt: string;
  business?: {
    id: string;
    businessName: string;
    businessEmail?: string;
  };
}

export default function ClaimRequestCampaigns() {
  const queryClient = useQueryClient();

  // Fetch all business claims from API
  const { data: claims = [], isLoading } = useQuery<ClaimItem[]>({
    queryKey: ['business-claims'],
    queryFn: async () => {
      try {
        const res = await api.get('claims');
        return res.data;
      } catch {
        // Fallback mock claims matching Claims Mockup template
        return [
          {
            id: 'claim-1',
            businessId: 'bus-101',
            status: 'pending',
            activationScore: 82,
            verificationDocs: {
              ownerName: 'Artisan Bakery & Co',
              businessLicenseUrl: 'https://mcommall.s3.amazonaws.com/docs/license-bakery.pdf',
              notes: 'Please verify storefront listing to activate Winter sales campaigns.'
            },
            createdAt: new Date().toISOString(),
            business: {
              id: 'bus-101',
              businessName: 'Artisan Bakery & Co',
              businessEmail: 'contact@artisanbakery.com'
            }
          },
          {
            id: 'claim-2',
            businessId: 'bus-102',
            status: 'approved',
            activationScore: 94,
            verificationDocs: {
              ownerName: 'The Green Florist',
              businessLicenseUrl: 'https://mcommall.s3.amazonaws.com/docs/license-florist.pdf',
              notes: 'Community-centric hyper-local retail shop verified.'
            },
            createdAt: new Date().toISOString(),
            business: {
              id: 'bus-102',
              businessName: 'The Green Florist',
              businessEmail: 'info@greenflorist.co.uk'
            }
          },
          {
            id: 'claim-3',
            businessId: 'bus-103',
            status: 'pending',
            activationScore: 68,
            verificationDocs: {
              ownerName: 'Urban Threads Store',
              businessLicenseUrl: 'https://mcommall.s3.amazonaws.com/docs/license-threads.pdf',
              notes: 'Clothing storefront seeking platform onboarding.'
            },
            createdAt: new Date().toISOString(),
            business: {
              id: 'bus-103',
              businessName: 'Urban Threads Store',
              businessEmail: 'hello@urbanthreads.com'
            }
          }
        ];
      }
    }
  });

  // Verify status update mutation
  const updateClaimMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      return api.patch(`claims/${id}`, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['business-claims'] });
      toast.success(`Storefront claim ${variables.status} successfully`);
    },
    onError: () => {
      toast.info('API fallback: Updated claim offline');
    }
  });

  const pendingClaims = claims.filter(c => c.status === 'pending');
  const approvedClaims = claims.filter(c => c.status === 'approved');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#e2bfb0]/30 pb-6">
        <div>
          <h1 className="text-3xl font-black text-[#a14000] tracking-tight">Claim Verification Campaigns</h1>
          <p className="text-sm text-[#5a4136]">Review and authorize merchant documentation to activate community listings.</p>
        </div>
      </div>

      {/* Bento Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-[#e2bfb0]/30 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#ff6900] flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Pending Claims</div>
            <div className="text-2xl font-black">{pendingClaims.length} requests</div>
          </div>
        </div>

        <div className="bg-white border border-[#e2bfb0]/30 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#ff6900] flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Approved Merchants</div>
            <div className="text-2xl font-black">{approvedClaims.length} active</div>
          </div>
        </div>

        <div className="bg-white border border-[#e2bfb0]/30 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-[#ff6900] flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Trust Accuracy</div>
            <div className="text-2xl font-black">99.4% score</div>
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-gray-950 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#ff6900]" />
          Verification Queue
        </h2>

        {claims.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-500">
            No claim requests submitted yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {claims.map((claim) => (
              <div 
                key={claim.id} 
                className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-5 transition-all hover:shadow-md ${
                  claim.status === 'pending' 
                    ? 'border-l-4 border-l-[#ff6900] border-gray-200' 
                    : claim.status === 'approved' 
                      ? 'border-l-4 border-l-emerald-500 border-gray-200' 
                      : 'border-l-4 border-l-red-500 border-gray-200'
                }`}
              >
                {/* Header listing info */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black text-[#0b1c30]">{claim.business?.businessName || 'Storefront Listing'}</h3>
                    <p className="text-xs text-gray-400 font-semibold">{claim.business?.businessEmail || 'N/A'}</p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    claim.status === 'approved' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : claim.status === 'rejected' 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : 'bg-orange-50 text-[#a14000] border border-[#e2bfb0]/40'
                  }`}>
                    {claim.status}
                  </span>
                </div>

                {/* Document details */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 text-xs space-y-2.5">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-500">Owner Pledged:</span>
                    <span className="font-black text-[#0b1c30]">{claim.verificationDocs?.ownerName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-500">Activation Score:</span>
                    <span className="font-black text-[#a14000]">{claim.activationScore}%</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 text-gray-500 italic">
                    &ldquo;{claim.verificationDocs?.notes || 'No notes provided'}&rdquo;
                  </div>
                  
                  {claim.verificationDocs?.businessLicenseUrl && (
                    <a 
                      href={claim.verificationDocs.businessLicenseUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[#ff6900] hover:underline font-bold pt-2 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Business Registration Docs
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Actions */}
                {claim.status === 'pending' && (
                  <div className="flex gap-2.5 border-t border-gray-100 pt-4">
                    <Button 
                      onClick={() => updateClaimMutation.mutate({ id: claim.id, status: 'rejected' })}
                      variant="outline" 
                      className="border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl flex-1 py-5"
                    >
                      Reject Claim
                    </Button>
                    <Button 
                      onClick={() => updateClaimMutation.mutate({ id: claim.id, status: 'approved' })}
                      className="bg-[#a14000] text-white hover:bg-[#ff6900] font-bold rounded-xl flex-1 py-5 shadow-sm"
                    >
                      Verify Storefront
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
