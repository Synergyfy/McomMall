"use client";
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGiftCardTemplate } from '@/service/gift-card';
import { CreateGiftCardTemplateDto } from '@/service/gift-card/types';

const CreateGiftCardTemplatePage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateGiftCardTemplateDto>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createGiftCardTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['giftCardTemplates']});
      router.push('/dashboard/gift-card/templates');
    },
    onError: (error) => {
      // Handle error, e.g., show a notification
      console.error("Failed to create gift card template:", error);
    },
  });

  const onSubmit = (data: CreateGiftCardTemplateDto) => {
    mutate(data);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">Create New Gift Card Template</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Template Name</label>
              <Input
                id="name"
                {...register("name", { required: "Template name is required" })}
                className="mt-1"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <Textarea
                id="description"
                {...register("description")}
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
              <Input
                id="imageUrl"
                {...register("imageUrl", { required: "Image URL is required" })}
                className="mt-1"
              />
              {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl.message}</p>}
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white" disabled={isPending}>
                {isPending ? 'Creating...' : 'Create Template'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateGiftCardTemplatePage;