"use client";
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { useGetGiftCardTemplates } from '@/service/gift-card/hook';

const GiftCardTemplatesPage = () => {
  const { data: templates, isPending, isError } = useGetGiftCardTemplates();

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates && templates.map((template) => (
            <Card key={template.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="p-0 relative">
                <Image src={template.backgroundImageUrl || 'https://via.placeholder.com/400x200'} alt={template.name} className="w-full h-48 object-cover" width={300} height={200} />
                <Badge className={`absolute top-2 right-2 ${template.isActive ? 'bg-green-500' : 'bg-red-500'}`}>
                  {template.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 flex flex-col flex-grow">
                <div className="flex-grow">
                    <CardTitle className="text-lg font-semibold text-gray-800">{template.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-2 mb-4">{template.description}</p>

                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Price Options</h4>
                    <div className="flex flex-wrap gap-2">
                        {template.fixedAmounts?.map((amount) => (
                            <Badge key={amount} variant="secondary">£{amount}</Badge>
                        ))}
                        {template.allowCustomAmount && (
                            <Badge variant="outline">
                                Custom: £{template.minCustomAmount} - £{template.maxCustomAmount}
                            </Badge>
                        )}
                    </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GiftCardTemplatesPage;