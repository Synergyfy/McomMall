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
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

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
        requestPartnership({ providerId: selectedService.business.id }, {
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
          <DialogTitle>Add Service Plus Partner</DialogTitle>
          <DialogDescription>
            Search for a service to recommend to your customers. A partnership request will be sent to the business owner.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 pt-4">
          <div className="flex items-center space-x-2">
            <Input
              id="search-service"
              placeholder="e.g., 'plumbing', 'electrician', 'cleaning'"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
          <ScrollArea className="h-72 w-full rounded-md border">
            <div className="p-4">
                {services && services.length > 0 ? (
                    services.map((service: IService) => (
                    <div
                        key={service.id}
                        className={cn(
                            'flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors',
                            selectedService?.id === service.id ? 'bg-red-100' : 'hover:bg-gray-100'
                        )}
                        onClick={() => setSelectedService(service)}
                    >
                        <Avatar className="h-12 w-12 border">
                            <AvatarImage src={service.business.logoUrl || ''} alt={service.business.businessName} />
                            <AvatarFallback>{service.business.businessName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{service.name}</h4>
                            <p className="text-sm text-gray-500">by {service.business.businessName}</p>
                        </div>
                    </div>
                    ))
                ) : (
                    <div className="text-center text-gray-500 py-10">
                        <p>No services found. Try a different search term.</p>
                    </div>
                )}
            </div>
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => setShowConfirmation(true)} disabled={!selectedService || isRequesting}>
            {isRequesting ? 'Sending...' : 'Send Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Confirm Partnership Request</AlertDialogTitle>
                <AlertDialogDescription>
                    Send a partnership request to <span className="font-semibold">{selectedService?.business.businessName}</span> for their service: <span className="font-semibold">&quot;{selectedService?.name}&quot;</span>?
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRequestPartnership} disabled={isRequesting}>
                    {isRequesting ? 'Sending...' : 'Confirm & Send'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}