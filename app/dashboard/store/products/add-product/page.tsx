"use client";

import React, { useState } from 'react';
import Step1BasicInfo from './components/Step1BasicInfo';
import Step2MediaContent from './components/Step2MediaContent';
import Step3PricingInventory from './components/Step3PricingInventory';
import Step4ShippingOptions from './components/shipping/Step4ShippingOptions';
import Step4aFulfillmentSelection from './components/shipping/Step4aFulfillmentSelection';
import Step4bDeliveryPricing from './components/shipping/Step4bDeliveryPricing';
import Step5SelectCarrier from './components/shipping/Step5SelectCarrier';
import Step5aPickupConfiguration from './components/shipping/Step5aPickupConfiguration';
import Step5bConnectShipStation from './components/shipping/Step5bConnectShipStation';
import Step6ShipStationConfig from './components/shipping/Step6ShipStationConfig';
import Step7ServiceMapping from './components/shipping/Step7ServiceMapping';
import Step8Finalize from './components/Step8Finalize';
import { ProductStatusModal } from './components/lib/ProductStatusModal';
import { useAuth } from '@/service/auth/hook';
import { useGetUserListings } from '@/service/listings/hook';
import { useAddProduct } from '@/service/store/products/hook';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function AddProductPage() {
  const { user } = useAuth();
  const { data: userListings } = useGetUserListings();
  const { mutate: addProduct, isPending } = useAddProduct();

  const [step, setStep] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState<('shipping' | 'pickup')[]>([]);
  const [shippingMethod, setShippingMethod] = useState<'existing' | 'shipstation' | null>(null);

  const [formData, setFormData] = useState({
    productName: '',
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
    stock_status: 'instock',
    quantity: 100,
    weight: '',
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
  });

  const updateFormData = (newData: any) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  useEffect(() => {
    if (user?.id) {
      updateFormData({ serviceProviderId: user.id });
    }
  }, [user]);

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

    const payload: any = {
      ...formData,
      title: formData.productName,
      productName: formData.productName,
      description: formData.fullDesc,
      shortDescription: formData.shortDesc,
      category: formData.categoryName || formData.category,
      subCategory: formData.subCategoryName || formData.subCategory,
      productType: formData.product_type,
      sku: finalSku,
      price: parseFloat(formData.regular_price) || 0,
      salePrice: parseFloat(formData.sale_price) || undefined,
      regular_price: parseFloat(formData.regular_price) || 0,
      sale_price: parseFloat(formData.sale_price) || undefined,
      quantity: parseInt(formData.quantity.toString()) || 0,
      stock: parseInt(formData.quantity.toString()) || 0,
      media: [...(formData.images || []), ...(formData.videos || [])],
      variantConfig,
      fulfillmentType: fulfillmentType,
      shippingMethod: finalShippingMethod,
      weight: formData.weight ? parseFloat(formData.weight) : 0,
      lowStockThreshold: formData.lowStockThreshold ? parseInt(formData.lowStockThreshold.toString()) : 0,
    };

    addProduct(payload, {
      onSuccess: () => {
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
        setStep(8);
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
        setStep(8);
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
        setStep(8);
      }
      return;
    }

    if (step === 5.1) {
      setStep(8);
      return;
    }

    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (step === 8) {
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
                setStep(8);
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
        return <Step7ServiceMapping onBack={prevStep} onFinish={() => setStep(8)} />;
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
        onClose={() => setIsPublished(false)}
        type="success"
        title="Product Added Successfully!"
        message={`${formData.productName} is now live and ready for customers.`}
        primaryAction={{
          label: "View Product",
          onClick: () => console.log("Navigate to product")
        }}
        secondaryAction={{
          label: "Add Another Product",
          onClick: () => {
            setIsPublished(false);
            setStep(1);
          }
        }}
        dashboardAction={{
          label: "Go to Dashboard",
          onClick: () => console.log("Navigate to dashboard")
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