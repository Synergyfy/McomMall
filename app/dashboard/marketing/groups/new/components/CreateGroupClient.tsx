"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateGroup } from '@/service/grouping/hooks';
import { useGetMyMembership } from '@/service/membership/hooks';
import { toast } from 'sonner';
import Link from 'next/link';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreateGroupDto } from '@/service/grouping/types';
import { Label } from '@/components/ui/label';

interface FormErrors {
  name?: string;
  localArea?: string;
  recruitmentDeadline?: string;
  pitchUrl?: string;
}

const CreateGroupClient = () => {
  const { data: membership, isLoading: isLoadingMembership } =
    useGetMyMembership();
  const createGroup = useCreateGroup();

  const [formData, setFormData] = useState({
    name: '',
    localArea: '',
    size: '6',
    recruitmentDeadline: '',
    pitchUrl: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }
    if (formData.localArea.length < 2) {
      newErrors.localArea = 'Local area must be at least 2 characters.';
    }
    if (!formData.recruitmentDeadline) {
      newErrors.recruitmentDeadline = 'Recruitment deadline is required.';
    } else if (
      new Date(formData.recruitmentDeadline).getTime() < new Date().setHours(0, 0, 0, 0)
    ) {
      newErrors.recruitmentDeadline = 'Recruitment deadline cannot be in the past.';
    }
    if (formData.pitchUrl) {
      try {
        new URL(formData.pitchUrl);
      } catch (_) {
        newErrors.pitchUrl = 'Please enter a valid URL.';
      }
    }
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, size: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      const data: CreateGroupDto = {
        ...formData,
        size: parseInt(formData.size, 10) as 6 | 12,
        recruitmentDeadline: new Date(formData.recruitmentDeadline).toISOString(),
      };
      createGroup.mutate(data, {
        onSuccess: () => {
          toast.success('Group created successfully!');
          setFormData({
            name: '',
            localArea: '',
            size: '6',
            recruitmentDeadline: '',
            pitchUrl: '',
          });
        },
        onError: (error: any) => {
          const errorMessage =
            error.response?.data?.message || 'An unexpected error occurred.';
          toast.error(`Failed to create group: ${errorMessage}`);
        },
      });
    }
  };

  if (isLoadingMembership) {
    return <div>Loading membership status...</div>;
  }

  if (membership?.tier?.toUpperCase() !== 'PROFESSIONAL') {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Upgrade Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              You need to be a Professional member to create a group.
            </p>
            <Button asChild>
              <Link href="/dashboard/marketing/membership">
                Upgrade Membership
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create a New Group</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Local Retail Alliance"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="localArea">Local Area</Label>
              <Input
                id="localArea"
                name="localArea"
                value={formData.localArea}
                onChange={handleChange}
                placeholder="e.g., Shoreditch"
              />
              {errors.localArea && (
                <p className="text-sm text-red-500">{errors.localArea}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Group Size</Label>
              <RadioGroup
                onValueChange={handleRadioChange}
                value={formData.size}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="6" id="size-6" />
                  <Label htmlFor="size-6" className="font-normal">
                    6 Members
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="12" id="size-12" />
                  <Label htmlFor="size-12" className="font-normal">
                    12 Members
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recruitmentDeadline">Recruitment Deadline</Label>
              <Input
                id="recruitmentDeadline"
                name="recruitmentDeadline"
                type="date"
                value={formData.recruitmentDeadline}
                onChange={handleChange}
              />
              {errors.recruitmentDeadline && (
                <p className="text-sm text-red-500">
                  {errors.recruitmentDeadline}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pitchUrl">Pitch URL (Optional)</Label>
              <Input
                id="pitchUrl"
                name="pitchUrl"
                value={formData.pitchUrl}
                onChange={handleChange}
                placeholder="https://example.com/pitch.pdf"
              />
              {errors.pitchUrl && (
                <p className="text-sm text-red-500">{errors.pitchUrl}</p>
              )}
            </div>

            <Button type="submit" disabled={createGroup.isPending}>
              {createGroup.isPending ? 'Creating...' : 'Create Group'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateGroupClient;