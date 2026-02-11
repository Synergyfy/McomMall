'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase, Save } from 'lucide-react';
import { ServiceTemplateManager } from '@/app/admin/components/services/ServiceTemplateManager';
import { ServiceTemplate } from '@/app/admin/types/service-template';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ServiceTemplatesPage() {
    const methods = useForm<ServiceTemplate>({
        defaultValues: {
            name: 'Home Cleaning',
            category: 'Cleaning',
            description: 'Standard home cleaning services.',
            packages: [
                { name: 'Basic Clean', price: 50, duration: 120, description: 'Standard cleaning for 1-2 bedrooms.', features: [] },
                { name: 'Deep Clean', price: 120, duration: 240, description: 'Thorough deep clean including appliances.', features: [] }
            ],
            requirements: []
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Service Templates</h1>
                    <p className="text-slate-500">Standardize service offerings and booking rules</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Discard</Button>
                    <Button className="bg-orange-500 hover:bg-orange-600">
                        <Save className="h-4 w-4 mr-2" />
                        Save Template
                    </Button>
                </div>
            </div>

            <FormProvider {...methods}>
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Basic Info */}
                    <Card className="lg:col-span-1 h-fit">
                        <CardContent className="space-y-4 pt-6">
                            <div className="space-y-2">
                                <Label>Template Name</Label>
                                <Input {...methods.register('name')} placeholder="e.g. Plumbing Repair" />
                            </div>
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Input {...methods.register('category')} placeholder="e.g. Home Services" />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea {...methods.register('description')} className="min-h-[100px]" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Packages Manager */}
                    <Card className="lg:col-span-2">
                        <CardContent className="pt-6">
                            <ServiceTemplateManager />
                        </CardContent>
                    </Card>
                </div>
            </FormProvider>
        </div>
    );
}
