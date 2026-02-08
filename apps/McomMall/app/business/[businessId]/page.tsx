'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGetProductsByBusiness } from '@/service/store/products/hook';
import { useGetServicesByBusiness } from '@/service/services/hook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/service/listings/types';

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

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center py-16 bg-gray-50">
        <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
          Welcome to <span className="text-orange-600">Our Store</span>
        </h1>
        <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
          Discover our exclusive collections and services, curated just for you.
        </p>
      </header>

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
                        <p className="text-xl font-bold text-orange-600">${product.price.toFixed(2)}</p>
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
  );
};

export default BusinessStorefrontPage;