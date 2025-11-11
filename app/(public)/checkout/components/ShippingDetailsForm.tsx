'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export default function ShippingDetailsForm() {
  const [shippingDetails, setShippingDetails] = useState({
    flatHouseNo: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    famousLandmark: '',
    sameAddress: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, checked, type } = e.target;
    setShippingDetails(prevDetails => ({
      ...prevDetails,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Shipping Details:', shippingDetails);
    // Handle form submission logic here
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Shipping Details
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <Label htmlFor="flatHouseNo">Flat/House no.</Label>
            <Input
              id="flatHouseNo"
              placeholder="Enter your flat/house no."
              value={shippingDetails.flatHouseNo}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Enter your address"
              value={shippingDetails.address}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Enter your city"
                value={shippingDetails.city}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="Enter your state"
                value={shippingDetails.state}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                placeholder="Enter your postal code"
                value={shippingDetails.postalCode}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label htmlFor="famousLandmark">Famous Landmark</Label>
              <Input
                id="famousLandmark"
                placeholder="Enter a famous landmark"
                value={shippingDetails.famousLandmark}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sameAddress"
              checked={shippingDetails.sameAddress}
              onCheckedChange={(checked) => {
                setShippingDetails(prevDetails => ({
                  ...prevDetails,
                  sameAddress: !!checked,
                }));
              }}
            />
            <Label htmlFor="sameAddress">
              My shipping and billing address are the same
            </Label>
          </div>
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
