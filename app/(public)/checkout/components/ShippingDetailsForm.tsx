'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useGetShippingAddresses } from '@/service/shipping/hook';
import { ShippingAddress } from '@/service/shipping/types';

interface Errors {
  recipientName?: string;
  addressLine1?: string;
  city?: string;
  postcode?: string;
}

export default function ShippingDetailsForm() {
  const { data: addressData } = useGetShippingAddresses(1, 100);
  const addresses = addressData?.data || [];

  const [selectedAddressId, setSelectedAddressId] = useState<string>('new');
  const [shippingDetails, setShippingDetails] = useState({
    recipientName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
  });
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    // If we have addresses and haven't selected one yet, try to select the main one
    if (addresses.length > 0 && selectedAddressId === 'new') {
      const mainAddress = addresses.find((addr) => addr.isMain);
      if (mainAddress) {
        handleAddressSelection(mainAddress.id);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses.length]); // Only run when addresses load

  const handleAddressSelection = (addressId: string) => {
    setSelectedAddressId(addressId);
    if (addressId === 'new') {
      setShippingDetails({
        recipientName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postcode: '',
        country: 'United Kingdom',
      });
    } else {
      const address = addresses.find((addr) => addr.id === addressId);
      if (address) {
        setShippingDetails({
          recipientName: address.recipientName,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || '',
          city: address.city,
          postcode: address.postalCode || '',
          country: address.country,
        });
      }
    }
  };

  const validate = () => {
    const newErrors: Errors = {};
    if (!shippingDetails.recipientName) {
      newErrors.recipientName = 'Recipient name is required.';
    }
    if (!shippingDetails.addressLine1) {
      newErrors.addressLine1 = 'Address line 1 is required.';
    }
    if (!shippingDetails.city) {
      newErrors.city = 'City/Town is required.';
    }
    if (!shippingDetails.postcode) {
      newErrors.postcode = 'Postcode is required.';
    } else if (!/^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(shippingDetails.postcode)) {
      newErrors.postcode = 'Invalid UK postcode format.';
    }
    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setShippingDetails(prevDetails => ({
      ...prevDetails,
      [id]: value,
    }));
    // If user types, we are essentially in "custom" mode, but we can keep the ID if it matches?
    // Usually it's better to switch to "new" or "custom" if they edit, but for simplicity let's leave it.
    // Or we could set selectedAddressId to 'new' if they edit?
    // Let's keep it simple.
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      console.log('Shipping Details:', shippingDetails);
      // Handle form submission logic here
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Shipping Details
      </h2>

      {addresses.length > 0 && (
        <div className="mb-6">
          <Label htmlFor="savedAddress">Use a Saved Address</Label>
          <Select
            value={selectedAddressId}
            onValueChange={handleAddressSelection}
          >
            <SelectTrigger className="w-full mt-1">
              <SelectValue placeholder="Select an address" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Add New Address</SelectItem>
              {addresses.map((address) => (
                <SelectItem key={address.id} value={address.id}>
                  {address.addressName} - {address.addressLine1}, {address.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="recipientName">Recipient Name</Label>
          <Input
            id="recipientName"
            placeholder="e.g., John Doe"
            value={shippingDetails.recipientName}
            onChange={handleChange}
            autoComplete="name"
            required
          />
          {errors.recipientName && (
            <p className="text-red-500 text-sm mt-1">{errors.recipientName}</p>
          )}
        </div>
        <div>
          <Label htmlFor="addressLine1">
            Address Line 1 (House/Building & Street)
          </Label>
          <Input
            id="addressLine1"
            placeholder="e.g., 123 Main Street"
            value={shippingDetails.addressLine1}
            onChange={handleChange}
            autoComplete="street-address"
            required
          />
          {errors.addressLine1 && (
            <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>
          )}
        </div>
        <div>
          <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
          <Input
            id="addressLine2"
            placeholder="e.g., Apartment 4B"
            value={shippingDetails.addressLine2}
            onChange={handleChange}
            autoComplete="address-line2"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="city">City/Town</Label>
            <Input
              id="city"
              placeholder="e.g., London"
              value={shippingDetails.city}
              onChange={handleChange}
              autoComplete="address-level2"
              required
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city}</p>
            )}
          </div>
          <div>
            <Label htmlFor="postcode">Postcode</Label>
            <Input
              id="postcode"
              placeholder="e.g., SW1A 0AA"
              value={shippingDetails.postcode}
              onChange={handleChange}
              autoComplete="postal-code"
              required
            />
            {errors.postcode && (
              <p className="text-red-500 text-sm mt-1">{errors.postcode}</p>
            )}
          </div>
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <select
            id="country"
            value={shippingDetails.country}
            onChange={handleChange}
            className="w-full p-2 border rounded-md bg-white"
            autoComplete="country"
          >
            <option value="United Kingdom">United Kingdom</option>
            {/* Add other countries here if needed */}
          </select>
        </div>
        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </div>
  );
}
