'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import GoogleLogo from '@/app/components/GoogleLogo';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface GoogleVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  placeId: string;
  onPlaceIdChange: (value: string) => void;
}

export const GoogleVerificationModal: React.FC<
  GoogleVerificationModalProps
> = ({ isOpen, onClose, onContinue, placeId, onPlaceIdChange }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-bold text-center">
            Authenticate with Google
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2">
            {
              " You'll be redirected to Google to authenticate and verify your business. Please select the Gmail account you registered your business with."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-4 space-y-2">
          <Label htmlFor="placeId" className="text-left">
            Google Place ID
          </Label>
          <Input
            id="placeId"
            type="text"
            placeholder="Enter your Google Place ID"
            value={placeId}
            onChange={e => onPlaceIdChange(e.target.value)}
            className="w-full"
          />
        </div>
        <DialogFooter className="p-6 pt-4">
          <Button
            onClick={onContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center text-lg"
          >
            <GoogleLogo className="mr-3 h-6 w-6" />
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
