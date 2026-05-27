'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGetProductsByBusiness } from '@/service/store/products/hook';
import { useGetServicesByBusiness } from '@/service/services/hook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/service/listings/types';
import { Building2, Mail, Phone, Globe, MapPin, CheckCircle, User, ChevronLeft, Gift } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ProductCard from '@/components/marketplace/ProductCard';
import ServiceCard from '@/components/marketplace/ServiceCard';
import { PromotionalItem } from '@/lib/listing-data';

const BusinessStorefrontPage = () => {
  const { businessId } = useParams();
  const router = useRouter();
  const { addItemToCart } = useCart();
  const [productsPage, setProductsPage] = useState(1);
  const [servicesPage, setServicesPage] = useState(1);
  const productsLimit = 10;
  const servicesLimit = 10;

  const {
    data: productsData,
    isLoading: productsLoading,
    isError: productsError,
  } = useGetProductsByBusiness(
    businessId as string,
    productsPage,
    productsLimit
  );
  const {
    data: servicesData,
    isLoading: servicesLoading,
    isError: servicesError,
  } = useGetServicesByBusiness(
    businessId as string,
    servicesPage,
    servicesLimit
  );

  const handleAddToCart = (productId: string) => {
    addItemToCart({ productId, quantity: 1 });
  };

  const handleBookNow = (serviceId: string) => {
    router.push(`/booking/${serviceId}`);
  };

  // Extract business info from first product/service
  const business = productsData?.data?.[0]?.business || servicesData?.data?.[0]?.business;

  return (
    <div className="min-h-screen bg-gray-50 pb-12 pt-3">
      {/* Navigation */}
      <div className="bg-white/80 backdrop-blur-md border-b shadow-sm mb-6 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Link href="/marketplace" className="flex items-center text-gray-500 hover:text-orange-600 transition-colors text-sm font-bold">
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back to Marketplace
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Business Header */}
        {business && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            {/* Banner */}
            {business.bannerUrl ? (
              <div className="relative w-full h-64 md:h-80 bg-gray-900">
                <Image
                  src={business.bannerUrl}
                  alt={business.bannerAltText || business.businessName}
                  fill
                  className="object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
            ) : (
              <div className="relative w-full h-64 md:h-80 bg-gradient-to-r from-orange-500 to-red-600">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-multiply pointer-events-none" />
              </div>
            )}

            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Logo */}
                <div className="relative w-28 h-28 md:w-40 md:h-40 rounded-[2rem] overflow-hidden bg-white border-4 border-white shadow-2xl flex-shrink-0 -mt-20 md:-mt-24 ring-4 ring-orange-500/20">
                  {business.logoUrl ? (
                    <Image src={business.logoUrl} alt={business.logoAltText || business.businessName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-orange-200 bg-orange-50">
                      <Building2 size={64} />
                    </div>
                  )}
                </div>

                {/* Business Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-2">
                        {business.businessName}
                        {'isVerified' in business && business.isVerified && (
                          <span title="Verified Business">
                            <CheckCircle className="w-6 h-6 text-blue-500" />
                          </span>
                        )}
                      </h1>
                      {business.legalName && business.legalName !== business.businessName && (
                        <p className="text-gray-500 mt-1">Legal Name: {business.legalName}</p>
                      )}
                      {'user' in business && business.user && (
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                          <User className="w-4 h-4" />
                          Owner: {business.user.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Short Description */}
                  {business.shortDescription && (
                    <p className="text-gray-600 mt-4 text-lg">{business.shortDescription}</p>
                  )}

                  {/* Contact Info */}
                  <div className="mt-6 flex flex-wrap gap-4">
                    {business.businessEmail && (
                      <a href={`mailto:${business.businessEmail}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors">
                        <Mail className="w-4 h-4" />
                        {business.businessEmail}
                      </a>
                    )}
                    {business.businessPhone && (
                      <a href={`tel:${business.businessPhone}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors">
                        <Phone className="w-4 h-4" />
                        {business.businessPhone}
                      </a>
                    )}
                    {business.website && (
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-600 transition-colors">
                        <Globe className="w-4 h-4" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* About Section */}
              {business.about && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">About</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{business.about}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-16">
          {/* Products Section */}
          <section>
            <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-12">
              Our <span className="text-orange-600">Products</span>
            </h2>
            {productsLoading && <p>Loading products...</p>}
            {productsError && <p>Error loading products.</p>}
            {productsData && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {productsData.data.map((product: Product) => {
                    const mappedProduct: PromotionalItem = {
                      id: product.id,
                      title: product.title,
                      image: (product.fileUrls && product.fileUrls.length > 0) ? product.fileUrls[0] : (product.imageUrl || 'https://placehold.co/400x400'),
                      category: 'Products',
                      price: product.price,
                      items_left: 100,
                      link: `/products/${product.id}`
                    } as any;
                    
                    return (
                      <div key={product.id}>
                        <ProductCard product={mappedProduct} viewMode="grid" />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center items-center mt-8 space-x-4">
                  <Button
                    onClick={() => setProductsPage(p => Math.max(p - 1, 1))}
                    disabled={productsPage === 1}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="text-gray-600">
                    Page {productsPage} of{' '}
                    {Math.ceil(productsData.total / productsLimit)}
                  </span>
                  <Button
                    onClick={() => setProductsPage(p => p + 1)}
                    disabled={productsPage * productsLimit >= productsData.total}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* Services Section */}
          <section>
            <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-12">
              Our <span className="text-orange-600">Services</span>
            </h2>
            {servicesLoading && <p>Loading services...</p>}
            {servicesError && <p>Error loading services.</p>}
            {servicesData && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {servicesData.data.map(service => {
                    const mappedService = {
                      ...service,
                      image: service.media?.[0] || 'https://placehold.co/600x400',
                      link: `/services/${service.id}`
                    };
                    return (
                      <div key={service.id}>
                        <ServiceCard service={mappedService} viewMode="grid" />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center items-center mt-8 space-x-4">
                  <Button
                    onClick={() => setServicesPage(p => Math.max(p - 1, 1))}
                    disabled={servicesPage === 1}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="text-gray-600">
                    Page {servicesPage} of{' '}
                    {Math.ceil(servicesData.total / servicesLimit)}
                  </span>
                  <Button
                    onClick={() => setServicesPage(p => p + 1)}
                    disabled={servicesPage * servicesLimit >= servicesData.total}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </section>

          {/* E-Cards Section (Mocked) */}
          <section>
            <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-12">
              Gift <span className="text-orange-600">E-Cards</span>
            </h2>
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[50, 100, 200].map((amount) => (
                  <div key={amount} className="group relative rounded-3xl overflow-hidden shadow-xl transition-all hover:-translate-y-2 hover:shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 opacity-90" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
                    <div className="relative p-8 text-white h-full flex flex-col justify-between min-h-[220px]">
                      <div className="flex justify-between items-start">
                        <Gift className="w-10 h-10 opacity-80" />
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-md">
                          Digital
                        </span>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-1">{business?.businessName || 'Business'} E-Card</h3>
                        <p className="text-5xl font-black mb-4">£{amount}</p>
                        <Button className="w-full bg-white text-orange-600 hover:bg-gray-50 rounded-xl font-bold py-6 shadow-lg">
                          Purchase
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BusinessStorefrontPage;