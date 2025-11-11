'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

interface Errors {
  recipientName?: string;
  addressLine1?: string;
  city?: string;
  postcode?: string;
}

export default function ShippingDetailsForm() {
  const [shippingDetails, setShippingDetails] = useState({
    recipientName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
  });
  const [errors, setErrors] = useState<Errors>({});

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
    } else if (!/^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$/i.test(shippingDetails.postcode)) {
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
