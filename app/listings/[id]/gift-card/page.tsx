'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getGiftCardTemplatesByBusiness } from '@/service/gift-card';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import type { GiftCardTemplate } from '@/types/gift-card';

const GiftCardTemplate: React.FC<{ template: GiftCardTemplate, onSelect: (template: GiftCardTemplate) => void, selected: boolean }> = ({ template, onSelect, selected }) => (
  <Card
    className={`cursor-pointer transition-all duration-300 ${
      selected ? 'border-orange-600 shadow-lg' : 'hover:shadow-md'
    }`}
    onClick={() => onSelect(template)}
  >
    <CardContent className="p-4">
      <img src={template.imageUrl || '/placeholder.svg'} alt={template.name} className="w-full h-40 object-cover rounded-md mb-4" />
      <h3 className="text-lg font-semibold text-orange-600">{template.name}</h3>
      <p className="text-sm text-gray-600">{template.description}</p>
    </CardContent>
  </Card>
);

export default function ListingGiftCardPage() {
  const [templates, setTemplates] = useState<GiftCardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<GiftCardTemplate | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const params = useParams();
  const { id: businessId } = params;

  useEffect(() => {
    if (businessId) {
      const fetchTemplates = async () => {
        setLoading(true);
        try {
          const response = await getGiftCardTemplatesByBusiness(businessId as string);
          setTemplates(response.data);
        } catch (error) {
          toast.error('Failed to fetch gift card templates.');
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchTemplates();
    }
  }, [businessId]);

  const handleSelectTemplate = (template: GiftCardTemplate) => {
    setSelectedTemplate(template);
    setSelectedAmount(null);
    setCustomAmount('');
  };

  const handleSelectAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handlePurchase = () => {
      // a toast message to show that the purchase flow is not implemented
      toast.info('The purchase flow is not implemented in this task.');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-orange-600">Purchase a Gift Card</h1>
      {loading ? (
        <div className="text-center">Loading templates...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold mb-4">1. Choose a Design</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <GiftCardTemplate
                  key={template.id}
                  template={template}
                  selected={selectedTemplate?.id === template.id}
                  onSelect={handleSelectTemplate}
                />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">2. Choose an Amount</h2>
            {selectedTemplate && (
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {selectedTemplate.fixedAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant={selectedAmount === amount ? 'default' : 'outline'}
                        onClick={() => handleSelectAmount(amount)}
                        className={`w-full ${selectedAmount === amount ? 'bg-orange-600 hover:bg-orange-700' : ''}`}
                      >
                        £{amount.toFixed(2)}
                      </Button>
                    ))}
                    {selectedTemplate.allowCustomAmount && (
                      <div>
                        <input
                          type="number"
                          placeholder={`Custom amount (£${selectedTemplate.minCustomAmount} - £${selectedTemplate.maxCustomAmount})`}
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          onFocus={() => setSelectedAmount(null)}
                          className="w-full p-2 border rounded-md border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handlePurchase}
                    disabled={!selectedAmount && !customAmount}
                    className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    Purchase for £{selectedAmount || customAmount}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}