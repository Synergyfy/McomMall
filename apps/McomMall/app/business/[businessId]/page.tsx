'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGetProductsByBusiness } from '@/service/store/products/hook';
import { useGetServicesByBusiness } from '@/service/services/hook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/service/listings/types';
import { Building2, Mail, Phone, Globe, MapPin, CheckCircle, User, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

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
      <div className="bg-white border-b shadow-sm mb-6">
        <div className="container mx-auto px-4 h-14 flex items-center">
          <Link href="/marketplace" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm font-medium">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Marketplace
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Business Header */}
        {business && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            {/* Banner */}
            {business.bannerUrl && (
              <div className="relative w-full h-48 md:h-64 bg-gradient-to-r from-orange-500 to-red-500">
                <img src={business.bannerUrl} alt={business.bannerAltText || business.businessName} className="absolute inset-0 w-full h-full object-cover" />
              </div>
            )}

            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Logo */}
                <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg flex-shrink-0 -mt-16 md:-mt-20">
                  {business.logoUrl ? (
                    <img src={business.logoUrl} alt={business.logoAltText || business.businessName} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Building2 size={48} />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {productsData.data.map((product: Product) => (
                    <Card key={product.id} className="pt-0 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
                      {product.fileUrls?.length ? (
                        <img
                          src={product.fileUrls[0]}
                          alt={product.title}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="w-full h-40 image-placeholder">
                          <span>No Image</span>
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle>{product.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4">{product.shortDescription}</p>
                        <div className="flex justify-between items-center mb-4">
                          <p className="text-xl font-bold text-orange-600">£{product.price.toFixed(2)}</p>
                          {product.points && (
                            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                              Earn {product.points} points
                            </span>
                          )}
                        </div>
                        <Button
                          onClick={() => handleAddToCart(product.id)}
                          className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {servicesData.data.map(service => (
                    <Card key={service.id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
                      {service.media?.[0] ? (
                        <img
                          src={service.media[0]}
                          alt={service.name}
                          className="w-full h-40 object-cover"
                        />
                      ) : (
                        <div className="w-full h-40 image-placeholder">
                          <span>No Image</span>
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle>{service.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600 text-sm mb-4">{service.description}</p>
                        <Button
                          onClick={() => handleBookNow(service.id)}
                          className="w-full bg-orange-600 hover:bg-orange-700"
                        >
                          Book Now
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
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
        </div>
      </div>
    </div>
  );
};

export default BusinessStorefrontPage;