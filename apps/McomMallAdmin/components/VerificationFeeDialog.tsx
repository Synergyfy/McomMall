'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { setLoginModalOpen } from '@/service/store/uiSlice';

interface VerificationFeeDialogProps {
  listingId: string;
}

export function VerificationFeeDialog({ listingId }: VerificationFeeDialogProps) {
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const { accessToken } = useSelector((state: RootState) => state.auth);

  const handleClaimClick = () => {
    if (accessToken) {
      setIsFeeDialogOpen(true);
    } else {
      dispatch(setLoginModalOpen(true));
    }
  };

  const handleContinue = () => {
    router.push(`/pricing?listing_id=${listingId}`);
  };

  return (
    <>
      <Button
        variant="outline"
        className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 cursor-pointer"
        onClick={handleClaimClick}
      >
        <AlertTriangle className="mr-2 h-4 w-4" />
        Not Verified - Claim with Mcom
      </Button>

      <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Claim Your Listing</DialogTitle>
            <DialogDescription>
              To verify your listing, you&apos;ll be charged a one-time fee of £1.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFeeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleContinue}>Continue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
