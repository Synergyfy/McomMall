'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGetProductsByBusiness } from '@/service/store/products/hook';
import { useGetServicesByBusiness } from '@/service/services/hook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/useCart';

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
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-orange-600">
          Welcome to Our Store
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Explore our products and services
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Products Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Products
          </h2>
          {productsLoading && <p>Loading products...</p>}
          {productsError && <p>Error loading products.</p>}
          {productsData && (
            <div className="space-y-6">
              {productsData.data.map(product => (
                <Card key={product.id}>
                  <CardHeader>
                    <CardTitle>{product.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-semibold text-orange-600">
                      ${product.price}
                    </p>
                    {product.points && (
                      <p className="text-sm text-gray-500">
                        Earn {product.points} loyalty points
                      </p>
                    )}
                    <Button
                      onClick={() => handleAddToCart(product.id)}
                      className="mt-4 w-full bg-orange-600 hover:bg-orange-700"
                    >
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <div className="flex justify-between mt-6">
                <Button
                  onClick={() => setProductsPage(p => Math.max(p - 1, 1))}
                  disabled={productsPage === 1}
                >
                  Previous
                </Button>
                <span>
                  Page {productsPage} of{' '}
                  {Math.ceil(productsData.total / productsLimit)}
                </span>
                <Button
                  onClick={() => setProductsPage(p => p + 1)}
                  disabled={productsPage * productsLimit >= productsData.total}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Services Section */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Services
          </h2>
          {servicesLoading && <p>Loading services...</p>}
          {servicesError && <p>Error loading services.</p>}
          {servicesData && (
            <div className="space-y-6">
              {servicesData.data.map(service => (
                <Card key={service.id}>
                  <CardHeader>
                    <CardTitle>{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleBookNow(service.id)}
                      className="mt-4 w-full bg-orange-600 hover:bg-orange-700"
                    >
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
              <div className="flex justify-between mt-6">
                <Button
                  onClick={() => setServicesPage(p => Math.max(p - 1, 1))}
                  disabled={servicesPage === 1}
                >
                  Previous
                </Button>
                <span>
                  Page {servicesPage} of{' '}
                  {Math.ceil(servicesData.total / servicesLimit)}
                </span>
                <Button
                  onClick={() => setServicesPage(p => p + 1)}
                  disabled={servicesPage * servicesLimit >= servicesData.total}
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