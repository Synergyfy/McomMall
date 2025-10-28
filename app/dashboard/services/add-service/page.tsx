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
import { ChevronRight, Info, PlusCircle, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { SuccessAnimationDialog } from '@/components/SuccessAnimationDialog';
import { CreateServiceDto } from '@/service/services/types';
import { useAddService } from '@/service/services/hook';
import MultiMediaUpload from '@/app/dashboard/add-listing/components/steps/shared/MultiMediaUpload';
import { uploadFile } from '@/lib/upload';
import { UserListing } from '@/service/listings/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ServiceError {
  name?: string;
  businessId?: string;
  pricingModel?: string;
  fixedPrice?: string;
  pricePerHour?: string;
  pricePerUnit?: string;
  unitName?: string;
  minGuests?: string;
  maxGuests?: string;
  pricePerGuest?: string;
  fixedGroupPrice?: string;
  basePrice?: string;
  baseGuests?: string;
  additionalGuestPrice?: string;
  bookingFee?: string;
  media?: string;
}

const TooltipLabel = ({
  htmlFor,
  label,
  tooltip,
}: {
  htmlFor: string;
  label: string;
  tooltip: string;
}) => (
  <div className="flex items-center gap-2">
    <Label htmlFor={htmlFor}>{label}</Label>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-4 w-4 text-gray-500 cursor-pointer" />
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);

