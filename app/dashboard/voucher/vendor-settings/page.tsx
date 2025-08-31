'use client';

import * as React from 'react';
import { useState, ChangeEvent, FormEvent } from 'react';
import { UploadCloud } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// Helper component for form rows
interface FormRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  htmlFor?: string;
}

const FormRow: React.FC<FormRowProps> = ({
  label,
  description,
  children,
  htmlFor,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 items-start py-4 border-b last:border-b-0">
    <div className="md:col-span-1">
      <Label htmlFor={htmlFor} className="font-semibold text-gray-700">
        {label}
      </Label>
    </div>
    <div className="md:col-span-2">
      {children}
      {description && (
        <p className="text-sm text-gray-500 mt-2">{description}</p>
      )}
    </div>
  </div>
);

// TypeScript type for the form state
interface VoucherSettingsState {
  siteLogo: File | null;
  pdfTemplate: string;
  usability: string;
  isMyVoucherEnabled: boolean;
  allowChangingVoucherExpiry: boolean;
  allowChangeVoucherTemplate: boolean;
  voucherAsAttachment: boolean;
  showOrHideVoucherDownloadLink: boolean;
  allowRedemptionForExpiredVouchers: boolean;
  allowAutoDeletionAndRedemption: boolean;
  voucherUsageLimit: string;
  accessForLoggedInUsers: boolean;
  accessForGuestUsers: boolean;
  allowDirectVoucherFromDownloadPage: boolean;
  defaultVoucherValue: string;
  voucherDelivery: string;
  expirationDateType: string;
  voucherStartDate: string;
  voucherExpirationDate: string;
  sendEmailsToAdmin: boolean;
  sendCopyToAdmin: string;
}

// Main Component
export default function VoucherSettingsPage() {
  const [formState, setFormState] = useState<VoucherSettingsState>({
    siteLogo: null,
    pdfTemplate: 'default',
    usability: '',
    isMyVoucherEnabled: true,
    allowChangingVoucherExpiry: false,
    allowChangeVoucherTemplate: true,
    voucherAsAttachment: true,
    showOrHideVoucherDownloadLink: true,
    allowRedemptionForExpiredVouchers: false,
    allowAutoDeletionAndRedemption: false,
    voucherUsageLimit: '',
    accessForLoggedInUsers: true,
    accessForGuestUsers: false,
    allowDirectVoucherFromDownloadPage: true,
    defaultVoucherValue: '',
    voucherDelivery: 'email',
    expirationDateType: 'specific_days',
    voucherStartDate: '',
    voucherExpirationDate: '',
    sendEmailsToAdmin: true,
    sendCopyToAdmin: '',
  });
  const [logoFileName, setLogoFileName] = useState<string>('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (
    field: keyof VoucherSettingsState,
    value: string
  ) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (
    field: keyof VoucherSettingsState,
    checked: boolean
  ) => {
    setFormState(prev => ({ ...prev, [field]: checked }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormState(prev => ({ ...prev, siteLogo: file }));
      setLogoFileName(file.name);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log('Form Submitted:', formState);
    alert('Voucher settings saved. Check the console for the form data.');
  };

  return (
    <div className="bg-gray-50 ">
      <main className="w-full max-w-5xl mx-auto p-4 md:p-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 md:p-8 rounded-lg shadow-sm border"
        >
          <h1 className="text-2xl font-bold text-gray-800 border-b pb-4 mb-4">
            {'Voucher Settings'}
          </h1>

          {/* --- Voucher Settings Section --- */}
          <div className="space-y-4">
            <FormRow
              label={'Site Logo'}
              description={
                'Here you can upload a logo of your site. This logo will be displayed on the header of the voucher.'
              }
            >
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('logoUpload')?.click()}
                >
                  <UploadCloud className="h-4 w-4 mr-2" />
                  {'Upload File'}
                </Button>
                {logoFileName && (
                  <span className="text-sm text-gray-600">{logoFileName}</span>
                )}
              </div>
              <Input
                type="file"
                id="logoUpload"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
            </FormRow>

            <FormRow label={'PDF Template'} htmlFor="pdfTemplate">
              <Select
                value={formState.pdfTemplate}
                onValueChange={value =>
                  handleSelectChange('pdfTemplate', value)
                }
              >
                <SelectTrigger
                  id="pdfTemplate"
                  className="focus:ring-orange-600"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">
                    {'Default PDF Template'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormRow>

            <FormRow
              label={'My Vóle Voucher'}
              description={
                'Check this box if you want to generate a PDF for a voucher code instead of installing a combined PDF for all vouchers.'
              }
            >
              <Checkbox
                id="isMyVoucherEnabled"
                checked={formState.isMyVoucherEnabled}
                onCheckedChange={checked =>
                  handleCheckboxChange('isMyVoucherEnabled', !!checked)
                }
              />
            </FormRow>

            <FormRow
              label={'Allow Changing Voucher Expiry Date'}
              description={
                'Check this box if you want to allow vendors/users to change voucher expiry date when voucher is redeemed or expired and from voucher code page.'
              }
            >
              <Checkbox
                id="allowChangingVoucherExpiry"
                checked={formState.allowChangingVoucherExpiry}
                onCheckedChange={checked =>
                  handleCheckboxChange('allowChangingVoucherExpiry', !!checked)
                }
              />
            </FormRow>

            <FormRow
              label={'Allow Change Voucher Template'}
              description={
                'Check this box if you want to allow vendors/users to change voucher template when voucher is unredeemed, redeemed or expired from voucher code details page.'
              }
            >
              <Checkbox
                id="allowChangeVoucherTemplate"
                checked={formState.allowChangeVoucherTemplate}
                onCheckedChange={checked =>
                  handleCheckboxChange('allowChangeVoucherTemplate', !!checked)
                }
              />
            </FormRow>

            {/* ... other checkboxes ... */}
            <FormRow
              label={'Voucher as Attachment'}
              description={
                'Send voucher PDF as an attachment to processing/completed order email. (To make it work, PDF must be attached in Gift cert Notification)'
              }
            >
              <Checkbox
                id="voucherAsAttachment"
                checked={formState.voucherAsAttachment}
                onCheckedChange={checked =>
                  handleCheckboxChange('voucherAsAttachment', !!checked)
                }
              />
            </FormRow>
            <FormRow
              label={'Show/Hide Voucher Download Link'}
              description={
                'Allow voucher to be downloaded from processing/completed order email and thank you page. Allow voucher to be downloaded from gift notification mail. Allow voucher to be downloaded from My Account page. Allow voucher to be downloaded by its link or from within voucher.'
              }
            >
              <Checkbox
                id="showOrHideVoucherDownloadLink"
                checked={formState.showOrHideVoucherDownloadLink}
                onCheckedChange={checked =>
                  handleCheckboxChange(
                    'showOrHideVoucherDownloadLink',
                    !!checked
                  )
                }
              />
            </FormRow>

            <FormRow
              label={'Voucher Usage Limit'}
              htmlFor="voucherUsageLimit"
              description={
                'Set the number of times the same voucher code can be used, leave it empty for unlimited redemption.'
              }
            >
              <Input
                id="voucherUsageLimit"
                value={formState.voucherUsageLimit}
                onChange={handleInputChange}
                className="focus-visible:ring-orange-600"
              />
            </FormRow>

            <FormRow
              label={'Voucher Delivery'}
              htmlFor="voucherDelivery"
              description={
                'Local - Customer receives PDF Voucher through email. Manually - Administrator will provide the Voucher code manually, via post or in-shop.'
              }
            >
              <Select
                value={formState.voucherDelivery}
                onValueChange={value =>
                  handleSelectChange('voucherDelivery', value)
                }
              >
                <SelectTrigger
                  id="voucherDelivery"
                  className="focus:ring-orange-600"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">{'Email'}</SelectItem>
                  <SelectItem value="manual">{'Manual'}</SelectItem>
                </SelectContent>
              </Select>
            </FormRow>

            <FormRow
              label={'Voucher Start Date'}
              htmlFor="voucherStartDate"
              description={
                'Select a start date if you want to make a voucher codes valid for a specific time only.'
              }
            >
              <Input
                id="voucherStartDate"
                type="date"
                value={formState.voucherStartDate}
                onChange={handleInputChange}
                className="focus-visible:ring-orange-600"
              />
            </FormRow>
          </div>

          {/* --- Email Settings Section --- */}
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-800 border-b pb-4 mb-4">
              {'Email Settings'}
            </h2>
            <div className="space-y-4">
              <FormRow
                label={'Send Emails to Admin'}
                description={
                  'Check this box if you want to send customer order email and gift notification even to admins.'
                }
              >
                <Checkbox
                  id="sendEmailsToAdmin"
                  checked={formState.sendEmailsToAdmin}
                  onCheckedChange={checked =>
                    handleCheckboxChange('sendEmailsToAdmin', !!checked)
                  }
                />
              </FormRow>
              <FormRow
                label={'SendCopyTo Admin'}
                htmlFor="sendCopyToAdmin"
                description={
                  'Select the admin users to send customer order email and gift notification email. Leave it empty to send email to all admins.'
                }
              >
                <Select
                  value={formState.sendCopyToAdmin}
                  onValueChange={value =>
                    handleSelectChange('sendCopyToAdmin', value)
                  }
                >
                  <SelectTrigger
                    id="sendCopyToAdmin"
                    className="focus:ring-orange-600"
                  >
                    <SelectValue placeholder="Select Admins" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin1">{'Admin One'}</SelectItem>
                    <SelectItem value="admin2">{'Admin Two'}</SelectItem>
                  </SelectContent>
                </Select>
              </FormRow>
            </div>
          </div>

          <div className="flex justify-start gap-4 pt-8 mt-8 border-t">
            <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
              {'Save Changes'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
