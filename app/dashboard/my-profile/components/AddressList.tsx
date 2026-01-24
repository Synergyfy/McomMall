'use client';

import { useState } from 'react';
import {
  useGetShippingAddresses,
  useDeleteShippingAddress,
  useSetMainShippingAddress,
} from '@/service/shipping/hook';
import { ShippingAddress } from '@/service/shipping/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import AddressFormDialog from './AddressFormDialog';
import { toast } from 'sonner';

export default function AddressList() {
  const { data, isLoading, isError } = useGetShippingAddresses(1, 50); // Fetch up to 50 addresses
  const deleteMutation = useDeleteShippingAddress();
  const setMainMutation = useSetMainShippingAddress();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(
    null
  );
  const [addressToDelete, setAddressToDelete] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Address deleted successfully');
        setAddressToDelete(null);
      },
      onError: (error) => {
        toast.error(`Failed to delete address: ${error.message}`);
      },
    });
  };

  const handleSetMain = (id: string) => {
    setMainMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Default address updated');
      },
      onError: (error) => {
        toast.error(`Failed to update default address: ${error.message}`);
      },
    });
  };

  const openAddDialog = () => {
    setEditingAddress(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (address: ShippingAddress) => {
    setEditingAddress(address);
    setIsDialogOpen(true);
  };

  if (isLoading) return <div>Loading addresses...</div>;
  if (isError) return <div>Failed to load addresses.</div>;

  const addresses = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Saved Addresses
        </h2>
        <Button onClick={openAddDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed dark:bg-gray-800 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            You haven't saved any addresses yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card key={address.id} className="relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">
                      {address.addressName}
                    </h3>
                    {address.isMain && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Default
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {address.recipientName}
                  </p>
                  <p>{address.addressLine1}</p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  <p>
                    {address.city}, {address.state} {address.postalCode}
                  </p>
                  <p>{address.country}</p>
                  <p className="mt-2 text-xs text-gray-500">{address.phoneNumber}</p>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEditDialog(address)}
                  >
                    <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Address</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this address? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(address.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                </div>
                 {!address.isMain && (
                    <div className="mt-2">
                         <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-gray-500 hover:text-gray-900"
                            onClick={() => handleSetMain(address.id)}
                            disabled={setMainMutation.isPending}
                          >
                             {setMainMutation.isPending ? 'Setting...' : 'Set as Default'}
                          </Button>
                    </div>
                  )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddressFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        addressToEdit={editingAddress}
      />
    </div>
  );
}
