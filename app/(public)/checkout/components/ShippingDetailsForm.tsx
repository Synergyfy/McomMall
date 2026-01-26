'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useGetShippingAddresses, useAddShippingAddress } from '@/service/shipping/hook';
import { ShippingAddress } from '@/service/shipping/types';
import { toast } from 'sonner';
import { Pencil, CheckCircle2, Plus } from 'lucide-react';

interface Errors {
  recipientName?: string;
  addressLine1?: string;
  city?: string;
  postcode?: string;
}

type ViewMode = 'summary' | 'list' | 'form';

export default function ShippingDetailsForm() {
  const { data: addressData, refetch } = useGetShippingAddresses(1, 100);
  const { mutateAsync: addAddressAsync, isPending: isAdding } = useAddShippingAddress();
  const addresses = addressData?.data || [];

  const [viewMode, setViewMode] = useState<ViewMode>('summary');
  const [selectedAddress, setSelectedAddress] = useState<ShippingAddress | null>(null);

  const [shippingDetails, setShippingDetails] = useState({
    addressName: 'New Address',
    recipientName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    country: 'United Kingdom',
    state: '',
    isMain: false
  });
  const [errors, setErrors] = useState<Errors>({});

  // Initialize with main address
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const mainAddress = addresses.find((addr) => addr.isMain) || addresses[0];
      setSelectedAddress(mainAddress);
      setViewMode('summary');
    } else if (addresses.length === 0 && !selectedAddress) {
        setViewMode('form'); // Force form if no addresses
    }
  }, [addresses, selectedAddress]);

  const handleSelectAddress = (address: ShippingAddress) => {
    setSelectedAddress(address);
    setViewMode('summary');
    // We update the internal "form" state just in case, though it's not used in summary view
    setShippingDetails({
        addressName: address.addressName,
        recipientName: address.recipientName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || '',
        city: address.city,
        postcode: address.postalCode || '',
        country: address.country,
        state: address.state,
        isMain: address.isMain
    });
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
  };

  const handleSaveNewAddress = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
        const newAddress = await addAddressAsync({
            addressName: shippingDetails.addressName || 'New Address',
            recipientName: shippingDetails.recipientName,
            phoneNumber: '0000000000', // Need phone field in form if API requires it, defaulting for now
            addressLine1: shippingDetails.addressLine1,
            addressLine2: shippingDetails.addressLine2,
            city: shippingDetails.city,
            state: shippingDetails.city, // Defaulting state to city if not captured
            country: shippingDetails.country,
            postalCode: shippingDetails.postcode,
            isMain: addresses.length === 0 // Make main if it's the first one
        });

        await refetch();
        setSelectedAddress(newAddress);
        setViewMode('summary');
        toast.success("Address saved successfully");
    } catch (error) {
        console.error("Failed to add address", error);
        toast.error("Failed to save address");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
            Shipping Details
        </h2>
        {viewMode === 'summary' && selectedAddress && (
             <Button variant="ghost" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50" onClick={() => setViewMode('list')}>
                Change Address
             </Button>
        )}
      </div>

      {/* VIEW 1: SUMMARY CARD */}
      {viewMode === 'summary' && selectedAddress && (
         <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex items-start gap-3">
             <CheckCircle2 className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
             <div>
                 <p className="font-bold text-gray-900">{selectedAddress.recipientName}</p>
                 <p className="text-gray-600 text-sm mt-1">
                     {selectedAddress.addressLine1}, {selectedAddress.addressLine2 ? `${selectedAddress.addressLine2}, ` : ''}{selectedAddress.city}
                 </p>
                 <p className="text-gray-600 text-sm">{selectedAddress.postalCode}</p>
                 <p className="text-gray-500 text-xs mt-2 uppercase font-semibold tracking-wider">{selectedAddress.country}</p>
             </div>
         </div>
      )}

      {/* VIEW 2: LIST SELECTION */}
      {viewMode === 'list' && (
          <div className="space-y-4">
              {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`border rounded-xl p-4 cursor-pointer transition-all flex items-start gap-3 ${selectedAddress?.id === addr.id ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => handleSelectAddress(addr)}
                  >
                      <div className={`w-4 h-4 rounded-full border mt-1 flex items-center justify-center ${selectedAddress?.id === addr.id ? 'border-orange-500' : 'border-gray-400'}`}>
                          {selectedAddress?.id === addr.id && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{addr.recipientName} {addr.isMain && <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded ml-2 font-normal">Default</span>}</p>
                        <p className="text-gray-600 text-sm mt-1">
                            {addr.addressLine1}, {addr.city}, {addr.postalCode}
                        </p>
                      </div>
                  </div>
              ))}

              <Button
                variant="outline"
                className="w-full border-dashed border-gray-300 hover:border-orange-500 hover:text-orange-500 h-12"
                onClick={() => {
                    setShippingDetails({
                        addressName: 'Home',
                        recipientName: '',
                        addressLine1: '',
                        addressLine2: '',
                        city: '',
                        postcode: '',
                        country: 'United Kingdom',
                        state: '',
                        isMain: false
                    });
                    setViewMode('form');
                }}
            >
                  <Plus className="w-4 h-4 mr-2" /> Add New Address
              </Button>
          </div>
      )}

      {/* VIEW 3: ADD NEW FORM */}
      {viewMode === 'form' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
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
                Address Line 1
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
                className="w-full p-2 border rounded-md bg-white text-sm"
                autoComplete="country"
            >
                <option value="United Kingdom">United Kingdom</option>
            </select>
            </div>

            <div className="flex gap-4 pt-2">
                {addresses.length > 0 && (
                    <Button variant="outline" className="flex-1" onClick={() => setViewMode('list')}>
                        Cancel
                    </Button>
                )}
                <Button className="flex-1 bg-orange-600 hover:bg-orange-700" onClick={handleSaveNewAddress} disabled={isAdding}>
                    {isAdding ? 'Saving...' : 'Save & Use This Address'}
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}
