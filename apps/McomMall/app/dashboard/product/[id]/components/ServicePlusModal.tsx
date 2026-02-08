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
import { useCreatePartnershipRequest } from '@/service/partnerships/hooks';
import { useSendMessage } from '@/service/messaging/hook';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSearchServices } from '@/service/services/hooks';
import { IService } from '@/service/services/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { SuccessDialog } from '@/components/ui/SuccessDialog';
import { Textarea } from '@/components/ui/textarea';

interface ServicePlusModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
}

export default function ServicePlusModal({
  isOpen,
  onClose,
  productId,
}: ServicePlusModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<IService | null>(null);
  const [message, setMessage] = useState('');
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const { data: services, mutate: searchServices, isPending: isSearching } = useSearchServices();
  const { mutateAsync: createPartnership, isPending: isRequesting } = useCreatePartnershipRequest();
  const { mutate: sendMessage } = useSendMessage();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      searchServices({ term: searchTerm });
    }
  };

  const handleRequestPartnership = async () => {
    if (selectedService) {
      try {
        await createPartnership({
          productId,
          serviceId: selectedService.id,
        });

        if (message.trim()) {
          sendMessage({
            content: message,
            receiverId: selectedService.business.userId,
          });
        }

        setRequestError(null);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setRequestError(error.message);
        } else {
          setRequestError('An unknown error occurred.');
        }
      } finally {
        setShowResultDialog(true);
      }
    }
  };

  const closeAllModals = () => {
    setShowResultDialog(false);
    setSelectedService(null);
    setMessage('');
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Add Service Plus Partner</DialogTitle>
            <DialogDescription>
              Search for a service to recommend. A partnership request will be sent to the business owner.
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
            <ScrollArea className="h-60 w-full rounded-md border">
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
            {selectedService && (
              <div className="grid gap-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message (optional)
                </label>
                <Textarea
                  id="message"
                  placeholder="Write a brief message to the service owner..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleRequestPartnership} disabled={!selectedService || isRequesting}>
              {isRequesting ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SuccessDialog
        isOpen={showResultDialog}
        onClose={closeAllModals}
        title={requestError ? 'Request Failed' : 'Request Sent!'}
        description={
          requestError
            ? requestError
            : `Your partnership request has been sent to ${selectedService?.business.businessName}. You can track its status on your dashboard.`
        }
        variant={requestError ? 'error' : 'success'}
        buttonText="Close"
      />
    </>
  );
}