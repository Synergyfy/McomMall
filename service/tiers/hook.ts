import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Tier, ApiTier } from './types';

// Helper function to map API response to internal Tier type
export const mapApiTierToTier = (apiTier: ApiTier): Tier => {
  const id = apiTier.id || apiTier.name.toLowerCase().replace(/\s+/g, '-');

  // Determine color based on name
  let colorCode = '#3B82F6'; // Default blue
  const lowerName = apiTier.name.toLowerCase();
  if (lowerName.includes('gold')) colorCode = '#EAB308';
  else if (lowerName.includes('silver')) colorCode = '#94A3B8';
  else if (lowerName.includes('bronze')) colorCode = '#B45309';
  else if (lowerName.includes('platinum')) colorCode = '#E5E7EB';
  else if (lowerName.includes('pro')) colorCode = '#8B5CF6';
  else if (lowerName.includes('basic')) colorCode = '#0EA5E9'; // Sky blue for basic

  // Synthesize features list from flags
  const features: string[] = [];
  if (apiTier.description) {
    features.push(apiTier.description);
  }

  if (apiTier.configuration?.featureFlags) {
    const flags = apiTier.configuration.featureFlags;
    if (flags.dedicatedSupport) features.push('Dedicated Support');
    if (flags.priorityInSearch) features.push('Priority In Search');
    if (flags.advancedAnalytics) features.push('Advanced Analytics');
    if (flags.allowGroupCreation) features.push('Group Creation Allowed');
    if (flags.allowCustomBranding) features.push('Custom Branding');
    if (flags.hasAccessToCRM) features.push('Access to CRM');
  }

  const defaultQuotas = {
    maxActiveCampaigns: 0,
    maxActiveRewards: 0,
    maxRewardsPerCampaign: 0,
    monthlyPointsAllowance: 0,
    monthlyStampsAllowance: 0,
    maxTeamMembers: 0,
  };

  const defaultFlags = {
      canCreateCampaignFromScratch: false,
      canEditAdminTemplates: false,
      hasAccessToAdvancedAnalytics: false,
      hasAccessToCRM: false,
      canUpdateReward: false,
  };

  const configuration = {
      ...apiTier.configuration,
      quotas: { ...defaultQuotas, ...apiTier.configuration?.quotas },
      featureFlags: { ...defaultFlags, ...apiTier.configuration?.featureFlags },
  };

  const mockDate = apiTier.createdAt || "2024-01-01T00:00:00.000Z";

  return {
    id,
    created_at: mockDate,
    updated_at: apiTier.updatedAt || mockDate,
    deleted_at: apiTier.deletedAt || null,
    name: apiTier.name,
    type: 'standard',
    color_code: colorCode,
    fixed_price: 0,
    monthly_price: Number(apiTier.monthlyPrice) || 0,
    annual_price: Number(apiTier.annualPrice) || 0,
    quaterly_price: 0,
    features: features,
    status: apiTier.isActive ? 'published' : 'archived',
    stripe_monthly_price_id: apiTier.stripeMonthlyPriceId || '',
    stripe_quarterly_price_id: '',
    stripe_annual_price_id: apiTier.stripeAnnualPriceId || '',
    paypal_monthly_plan_id: apiTier.paypalMonthlyPlanId || '',
    paypal_quarterly_plan_id: '',
    paypal_annual_plan_id: apiTier.paypalAnnualPlanId || '',
    qrCodeCount: 0,
    configuration: configuration,
    // season is undefined in API response currently
  };
};

export const useGetTiers = (type: string = 'all') => {
  const fetchTiers = async (): Promise<Tier[]> => {
    const response = await api.get<ApiTier[]>('/tiers');
    return response.data.map(mapApiTierToTier);
  };

  return useQuery({
    queryKey: ['tiers'],
    queryFn: fetchTiers,
  });
};

export const useGetTierById = (id: string) => {
  const fetchTier = async (): Promise<Tier> => {
    const response = await api.get<Tier>(`/tier/${id}`);
    return response.data;
  };

  return useQuery({
    queryKey: ['tier', id],
    queryFn: fetchTier,
    enabled: !!id,
  });
};
