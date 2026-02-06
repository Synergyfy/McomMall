"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Step1BasicInfo from '../../components/wizard/Step1BasicInfo';
import Step2MediaContent from '../../components/wizard/Step2MediaContent';
import Step3PricingInventory from '../../components/wizard/Step3PricingInventory';
import Step4ShippingOptions from '../../components/wizard/shipping/Step4ShippingOptions';
import Step4aFulfillmentSelection from '../../components/wizard/shipping/Step4aFulfillmentSelection';
import Step4bDeliveryPricing from '../../components/wizard/shipping/Step4bDeliveryPricing';
import Step5SelectCarrier from '../../components/wizard/shipping/Step5SelectCarrier';
import Step5aPickupConfiguration from '../../components/wizard/shipping/Step5aPickupConfiguration';
import Step5bConnectShipStation from '../../components/wizard/shipping/Step5bConnectShipStation';
import Step6ShipStationConfig from '../../components/wizard/shipping/Step6ShipStationConfig';
import Step7ServiceMapping from '../../components/wizard/shipping/Step7ServiceMapping';
import Step8Finalize from '../../components/wizard/Step8Finalize';
import { ProductStatusModal } from '../../components/wizard/lib/ProductStatusModal';
import { useAuth } from '@/service/auth/hook';
import { useGetUserListings } from '@/service/listings/hook';
import { useGetProductById, useUpdateProduct } from '@/service/store/products/hook';
import { useGetCategories, useGetSubCategoriesByCategory } from '@/service/taxonomy/hook';
import { toast } from 'sonner';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();
  const { data: userListings } = useGetUserListings();
  const { data: product, isLoading: isLoadingProduct } = useGetProductById(id);
  const { mutate: updateProduct, isPending } = useUpdateProduct();
  const { data: categories } = useGetCategories();

  const [step, setStep] = useState(1);
  const [isUpdated, setIsUpdated] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState<('shipping' | 'pickup')[]>([]);
  const [shippingMethod, setShippingMethod] = useState<'existing' | 'shipstation' | null>(null);

  const [formData, setFormData] = useState<any>({
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
  });

  const { data: subCategories } = useGetSubCategoriesByCategory(formData.category);

  useEffect(() => {
    if (product) {
      const initialData = {
        productName: product.title || '',
        category: product.category || '',
        subCategory: product.subCategory || '',
        shortDesc: product.shortDescription || '',
        fullDesc: product.description || '',
        product_type: product.productType || 'physical',
        brand: product.brand || '',
        gender: product.gender || 'none',
        productStatus: product.productStatus || 'published',
        hasVariants: (product.variations && product.variations.length > 0) || false,
        regular_price: product.price?.toString() || '',
        sale_price: product.salePrice?.toString() || '',
        sku: product.sku || '',
        images: product.fileUrls?.filter((url: string) => /\.(jpg|jpeg|png|webp|gif)$/i.test(url)) || [],
        videos: product.fileUrls?.filter((url: string) => /\.(mp4|webm|ogg)$/i.test(url)) || product.media?.filter((url: string) => /\.(mp4|webm|ogg)$/i.test(url)) || [],
        stock_status: (product.stock ?? 0) > 0 ? 'instock' : 'outofstock',
        quantity: product.stock || 0,
        weight: product.weight?.toString() || '',
        length: product.length?.toString() || '',
        width: product.width?.toString() || '',
        height: product.height?.toString() || '',
        attributes: product.attributes || [],
        variations: product.variations || [],
        sizeGuide: product.sizeGuide || {
          enabled: false,
          system: 'international',
          measurements: [],
          diagrams: { male: '', female: '', unisex: '' }
        },
        bussinessId: product.bussinessId || '',
        serviceProviderId: product.serviceProviderId || '',
        fulfillmentType: product.fulfillmentType || [],
        pickupInstructions: product.pickupInstructions || '',
        isFreeDelivery: product.isFreeDelivery || false,
        isPaidDelivery: product.isPaidDelivery || false,
        freeDeliveryRadius: product.freeDeliveryRadius || 0,
        tags: product.tags || [],
        useVariantPricing: product.useVariantPricing ?? true,
        visibility: product.visibility || 'public',
        enableReviews: product.enableReviews ?? true,
        purchaseNote: product.purchaseNote || '',
      };
      setFormData(initialData);

      if (product.fulfillmentType) {
          setFulfillmentType(product.fulfillmentType as ('shipping' | 'pickup')[]);
      }
    }
  }, [product]);

  // Resolve category Name to ID
  useEffect(() => {
      if (categories && formData.category && !formData.categoryName) {
          const cat = categories.find(c => c.id === formData.category || c.name === formData.category);
          if (cat && cat.id !== formData.category) {
              setFormData((prev: any) => ({ ...prev, category: cat.id, categoryName: cat.name }));
          } else if (cat) {
              setFormData((prev: any) => ({ ...prev, categoryName: cat.name }));
          }
      }
  }, [categories, formData.category]);

  // Resolve subcategory Name to ID
  useEffect(() => {
      if (subCategories && formData.subCategory && !formData.subCategoryName) {
          const sub = subCategories.find(s => s.id === formData.subCategory || s.name === formData.subCategory);
          if (sub && sub.id !== formData.subCategory) {
              setFormData((prev: any) => ({ ...prev, subCategory: sub.id, subCategoryName: sub.name }));
          } else if (sub) {
              setFormData((prev: any) => ({ ...prev, subCategoryName: sub.name }));
          }
      }
  }, [subCategories, formData.subCategory]);

  const updateFormData = (newData: any) => {
    setFormData((prev: any) => ({ ...prev, ...newData }));
  };

  const handleUpdate = () => {
    const variantConfig = formData.attributes.map((attr: any) => ({
      name: attr.name,
      type: attr.type || 'select',
      options: attr.options.map((opt: any) => ({
        name: opt.name,
        priceModifier: opt.priceModifier || 0
      }))
    }));

    // Determine shipping method
    let finalShippingMethod = 'delivery';
    if (formData.isFreeDelivery) finalShippingMethod = 'free';
    else if (fulfillmentType.includes('shipping')) finalShippingMethod = 'delivery';
    else if (fulfillmentType.includes('pickup')) finalShippingMethod = 'pickup';

    const finalVariations = (formData.variations || []).map((v: any) => {
      const generatedSku = (formData.sku ? `${formData.sku}-${Object.values(v.combination).join('-').toUpperCase()}` : `VAR-${Math.random().toString(36).substring(2, 5).toUpperCase()}`);

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
    let topLevelSku = formData.sku;

    // Requirement: "if a user selects yes price sku should come from the varaition table"
    if (formData.useVariantPricing && finalVariations.length > 0) {
      const firstVar = finalVariations[0];
      if (!topLevelPrice || topLevelPrice === 0) {
        topLevelPrice = firstVar.price;
        topLevelSalePrice = firstVar.salePrice;
      }
      if (!topLevelSku) {
        topLevelSku = firstVar.sku;
      }
    }

    const payload: any = {
      ...formData,
      id,
      title: formData.productName,
      description: formData.fullDesc,
      shortDescription: formData.shortDesc,
      category: formData.categoryName || formData.category,
      subCategory: formData.subCategoryName || formData.subCategory,
      productType: formData.product_type,
      price: topLevelPrice,
      salePrice: topLevelSalePrice,
      regular_price: topLevelPrice,
      sale_price: topLevelSalePrice,
      sku: topLevelSku,
      quantity: parseInt(formData.quantity.toString()) || 0,
      stock: parseInt(formData.quantity.toString()) || 0,
      media: [...(formData.images || []), ...(formData.videos || [])],
      fileUrls: [...(formData.images || []), ...(formData.videos || [])],
      variations: finalVariations,
      variantConfig,
      fulfillmentType: fulfillmentType,
      shippingMethod: finalShippingMethod,
      weight: formData.weight ? parseFloat(formData.weight) : 0,
      length: formData.length ? parseFloat(formData.length) : 0,
      width: formData.width ? parseFloat(formData.width) : 0,
      height: formData.height ? parseFloat(formData.height) : 0,
    };

    // Clean up payload to avoid backend validation errors
    if (!payload.serviceProviderId) delete payload.serviceProviderId;
    if (payload.sale_price === undefined || payload.sale_price === null || isNaN(payload.sale_price)) delete payload.sale_price;
    if (payload.salePrice === undefined || payload.salePrice === null || isNaN(payload.salePrice)) delete payload.salePrice;

    // Ensure price is a positive number
    if (payload.price <= 0) payload.price = 0;
    if (payload.regular_price <= 0) payload.regular_price = 0;

    updateProduct(payload, {
      onSuccess: () => {
        setIsUpdated(true);
        toast.success('Product updated successfully!');
      },
      onError: (error: any) => {
        console.error('Failed to update product:', error);
        toast.error(error.message || 'Failed to update product');
      }
    });
  };

  const nextStep = () => {
    window.scrollTo(0, 0);
    if (step === 3) {
      if (formData.product_type !== 'physical') return setStep(8);
      return setStep(4);
    }
    if (step === 4) {
      if (fulfillmentType.includes('shipping')) return setStep(4.1);
      if (fulfillmentType.includes('pickup')) return setStep(5.1);
      return setStep(8);
    }
    if (step === 4.1) return setStep(4.2);
    if (step === 4.2) {
      if (shippingMethod === 'shipstation') return setStep(5.5);
      return setStep(5);
    }
    if (step === 5.5) return setStep(6);
    if (step === 6) return setStep(7);
    if (step === 5 || step === 7) {
      if (fulfillmentType.includes('pickup')) return setStep(5.1);
      return setStep(8);
    }
    if (step === 5.1) return setStep(8);
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    window.scrollTo(0, 0);
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
    setStep((prev) => prev - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1BasicInfo formData={formData} updateFormData={updateFormData} onNext={nextStep} onCancel={() => router.back()} userListings={userListings?.data || []} />;
      case 2:
        return <Step2MediaContent formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} onSaveDraft={() => {}} />;
      case 3:
        return <Step3PricingInventory formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} />;
      case 4:
        return (
          <Step4aFulfillmentSelection
            onSelect={(types: ('shipping' | 'pickup')[]) => {
              setFulfillmentType(types);
              if (types.includes('shipping')) setStep(4.1);
              else if (types.includes('pickup')) setStep(5.1);
              else setStep(8);
            }}
            onBack={prevStep}
          />
        );
      case 4.1:
        return <Step4ShippingOptions onSelectOption={(opt: any) => { setShippingMethod(opt); nextStep(); }} onBack={prevStep} />;
      case 4.2:
        return <Step4bDeliveryPricing formData={formData} updateFormData={updateFormData} onNext={nextStep} onBack={prevStep} />;
      case 5:
        return <Step5SelectCarrier onBack={prevStep} onNext={nextStep} />;
      case 5.1:
        return <Step5aPickupConfiguration formData={formData} updateFormData={updateFormData} onBack={prevStep} onNext={nextStep} />;
      case 5.5:
        return <Step5bConnectShipStation onBack={prevStep} onNext={nextStep} />;
      case 6:
        return <Step6ShipStationConfig onBack={prevStep} onNext={nextStep} />;
      case 7:
        return <Step7ServiceMapping onBack={prevStep} onFinish={() => setStep(8)} />;
      case 8:
        return <Step8Finalize formData={formData} updateFormData={updateFormData} onBack={prevStep} onPublish={handleUpdate} onSaveDraft={() => {}} isPending={isPending} />;
      default:
        return <div>Unknown Step</div>;
    }
  };

  if (isLoadingProduct) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  if (isUpdated) {
    return (
      <ProductStatusModal
        isOpen={true}
        onClose={() => { setIsUpdated(false); router.push('/dashboard/store/products'); }}
        type="success"
        title="Product Updated Successfully!"
        message={`${formData.productName} has been updated.`}
        primaryAction={{ label: "View Product", onClick: () => router.push(`/dashboard/product/${id}`) }}
        dashboardAction={{ label: "Go to Dashboard", onClick: () => router.push('/dashboard/store/products') }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1c140d] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">{renderStep()}</div>
    </div>
  );
}
