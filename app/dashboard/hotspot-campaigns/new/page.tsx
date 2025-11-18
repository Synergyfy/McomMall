'use client';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import MultiMediaUpload from '@/app/dashboard/add-listing/components/steps/shared/MultiMediaUpload';
import { mockCampaigns, Campaign } from '@/lib/hotspot-data';

const NewHotspotCampaignPage = () => {
  const [campaignName, setCampaignName] = useState('');
  const [media, setMedia] = useState<File[]>([]);
  const router = useRouter();

  const handleCreateCampaign = () => {
    if (campaignName.trim() && media.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newCampaign: Campaign = {
          id: Date.now().toString(),
          name: campaignName.trim(),
          imageUrl: reader.result as string,
          hotspots: [],
        };

        mockCampaigns.push(newCampaign);
        router.push(`/dashboard/hotspot-campaigns/edit/${newCampaign.id}`);
      };
      reader.readAsDataURL(media[0]);
    } else {
      alert('Please provide a campaign name and upload an image.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Create New Hotspot Campaign</h1>
      <div className="space-y-6">
        <div>
          <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700 mb-1">
            Campaign Name
          </label>
          <Input
            id="campaignName"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="e.g., Summer Sale Showcase"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Campaign Media
          </label>
          <MultiMediaUpload
            onMediaChange={setMedia}
            maxFiles={1}
            initialMedia={[]}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={handleCreateCampaign} disabled={!campaignName.trim() || media.length === 0}>
            Create Campaign and Add Hotspots
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NewHotspotCampaignPage;
