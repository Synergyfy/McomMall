"use client";

import React, { useState } from 'react';
import Step1BasicInfo from '../components/wizard/Step1BasicInfo';
import Step2MediaContent from '../components/wizard/Step2MediaContent';
import Step3PricingInventory from '../components/wizard/Step3PricingInventory';
import Step4ShippingOptions from '../components/wizard/shipping/Step4ShippingOptions';
import Step4aFulfillmentSelection from '../components/wizard/shipping/Step4aFulfillmentSelection';
import Step4bDeliveryPricing from '../components/wizard/shipping/Step4bDeliveryPricing';
import Step5SelectCarrier from '../components/wizard/shipping/Step5SelectCarrier';
import Step5aPickupConfiguration from '../components/wizard/shipping/Step5aPickupConfiguration';
import Step5bConnectShipStation from '../components/wizard/shipping/Step5bConnectShipStation';
import Step6ShipStationConfig from '../components/wizard/shipping/Step6ShipStationConfig';
import Step7ServiceMapping from '../components/wizard/shipping/Step7ServiceMapping';
import Step7Partnership from '../components/wizard/Step7Partnership';
import Step8Finalize from '../components/wizard/Step8Finalize';
import { ProductStatusModal } from '../components/wizard/lib/ProductStatusModal';
import { useAuth } from '@/service/auth/hook';
import { useGetUserListings } from '@/service/listings/hook';
import { useAddProduct } from '@/service/store/products/hook';
import { useCreateCompositePartnershipRequest } from '@/service/partnerships/hooks';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: userListings } = useGetUserListings();
  const { mutate: addProduct, isPending } = useAddProduct();
  const { mutate: createPartnershipRequest } = useCreateCompositePartnershipRequest();

  const [step, setStep] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const [fulfillmentType, setFulfillmentType] = useState<('shipping' | 'pickup')[]>([]);
  const [shippingMethod, setShippingMethod] = useState<'existing' | 'shipstation' | null>(null);

  const [formData, setFormData] = useState({
    productName: '',
    plusItem: null as any,
    category: '',
    categoryName: '',
    subCategory: '',
    subCategoryName: '',
    shortDesc: '',
    fullDesc: '',
    product_type: 'physical',
    brand: '',
    gender: 'none',
    productStatus: 'published',
    hasVariants: false,
    regular_price: '',
    sale_price: '',
    sku: '',
    images: [] as string[],
    videos: [] as string[],
    stock_status: 'instock',
    quantity: 100,
    weight: '',
    length: '',
    width: '',
    height: '',
    attributes: [],
    variations: [],
    sizeGuide: {
      enabled: false,
      system: 'international',
      measurements: [],
      diagrams: { male: '', female: '', unisex: '' }
    },
    bussinessId: '',
    serviceProviderId: '',
    fulfillmentType: [] as string[],
    pickupInstructions: '',
    isFreeDelivery: false,
    isPaidDelivery: false,
    freeDeliveryRadius: 0,
    tags: [] as string[],
    useVariantPricing: true,
    visibility: 'public',
    enableReviews: true,
    purchaseNote: '',
    lowStockThreshold: '',
    deliveryOriginAddressId: '',
    deliveryOriginAddressLine1: '',
    deliveryOriginCity: '',
    deliveryOriginPostalCode: '',
    deliveryOriginLat: '',
    deliveryOriginLng: '',
  });

  const updateFormData = (newData: any) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  useEffect(() => {
    if (userListings?.data?.length === 1 && !formData.bussinessId) {
      updateFormData({ bussinessId: userListings.data[0].id });
    }
  }, [userListings, formData.bussinessId]);


  const handlePublish = () => {
    const variantConfig = formData.attributes.map((attr: any) => ({
      name: attr.name,
      type: attr.type || 'select',
      options: attr.options.map((opt: any) => ({
        name: opt.name,
        priceModifier: opt.priceModifier || 0
      }))
    }));

    // Determine shipping method based on fulfillment and pricing
    let finalShippingMethod = 'delivery';
    if (formData.isFreeDelivery) finalShippingMethod = 'free';
    else if (fulfillmentType.includes('shipping')) finalShippingMethod = 'delivery';
    else if (fulfillmentType.includes('pickup')) finalShippingMethod = 'pickup';

    // Auto-generate SKU if empty
    const finalSku = formData.sku || (formData.productName
      ? formData.productName.replace(/[^a-z0-9]/gi, '-').toUpperCase() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase()
      : 'SKU-' + Date.now());

    // Map variations and ensure SKUs exist
    const finalVariations = (formData.variations || []).map((v: any) => {
      const generatedSku = (finalSku ? `${finalSku}-${Object.values(v.combination).join('-').toUpperCase()}` : `VAR-${Math.random().toString(36).substring(2, 5).toUpperCase()}`);

      if (!formData.useVariantPricing) {
        return {
          ...v,
          price: parseFloat(formData.regular_price) || 0,
          salePrice: parseFloat(formData.sale_price) || undefined,
          sku: v.sku || generatedSku,
          stock: parseInt(formData.quantity.toString()) || 0
        };
      }
      return {
        ...v,
        sku: v.sku || generatedSku
      };
    });

    let topLevelPrice = parseFloat(formData.regular_price) || 0;
    let topLevelSalePrice = parseFloat(formData.sale_price) || undefined;
    let topLevelSku = finalSku;

    // Requirement: "if a user selects yes price sku should come from the varaition table"
    if (formData.useVariantPricing && finalVariations.length > 0) {
      const firstVar = finalVariations[0];
      if (!topLevelPrice || topLevelPrice === 0) {
        topLevelPrice = firstVar.price;
        topLevelSalePrice = firstVar.salePrice;
      }
      if (!formData.sku) {
        topLevelSku = firstVar.sku;
      }
    }

    const payload: any = {
      ...formData,
      title: formData.productName,
      productName: formData.productName,
      description: formData.fullDesc,
      shortDescription: formData.shortDesc,
      category: formData.categoryName || formData.category,
      subCategory: formData.subCategoryName || formData.subCategory,
      productType: formData.product_type,
      sku: topLevelSku,
      price: topLevelPrice,
      salePrice: topLevelSalePrice,
      regular_price: topLevelPrice,
      sale_price: topLevelSalePrice,
      quantity: parseInt(formData.quantity.toString()) || 0,
      stock: parseInt(formData.quantity.toString()) || 0,
      media: [...(formData.images || []), ...(formData.videos || [])],
      variations: finalVariations,
      variantConfig,
      fulfillmentType: fulfillmentType,
      shippingMethod: finalShippingMethod,
      weight: formData.weight ? parseFloat(formData.weight) : 0,
      length: formData.length ? parseFloat(formData.length) : 0,
      width: formData.width ? parseFloat(formData.width) : 0,
      height: formData.height ? parseFloat(formData.height) : 0,
      lowStockThreshold: formData.lowStockThreshold ? parseInt(formData.lowStockThreshold.toString()) : 0,
    };

    // Clean up payload to avoid backend validation errors
    if (!payload.serviceProviderId) delete payload.serviceProviderId;
    if (payload.sale_price === undefined || payload.sale_price === null || isNaN(payload.sale_price)) delete payload.sale_price;
    if (payload.salePrice === undefined || payload.salePrice === null || isNaN(payload.salePrice)) delete payload.salePrice;

    // Ensure price is a positive number
    if (payload.price <= 0) payload.price = 0;
    if (payload.regular_price <= 0) payload.regular_price = 0;

    addProduct(payload, {
      onSuccess: (data: any) => {
        setCreatedProductId(data.id);

        if (formData.plusItem) {
            const requestDto: any = {};
            if (formData.plusItem.type === 'product') {
                requestDto.plusProductId = formData.plusItem.id;
            } else {
                requestDto.plusServiceId = formData.plusItem.id;
            }
            // Set base product ID (the one we just created)
            requestDto.baseProductId = data.id;

            createPartnershipRequest(requestDto, {
                onSuccess: () => toast.success('Partnership request sent!'),
                onError: (err) => toast.error('Product created, but partnership request failed: ' + err.message)
            });
        }

        setIsPublished(true);
        toast.success('Product created successfully!');
      },
      onError: (error: any) => {
        console.error('Failed to add product:', error);
        toast.error(error.message || 'Failed to create product');
      }
    });
  };

  const nextStep = () => {
    // Branching from Step 3
    if (step === 3) {
      if (formData.product_type !== 'physical') {
        setStep(7.5);
      } else {
        setStep(4);
      }
      return;
    }

    if (step === 4) {
      if (fulfillmentType.includes('shipping')) {
        setStep(4.1);
      } else if (fulfillmentType.includes('pickup')) {
        setStep(5.1);
      } else {
        setStep(7.5);
      }
      return;
    }

    // Path: Shipping Options -> Delivery Pricing
    if (step === 4.1) {
      setStep(4.2);
      return;
    }

    if (step === 4.2) {
      if (shippingMethod === 'shipstation') {
        setStep(5.5);
      } else {
        setStep(5);
      }
      return;
    }

    if (step === 5.5) {
      setStep(6);
      return;
    }

    if (step === 6) {
      setStep(7);
      return;
    }

    if (step === 5 || step === 7) {
      if (fulfillmentType.includes('pickup')) {
        setStep(5.1);
      } else {
        setStep(7.5);
      }
      return;
    }

    if (step === 5.1) {
      setStep(7.5);
      return;
    }

    if (step === 7.5) {
      setStep(8);
      return;
    }

    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (step === 8) {
      setStep(7.5);
      return;
    }

    if (step === 7.5) {
      if (formData.product_type !== 'physical') return setStep(3);
      if (fulfillmentType.includes('pickup')) return setStep(5.1);
      if (fulfillmentType.includes('shipping')) {
        if (shippingMethod === 'shipstation') return setStep(7);
        return setStep(5);
      }
      return setStep(4);
    }

    if (step === 7) return setStep(6);
    if (step === 6) return setStep(5.5);
    if (step === 5.5) return setStep(4.2);

    if (step === 4.1 || step === 5.1) return setStep(4);
    if (step === 4.2) return setStep(4.1);
    if (step === 5) return setStep(4.2);
    if (step === 5.1) {
      if (fulfillmentType.includes('shipping')) {
        if (shippingMethod === 'shipstation') return setStep(7);
        return setStep(5);
      }
      return setStep(4);
    }

    setStep((prev) => prev - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1BasicInfo formData={formData} updateFormData={updateFormData} onNext={nextStep} onCancel={() => { }} userListings={userListings?.data || []} />;
      case 2:
        return <Step2MediaContent formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} onSaveDraft={() => { }} />;
      case 3:
        return <Step3PricingInventory formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} />;
      case 4:
        return (
          <Step4aFulfillmentSelection
            onSelect={(types: ('shipping' | 'pickup')[]) => {
              setFulfillmentType(types);
              if (types.includes('shipping')) {
                setStep(4.1);
              } else if (types.includes('pickup')) {
                setStep(5.1);
              } else {
                setStep(7.5);
              }
            }}
            onBack={prevStep}
          />
        );
      case 4.1:
        return (
          <Step4ShippingOptions
            onSelectOption={(opt: 'existing' | 'shipstation') => {
              setShippingMethod(opt);
              nextStep();
            }}
            onBack={prevStep}
          />
        );
      case 4.2:
        return <Step4bDeliveryPricing formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} />;
      case 5:
        return <Step5SelectCarrier onBack={prevStep} onNext={nextStep} />;
      case 5.1:
        return <Step5aPickupConfiguration formData={formData} updateFormData={updateFormData} onBack={prevStep} onNext={nextStep} />
      case 5.5:
        return <Step5bConnectShipStation onBack={prevStep} onNext={nextStep} />;
      case 6:
        return <Step6ShipStationConfig onBack={prevStep} onNext={nextStep} />;
      case 7:
        return <Step7ServiceMapping onBack={prevStep} onFinish={() => setStep(7.5)} />;
      case 7.5:
        return <Step7Partnership formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} />;
      case 8:
        return <Step8Finalize formData={formData} updateFormData={updateFormData} onBack={prevStep} onPublish={handlePublish} onSaveDraft={() => { }} isPending={isPending} />;
      default:
        return <div>Unknown Step</div>;
    }
  };

  if (isPublished) {
    return (
      <ProductStatusModal
        isOpen={true}
        onClose={() => {
            setIsPublished(false);
            router.push('/dashboard/store/products');
        }}
        type="success"
        title="Product Added Successfully!"
        message={`${formData.productName} is now live and ready for customers.`}
        primaryAction={{
          label: "View Product",
          onClick: () => {
            if (createdProductId) {
                router.push(`/dashboard/product/${createdProductId}`);
            }
          }
        }}
        secondaryAction={{
          label: "Add Another Product",
          onClick: () => {
            setIsPublished(false);
            setCreatedProductId(null);
            setStep(1);
            // Reset form data if needed, but for now just go back to step 1
          }
        }}
        dashboardAction={{
          label: "Go to Dashboard",
          onClick: () => router.push('/dashboard/store/products')
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1c140d] p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">{renderStep()}</div>
    </div>
  );
}