"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { DashboardGiftCard } from '@/app/dashboard/component/DashboardMarketingCards';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { useGetGiftCardTemplates, useDeleteGiftCardTemplate } from '@/service/gift-card/hook';

const GiftCardTemplatesPage = () => {
  const router = useRouter();
  const { data: templates, isPending, isError } = useGetGiftCardTemplates();
  const { mutate: deleteTemplate, isPending: isDeleting } = useDeleteGiftCardTemplate();

  const handleDelete = (id: string) => {
    deleteTemplate(id, {
      onSuccess: () => {
        toast.success("Template deleted successfully!");
      },
      onError: () => {
        toast.error("Failed to delete template. Please try again.");
      },
    });
  };

  if (isPending) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load gift card templates. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gift Card Templates</h1>
        <Link href="/dashboard/gift-card/templates/new" passHref>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Template
          </Button>
        </Link>
      </div>

      {templates && templates.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 mb-4">You haven&apos;t created any gift card templates yet.</p>
          <Link href="/dashboard/gift-card/templates/new" passHref>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Template
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {templates && templates.map((template) => (
            <DashboardGiftCard
              key={template.id}
              template={template}
              onEdit={(id) => router.push(`/dashboard/gift-card/templates/edit/${id}`)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GiftCardTemplatesPage;