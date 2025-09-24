import useSWR, { SWRConfiguration } from 'swr';
import api from '@/service/api';
import {
  GiftCardSettings,
  UpdateGiftCardSettingsDto,
} from '@/app/dashboard/gift-card/types';

// The fetcher function for SWR
const fetcher = (url: string) => api.get(url).then(res => res.data);

/**
 * Custom hook to manage merchant gift card settings.
 *
 * This hook handles fetching, updating, and revalidating the gift card settings
 * for the authenticated merchant. It uses SWR for robust data fetching and caching.
 *
 * @param {SWRConfiguration} options - Optional SWR configuration.
 * @returns {object} The state and functions to manage gift card settings.
 */
export const useGiftCardSettings = (options?: SWRConfiguration) => {
  const endpoint = '/merchant/gift-cards/settings';

  // Use SWR to fetch the settings data
  const {
    data: settings,
    error,
    mutate, // `mutate` is used to trigger a re-fetch or update local data
    isLoading,
  } = useSWR<GiftCardSettings>(endpoint, fetcher, {
    ...options,
    // Optional: Keep data fresh by revalidating on focus or reconnect
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
      await mutate(
        async currentSettings => {
          // Make the API call to update the settings
          const { data: newSettings } = await api.put<GiftCardSettings>(
            endpoint,
            updatedSettings
          );
          return { ...currentSettings, ...newSettings }; // Return the merged data
        },
        {
          optimisticData: { ...settings, ...updatedSettings } as GiftCardSettings, // Immediately update UI
          rollbackOnError: true, // Revert on failure
          populateCache: true, // Update the cache with the new data
          revalidate: false, // Don't re-fetch immediately after mutation
        }
      );

      // The `mutate` function above already returns the updated data,
      // but we need to satisfy the promise return type.
      // We can fetch the latest data from the cache.
      const finalSettings = await mutate();
      if (!finalSettings) {
        throw new Error('Failed to retrieve updated settings from cache.');
      }
      return finalSettings;
    } catch (e) {
      console.error('Failed to update gift card settings:', e);
      // Let the SWR error handling and rollback take care of the UI state
      throw e; // Re-throw the error to be caught by the caller
    }
  };

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    mutate, // Expose mutate for manual re-fetching if needed
  };
};