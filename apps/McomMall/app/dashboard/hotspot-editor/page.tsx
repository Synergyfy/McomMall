'use client';
import React from 'react';
import { mockCampaigns } from '@/lib/hotspot-data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const HotspotCampaignsPage = () => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hotspot Campaigns</h1>
        <Button asChild>
          <Link href="/dashboard/hotspot-editor/new">Create New Campaign</Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mockCampaigns.map((campaign) => (
          <div key={campaign.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative h-48 w-full">
              <Image
                src={campaign.imageUrl}
                alt={campaign.name}
                layout="fill"
                objectFit="cover"
                onError={(e) => e.currentTarget.src = '/placeholder.svg'} // Fallback image
              />
            </div>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-2">{campaign.name}</h2>
              <p className="text-sm text-gray-500 mb-4">
                {campaign.hotspots.length} hotspot{campaign.hotspots.length !== 1 && 's'}
              </p>
              <Button asChild variant="outline">
                <Link href={`/dashboard/hotspot-editor/edit/${campaign.id}?type=campaign`}>
                  Edit Campaign
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotspotCampaignsPage;
