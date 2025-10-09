"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Membership } from '@/service/membership/types';
import { CheckCircle, PartyPopper } from 'lucide-react';

interface MembershipSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  membership: Membership | null;
}

const MembershipSuccessDialog = ({
  isOpen,
  onClose,
  membership,
}: MembershipSuccessDialogProps) => {
  if (!membership) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="flex flex-col items-center">
          <div className="bg-green-100 p-3 rounded-full mb-4">
            <PartyPopper className="h-10 w-10 text-green-600" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            Congratulations!
          </DialogTitle>
          <DialogDescription className="mt-2">
            You are now a{' '}
            <span className="font-semibold text-primary">
              {membership.tier}
            </span>{' '}
            member.
          </DialogDescription>
        </DialogHeader>
        <div className="my-6">
          <p className="text-muted-foreground">
            Your membership is active and will expire on{' '}
            <span className="font-medium text-foreground">
              {new Date(membership.expiresAt).toLocaleDateString()}.
            </span>
          </p>
          <div className="mt-4 flex justify-center items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            <p className="font-semibold">Payment Successful</p>
          </div>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MembershipSuccessDialog;