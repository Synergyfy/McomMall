'use client';
import React, { useState, useEffect, MouseEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockCampaigns, Campaign, Hotspot } from '@/lib/hotspot-data';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Eye, Save } from 'lucide-react';
import { toast } from 'sonner';

const HotspotEditorPage = () => {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  useEffect(() => {
    const campaignData = mockCampaigns.find(c => c.id === params.id);
    if (campaignData) {
      setCampaign(campaignData);
    } else {
      router.push('/dashboard/hotspot-campaigns');
    }
  }, [params.id, router]);

  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!campaign) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newHotspot: Hotspot = {
      id: `hs${Date.now()}`,
      x,
      y,
      link: '',
    };

    setCampaign({
      ...campaign,
      hotspots: [...campaign.hotspots, newHotspot],
    });
    setSelectedHotspot(newHotspot);
  };

  const updateHotspotLink = (link: string) => {
    if (!campaign || !selectedHotspot) return;

    const updatedHotspots = campaign.hotspots.map(h =>
      h.id === selectedHotspot.id ? { ...h, link } : h
    );
    setCampaign({ ...campaign, hotspots: updatedHotspots });
    setSelectedHotspot({ ...selectedHotspot, link });
  };

  const deleteHotspot = (hotspotId: string) => {
    if (!campaign) return;

    const updatedHotspots = campaign.hotspots.filter(h => h.id !== hotspotId);
    setCampaign({ ...campaign, hotspots: updatedHotspots });
    setSelectedHotspot(null);
  };

  const saveChanges = () => {
    if (!campaign) return;

    const campaignIndex = mockCampaigns.findIndex(c => c.id === campaign.id);
    if (campaignIndex !== -1) {
      mockCampaigns[campaignIndex] = campaign;
      toast.success('Changes saved successfully!');
      router.push('/dashboard/hotspot-campaigns');
    } else {
      toast.error('Error: Campaign not found.');
    }
  };

  if (!campaign) {
    return <div>Loading campaign...</div>;
  }

  return (
    <div className="flex h-full">
      {/* Main Editor Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-100">
        <h2 className="text-xl font-bold mb-4">{campaign.name}</h2>
        <div
          className="relative w-full max-w-4xl aspect-video overflow-hidden shadow-lg"
          onClick={handleImageClick}
          style={{ cursor: 'crosshair' }}
        >
          <Image
            src={campaign.imageUrl}
            alt={campaign.name}
            layout="fill"
            objectFit="contain"
            onError={(e) => e.currentTarget.src = '/placeholder.svg'}
          />
          {campaign.hotspots.map(hotspot => (
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

      {/* Properties Panel */}
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

      {/* Preview Modal */}
      {isPreviewing && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setIsPreviewing(false)}>
          <div className="relative w-full max-w-5xl aspect-video" onClick={e => e.stopPropagation()}>
            <Image
                src={campaign.imageUrl}
                alt={campaign.name}
                layout="fill"
                objectFit="contain"
                onError={(e) => e.currentTarget.src = '/placeholder.svg'}
            />
            {campaign.hotspots.map(hotspot => (
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

export default HotspotEditorPage;
