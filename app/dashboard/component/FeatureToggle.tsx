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
import { toast } from 'sonner';

interface FeatureToggleProps {
  featureName: 'giftCard' | 'voucher' | 'promotion';
}

export function FeatureToggle({ featureName }: FeatureToggleProps) {
  const { data: user } = useGetUserProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { mutate: updateUserProfile, isPending: isLoading } = useUpdateUserProfile();

  const isChecked = user?.[featureName] ?? false;

  const handleToggle = async () => {
    if (!user) return;

    const newStatus = !isChecked;
    updateUserProfile(
      { id: user.id, [featureName]: newStatus },
      {
        onSuccess: () => {
          toast.success(`Feature ${newStatus ? 'enabled' : 'disabled'} successfully.`);
          setIsModalOpen(false);
        },
        onError: () => {
          toast.error('Failed to update feature status.');
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
        />
        <label htmlFor={featureName} className="text-sm font-medium">
          {isChecked ? 'Enabled' : 'Disabled'}
        </label>
      </div>
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
              {isLoading ? 'Updating...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}