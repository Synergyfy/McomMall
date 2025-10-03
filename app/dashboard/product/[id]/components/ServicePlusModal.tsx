'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchOwners, useRequestPartnership } from '@/service/partnerships/hooks';
import { User } from '@/service/user/types';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ServicePlusModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
}

export default function ServicePlusModal({
  isOpen,
  onClose,
}: ServicePlusModalProps) {
  const [serviceArea, setServiceArea] = useState('');
  const [selectedOwner, setSelectedOwner] = useState<User | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { data: owners, mutate: searchOwners, isPending: isSearching } = useSearchOwners();
  const { mutate: requestPartnership, isPending: isRequesting } = useRequestPartnership();

  const handleSearch = () => {
    if (serviceArea.trim()) {
      searchOwners({ serviceArea });
    }
  };

  const handleRequestPartnership = () => {
    if (selectedOwner) {
        requestPartnership({ providerId: selectedOwner.id }, {
            onSuccess: () => {
                toast.success('Partnership request sent successfully!');
                setShowConfirmation(false);
                setSelectedOwner(null);
                onClose();
            },
            onError: (error: Error) => {
                toast.error(error.message || "Failed to send partnership request.");
                setShowConfirmation(false);
            }
        });
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add Service Plus</DialogTitle>
          <DialogDescription>
            Search for a business owner to partner with based on their service area.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Input
              id="search-owner"
              placeholder="Search by service area..."
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
          <div className="mt-4 max-h-60 overflow-y-auto">
            {owners?.map((owner: User) => (
              <div
                key={owner.id}
                className={`flex items-center gap-4 p-2 rounded-md cursor-pointer ${selectedOwner?.id === owner.id ? 'bg-muted' : ''}`}
                onClick={() => setSelectedOwner(owner)}
              >
                <Avatar>
                    <AvatarImage src={owner.profilePictureUrl} />
                    <AvatarFallback>{owner.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h4 className="font-semibold">{owner.name}</h4>
                    <p className="text-sm text-muted-foreground">{owner.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => setShowConfirmation(true)} disabled={!selectedOwner}>
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Confirm Partnership Request</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to send a partnership request to {selectedOwner?.name}?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRequestPartnership} disabled={isRequesting}>
                    {isRequesting ? 'Sending...' : 'Confirm'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}