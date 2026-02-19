'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUpdateUserProfile, useGetUserProfile } from '@/service/user/hook';
import { Loader2 } from 'lucide-react';
import { SuccessDialog } from '@/components/SuccessDialog';
import { ErrorDialog } from '@/components/ErrorDialog';

interface FeatureToggleProps {
  featureName: 'giftCard' | 'voucher' | 'promotion' | 'coupons';
}

export function FeatureToggle({ featureName }: FeatureToggleProps) {
  const { data: user } = useGetUserProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const { mutate: updateUserProfile, isPending: isLoading } = useUpdateUserProfile();

  const isChecked = user?.[featureName] ?? false;

  const handleToggle = async () => {
    if (!user) return;

    const newStatus = !isChecked;
    updateUserProfile(
      { id: user.id, [featureName]: newStatus },
      {
        onSuccess: () => {
          setIsSuccessDialogOpen(true);
          setIsModalOpen(false);
        },
        onError: () => {
          setIsErrorDialogOpen(true);
          setIsModalOpen(false);
        },
      }
    );
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <Switch
          id={featureName}
          checked={isChecked}
          onCheckedChange={() => setIsModalOpen(true)}
          className="h-6 w-12 data-[state=checked]:bg-orange-600"
        />
        <label htmlFor={featureName} className="text-sm font-medium">
          {isChecked ? 'Enabled' : 'Disabled'}
        </label>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        When toggled on, the {featureName} feature will be available to all users.
        When toggled off, it will be hidden.
      </p>
      <AlertDialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to {isChecked ? 'disable' : 'enable'} the {featureName} feature.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggle} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <SuccessDialog
        isOpen={isSuccessDialogOpen}
        onClose={() => setIsSuccessDialogOpen(false)}
        message={`Feature ${isChecked ? 'enabled' : 'disabled'} successfully.`}
      />
      <ErrorDialog
        isOpen={isErrorDialogOpen}
        onClose={() => setIsErrorDialogOpen(false)}
        message="Failed to update feature status."
      />
    </>
  );
}