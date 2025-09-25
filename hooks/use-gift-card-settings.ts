import useSWR, { SWRConfiguration } from 'swr';
import api from '@/service/api';
import {
  GiftCardSettings,
  UpdateGiftCardSettingsDto,
} from '@/app/dashboard/gift-card/types';

/**
 * The fetcher function for SWR.
 * It handles 404 errors by returning null, which signifies that settings
 * have not yet been created. Other errors are thrown to be handled by SWR.
 */
const fetcher = async (url: string): Promise<GiftCardSettings | null> => {
  try {
    const res = await api.get(url);
    return res.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      // Return null if settings are not found (404), it's not an "error" state.
      return null;
    }
    // For all other errors, let SWR handle it.
    throw error;
  }
};

/**
 * Custom hook to manage the gift card settings for a business owner.
 *
 * This hook handles fetching, updating, and revalidating the gift card settings
 * for the authenticated business owner. These settings apply globally across all
 * businesses owned by the user. It uses SWR for robust data fetching and caching.
 *
 * @param {SWRConfiguration} options - Optional SWR configuration.
 * @returns {object} The state and functions to manage gift card settings.
 */
export const useGiftCardSettings = (options?: SWRConfiguration) => {
  const endpoint = '/merchant/gift-cards/settings';

  // Use SWR to fetch the settings data. Note the type allows for `null`.
  const {
    data: settings,
    error,
    mutate,
    isLoading,
  } = useSWR<GiftCardSettings | null>(endpoint, fetcher, {
    ...options,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  /**
   * Updates the gift card settings.
   *
   * @param {UpdateGiftCardSettingsDto} updatedSettings - The settings to update.
   * @returns {Promise<GiftCardSettings>} The updated settings data.
   */
  const updateSettings = async (
    updatedSettings: UpdateGiftCardSettingsDto
  ): Promise<GiftCardSettings> => {
    try {
      // Optimistically update the local data for a better user experience
      const { data: newSettings } = await api.put<GiftCardSettings>(
        endpoint,
        updatedSettings
      );

      // After a successful update, re-fetch the data to ensure consistency.
      // Or, we can just update the cache directly.
      mutate(newSettings, false); // Update local data, don't revalidate

      return newSettings;
    } catch (e) {
      console.error('Failed to update gift card settings:', e);
      // Manually trigger a revalidation to get the correct server state on error.
      mutate();
      throw e; // Re-throw the error to be caught by the caller
    }
  };

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    mutate,
  };
};