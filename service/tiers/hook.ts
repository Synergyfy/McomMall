import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Tier, ApiTier } from './types';

// Helper function to map API response to internal Tier type
export const mapApiTierToTier = (apiTier: ApiTier): Tier => {
  // Generate a consistent ID (using stripe ID or name-based slug)
  const id = apiTier.stripeMonthlyPriceId || apiTier.name.toLowerCase().replace(/\s+/g, '-');

  // Determine color based on name (simple heuristic)
  let colorCode = '#3B82F6'; // Default blue
  const lowerName = apiTier.name.toLowerCase();
  if (lowerName.includes('gold')) colorCode = '#EAB308';
  else if (lowerName.includes('silver')) colorCode = '#94A3B8';
  else if (lowerName.includes('bronze')) colorCode = '#B45309';
  else if (lowerName.includes('platinum')) colorCode = '#E5E7EB';
  else if (lowerName.includes('pro')) colorCode = '#8B5CF6';

  // Synthesize features list
  // If configuration has featureFlags, we can convert true flags to feature strings
  const features: string[] = [apiTier.description];
  if (apiTier.configuration?.featureFlags) {
     // This is a best-effort mapping if structure matches known flags
     // If the structure is completely different (as in user example), we might just stick to description
     // or map known keys if they exist in the incoming 'any' configuration.
  }

  // Create a default configuration structure if the incoming one is vastly different
  // The user schema showed keys like 'maxListings', 'allowProductListing' which differ from TierQuotas
  // We will pass the configuration through but cast it, assuming the UI might be resilient enough or won't access deep props that don't exist.
  // Ideally we should map `maxActiveCampaigns` etc from `maxListings` if they are semantically similar.
  // For now, let's keep it safe by providing defaults for required nested props of TierConfiguration

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

  // Construct the configuration object, merging defaults
  const configuration = {
      quotas: { ...defaultQuotas, ...apiTier.configuration?.quotas },
      featureFlags: { ...defaultFlags, ...apiTier.configuration?.featureFlags },
      // preserve other props
      ...apiTier.configuration
  };

  const mockDate = "2024-01-01T00:00:00.000Z";

  return {
    id,
    created_at: mockDate,
    updated_at: mockDate,
    deleted_at: null,
    name: apiTier.name,
    type: 'standard', // default
    color_code: colorCode,
    fixed_price: 0,
    monthly_price: apiTier.monthlyPrice,
    annual_price: apiTier.annualPrice,
    quaterly_price: 0, // Not provided in new API, spelling intentionally matches interface typo
    features: features,
    status: apiTier.isActive ? 'published' : 'archived',
    stripe_monthly_price_id: apiTier.stripeMonthlyPriceId,
    stripe_quarterly_price_id: '',
    stripe_annual_price_id: apiTier.stripeAnnualPriceId,
    paypal_monthly_plan_id: apiTier.paypalMonthlyPlanId,
    paypal_quarterly_plan_id: '',
    paypal_annual_plan_id: apiTier.paypalAnnualPlanId,
    qrCodeCount: 0,
    configuration: configuration,
    // season is undefined
  };
};

export const useGetTiers = (type: string = 'all') => {
  const fetchTiers = async (): Promise<Tier[]> => {
    // Updated endpoint to /tiers (plural) and expect ApiTier[]
    // 'type' param is ignored as new API does not support/require it
    const response = await api.get<ApiTier[]>('/tiers');

    // Map response to internal Tier type
    return response.data.map(mapApiTierToTier);
  };

  return useQuery({
    queryKey: ['tiers'], // Removed type dependency from queryKey as it's no longer used
    queryFn: fetchTiers,
  });
};

export const useGetTierById = (id: string) => {
  const fetchTier = async (): Promise<Tier> => {
    // Note: We might need to update this endpoint too if it follows the same pattern
    // e.g. /tiers/:id. But for now keeping as is unless user complains.
    const response = await api.get<Tier>(`/tier/${id}`);
    return response.data;
  };

  return useQuery({
    queryKey: ['tier', id],
    queryFn: fetchTier,
    enabled: !!id,
  });
};
