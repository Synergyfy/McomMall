'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { VariantManager } from '@/app/admin/components/products/VariantManager';
import { VisualVariantSelector } from '@/app/admin/components/products/VisualVariantSelector';
import { Product } from '@/app/admin/types/product-variant';
import { Plus, LayoutTemplate, Box, Eye, FileJson } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export default function ProductTemplatesPage() {
    const methods = useForm<Product>({
        defaultValues: {
            attributes: [
                {
                    name: 'Color',
                    options: [
                        { name: 'Red', priceModifier: 0 },
                        { name: 'Blue', priceModifier: 0 }
                    ]
                },
                {
                    name: 'Size',
                    options: [
                        { name: 'S', priceModifier: 0 },
                        { name: 'M', priceModifier: 2 }
                    ]
                }
            ],
            variations: [],
            basePrice: 29.99
        }
    });

    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
    const [jsonOpen, setJsonOpen] = useState(false);

    const watchedAttributes = methods.watch('attributes');
    const watchedVariations = methods.watch('variations');
    const watchedBasePrice = methods.watch('basePrice');

    const handleSelectionChange = (attr: string, val: string) => {
        setSelectedVariants(prev => ({ ...prev, [attr]: val }));
    };

    // Find current variation for preview
    const currentVariation = watchedVariations.find(v =>
        Object.entries(selectedVariants).every(([key, val]) => v.combination[key] === val)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Product Templates</h1>
                    <p className="text-slate-500">Manage standard product structures and variant logic</p>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                </Button>
            </div>

            <Tabs defaultValue="demo" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">All Templates</TabsTrigger>
                    <TabsTrigger value="demo">Variant System Demo</TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                    <Card>
                        <CardContent className="p-8 text-center text-slate-500">
                            <LayoutTemplate className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                            <h3 className="text-lg font-medium text-slate-900">No Templates Found</h3>
                            <p>Create your first product template to standardize your catalog.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="demo">
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Left: Admin Manager */}
                        <div className="space-y-6">
                            <Card className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-blue-700">Admin View: Variant Manager</CardTitle>
                                            <CardDescription>This component is used by admins/sellers to define variants.</CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">Base Price:</span>
                                                <Input
                                                    type="number"
                                                    {...methods.register('basePrice')}
                                                    className="w-20 h-8"
                                                />
                                            </div>
                                            <Dialog open={jsonOpen} onOpenChange={setJsonOpen}>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="icon" className="h-8 w-8">
                                                        <FileJson className="h-4 w-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
                                                    <pre className="text-xs">{JSON.stringify(methods.watch(), null, 2)}</pre>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <FormProvider {...methods}>
                                        <VariantManager />
                                    </FormProvider>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right: Client Preview */}
                        <div className="space-y-6">
                             <Card className="border-l-4 border-l-emerald-500 h-full">
                                <CardHeader>
                                    <CardTitle className="text-emerald-700">Client View: Product Page</CardTitle>
                                    <CardDescription>Live preview of how customers select variants.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-8">
                                    {/* Mock Product Image */}
                                    <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                                        <Box className="h-32 w-32 text-slate-300" />
                                        {/* If we had images per variant, we'd show them here */}
                                        <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-mono border shadow-sm">
                                            {currentVariation ? currentVariation.sku : 'PROD-???'}
                                        </div>
                                    </div>

                                    {/* Product Info */}
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">Sample Product</h2>
                                        <p className="text-xl font-medium text-slate-700 mt-1">
                                            £{currentVariation ? currentVariation.price.toFixed(2) : Number(watchedBasePrice).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Selector Component */}
                                    <div className="p-6 bg-slate-50 rounded-xl border">
                                        <VisualVariantSelector
                                            attributes={watchedAttributes}
                                            variations={watchedVariations}
                                            selectedVariants={selectedVariants}
                                            onChange={handleSelectionChange}
                                        />
                                    </div>

                                    {/* Cart Action */}
                                    <Button
                                        className="w-full h-12 text-lg bg-slate-900 hover:bg-slate-800"
                                        disabled={!currentVariation || currentVariation.stock <= 0}
                                    >
                                        {currentVariation
                                            ? (currentVariation.stock > 0 ? 'Add to Cart' : 'Out of Stock')
                                            : 'Select Options'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
