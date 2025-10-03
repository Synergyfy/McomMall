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
import { useRequestPartnership } from '@/service/partnerships/hooks';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSearchServices } from '@/service/services/hooks';
import { IService } from '@/service/services/types';

interface ServicePlusModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
}

export default function ServicePlusModal({
  isOpen,
  onClose,
}: ServicePlusModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<IService | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { data: services, mutate: searchServices, isPending: isSearching } = useSearchServices();
  const { mutate: requestPartnership, isPending: isRequesting } = useRequestPartnership();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchServices({ term: searchTerm });
    }
  };

  const handleRequestPartnership = () => {
    if (selectedService) {
        requestPartnership({ providerId: selectedService.owner.id }, {
            onSuccess: () => {
                toast.success('Partnership request sent successfully!');
                setShowConfirmation(false);
                setSelectedService(null);
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
            Search for a service to recommend to your customers.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Input
              id="search-service"
              placeholder="Search by service name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
          <div className="mt-4 max-h-60 overflow-y-auto">
            {services?.map((service: IService) => (
              <div
                key={service.id}
                className={`flex items-center gap-4 p-2 rounded-md cursor-pointer ${selectedService?.id === service.id ? 'bg-muted' : ''}`}
                onClick={() => setSelectedService(service)}
              >
                <Avatar>
                    <AvatarImage src={service.owner.profilePictureUrl} />
                    <AvatarFallback>{service.owner.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h4 className="font-semibold">{service.name}</h4>
                    <p className="text-sm text-muted-foreground">by {service.owner.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => setShowConfirmation(true)} disabled={!selectedService}>
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
                    Are you sure you want to send a partnership request to the provider of &quot;{selectedService?.name}&quot;?
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