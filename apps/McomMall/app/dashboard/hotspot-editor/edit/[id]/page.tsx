'use client';
import React, { useState, useEffect, MouseEvent, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { mockCampaigns, Campaign } from '@/lib/hotspot-data';
import { PromotionalItem, Hotspot } from '@/lib/listing-data';
import { useGetServiceById, useUpdateService } from '@/service/services/hook';
import { UpdateServiceDto } from '@/service/services/types';
import { useGetBusinessData, useEditListing } from '@/service/listings/hook';
import { useMarketplaceProducts } from '@/hooks/useMarketplace';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Eye, Save } from 'lucide-react';
import { toast } from 'sonner';

interface EditableItem {
  id: string;
  name: string;
  imageUrl: string;
  hotspots: Hotspot[];
}

const HotspotEditorContent = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [item, setItem] = useState<EditableItem | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  const itemType = searchParams.get('type');
  const itemId = params.id as string;

  const { data: serviceData, isLoading: isLoadingService } = useGetServiceById(itemId, itemType === 'service');
  const { data: listingData, isLoading: isLoadingListing } = useGetBusinessData({ id: itemId, enabled: itemType === 'banner' });
  const { data: productsData } = useMarketplaceProducts({ limit: 50 });

  const promotionalItems: (PromotionalItem & { hotspots: Hotspot[] })[] = (productsData?.items || []).map(p => ({
    id: p.id,
    title: p.title,
    image: p.media?.[0] || 'https://placehold.co/200x200/png',
    category: p.category || 'General',
    price: p.price,
    discountedPrice: p.salePrice,
    items_left: p.stock ?? 100,
    hotspots: [],
  }));

  useEffect(() => {
    let currentItem: EditableItem | undefined;

    if (itemType === 'product') {
      const product = promotionalItems.find(p => p.id.toString() === itemId);
      if(product) {
        currentItem = {
            id: product.id.toString(),
            name: product.title,
            imageUrl: product.image,
            hotspots: product.hotspots || [],
        }
      }
    } else if (itemType === 'service' && serviceData) {
        currentItem = {
            id: serviceData.id,
            name: serviceData.name,
            imageUrl: serviceData.media?.[0] || '',
            hotspots: serviceData.hotspots || [],
        }
    } else if (itemType === 'banner' && listingData) {
        currentItem = {
            id: listingData.id,
            name: `${listingData.businessName} Banner`,
            imageUrl: listingData.bannerUrl || '',
            hotspots: listingData.bannerHotspots || [],
        }
    }
    else { // Default to campaign
      const campaign = mockCampaigns.find(c => c.id === itemId);
      if(campaign) {
        currentItem = {
            id: campaign.id,
            name: campaign.name,
            imageUrl: campaign.imageUrl,
            hotspots: campaign.hotspots || [],
        }
      }
    }

    if (currentItem) {
      setItem(currentItem);
    } else if (!isLoadingService && !isLoadingListing) {
      toast.error('Item not found.');
      router.push('/dashboard');
    }
  }, [itemType, itemId, router, serviceData, isLoadingService, listingData, isLoadingListing]);

  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!item) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newHotspot: Hotspot = {
      id: `hs${Date.now()}`,
      x,
      y,
      link: '',
    };

    setItem({
      ...item,
      hotspots: [...item.hotspots, newHotspot],
    });
    setSelectedHotspot(newHotspot);
  };

  const updateHotspotLink = (link: string) => {
    if (!item || !selectedHotspot) return;

    const updatedHotspots = item.hotspots.map(h =>
      h.id === selectedHotspot.id ? { ...h, link } : h
    );
    setItem({ ...item, hotspots: updatedHotspots });
    setSelectedHotspot({ ...selectedHotspot, link });
  };

  const deleteHotspot = (hotspotId: string) => {
    if (!item) return;

    const updatedHotspots = item.hotspots.filter(h => h.id !== hotspotId);
    setItem({ ...item, hotspots: updatedHotspots });
    setSelectedHotspot(null);
  };

  const { mutate: updateService } = useUpdateService();
  const { mutate: editListing } = useEditListing();

  const saveChanges = () => {
    if (!item) return;

    if (itemType === 'product') {
        const productIndex = promotionalItems.findIndex(p => p.id.toString() === item.id);
        if (productIndex !== -1) {
            promotionalItems[productIndex].hotspots = item.hotspots;
            toast.success('Product hotspots saved successfully!');
            router.push('/dashboard/store/products');
        } else {
            toast.error('Error: Product not found.');
        }
    } else if (itemType === 'service') {
        if (!serviceData) {
            toast.error('Service data not loaded.');
            return;
        }

        const payload: UpdateServiceDto = {
            ...serviceData,
            id: item.id,
            hotspots: item.hotspots,
            fixedPrice: serviceData.fixedPrice ? Number(serviceData.fixedPrice) : undefined,
            pricePerHour: serviceData.pricePerHour ? Number(serviceData.pricePerHour) : undefined,
            pricePerUnit: serviceData.pricePerUnit ? Number(serviceData.pricePerUnit) : undefined,
            pricePerGuest: serviceData.pricePerGuest ? Number(serviceData.pricePerGuest) : undefined,
            fixedGroupPrice: serviceData.fixedGroupPrice ? Number(serviceData.fixedGroupPrice) : undefined,
            basePrice: serviceData.basePrice ? Number(serviceData.basePrice) : undefined,
            baseGuests: serviceData.baseGuests ? Number(serviceData.baseGuests) : undefined,
            additionalGuestPrice: serviceData.additionalGuestPrice ? Number(serviceData.additionalGuestPrice) : undefined,
            bookingFee: serviceData.bookingFee ? Number(serviceData.bookingFee) : undefined,
            unitName: serviceData.unitName || undefined,
            guestPricingModel: (serviceData.guestPricingModel as 'perGuest' | 'fixedGroup' | 'baseWithAdditional' | undefined) || undefined,
            bundledServices: serviceData.bundledServices?.map(bs => ({
                name: bs.name,
                price: bs.price ? Number(bs.price) : undefined
            })),
            configurableAddons: serviceData.configurableAddons?.map(ca => ({
                name: ca.name,
                price: ca.price ? Number(ca.price) : undefined,
                pricingType: ca.pricingType,
                unitName: ca.unitName
            }))
        };

        updateService(payload, {
            onSuccess: () => {
                toast.success('Service hotspots saved successfully!');
                router.push('/dashboard/services');
            },
            onError: () => {
                toast.error('Error: Could not save service hotspots.');
            }
        });
    } else if (itemType === 'banner') {
        if (!listingData) {
            toast.error('Listing data not loaded.');
            return;
        }
        editListing({ listingId: item.id, payload: { ...listingData, bannerHotspots: item.hotspots } }, {
            onSuccess: () => {
                toast.success('Banner hotspots saved successfully!');
                router.push('/dashboard/my-listings');
            },
            onError: () => {
                toast.error('Error: Could not save banner hotspots.');
            }
        });
    }
    else {
        const campaignIndex = mockCampaigns.findIndex(c => c.id === item.id);
        if (campaignIndex !== -1) {
            mockCampaigns[campaignIndex].hotspots = item.hotspots;
            toast.success('Campaign changes saved successfully!');
            router.push('/dashboard/hotspot-editor');
        } else {
            toast.error('Error: Campaign not found.');
        }
    }
  };

  if (!item || isLoadingService || isLoadingListing) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-100">
        <h2 className="text-xl font-bold mb-4">{item.name}</h2>
        <div
          className="relative w-full max-w-4xl aspect-video overflow-hidden shadow-lg"
          onClick={handleImageClick}
          style={{ cursor: 'crosshair' }}
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            onError={(e) => e.currentTarget.src = '/placeholder.svg'}
           className="absolute inset-0 h-full w-full object-contain"/>
          {item.hotspots.map(hotspot => (
            <div
              key={hotspot.id}
              className={`absolute w-6 h-6 rounded-full bg-red-500/80 border-2 border-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-xl ${selectedHotspot?.id === hotspot.id ? 'ring-2 ring-blue-500' : ''}`}
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedHotspot(hotspot);
              }}
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => setIsPreviewing(true)} variant="secondary">
            <Eye className="mr-2 h-4 w-4" /> Preview
          </Button>
          <Button onClick={saveChanges}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>

      <div className="w-80 bg-white p-4 border-l">
        <h3 className="text-lg font-semibold mb-4">Hotspot Properties</h3>
        {selectedHotspot ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Hotspot Link</label>
              <Input
                placeholder="https://example.com/product"
                value={selectedHotspot.link}
                onChange={(e) => updateHotspotLink(e.target.value)}
              />
            </div>
            <Button variant="destructive" onClick={() => deleteHotspot(selectedHotspot.id)}>
              <X className="mr-2 h-4 w-4" /> Delete Hotspot
            </Button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Click on the image to add a hotspot, or select an existing one to edit.</p>
        )}
      </div>

      {isPreviewing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setIsPreviewing(false)}>
          <div className="relative w-full max-w-5xl aspect-video" onClick={e => e.stopPropagation()}>
            <img
                src={item.imageUrl}
                alt={item.name}
                onError={(e) => e.currentTarget.src = '/placeholder.svg'}
             className="absolute inset-0 h-full w-full object-contain"/>
            {item.hotspots.map(hotspot => (
              <a
                key={hotspot.id}
                href={hotspot.link}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute w-6 h-6 rounded-full bg-red-500/80 border-2 border-white cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-xl hover:scale-125 transition-transform"
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              >
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </a>
            ))}
             <Button onClick={() => setIsPreviewing(false)} className="absolute top-4 right-4" variant="secondary">
                <X className="mr-2 h-4 w-4" /> Close Preview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const HotspotEditorPage = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <HotspotEditorContent />
    </Suspense>
);

export default HotspotEditorPage;
