'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useGetProductById } from '@/service/store/products/hook';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCart } from '@/hooks/useCart';
import { Loader, ShoppingCart, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const { addItemToCart } = useCart();

  const { data: product, isLoading, isError } = useGetProductById(id || '');

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Initialize selected variants with defaults
  useEffect(() => {
    if (product?.variants) {
      const defaults: Record<string, string> = {};
      product.variants.forEach((v) => {
        if (v.options && v.options.length > 0) {
          defaults[v.name] = v.options[0].name;
        }
      });
      setSelectedVariants(defaults);
    }
  }, [product]);

  const handleVariantChange = (variantName: string, optionName: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [variantName]: optionName,
    }));
  };

  const calculatePrice = useMemo(() => {
    if (!product) return 0;
    let basePrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;

    if (product.variants) {
      product.variants.forEach((variant) => {
        const selectedOptionName = selectedVariants[variant.name];
        const selectedOption = variant.options.find((opt) => opt.name === selectedOptionName);
        if (selectedOption) {
          basePrice += Number(selectedOption.priceModifier) || 0;
        }
      });
    }
    return basePrice;
  }, [product, selectedVariants]);

  const handleAddToCart = () => {
    if (!product || !id) return;
    addItemToCart({
      productId: id,
      quantity: 1,
      selectedVariants,
    });
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    if (!product || !id) return;
    // Construct query params for variants
    const variantParams = new URLSearchParams();
    variantParams.append('productId', id);
    // We can't easily pass the complex object via URL for direct checkout without saving it somewhere or encoding it.
    // However, the checkout page logic handles fetching the product and applying variants if passed?
    // The current checkout implementation fetches product by ID. It doesn't seem to accept variants from URL yet.
    // We should probably add to cart and redirect to checkout? Or pass variants via URL?
    // The requirement says: "When the frontend initiates a checkout... it must include the selectedVariants."
    // If we go to /checkout?productId=..., we need a way to pass variants.
    // I will encode selectedVariants in the URL or use local storage?
    // Let's assume we add to cart then checkout for now, OR we pass it in URL.
    // Since the checkout page is a client component, I can pass it via URL state or context.
    // I'll stick to URL encoding for now as a simple solution if the checkout page supports it.
    // Wait, I haven't updated CheckoutClient to read variants from URL yet.
    // I will add logic to CheckoutClient later to read `variants` from URL param.

    // For now, let's just add to cart and go to checkout with from=cart?
    // Or just pass `variants` as a JSON string in query param.

    const variantsJson = encodeURIComponent(JSON.stringify(selectedVariants));
    router.push(`/checkout?productId=${id}&variants=${variantsJson}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin text-orange-600" size={48} />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl text-red-500">Product not found</p>
      </div>
    );
  }

  const images = product.fileUrls && product.fileUrls.length > 0
    ? product.fileUrls
    : [product.imageUrl || 'https://via.placeholder.com/500'];

  return (
    <div className="container mx-auto px-4 py-8 pt-28">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
            <Image
                src={images[currentImageIndex]}
                alt={product.title}
                fill
                className="object-contain"
            />
             {/* Hotspots would go here if we implemented the hotspot viewer for public page */}
            </div>
            {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {images.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`relative w-20 h-20 rounded-md overflow-hidden border-2 ${currentImageIndex === index ? 'border-orange-500' : 'border-transparent'}`}
                        >
                            <Image src={img} alt={`${product.title} ${index}`} fill className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>

        {/* Product Details */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
            <p className="text-lg text-gray-500 mt-2">{product.category}</p>
          </div>

          <div className="text-3xl font-bold text-orange-600">
            £{calculatePrice.toFixed(2)}
          </div>

          <p className="text-gray-700 leading-relaxed">
            {product.description}
          </p>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-6 border-t pt-6">
              {product.variants.map((variant) => (
                <div key={variant.name} className="space-y-3">
                  <Label className="text-base font-semibold">{variant.name}</Label>

                  {variant.type === 'radio' ? (
                    <RadioGroup
                        value={selectedVariants[variant.name]}
                        onValueChange={(val) => handleVariantChange(variant.name, val)}
                        className="flex flex-wrap gap-3"
                    >
                        {variant.options.map((option) => (
                            <div key={option.name} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.name} id={`${variant.name}-${option.name}`} />
                                <Label htmlFor={`${variant.name}-${option.name}`}>
                                    {option.name}
                                    {Number(option.priceModifier) !== 0 && (
                                        <span className="text-gray-500 text-sm ml-1">
                                            ({Number(option.priceModifier) > 0 ? '+' : ''}£{Number(option.priceModifier).toFixed(2)})
                                        </span>
                                    )}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                  ) : (
                    // Default to Select for 'select' and other types for now
                    <Select
                        value={selectedVariants[variant.name]}
                        onValueChange={(val) => handleVariantChange(variant.name, val)}
                    >
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder={`Select ${variant.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                            {variant.options.map((option) => (
                                <SelectItem key={option.name} value={option.name}>
                                    {option.name}
                                    {Number(option.priceModifier) !== 0 && (
                                        <span className="text-gray-500 ml-1">
                                             ({Number(option.priceModifier) > 0 ? '+' : ''}£{Number(option.priceModifier).toFixed(2)})
                                        </span>
                                    )}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button
                size="lg"
                className="flex-1 text-lg py-6"
                onClick={handleAddToCart}
            >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
            </Button>
            <Button
                size="lg"
                variant="secondary"
                className="flex-1 text-lg py-6"
                onClick={handleBuyNow}
            >
                <CreditCard className="mr-2 h-5 w-5" />
                Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