const AddServicePage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: listings, isLoading: isLoadingListings } =
    useGetUserListings();
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);

  const [formData, setFormData] = React.useState<CreateServiceDto>({
    name: '',
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

  const [errors, setErrors] = React.useState<ServiceError>({});

  const { mutate: addService, isPending: isAddingService } = useAddService();

  const [media, setMedia] = React.useState<File[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const mediaUrls = await Promise.all(
        media.map(file => uploadFile(file))
      );

      const serviceData = {
        ...formData,
        images: mediaUrls.map(result => result.secure_url),
      }

      addService(serviceData, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['my-services'] });
          setShowSuccessDialog(true);
        },
        onError: (error) => {
          console.error('Error creating service:', error);
          // Handle error display to the user
        },
      });
    }
  };

  const validateForm = () => {
    const newErrors: ServiceError = {};

    if (!formData.name) newErrors.name = 'Service name is required.';
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

    if (media.length === 0) {
      newErrors.media = 'At least one image is required.';
    } else if (media.length > 5) {
        newErrors.media = 'You can upload a maximum of 5 files.';
    } else {
        const hasImage = media.some(file => file.type.startsWith('image/'));
        if (!hasImage) {
            newErrors.media = 'At least one image is required.';
        }
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
    listings?.filter(
      (listing: UserListing) =>
        listing.listingType.includes('service')
    ) || [];

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-sans">
        <div className="max-w-4xl mx-auto">
          <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Add New Service
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Add a new service to your business listing.
              </p>
            </div>
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
              <span className="text-gray-700">Add Service</span>
            </div>
          </header>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Provide the basic details for your new service.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <TooltipLabel
                      htmlFor="name"
                      label="Service Name"
                      tooltip="The name of the service."
                    />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <TooltipLabel
                      htmlFor="businessId"
                      label="Listing/Business"
                      tooltip="The business this service belongs to."
                    />
                    <Select
                      name="businessId"
                      onValueChange={value =>
                        handleSelectChange('businessId', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Listing" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingListings ? (
                          <SelectItem value="loading" disabled>
                            Loading businesses...
                          </SelectItem>
                        ) : (
                          businesses.map((business: UserListing) => (
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
                <div className="mt-6">
                  <TooltipLabel
                    htmlFor="description"
                    label="Description (Optional)"
                    tooltip="A detailed description of the service."
                  />
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
                <CardDescription>
                  Configure the pricing model for this service.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <TooltipLabel
                      htmlFor="pricingModel"
                      label="Pricing Model"
                      tooltip="Choose how to price this service."
                    />
                    <Select
                      name="pricingModel"
                      value={formData.pricingModel}
                      onValueChange={value =>
                        handleSelectChange('pricingModel', value)
                      }
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
                    <div>
                      <TooltipLabel
                        htmlFor="fixedPrice"
                        label="Fixed Price"
                        tooltip="The total price for the service."
                      />
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
                    <div>
                      <TooltipLabel
                        htmlFor="pricePerHour"
                        label="Price Per Hour"
                        tooltip="The cost for each hour of service."
                      />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <TooltipLabel
                          htmlFor="pricePerUnit"
                          label="Price Per Unit"
                          tooltip="The cost for each unit of the service."
                        />
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
                        <TooltipLabel
                          htmlFor="unitName"
                          label="Unit Name"
                          tooltip="The name of the unit (e.g., 'item', 'session')."
                        />
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
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Guest Pricing</CardTitle>
                <CardDescription>
                  Enable and configure pricing based on the number of guests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-6">
                  <Switch
                    id="enableGuestPricing"
                    checked={formData.enableGuestPricing}
                    onCheckedChange={checked =>
                      handleSwitchChange('enableGuestPricing', checked)
                    }
                  />
                  <TooltipLabel
                    htmlFor="enableGuestPricing"
                    label="Enable Guest Pricing"
                    tooltip="Enable this to set prices based on the number of guests."
                  />
                </div>

                {formData.enableGuestPricing && (
                  <div className="p-4 border rounded-md space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <TooltipLabel
                          htmlFor="minGuests"
                          label="Min Guests"
                          tooltip="The minimum number of guests required."
                        />
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
                        <TooltipLabel
                          htmlFor="maxGuests"
                          label="Max Guests"
                          tooltip="The maximum number of guests allowed."
                        />
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
                    <div>
                      <TooltipLabel
                        htmlFor="guestPricingModel"
                        label="Guest Pricing Model"
                        tooltip="Choose the model for guest-based pricing."
                      />
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
                          <SelectItem value="fixedGroup">
                            Fixed Group
                          </SelectItem>
                          <SelectItem value="baseWithAdditional">
                            Base with Additional
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {formData.guestPricingModel === 'perGuest' && (
                      <div>
                        <TooltipLabel
                          htmlFor="pricePerGuest"
                          label="Price Per Guest"
                          tooltip="The cost for each individual guest."
                        />
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
                      <div>
                        <TooltipLabel
                          htmlFor="fixedGroupPrice"
                          label="Fixed Group Price"
                          tooltip="A fixed price for a group of any size (within min/max)."
                        />
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
                    {formData.guestPricingModel ===
                      'baseWithAdditional' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <TooltipLabel
                            htmlFor="basePrice"
                            label="Base Price"
                            tooltip="The starting price for a base number of guests."
                          />
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
                          <TooltipLabel
                            htmlFor="baseGuests"
                            label="Base Guests"
                            tooltip="The number of guests included in the base price."
                          />
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
                          <TooltipLabel
                            htmlFor="additionalGuestPrice"
                            label="Additional Guest Price"
                            tooltip="The price for each guest beyond the base number."
                          />
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quote Model</CardTitle>
                <CardDescription>
                  Allow customers to request a quote instead of direct booking.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-6">
                  <Switch
                    id="isQuoteModel"
                    checked={formData.isQuoteModel}
                    onCheckedChange={checked =>
                      handleSwitchChange('isQuoteModel', checked)
                    }
                  />
                  <TooltipLabel
                    htmlFor="isQuoteModel"
                    label="Enable Quote Model"
                    tooltip="If enabled, customers will request a quote rather than booking directly."
                  />
                </div>
                {formData.isQuoteModel && (
                  <div>
                    <TooltipLabel
                      htmlFor="bookingFee"
                      label="Booking Fee"
                      tooltip="A fee to be paid upfront when requesting a quote."
                    />
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
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Service Media</CardTitle>
                    <CardDescription>
                        Upload images and videos for your service.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <MultiMediaUpload onMediaChange={setMedia} />
                    {errors.media && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.media}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bundled Services</CardTitle>
                <CardDescription>
                  Offer additional services that are included in the main
                  service package.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.bundledServices?.map((service, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2"
                    >
                      <Input
                        placeholder="Service Name"
                        value={service.name}
                        onChange={e => {
                          const newServices = [
                            ...(formData.bundledServices ?? []),
                          ];
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
                          const newServices = [
                            ...(formData.bundledServices ?? []),
                          ];
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
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Bundled
                    Service
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurable Add-ons</CardTitle>
                <CardDescription>
                  Provide optional add-ons that customers can choose to purchase.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.configurableAddons?.map((addon, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-md space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Add-on Name"
                          value={addon.name}
                          onChange={e => {
                            const newAddons = [
                              ...(formData.configurableAddons ?? []),
                            ];
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
                            const newAddons = [
                              ...(formData.configurableAddons ?? []),
                            ];
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
                            const newAddons = [
                              ...(formData.configurableAddons ?? []),
                            ];
                            newAddons[index].pricingType = value as
                              | 'perUnit'
                              | 'perGuest'
                              | 'oneTime';
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
                              const newAddons = [
                                ...(formData.configurableAddons ?? []),
                              ];
                              newAddons[index].unitName = e.target.value;
                              setFormData(prev => ({
                                ...prev,
                                configurableAddons: newAddons,
                              }));
                            }}
                          />
                        )}
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newAddons =
                              formData.configurableAddons?.filter(
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
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={isAddingService}>
                {isAddingService ? (
                  'Creating...'
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Service
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

export default AddServicePage;
