"use client";

import React, { useState } from 'react';
import Step1BasicInfo from './components/Step1BasicInfo';
import Step2MediaContent from './components/Step2MediaContent';
import Step3PricingInventory from './components/Step3PricingInventory';
import Step4ShippingOptions from './components/shipping/Step4ShippingOptions';
import Step5SelectCarrier from './components/shipping/Step5SelectCarrier';
import Step5bConnectShipStation from './components/shipping/Step5bConnectShipStation';
import Step6ShipStationConfig from './components/shipping/Step6ShipStationConfig';
import Step7ServiceMapping from './components/shipping/Step7ServiceMapping';
import Step8Finalize from './components/Step8Finalize';

export default function AddProductPage() {
    const [step, setStep] = useState(1);
    const [shippingMethod, setShippingMethod] = useState<'existing' | 'shipstation' | null>(null);

    // Centralized State
    const [formData, setFormData] = useState({
        productTitle: '',
        category: '',
        subCategory: '',
        description: '',
        shortDesc: '',
        fullDesc: '',
        product_type: 'physical',
        regular_price: '',
        sale_price: '',
        sku: '',
        stock_status: 'instock',
        quantity: 100,
        weight: '',
        // ... add more fields as needed for all steps
    });

    const updateFormData = (newData: any) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    // Navigation Logic
    const nextStep = () => {
        if (step === 3 && formData.product_type !== 'physical') {
            // Skip shipping for non-physical products
            setStep(8);
            return;
        }

        if (step === 4) {
            if (shippingMethod === 'shipstation') {
                setStep(5.5); // Go to 5b
            } else {
                setStep(5); // Go to 5 (Carrier Select)
            }
            return;
        }

        if (step === 5) {
            setStep(8); // From Carrier Select to Finalize for now (skipping config for custom carriers)
            return;
        }

        if (step === 5.5) {
            setStep(6);
            return;
        }

        // Default increment
        setStep(prev => prev + 1);
    };

    const prevStep = () => {
        if (step === 8) {
            if (formData.product_type !== 'physical') {
                setStep(3);
                return;
            }
            if (shippingMethod === 'shipstation') {
                setStep(7);
            } else if (shippingMethod === 'existing') {
                setStep(5);
            } else {
                // Fallback if came from direct flow or state issue
                setStep(4);
            }
            return;
        }

        if (step === 5 || step === 5.5) {
            setStep(4);
            return;
        }

        // decimal steps handling
        if (step === 6) {
            setStep(5.5);
            return;
        }

        setStep(prev => prev - 1);
    };

    const handleShippingOptionSelect = (option: 'existing' | 'shipstation') => {
        setShippingMethod(option);
        if (option === 'shipstation') {
            setStep(5.5); // Using 5.5 to represent Step 5b
        } else {
            setStep(5);
        }
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
                return <Step4ShippingOptions onSelectOption={handleShippingOptionSelect} onBack={prevStep} />;
            case 5:
                return <Step5SelectCarrier onBack={prevStep} onNext={nextStep} />;
            case 5.5: // Step 5b
                return <Step5bConnectShipStation onBack={prevStep} onNext={nextStep} />;
            case 6:
                return <Step6ShipStationConfig onBack={prevStep} onNext={nextStep} />;
            case 7:
                return <Step7ServiceMapping onBack={prevStep} onFinish={() => setStep(8)} />;
            case 8:
                return <Step8Finalize formData={formData} updateFormData={updateFormData} onBack={prevStep} onPublish={() => { }} onSaveDraft={() => { }} />;
            default:
                return <div>Unknown Step</div>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#1c140d] p-4 md:p-8 font-sans transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {renderStep()}
            </div>
        </div>
    );
}
