'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  useAddShippingAddress,
  useUpdateShippingAddress,
} from '@/service/shipping/hook';
import { ShippingAddress } from '@/service/shipping/types';
import { toast } from 'sonner';

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addressToEdit?: ShippingAddress | null;
  onSuccess?: () => void;
}

interface Errors {
  [key: string]: string;
}

export default function AddressFormDialog({
  open,
  onOpenChange,
  addressToEdit,
  onSuccess,
}: AddressFormDialogProps) {
  const addAddressMutation = useAddShippingAddress();
  const updateAddressMutation = useUpdateShippingAddress();

  const [formData, setFormData] = useState({
    addressName: '',
    recipientName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: 'United Kingdom',
    postalCode: '',
    isMain: false,
  });

  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (open) {
      if (addressToEdit) {
        setFormData({
          addressName: addressToEdit.addressName,
          recipientName: addressToEdit.recipientName,
          phoneNumber: addressToEdit.phoneNumber,
          addressLine1: addressToEdit.addressLine1,
          addressLine2: addressToEdit.addressLine2 || '',
          city: addressToEdit.city,
          state: addressToEdit.state,
          country: addressToEdit.country,
          postalCode: addressToEdit.postalCode || '',
          isMain: addressToEdit.isMain,
        });
      } else {
        // Reset for new address
        setFormData({
          addressName: '',
          recipientName: '',
          phoneNumber: '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          country: 'United Kingdom',
          postalCode: '',
          isMain: false,
        });
      }
      setErrors({});
    }
  }, [open, addressToEdit]);

  const validate = () => {
    const newErrors: Errors = {};
    if (!formData.addressName) newErrors.addressName = 'Address Name is required';
    if (!formData.recipientName) newErrors.recipientName = 'Recipient Name is required';
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone Number is required';
    if (!formData.addressLine1) newErrors.addressLine1 = 'Address Line 1 is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State/Province is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.postalCode) newErrors.postalCode = 'Postal Code is required';

    // Simple postcode validation for UK
    if (formData.country === 'United Kingdom' && formData.postalCode) {
        if (!/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(formData.postalCode)) {
             newErrors.postalCode = 'Invalid UK postcode format.';
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (addressToEdit) {
      updateAddressMutation.mutate(
        { id: addressToEdit.id, ...formData },
        {
          onSuccess: () => {
            toast.success('Address updated successfully');
            onOpenChange(false);
            if (onSuccess) onSuccess();
          },
          onError: (error) => {
             toast.error(`Failed to update address: ${error.message}`);
          }
        }
      );
    } else {
      addAddressMutation.mutate(formData, {
        onSuccess: () => {
          toast.success('Address added successfully');
          onOpenChange(false);
           if (onSuccess) onSuccess();
        },
        onError: (error) => {
            toast.error(`Failed to add address: ${error.message}`);
        }
      });
    }
  };

  const isLoading = addAddressMutation.isPending || updateAddressMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {addressToEdit ? 'Edit Address' : 'Add New Address'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="addressName">Address Name (e.g. Home)</Label>
              <Input
                id="addressName"
                value={formData.addressName}
                onChange={handleChange}
                placeholder="Home"
              />
              {errors.addressName && (
                <p className="text-sm text-red-500">{errors.addressName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name</Label>
              <Input
                id="recipientName"
                value={formData.recipientName}
                onChange={handleChange}
                placeholder="John Doe"
              />
              {errors.recipientName && (
                <p className="text-sm text-red-500">{errors.recipientName}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+1 234 567 890"
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-500">{errors.phoneNumber}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input
              id="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              placeholder="123 Main St"
            />
            {errors.addressLine1 && (
              <p className="text-sm text-red-500">{errors.addressLine1}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
            <Input
              id="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              placeholder="Apt 4B"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="New York"
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="NY"
              />
              {errors.state && (
                <p className="text-sm text-red-500">{errors.state}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="United Kingdom"
              />
               {errors.country && (
                <p className="text-sm text-red-500">{errors.country}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="10001"
              />
              {errors.postalCode && (
                <p className="text-sm text-red-500">{errors.postalCode}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isMain"
              checked={formData.isMain}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isMain: checked as boolean }))
              }
            />
            <Label htmlFor="isMain">Set as default address</Label>
          </div>

          <DialogFooter>
             <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : addressToEdit ? 'Update Address' : 'Add Address'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
