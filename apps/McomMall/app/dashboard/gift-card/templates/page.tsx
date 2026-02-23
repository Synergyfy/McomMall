"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Zap, Terminal } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGetGiftCardTemplates, useDeleteGiftCardTemplate } from '@/service/gift-card/hook';

const DashboardGiftCard = dynamic(() => import('@/app/dashboard/component/DashboardMarketingCards').then(mod => mod.DashboardGiftCard), {
  loading: () => <div className="aspect-[1.58/1] w-full bg-gray-100 animate-pulse rounded-[2rem]" />,
  ssr: false
});

const GiftCardTemplatesPage = () => {
  const router = useRouter();
  const { data: templates, isPending, isError } = useGetGiftCardTemplates();
  const { mutate: deleteTemplate } = useDeleteGiftCardTemplate();

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
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-orange-600" size={48} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
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
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <main className="container mx-auto px-4 py-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">Gift Card Catalog</h1>
            <p className="text-slate-500 font-bold text-sm mt-2 uppercase tracking-widest">
              Home &gt; Dashboard &gt; Gift Cards &gt; Templates
            </p>
          </div>
        </header>

        {templates && templates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {templates.map((template) => (
              <DashboardGiftCard
                key={template.id}
                template={template}
                onEdit={(id) => router.push(`/dashboard/gift-card/templates/edit/${id}`)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
            <Zap className="mx-auto text-gray-200 mb-6" size={64} />
            <h3 className="text-2xl font-black text-gray-900">No Templates Found</h3>
            <p className="text-gray-500 font-bold mt-2">Go to the global templates catalog to find templates to issue.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default GiftCardTemplatesPage;