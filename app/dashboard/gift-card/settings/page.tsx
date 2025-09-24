'use client';

import * as React from 'react';
import { useEffect, useState, useMemo } from 'react';
import { useGiftCardSettings } from '@/hooks/use-gift-card-settings';
import {
  GiftCardSettings,
  UpdateGiftCardSettingsDto,
  RedemptionRules,
} from '@/app/dashboard/gift-card/types';
import { toast } from 'sonner';

// --- UI Components (Placeholders) ---
const Card = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm ${className}`}
  >
    {children}
  </div>
);
const CardHeader = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 border-b dark:border-gray-700 ${className}`}>{children}</div>;
const CardTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
    {children}
  </h3>
);
const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{children}</p>
);
const CardContent = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 ${className}`}>{children}</div>;
const Button = ({
  children,
  onClick,
  disabled = false,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 text-white hover:bg-blue-700 h-10 py-2 px-4 ${className}`}
  >
    {children}
  </button>
);
const Switch = ({
  id,
  checked,
  onCheckedChange,
}: {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <button
    id={id}
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
      checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
    }`}
  >
    <span
      aria-hidden="true"
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);
const FormRow = ({
  id,
  label,
  description,
  children,
}: {
  id: string;
  label: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b dark:border-gray-700 last:border-b-0">
    <div className="mb-2 sm:mb-0">
      <label
        htmlFor={id}
        className="text-sm font-medium text-gray-900 dark:text-gray-100"
      >
        {label}
      </label>
      {description && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
    </div>
    <div>{children}</div>
  </div>
);
const SkeletonLoader = ({ className = '' }: { className?: string }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md ${className}`}
  ></div>
);

// --- Default Settings ---
const DEFAULT_SETTINGS: GiftCardSettings = {
  isEnabled: false,
  allowDeliveryScheduling: true,
  allowPersonalMessage: true,
  enableQrCode: false,
  allowReloading: false,
  redemptionRules: {
    canBeUsedWithDiscounts: false,
    canApplyToShipping: true,
    canApplyToTax: true,
  },
};

// --- Main Page Component ---
export default function GiftCardSettingsPage() {
  const { settings, isLoading, error, updateSettings } = useGiftCardSettings();
  const [formData, setFormData] = useState<UpdateGiftCardSettingsDto>({});
  const [isSaving, setIsSaving] = useState(false);

  const initialSettings = useMemo(
    () => settings ?? DEFAULT_SETTINGS,
    [settings]
  );

  useEffect(() => {
    // When settings load (or on initial load with defaults), set the form data.
    setFormData(initialSettings);
  }, [initialSettings]);

  const hasChanges = useMemo(() => {
    if (isLoading || !formData) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialSettings);
  }, [formData, initialSettings, isLoading]);

  const handleFormChange = (
    key: keyof UpdateGiftCardSettingsDto,
    value: UpdateGiftCardSettingsDto[keyof UpdateGiftCardSettingsDto]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleRedemptionRuleChange = (
    key: keyof RedemptionRules,
    value: boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      redemptionRules: {
        ...(prev.redemptionRules ??
          DEFAULT_SETTINGS.redemptionRules),
        [key]: value,
      },
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const promise = updateSettings(formData);

    toast.promise(promise, {
      loading: 'Saving settings...',
      success: () => {
        setIsSaving(false);
        return 'Settings saved successfully!';
      },
      error: () => {
        setIsSaving(false);
        return 'Failed to save settings. Please try again.';
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <SkeletonLoader className="h-6 w-1/2" />
            <SkeletonLoader className="h-4 w-3/4 mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <SkeletonLoader className="h-10 w-full" />
            <SkeletonLoader className="h-10 w-full" />
            <SkeletonLoader className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center">
        <p className="text-red-500">
          Failed to load settings. Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Gift Card Settings</CardTitle>
            <CardDescription>
              Manage your gift card program. These settings apply to all
              businesses you own.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormRow
              id="isEnabled"
              label="Enable Gift Card Program"
              description="Activate or deactivate the gift card feature for your store."
            >
              <Switch
                id="isEnabled"
                checked={formData.isEnabled ?? false}
                onCheckedChange={checked =>
                  handleFormChange('isEnabled', checked)
                }
              />
            </FormRow>

            <FormRow
              id="allowDeliveryScheduling"
              label="Allow Delivery Scheduling"
              description="Let customers choose a future date to send their gift card."
            >
              <Switch
                id="allowDeliveryScheduling"
                checked={formData.allowDeliveryScheduling ?? false}
                onCheckedChange={checked =>
                  handleFormChange('allowDeliveryScheduling', checked)
                }
              />
            </FormRow>

            <FormRow
              id="allowPersonalMessage"
              label="Allow Personal Message"
              description="Enable customers to add a personal message to the gift card."
            >
              <Switch
                id="allowPersonalMessage"
                checked={formData.allowPersonalMessage ?? false}
                onCheckedChange={checked =>
                  handleFormChange('allowPersonalMessage', checked)
                }
              />
            </FormRow>

            <FormRow
              id="enableQrCode"
              label="Enable QR Code Redemption"
              description="Include a QR code in the gift card email for easy in-store redemption."
            >
              <Switch
                id="enableQrCode"
                checked={formData.enableQrCode ?? false}
                onCheckedChange={checked =>
                  handleFormChange('enableQrCode', checked)
                }
              />
            </FormRow>

            <FormRow
              id="allowReloading"
              label="Allow Reloading"
              description="Permit customers to add more funds to an existing gift card."
            >
              <Switch
                id="allowReloading"
                checked={formData.allowReloading ?? false}
                onCheckedChange={checked =>
                  handleFormChange('allowReloading', checked)
                }
              />
            </FormRow>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Redemption Rules</CardTitle>
              <CardDescription>
                Define how gift cards can be used at checkout.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormRow
                id="canBeUsedWithDiscounts"
                label="Can be used with other discounts"
                description="Allow gift cards to be applied to carts that also have discount codes."
              >
                <Switch
                  id="canBeUsedWithDiscounts"
                  checked={
                    formData.redemptionRules?.canBeUsedWithDiscounts ?? false
                  }
                  onCheckedChange={checked =>
                    handleRedemptionRuleChange('canBeUsedWithDiscounts', checked)
                  }
                />
              </FormRow>

              <FormRow
                id="canApplyToShipping"
                label="Can be applied to shipping costs"
                description="Allow gift card balance to cover shipping fees."
              >
                <Switch
                  id="canApplyToShipping"
                  checked={formData.redemptionRules?.canApplyToShipping ?? false}
                  onCheckedChange={checked =>
                    handleRedemptionRuleChange('canApplyToShipping', checked)
                  }
                />
              </FormRow>

              <FormRow
                id="canApplyToTax"
                label="Can be applied to tax"
                description="Allow gift card balance to cover taxes."
              >
                <Switch
                  id="canApplyToTax"
                  checked={formData.redemptionRules?.canApplyToTax ?? false}
                  onCheckedChange={checked =>
                    handleRedemptionRuleChange('canApplyToTax', checked)
                  }
                />
              </FormRow>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSaveChanges}
            disabled={isSaving || !hasChanges}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}