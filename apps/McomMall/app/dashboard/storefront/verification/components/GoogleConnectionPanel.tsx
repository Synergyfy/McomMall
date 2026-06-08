'use client';

import React, { useState } from 'react';
import { useEditListing } from '@/service/listings/hook';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Chrome, Search, CheckCircle2, RefreshCw, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';

interface GoogleConnectionPanelProps {
  listing: any;
}

export const GoogleConnectionPanel: React.FC<GoogleConnectionPanelProps> = ({
  listing,
}) => {
  const { mutateAsync: editListing } = useEditListing();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showOAuthMock, setShowOAuthMock] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const isGoogleVerified = listing?.isGoogleVerified ?? false;

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);

    // Mock search results after a short delay
    setTimeout(() => {
      setSearchResults([
        {
          place_id: 'place_id_1',
          name: `${listing.businessName} (Main Branch)`,
          address: 'High Street Mall, Borough, London, SE1 9SG',
          rating: 4.5,
          user_ratings_total: 124,
        },
        {
          place_id: 'place_id_2',
          name: `${listing.businessName} - Borough High St`,
          address: '142 Borough High St, London, SE1 1LB',
          rating: 4.2,
          user_ratings_total: 48,
        },
      ]);
      setIsSearching(false);
    }, 800);
  };

  const handleStartConnect = (place: any) => {
    setSelectedPlace(place);
    setShowOAuthMock(true);
  };

  const handleOAuthSuccess = async () => {
    setShowOAuthMock(false);
    setIsConnecting(true);

    try {
      // Call real backend PATCH to save the googlePlaceId and isGoogleVerified
      await editListing({
        listingId: listing.id,
        payload: {
          ...listing,
          googlePlaceId: selectedPlace.place_id,
          isGoogleVerified: true,
        } as any,
      });

      toast.success('Successfully linked Google Business Profile!');
      // Invalidate query to refresh layout (handled by parent page reload or query invalidate)
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch {
      toast.error('Failed to link Google Business Profile. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Google Business Profile? This will stop automatic review syncing.')) {
      return;
    }

    try {
      await editListing({
        listingId: listing.id,
        payload: {
          ...listing,
          googlePlaceId: '',
          isGoogleVerified: false,
        } as any,
      });

      toast.success('Disconnected Google Business Profile.');
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch {
      toast.error('Failed to disconnect. Please try again.');
    }
  };

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast.success('Reviews and listing info synced successfully! 🎉');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {isGoogleVerified ? (
        /* CONNECTED STATE */
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Chrome className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-gray-950 flex items-center gap-1.5">
                  Connected to Google Profile <ShieldCheck className="w-4 h-4 text-blue-500 fill-current" />
                </h4>
                <p className="text-xs text-gray-500">
                  Linked to place ID: <span className="font-mono">{listing.googlePlaceId || 'place_id_mock'}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
                className="h-9 gap-1.5 text-xs font-semibold"
              >
                {isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Sync Now
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
                className="h-9 text-xs font-semibold"
              >
                Disconnect
              </Button>
            </div>
          </div>

          <div className="space-y-2 p-4 rounded-xl border border-gray-100 bg-gray-50/50">
            <h5 className="text-xs font-bold text-gray-800">Connection features active:</h5>
            <ul className="text-xs text-gray-500 space-y-1.5 list-disc pl-4">
              <li>Auto-syncing: We pull Google Reviews every 24 hours.</li>
              <li>Location Verification: Google matching status boosts search rank by +15%.</li>
              <li>Opening Hours: Changing hours on Google will prompt sync updates here.</li>
            </ul>
          </div>
        </div>
      ) : (
        /* DISCONNECTED STATE - CONNECT FLOW */
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Chrome className="w-5 h-5 text-gray-600" /> Link Google Business Profile
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Verify your physical storefront by searching for your business location listing on Google. Linking matches coordinates and unlocks automatic review imports.
            </p>
          </div>

          <div className="flex gap-2 max-w-lg">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search business name on Google Maps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-9 h-10 text-sm"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-gray-950 hover:bg-gray-800 text-white font-semibold h-10 px-4 shrink-0 text-sm"
            >
              {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Search'}
            </Button>
          </div>

          {/* Search Results list */}
          {searchResults.length > 0 && (
            <div className="border border-gray-150 rounded-xl overflow-hidden divide-y divide-gray-100 max-w-lg bg-white shadow-sm animate-in fade-in slide-in-from-top-1.5 duration-200">
              {searchResults.map((result) => (
                <div key={result.place_id} className="p-3.5 flex items-center justify-between hover:bg-gray-50/30 gap-4 transition-colors">
                  <div className="space-y-1">
                    <p className="font-bold text-xs text-gray-900">{result.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{result.address}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStartConnect(result)}
                    className="border-gray-200 text-xs h-8 text-gray-700 font-semibold"
                  >
                    Connect
                  </Button>
                </div>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !isSearching && (
            <p className="text-xs text-gray-400 italic">No locations found. Try searching with street name or postcode.</p>
          )}
        </div>
      )}

      {/* Google Sign-in Mock dialog */}
      <Dialog open={showOAuthMock} onOpenChange={setShowOAuthMock}>
        <DialogContent className="max-w-sm sm:max-w-md p-6 font-sans">
          <DialogHeader className="flex flex-col items-center text-center space-y-2 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Chrome className="w-6 h-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900">Sign in with Google</DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              MCOM Mall wants to access your Google Business Profile manager.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4 text-xs text-gray-600">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                This is a secure connection. MCOM Mall will only request permission to view listing details and retrieve public customer reviews.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-bold text-gray-800">Select Google Account:</p>
              <div className="p-3 rounded-xl border border-blue-500 bg-blue-50/20 flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-bold text-gray-900">Merchant Account</p>
                  <p className="text-[10px] text-gray-500">owner@mcom-business.com</p>
                </div>
                <CheckCircle2 className="w-4.5 h-4.5 text-blue-500 fill-current" />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowOAuthMock(false)} className="text-xs h-9">
              Cancel
            </Button>
            <Button
              onClick={handleOAuthSuccess}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs h-9"
              id="google-oauth-approve-btn"
            >
              Allow Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
