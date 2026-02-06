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
import { useAddProduct } from '@/service/store/products/hook';
import { toast } from 'sonner';

export default function AddProductPage() {
  const [step, setStep] = useState(1);
  const [isPublished, setIsPublished] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState<('shipping' | 'pickup')[]>([]);
  const [shippingMethod, setShippingMethod] = useState<'existing' | 'shipstation' | null>(null);

  const [formData, setFormData] = useState({
    bussinessId: '',
    productName: '',
    category: '',
    subCategory: '',
    shortDesc: '',
    fullDesc: '',
    product_type: 'physical',
    brand: '',
    gender: '',
    productStatus: 'publish',
    hasVariants: false,
    regular_price: '',
    sale_price: '',
    sku: '',
    stock_status: 'instock',
    quantity: 100,
    weight: '',
    images: [],
    videos: [],
    attributes: [],
    variations: [],
    sizeGuide: {
      enabled: false,
      system: 'international',
      measurements: [],
      diagrams: { male: '', female: '', unisex: '' }
    }
  });

  const updateFormData = (newData: any) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const { mutate: addProduct, isPending: isSubmitting } = useAddProduct();

  const handlePublish = () => {
    if (!formData.bussinessId) {
      toast.error('Please select a business first (Step 1)');
      setStep(1);
      return;
    }

    const payload: any = {
      bussinessId: formData.bussinessId,
      title: formData.productName,
      category: formData.category,
      subCategories: formData.subCategory ? [formData.subCategory] : [],
      brand: formData.brand,
      gender: formData.gender as any,
      productType: formData.product_type,
      price: parseFloat(formData.regular_price) || 0,
      description: formData.fullDesc || formData.shortDesc || '',
      sku: formData.sku,
      shortDescription: formData.shortDesc,
      imageUrl: formData.images?.[0] || '',
      fileUrls: formData.images || [],
      enableStockManagement: true,
      weight: parseFloat(formData.weight) || 0,
      productStatus: formData.productStatus,
      attributes: formData.attributes,
      variations: formData.variations,
      sizeGuide: formData.sizeGuide
    };

    addProduct(payload, {
      onSuccess: () => {
        setIsPublished(true);
      },
      onError: (err: any) => {
        toast.error(err.message || 'Failed to add product');
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
        return <Step1BasicInfo formData={formData} updateFormData={updateFormData} onNext={nextStep} onCancel={() => { }} />;
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
        return <Step8Finalize formData={formData} updateFormData={updateFormData} onBack={prevStep} onPublish={handlePublish} onSaveDraft={() => { }} isSubmitting={isSubmitting} />;
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