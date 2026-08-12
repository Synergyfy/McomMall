'use client';
import React, { useMemo, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { CampaignFilters } from './components/CampaignFilters';
import { CampaignsTable } from './components/CampaignsTable';
import { PageHeader } from './components/PageHeader';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useGetMyCampaigns } from '@/service/campaigns/hook';
import { Campaign as ServiceCampaign } from '@/service/campaigns/types';
import { Campaign as TableCampaign } from './types';

const CampaignsPage = () => {
  const {
    data: campaignsData,
    isLoading,
    isError,
  } = useGetMyCampaigns();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTypeFilter('all');
    setDateRange(undefined);
  };

  const router = useRouter();
  const goToAddPage = () => {
    router.push('/dashboard/add-campaign');
  };

  const allCampaigns: TableCampaign[] = useMemo(() => {
    if (!campaignsData?.data) return [];
    return campaignsData.data.map((c: any) => ({
      id: c.id,
      listingName: c.business?.businessName || c.name || 'Unknown Business',
      status: c.status || (new Date(c.endDate) < new Date() ? 'completed' : 'active'),
      type: c.type,
      startDate: new Date(c.startDate),
      budget: Number(c.budget) || 0,
      spent: Number(c.spent ?? c.totalSpent ?? 0),
      placements: c.adPlacement || [],
    }));
  }, [campaignsData]);

  const filteredCampaigns = useMemo(() => {
    return allCampaigns.filter(campaign => {
      const matchesSearch = campaign.listingName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || campaign.status === statusFilter;

      const matchesType = typeFilter === 'all' || campaign.type === typeFilter;

      const matchesDate =
        !dateRange?.from ||
        (campaign.startDate >= dateRange.from &&
          (!dateRange.to || campaign.startDate <= dateRange.to));

      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [allCampaigns, searchTerm, statusFilter, typeFilter, dateRange]);

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Campaigns"
          breadcrumb="Home > Dashboard > Campaigns"
        />

        <CampaignFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          dateRange={dateRange}
          setDateRange={setDateRange}
          resetFilters={resetFilters}
        />

        <CampaignsTable
          campaigns={filteredCampaigns}
          isLoading={isLoading}
          isError={isError}
        />
        <Button
          className="mt-3 py-6 px-5 bg-orange-600 hover:bg-orange-700 rounded-2xl"
          onClick={goToAddPage}
        >
          Add New Campaign
        </Button>
      </div>
    </div>
  );
};

export default CampaignsPage;
