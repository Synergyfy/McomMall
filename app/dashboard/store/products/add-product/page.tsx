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

export default function AddProductPage() {
  const [step, setStep] = useState(1);
  const [isPublished, setIsPublished] = useState(false); 
  const [fulfillmentType, setFulfillmentType] = useState<'shipping' | 'pickup' | null>(null);
  const [shippingMethod, setShippingMethod] = useState<'existing' | 'shipstation' | null>(null);

  const [formData, setFormData] = useState({
    productTitle: '',
    category: '',
    subCategory: '',
    description: '',
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

  const handlePublish = () => {
    setIsPublished(true);
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
      if (fulfillmentType === 'pickup') {
        setStep(5.1);
      } else {
        setStep(4.1);
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

    if (step === 5 || step === 5.1 || step === 7) {
      setStep(8);
      return;
    }

    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (step === 8) {
      if (formData.product_type !== 'physical') return setStep(3);
      if (fulfillmentType === 'pickup') return setStep(5.1);
      if (shippingMethod === 'shipstation') return setStep(7);
      return setStep(5);
    }
    
    if (step === 7) return setStep(6);
    if (step === 6) return setStep(5.5);
    if (step === 5.5) return setStep(4.2);

    if (step === 4.1 || step === 5.1) return setStep(4);
    if (step === 4.2) return setStep(4.1);
    if (step === 5) return setStep(4.2);
    
    setStep((prev) => prev - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1BasicInfo formData={formData} updateFormData={updateFormData} onNext={nextStep} onCancel={() => {}} />;
      case 2:
        return <Step2MediaContent formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} onSaveDraft={() => {}} />;
      case 3:
        return <Step3PricingInventory formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} />;
      case 4:
        return (
          <Step4aFulfillmentSelection
            onSelect={(type: 'shipping' | 'pickup') => {
              setFulfillmentType(type);
              type === 'pickup' ? setStep(5.1) : setStep(4.1);
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
        return <Step8Finalize formData={formData} updateFormData={updateFormData} onBack={prevStep} onPublish={handlePublish} onSaveDraft={() => {}} />;
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
        message={`${formData.productTitle} is now live and ready for customers.`}
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