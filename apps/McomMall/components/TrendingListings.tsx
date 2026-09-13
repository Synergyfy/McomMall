'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Zap, Fuel, Gauge, CheckCircle } from 'lucide-react';
import { CURRENCY } from '@/lib/utils';

const listings = [
  {
    id: 1,
    title: 'George Burton – Life Coach',
    category: 'Business Coach, Coaching, Life Coach',
    location: 'Ocean Avenue, New York',
    image: 'https://ext.same-assets.com/1310083762/3001611569.jpeg',
    rating: 3.8,
    price: `${CURRENCY}100.00`,
    priceUnit: 'per day',
    featured: true,
    verified: true,
    status: 'Now Open',
    statusColor: 'bg-green-500',
  },
  {
    id: 2,
    title: 'Sports Car',
    category: 'Cars, For Rent',
    location: 'Suffolk County, New York',
    image: 'https://ext.same-assets.com/1310083762/2416888981.jpeg',
    rating: 5.0,
    price: `${CURRENCY}20.00`,
    priceUnit: 'per hour',
    featured: false,
    verified: true,
    status: 'Now Open',
    statusColor: 'bg-green-500',
    specs: [
      { icon: Zap, text: '443' },
      { icon: Fuel, text: 'Petrol' },
      { icon: Gauge, text: '8-speed PDK' }
    ]
  }
];

export default function TrendingListings() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trending Listings
          </h2>
          <div className="w-16 h-1 bg-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            A selection of listings verified for quality
          </p>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-8">
          {listings.map((listing) => (
            <Card key={listing.id} className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="relative">
                <img
                  src={listing.image}
                  alt={listing.title}
                  width={400}
                  height={240}
                  className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {listing.category.split(', ').map((cat, index) => (
                    <Badge key={index} className="bg-red-500 hover:bg-red-600 text-white">
                      {cat}
                    </Badge>
                  ))}
                </div>

                {listing.status && (
                  <Badge className={`absolute top-4 right-4 ${listing.statusColor} text-white`}>
                    {listing.status}
                  </Badge>
                )}

                {listing.featured && (
                  <div className="absolute bottom-4 left-4">
                    <Badge className="bg-orange-500 text-white">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-500 transition-colors">
                    {listing.title}
                    {listing.verified && (
                      <CheckCircle className="inline-block w-5 h-5 ml-2 text-green-500" />
                    )}
                  </h3>
                </div>

                <div className="flex items-center text-gray-500 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{listing.location}</span>
                </div>

                {/* Specs for cars */}
                {listing.specs && (
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                    {listing.specs.map((spec, index) => (
                      <div key={index} className="flex items-center">
                        <spec.icon className="w-4 h-4 mr-1" />
                        <span>{spec.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-semibold">{listing.rating}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      Starts from {listing.price}
                    </div>
                    <div className="text-sm text-gray-500">{listing.priceUnit}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          <div className="w-3 h-3 rounded-full bg-gray-300"></div>
        </div>
      </div>
    </section>
  );
}
