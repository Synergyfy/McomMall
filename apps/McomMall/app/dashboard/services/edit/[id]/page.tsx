'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useGetUserListings } from '@/service/listings/hook';
import { ChevronRight, PlusCircle, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { SuccessAnimationDialog } from '@/components/SuccessAnimationDialog';
import { CreateServiceDto, UpdateServiceDto } from '@/service/services/types';
import { useAddService } from '@/service/services/hook';
import { UserListing } from '@/service/listings/types';
import Link from 'next/link';

interface ServiceError {
  name?: string;
  sector?: string;
  businessId?: string;
  pricingModel?: string;
  fixedPrice?: string;
  pricePerHour?: string;
  pricePerUnit?: string;
  unitName?: string;
  minGuests?: string;
  maxGuests?:string;
  pricePerGuest?: string;
  fixedGroupPrice?: string;
  basePrice?: string;
  baseGuests?: string;
  additionalGuestPrice?: string;
  bookingFee?: string;
}

import { useParams } from 'next/navigation';
import { useGetServiceById, useUpdateService } from '@/service/services/hook';

const EditServicePage = () => {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;
  const queryClient = useQueryClient();
  const { data: listings, isLoading: isLoadingListings } =
    useGetUserListings();
  const { data: serviceData, isLoading: isLoadingService } =
    useGetServiceById(serviceId);
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);

  const [formData, setFormData] = React.useState<UpdateServiceDto>({
    id: serviceId,
    name: '',
    sector: '',
    description: '',
    images: [],
    isActive: true,
    businessId: '',
    pricingModel: 'fixed',
    fixedPrice: undefined,
    pricePerHour: undefined,
    pricePerUnit: undefined,
    unitName: '',
    enableGuestPricing: false,
    guestPricingModel: 'perGuest',
    minGuests: undefined,
    maxGuests: undefined,
    pricePerGuest: undefined,
    fixedGroupPrice: undefined,
    basePrice: undefined,
    baseGuests: undefined,
    additionalGuestPrice: undefined,
    isQuoteModel: false,
    bookingFee: undefined,
    bundledServices: [],
    configurableAddons: [],
  });

  React.useEffect(() => {
    if (serviceData) {
      setFormData({
        ...serviceData,
        id: serviceId,
        unitName: serviceData.unitName ?? undefined,
        guestPricingModel: (serviceData.guestPricingModel as 'perGuest' | 'fixedGroup' | 'baseWithAdditional') ?? undefined,
        fixedPrice: parseFloat(serviceData.fixedPrice || '0'),
        pricePerHour: parseFloat(serviceData.pricePerHour || '0'),
        pricePerUnit: parseFloat(serviceData.pricePerUnit || '0'),
        pricePerGuest: parseFloat(serviceData.pricePerGuest || '0'),
        fixedGroupPrice: parseFloat(serviceData.fixedGroupPrice || '0'),
        basePrice: parseFloat(serviceData.basePrice || '0'),
        baseGuests: parseInt(serviceData.baseGuests || '0', 10),
        additionalGuestPrice: parseFloat(
          serviceData.additionalGuestPrice || '0'
        ),
        bookingFee: parseFloat(serviceData.bookingFee || '0'),
        bundledServices: serviceData.bundledServices.map(bs => ({
          ...bs,
          price: parseFloat(bs.price),
        })),
        configurableAddons: serviceData.configurableAddons.map(ca => ({
          ...ca,
          price: parseFloat(ca.price),
        })),
      });
    }
  }, [serviceData, serviceId]);


  const [errors, setErrors] = React.useState<ServiceError>({});

  const { mutate: updateService, isPending: isUpdatingService } =
    useUpdateService();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      updateService(formData, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['my-services'] });
          setShowSuccessDialog(true);
        },
        onError: (error) => {
          console.error('Error updating service:', error);
          // Handle error display to the user
        },
      });
    }
  };

  const validateForm = () => {
    const newErrors: ServiceError = {};

    if (!formData.name) newErrors.name = 'Service name is required.';
    if (formData.sector === undefined || formData.sector === '') newErrors.sector = 'Sector is required.';
    if (formData.name.length > 160)
      newErrors.name = 'Service name must be 160 characters or less.';
    if (!formData.businessId)
      newErrors.businessId = 'Please select a business.';

    // Pricing model validation
    if (formData.pricingModel === 'fixed' && formData.fixedPrice == null) {
      newErrors.fixedPrice = 'Fixed price is required.';
    } else if (formData.fixedPrice != null && formData.fixedPrice < 0) {
      newErrors.fixedPrice = 'Price must not be less than 0.';
    }

    if (formData.pricingModel === 'perHour' && formData.pricePerHour == null) {
      newErrors.pricePerHour = 'Price per hour is required.';
    } else if (formData.pricePerHour != null && formData.pricePerHour < 0) {
      newErrors.pricePerHour = 'Price must not be less than 0.';
    }

    if (formData.pricingModel === 'perUnit') {
      if (formData.pricePerUnit == null)
        newErrors.pricePerUnit = 'Price per unit is required.';
      else if (formData.pricePerUnit < 0)
        newErrors.pricePerUnit = 'Price must not be less than 0.';
      if (!formData.unitName) newErrors.unitName = 'Unit name is required.';
    }

    // Guest pricing validation
    if (formData.enableGuestPricing) {
      if (formData.minGuests == null) {
        newErrors.minGuests = 'Min guests is required.';
      } else if (formData.minGuests < 1) {
        newErrors.minGuests = 'Min guests must not be less than 1.';
      }

      if (formData.maxGuests == null) {
        newErrors.maxGuests = 'Max guests is required.';
      } else if (formData.maxGuests < 1) {
        newErrors.maxGuests = 'Max guests must not be less than 1.';
      }

      if (
        formData.guestPricingModel === 'perGuest' &&
        formData.pricePerGuest == null
      ) {
        newErrors.pricePerGuest = 'Price per guest is required.';
      } else if (formData.pricePerGuest != null && formData.pricePerGuest < 0) {
        newErrors.pricePerGuest = 'Price must not be less than 0.';
      }

      if (
        formData.guestPricingModel === 'fixedGroup' &&
        formData.fixedGroupPrice == null
      ) {
        newErrors.fixedGroupPrice = 'Fixed group price is required.';
      } else if (
        formData.fixedGroupPrice != null &&
        formData.fixedGroupPrice < 0
      ) {
        newErrors.fixedGroupPrice = 'Price must not be less than 0.';
      }

      if (formData.guestPricingModel === 'baseWithAdditional') {
        if (formData.basePrice == null)
          newErrors.basePrice = 'Base price is required.';
        else if (formData.basePrice < 0)
          newErrors.basePrice = 'Price must not be less than 0.';

        if (formData.baseGuests == null)
          newErrors.baseGuests = 'Base guests number is required.';
        else if (formData.baseGuests < 1)
          newErrors.baseGuests = 'Base guests must not be less than 1.';

        if (formData.additionalGuestPrice == null)
          newErrors.additionalGuestPrice = 'Additional guest price is required.';
        else if (formData.additionalGuestPrice < 0)
          newErrors.additionalGuestPrice = 'Price must not be less than 0.';
      }
    }

    // Quote model validation
    if (formData.isQuoteModel && formData.bookingFee == null) {
      newErrors.bookingFee = 'Booking fee is required.';
    } else if (formData.bookingFee != null && formData.bookingFee < 0) {
      newErrors.bookingFee = 'Booking fee must not be less than 0.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const isNumber = e.target.type === 'number';

    setFormData(prev => ({
      ...prev,
      [name]: isNumber ? (value === '' ? undefined : Number(value)) : value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const businesses =
    listings?.data?.filter(
      (listing: UserListing) =>
        listing.listingType.includes('service')
    ) || [];

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <h1 className="text-3xl font-bold text-gray-800">
              Edit Service
            </h1>
            <div className="flex items-center text-sm text-gray-500">
              <span
                onClick={() => router.push('/dashboard')}
                className="cursor-pointer"
              >
                Home
              </span>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span
                onClick={() => router.push('/dashboard/services')}
                className="cursor-pointer"
              >
                Services
              </span>
              <ChevronRight className="h-4 w-4 mx-1" />
              <span className="text-gray-700">Edit Service</span>
            </div>
          </header>
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="businessId">Business</Label>
                <Select
                  name="businessId"
                  onValueChange={value => handleSelectChange('businessId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a business" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingListings ? (
                      <SelectItem value="loading" disabled>
                        Loading businesses...
                      </SelectItem>
                    ) : (
                      businesses.filter((b: UserListing) => b.id && b.id.trim() !== '').map((business: UserListing) => (
                        <SelectItem key={business.id} value={business.id}>
                          {business.businessName}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.businessId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.businessId}
                  </p>
                )}
              </div>
            </div>
            <div className="mb-6">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            {/* Pricing Model */}
            <div className="mb-6">
              <Label>Pricing Model</Label>
              <Select
                name="pricingModel"
                value={formData.pricingModel}
                onValueChange={value => handleSelectChange('pricingModel', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                  <SelectItem value="perHour">Per Hour</SelectItem>
                  <SelectItem value="perUnit">Per Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.pricingModel === 'fixed' && (
              <div className="mb-6">
                <Label htmlFor="fixedPrice">Fixed Price</Label>
                <Input
                  id="fixedPrice"
                  name="fixedPrice"
                  type="number"
                  value={formData.fixedPrice}
                  onChange={handleInputChange}
                />
                {errors.fixedPrice && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.fixedPrice}
                  </p>
                )}
              </div>
            )}

            {formData.pricingModel === 'perHour' && (
              <div className="mb-6">
                <Label htmlFor="pricePerHour">Price Per Hour</Label>
                <Input
                  id="pricePerHour"
                  name="pricePerHour"
                  type="number"
                  value={formData.pricePerHour}
                  onChange={handleInputChange}
                />
                {errors.pricePerHour && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.pricePerHour}
                  </p>
                )}
              </div>
            )}

            {formData.pricingModel === 'perUnit' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="pricePerUnit">Price Per Unit</Label>
                  <Input
                    id="pricePerUnit"
                    name="pricePerUnit"
                    type="number"
                    value={formData.pricePerUnit}
                    onChange={handleInputChange}
                  />
                  {errors.pricePerUnit && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.pricePerUnit}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="unitName">Unit Name</Label>
                  <Input
                    id="unitName"
                    name="unitName"
                    value={formData.unitName}
                    onChange={handleInputChange}
                  />
                  {errors.unitName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.unitName}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Guest Pricing */}
            <div className="flex items-center space-x-2 mb-6">
              <Switch
                id="enableGuestPricing"
                checked={formData.enableGuestPricing}
                onCheckedChange={checked =>
                  handleSwitchChange('enableGuestPricing', checked)
                }
              />
              <Label htmlFor="enableGuestPricing">Enable Guest Pricing</Label>
            </div>

            {formData.enableGuestPricing && (
              <div className="p-4 border rounded-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label htmlFor="minGuests">Min Guests</Label>
                    <Input
                      id="minGuests"
                      name="minGuests"
                      type="number"
                      value={formData.minGuests}
                      onChange={handleInputChange}
                    />
                    {errors.minGuests && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.minGuests}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="maxGuests">Max Guests</Label>
                    <Input
                      id="maxGuests"
                      name="maxGuests"
                      type="number"
                      value={formData.maxGuests}
                      onChange={handleInputChange}
                    />
                    {errors.maxGuests && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.maxGuests}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mb-6">
                  <Label>Guest Pricing Model</Label>
                  <Select
                    name="guestPricingModel"
                    value={formData.guestPricingModel}
                    onValueChange={value =>
                      handleSelectChange('guestPricingModel', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="perGuest">Per Guest</SelectItem>
                      <SelectItem value="fixedGroup">Fixed Group</SelectItem>
                      <SelectItem value="baseWithAdditional">
                        Base with Additional
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.guestPricingModel === 'perGuest' && (
                  <div className="mb-6">
                    <Label htmlFor="pricePerGuest">Price Per Guest</Label>
                    <Input
                      id="pricePerGuest"
                      name="pricePerGuest"
                      type="number"
                      value={formData.pricePerGuest}
                      onChange={handleInputChange}
                    />
                    {errors.pricePerGuest && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.pricePerGuest}
                      </p>
                    )}
                  </div>
                )}
                {formData.guestPricingModel === 'fixedGroup' && (
                  <div className="mb-6">
                    <Label htmlFor="fixedGroupPrice">Fixed Group Price</Label>
                    <Input
                      id="fixedGroupPrice"
                      name="fixedGroupPrice"
                      type="number"
                      value={formData.fixedGroupPrice}
                      onChange={handleInputChange}
                    />
                    {errors.fixedGroupPrice && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.fixedGroupPrice}
                      </p>
                    )}
                  </div>
                )}
                {formData.guestPricingModel === 'baseWithAdditional' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div>
                      <Label htmlFor="basePrice">Base Price</Label>
                      <Input
                        id="basePrice"
                        name="basePrice"
                        type="number"
                        value={formData.basePrice}
                        onChange={handleInputChange}
                      />
                      {errors.basePrice && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.basePrice}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="baseGuests">Base Guests</Label>
                      <Input
                        id="baseGuests"
                        name="baseGuests"
                        type="number"
                        value={formData.baseGuests}
                        onChange={handleInputChange}
                      />
                      {errors.baseGuests && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.baseGuests}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="additionalGuestPrice">
                        Additional Guest Price
                      </Label>
                      <Input
                        id="additionalGuestPrice"
                        name="additionalGuestPrice"
                        type="number"
                        value={formData.additionalGuestPrice}
                        onChange={handleInputChange}
                      />
                      {errors.additionalGuestPrice && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.additionalGuestPrice}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quote Model */}
            <div className="flex items-center space-x-2 mb-6">
              <Switch
                id="isQuoteModel"
                checked={formData.isQuoteModel}
                onCheckedChange={checked =>
                  handleSwitchChange('isQuoteModel', checked)
                }
              />
              <Label htmlFor="isQuoteModel">Enable Quote Model</Label>
            </div>
            {formData.isQuoteModel && (
              <div className="mb-6">
                <Label htmlFor="bookingFee">Booking Fee</Label>
                <Input
                  id="bookingFee"
                  name="bookingFee"
                  type="number"
                  value={formData.bookingFee}
                  onChange={handleInputChange}
                />
                {errors.bookingFee && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.bookingFee}
                  </p>
                )}
              </div>
            )}

            {/* Bundled Services */}
            <div className="mb-6">
              <Label>Bundled Services</Label>
              {formData.bundledServices?.map((service, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <Input
                    placeholder="Service Name"
                    value={service.name}
                    onChange={e => {
                      const newServices = [...(formData.bundledServices ?? [])];
                      newServices[index].name = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        bundledServices: newServices,
                      }));
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={service.price}
                    onChange={e => {
                      const newServices = [...(formData.bundledServices ?? [])];
                      newServices[index].price = Number(e.target.value);
                      setFormData(prev => ({
                        ...prev,
                        bundledServices: newServices,
                      }));
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newServices = formData.bundledServices?.filter(
                        (_, i) => i !== index
                      );
                      setFormData(prev => ({
                        ...prev,
                        bundledServices: newServices,
                      }));
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    bundledServices: [
                      ...(prev.bundledServices ?? []),
                      { name: '', price: undefined },
                    ],
                  }));
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Bundled Service
              </Button>
            </div>

            {/* Configurable Add-ons */}
            <div className="mb-6">
              <Label>Configurable Add-ons</Label>
              {formData.configurableAddons?.map((addon, index) => (
                <div key={index} className="p-4 border rounded-md mb-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                    <Input
                      placeholder="Add-on Name"
                      value={addon.name}
                      onChange={e => {
                        const newAddons = [...(formData.configurableAddons ?? [])];
                        newAddons[index].name = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          configurableAddons: newAddons,
                        }));
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={addon.price}
                      onChange={e => {
                        const newAddons = [...(formData.configurableAddons ?? [])];
                        newAddons[index].price = Number(e.target.value);
                        setFormData(prev => ({
                          ...prev,
                          configurableAddons: newAddons,
                        }));
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      value={addon.pricingType}
                      onValueChange={value => {
                        const newAddons = [...(formData.configurableAddons ?? [])];
                        newAddons[index].pricingType = value as 'perUnit' | 'perGuest' | 'oneTime';
                        setFormData(prev => ({
                          ...prev,
                          configurableAddons: newAddons,
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pricing Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oneTime">One-Time</SelectItem>
                        <SelectItem value="perGuest">Per Guest</SelectItem>
                        <SelectItem value="perUnit">Per Unit</SelectItem>
                      </SelectContent>
                    </Select>
                    {addon.pricingType === 'perUnit' && (
                      <Input
                        placeholder="Unit Name"
                        value={addon.unitName}
                        onChange={e => {
                          const newAddons = [...(formData.configurableAddons ?? [])];
                          newAddons[index].unitName = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            configurableAddons: newAddons,
                          }));
                        }}
                      />
                    )}
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newAddons = formData.configurableAddons?.filter(
                          (_, i) => i !== index
                        );
                        setFormData(prev => ({
                          ...prev,
                          configurableAddons: newAddons,
                        }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    configurableAddons: [
                      ...(prev.configurableAddons ?? []),
                      {
                        name: '',
                        price: undefined,
                        pricingType: 'oneTime',
                        unitName: '',
                      },
                    ],
                  }));
                }}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Add Add-on
              </Button>
            </div>

            <div className="mb-6">
                <h3 className="text-lg font-medium">Interactive Hotspots</h3>
                <p className="text-sm text-muted-foreground">Add clickable hotspots to your service image.</p>
                <Button asChild variant="outline" className="mt-2">
                    <Link href={`/dashboard/hotspot-editor/edit/${serviceId}?type=service`}>
                        Add/Edit Hotspots
                    </Link>
                </Button>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isUpdatingService}>
                {isUpdatingService ? (
                  'Updating...'
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" /> Update Service
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <SuccessAnimationDialog
        isOpen={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          router.push('/dashboard/services');
        }}
      />
    </>
  );
};

export default EditServicePage;
