'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMerchantGiftCardTemplates, createMerchantGiftCardTemplate, updateMerchantGiftCardTemplate, deleteMerchantGiftCardTemplate } from '@/service/gift-card';
import { toast } from 'sonner';
import type { GiftCardTemplate, CreateGiftCardTemplateDto } from '@/types/gift-card';

const TemplateCard: React.FC<{ template: GiftCardTemplate; onEdit: (template: GiftCardTemplate) => void; onDelete: (id: string) => void; }> = ({ template, onEdit, onDelete }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
    <CardHeader>
      <CardTitle className="text-orange-600">{template.name}</CardTitle>
    </CardHeader>
    <CardContent>
      <img src={template.imageUrl || '/placeholder.svg'} alt={template.name} className="w-full h-40 object-cover rounded-md mb-4" />
      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
      <div className="flex justify-between items-center">
        <div className="text-sm font-semibold">
          {template.fixedAmounts.length > 0
            ? `Amounts: £${template.fixedAmounts.join(', £')}`
            : 'Custom Amounts'}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={() => onEdit(template)}>
            <Edit className="h-4 w-4 text-orange-600" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onDelete(template.id)}>
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TemplateForm: React.FC<{ template: GiftCardTemplate | null; onSubmit: (data: CreateGiftCardTemplateDto) => void; onCancel: () => void; }> = ({ template, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    fixedAmounts: [],
    allowCustomAmount: false,
    minCustomAmount: 0,
    maxCustomAmount: 0,
    ...template,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFixedAmountsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      fixedAmounts: value.split(',').map((v) => parseFloat(v.trim())).filter(v => !isNaN(v)),
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Template Name</Label>
        <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="border-orange-300 focus:border-orange-500 focus:ring-orange-500" />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} className="border-orange-300 focus:border-orange-500 focus:ring-orange-500" />
      </div>
      <div>
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="border-orange-300 focus:border-orange-500 focus:ring-orange-500" />
      </div>
      <div>
        <Label htmlFor="fixedAmounts">Fixed Amounts (comma-separated)</Label>
        <Input
          id="fixedAmounts"
          name="fixedAmounts"
          value={formData.fixedAmounts.join(', ')}
          onChange={handleFixedAmountsChange}
          className="border-orange-300 focus:border-orange-500 focus:ring-orange-500"
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="allowCustomAmount"
          name="allowCustomAmount"
          checked={formData.allowCustomAmount}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, allowCustomAmount: checked }))}
        />
        <Label htmlFor="allowCustomAmount">Allow Custom Amounts</Label>
      </div>
      {formData.allowCustomAmount && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minCustomAmount">Min Amount</Label>
            <Input
              id="minCustomAmount"
              name="minCustomAmount"
              type="number"
              value={formData.minCustomAmount}
              onChange={handleChange}
              className="border-orange-300 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
          <div>
            <Label htmlFor="maxCustomAmount">Max Amount</Label>
            <Input
              id="maxCustomAmount"
              name="maxCustomAmount"
              type="number"
              value={formData.maxCustomAmount}
              onChange={handleChange}
              className="border-orange-300 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>
        </div>
      )}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">Save Template</Button>
      </div>
    </form>
  );
};

export default function MerchantTemplatePage() {
  const [templates, setTemplates] = useState<GiftCardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<GiftCardTemplate | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await getMerchantGiftCardTemplates();
      setTemplates(response.data);
    } catch (error) {
      toast.error('Failed to fetch templates.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleFormSubmit = async (formData: CreateGiftCardTemplateDto) => {
    try {
      if (editingTemplate) {
        await updateMerchantGiftCardTemplate(editingTemplate.id, formData);
        toast.success('Template updated successfully.');
      } else {
        await createMerchantGiftCardTemplate(formData);
        toast.success('Template created successfully.');
      }
      fetchTemplates();
      setIsModalOpen(false);
      setEditingTemplate(null);
    } catch (error) {
      toast.error('Failed to save template.');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteMerchantGiftCardTemplate(id);
        toast.success('Template deleted successfully.');
        fetchTemplates();
      } catch (error) {
        toast.error('Failed to delete template.');
      }
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-orange-600">Gift Card Templates</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => setEditingTemplate(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTemplate ? 'Edit' : 'Create'} Gift Card Template</DialogTitle>
            </DialogHeader>
            <TemplateForm
              template={editingTemplate}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsModalOpen(false);
                setEditingTemplate(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={(t) => {
                setEditingTemplate(t);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}