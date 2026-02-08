'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Briefcase, Clock, MapPin, Star, Calendar, CheckCircle2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PromotionalItem } from '@/lib/listing-data';

interface ServiceCardProps {
    service: any; // Relaxed type to handle both PromotionalItem and real API data
    viewMode?: 'grid' | 'list';
}

export default function ServiceCard({ service, viewMode = 'grid' }: ServiceCardProps) {
    // Helper to extract price based on model
    const getPrice = () => {
        if (service.discountedPrice) return service.discountedPrice;
        if (service.pricingModel === 'perHour' && service.pricePerHour) return parseFloat(service.pricePerHour);
        if (service.pricingModel === 'fixed' && service.fixedPrice) return parseFloat(service.fixedPrice);
        if (service.price) return parseFloat(service.price.toString());
        return 0;
    };

    console.log('ServiceCard Debug:', {
        id: service.id,
        title: service.title,
        pricingModel: service.pricingModel,
        price: service.price,
        itemsLeft: service.items_left,
        stock: service.stock,
        fixedPrice: service.fixedPrice,
        pricePerHour: service.pricePerHour,
        discountedPrice: service.discountedPrice
    });

    const price = getPrice();
    const isHourly = service.pricingModel === 'perHour';

    // Helper to get image
    const getImage = () => {
        if (service.image) return service.image;
        if (service.imageUrl) return service.imageUrl;
        if (service.media && service.media.length > 0) return service.media[0];
        if (service.business?.logoUrl) return service.business.logoUrl;
        return 'https://placehold.co/600x400?text=Service';
    };

    const imageSrc = getImage();
    const title = service.title || service.name || 'Untitled Service';
    const category = service.category || service.subcategory || 'Professional Service';


    // Mock rating
    const idNum = typeof service.id === 'number'
        ? service.id
        : String(service.id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    const pseudoRandom = (idNum * 9301 + 49297) % 233280 / 233280;
    const rating = 4.2 + (pseudoRandom * 0.8);
    const completedJobs = Math.floor(pseudoRandom * 150) + 20;

    // Delivery modes
    const deliveryModes = ['onsite', 'remote', 'hybrid'];
    const deliveryMode = deliveryModes[idNum % deliveryModes.length];

    const deliveryConfig = {
        onsite: { label: 'On-site Service', color: 'bg-orange-100 text-orange-700', icon: MapPin },
        remote: { label: 'Remote Service', color: 'bg-green-100 text-green-700', icon: Briefcase },
        hybrid: { label: 'Flexible', color: 'bg-amber-100 text-amber-700', icon: Calendar }
    };

    const config = deliveryConfig[deliveryMode as keyof typeof deliveryConfig];
    const Icon = config.icon;

    if (viewMode === 'list') {
        return (
            <Link href={service.link || `/services/${service.id}`} className="block">
                <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                    <div className="flex flex-col sm:flex-row">
                        {/* Left - Service Image */}
                        <div className="relative w-full sm:w-64 h-48 sm:h-auto bg-gradient-to-br from-orange-50 to-amber-50 flex-shrink-0">
                            <Image
                                src={imageSrc}
                                alt={title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                            {/* Service Type Badge */}
                            <Badge className={cn("absolute top-3 left-3", config.color, "border-0 shadow-sm")}>
                                <Icon className="w-3 h-3 mr-1" />
                                {config.label}
                            </Badge>
                        </div>

                        {/* Right - Details */}
                        <div className="flex-1 p-6">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white border-0 mb-2">
                                        <Briefcase className="w-3 h-3 mr-1" />
                                        Service
                                    </Badge>
                                    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                        {title}
                                    </h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                                <User className="w-4 h-4" />
                                <span className="font-medium">{category}</span>
                            </div>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={cn(
                                                "w-4 h-4",
                                                i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                                            )}
                                        />
                                    ))}
                                    <span className="text-sm text-gray-600 ml-1">
                                        {rating.toFixed(1)} ({completedJobs} jobs)
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Verified Provider</span>
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className="text-sm text-gray-500">Starting from</span>
                                <span className="text-3xl font-bold text-gray-900">
                                    £{Number(price).toFixed(2)}
                                </span>
                                {isHourly && <span className="text-gray-500 text-sm">/ hour</span>}
                            </div>

                            <Button className="mt-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold shadow-md">
                                Book Now
                            </Button>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // Grid View - Professional Card
    return (
        <Link href={service.link || `/services/${service.id}`} className="block h-full">
            <div className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-orange-200 hover:scale-[1.02]">

                {/* Service Image */}
                <div className="relative h-40 bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden">
                    <Image
                        src={imageSrc}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                        <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white border-0 shadow-md text-[10px] md:text-xs">
                            <Briefcase className="w-3 h-3 mr-1" />
                            Service
                        </Badge>
                        <Badge className={cn("border-0 shadow-sm text-[10px] md:text-xs", config.color)}>
                            <Icon className="w-3 h-3 mr-1" />
                            {config.label}
                        </Badge>
                    </div>

                    {/* Verified Badge */}
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span className="text-[10px] font-semibold text-gray-700">Verified</span>
                    </div>
                </div>

                {/* Details Section */}
                <div className="flex-1 p-4 flex flex-col">
                    {/* Provider */}
                    <div className="flex items-center gap-1 text-gray-600 text-xs mb-2">
                        <User className="w-3 h-3" />
                        <span className="font-medium truncate">{category}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm md:text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors min-h-[2.5rem]">
                        {title}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={cn(
                                    "w-3 h-3",
                                    i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
                                )}
                            />
                        ))}
                        <span className="text-[10px] md:text-xs text-gray-500 ml-1">
                            {rating.toFixed(1)} ({completedJobs})
                        </span>
                    </div>

                    {/* Price */}
                    <div className="mt-auto">
                        <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-[10px] text-gray-500">From</span>
                            <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                                £{Number(price).toFixed(2)}
                            </span>
                            {isHourly && <span className="text-[10px] md:text-xs text-gray-500">/hr</span>}
                        </div>

                        {/* Book Button */}
                        <Button
                            size="sm"
                            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold shadow-sm text-xs h-9"
                            onClick={(e) => {
                                e.preventDefault();
                                // Handle booking
                            }}
                        >
                            <Calendar className="w-3 h-3 mr-1" />
                            Book Now
                        </Button>
                    </div>
                </div>

                {/* Decorative gradient accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400/10 to-transparent rounded-bl-full" />
            </div>
        </Link>
    );
}
