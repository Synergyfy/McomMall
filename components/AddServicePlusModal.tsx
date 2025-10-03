'use client';

import * as React from 'react';
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
import { Search, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useSearchServices, useRequestPartnership } from '@/service/services/hooks';
import { IService } from '@/types/service';

interface AddServicePlusModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

enum ModalState {
  Search,
  Submitting,
  Success,
}

export default function AddServicePlusModal({
  isOpen,
  onOpenChange,
}: AddServicePlusModalProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [modalState, setModalState] = React.useState<ModalState>(ModalState.Search);
  const [selectedService, setSelectedService] = React.useState<IService | null>(null);

  const {
    searchResults,
    isSearching,
    search,
  } = useSearchServices();

  const { mutate: requestPartnership, isPending: isRequesting } = useRequestPartnership();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      search(searchTerm);
    }
  };

  const handleRequestPartnership = (service: IService) => {
    if (!service.owner) {
        // In a real app, show a toast notification
        console.error("Cannot request partnership: Service owner is not defined.");
        return;
    }
    setSelectedService(service);
    setModalState(ModalState.Submitting);

    // Assuming the `providerId` is the service owner's ID
    requestPartnership({ providerId: service.owner.id }, {
        onSuccess: () => {
            setModalState(ModalState.Success);
        },
        onError: () => {
            // Handle error, maybe show a toast
            setModalState(ModalState.Search);
        }
    });
  };

  const resetAndClose = () => {
    setSearchTerm('');
    setModalState(ModalState.Search);
    setSelectedService(null);
    onOpenChange(false);
  };

  const renderContent = () => {
    switch (modalState) {
      case ModalState.Success:
        return (
          <div className="text-center p-8 flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Request Sent!</h3>
            <p className="text-gray-500">
              Your partnership request has been sent to{' '}
              <span className="font-medium text-gray-700">{selectedService?.owner?.name || 'the service provider'}</span>.
            </p>
            <DialogFooter className="mt-6">
              <Button onClick={resetAndClose}>Done</Button>
            </DialogFooter>
          </div>
        );
      case ModalState.Submitting:
        return (
            <div className="text-center p-8 flex flex-col items-center">
                <Loader2 className="w-16 h-16 text-red-500 animate-spin mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sending Request...</h3>
                <p className="text-gray-500">Please wait while we send your partnership request.</p>
            </div>
        );
      case ModalState.Search:
      default:
        return (
          <>
            <DialogHeader>
              <DialogTitle>Add Service Plus Partner</DialogTitle>
              <DialogDescription>
                Search for a service provider to partner with for this product.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSearch}>
              <div className="flex gap-2 my-4">
                <Input
                  placeholder="Search for services (e.g., 'plumbing')"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <Button type="submit" disabled={isSearching || !searchTerm.trim()}>
                  {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
                </Button>
              </div>
            </form>
            <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
              {isSearching && <p className="text-center text-gray-500">Searching...</p>}
              {!isSearching && searchResults && searchResults.length === 0 && (
                <p className="text-center text-gray-500">No services found.</p>
              )}
              {searchResults?.map(service => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{service.name}</p>
                    <p className="text-sm text-gray-500">by {service.owner?.name || 'Unknown Provider'}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRequestPartnership(service)}
                    disabled={isRequesting}
                  >
                    <Send className="mr-2 h-4 w-4" /> Request
                  </Button>
                </div>
              ))}
            </div>
            <DialogFooter className="mt-4">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}