'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { fetchCategories } from '@/app/admin/content/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VariantManager } from '@/app/admin/components/products/VariantManager';
import { ChevronLeft, ChevronRight, CheckCircle2, Package, Tag, Settings2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductAttribute {
    name: string;
    options: { name: string; priceModifier?: number }[];
}

interface ProductVariation {
    combination: Record<string, string>;
    sku: string;
    price: number;
    stock: number;
    available: boolean;
}

interface ProductFormData {
    title: string;
    description: string;
    basePrice: number;
    category: string;
    attributes: ProductAttribute[];
    variations: ProductVariation[];
}

const STEPS = [
    { id: 1, title: 'Basic Info', description: 'Product title and description', icon: Package },
    { id: 2, title: 'Attributes', description: 'Define options like size/color', icon: Tag },
    { id: 3, title: 'Variations', description: 'Manage SKUs and pricing', icon: Settings2 },
];

export default function AddProductPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);

    const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    const methods = useForm<ProductFormData>({
        defaultValues: {
            title: '',
            description: '',
            basePrice: 0,
            category: '',
            attributes: [],
            variations: []
        }
    });

    const onSubmit = (data: any) => {
        console.log('Final Product Data:', data);
        toast.success('Product created successfully!');
        router.push('/admin/products');
    };

    const nextStep = () => {
        if (currentStep === 2) {
            const success = generateVariations();
            if (!success) {
                toast.error('Please add options to your attributes before generating variations.');
                return;
            }
        }
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const generateVariations = (): boolean => {
        const watchedAttributes = methods.getValues('attributes');
        if (!watchedAttributes || watchedAttributes.length === 0) return false;

        const optionsArrays = watchedAttributes.map((attr: any) =>
            attr.options.map((opt: any) => opt.name).filter(Boolean)
        );

        if (optionsArrays.some((arr: any) => arr.length === 0)) return false;

        const cartesian = (arrays: string[][]): string[][] => {
            return arrays.reduce<string[][]>((acc, curr) => {
                return acc.flatMap(x => curr.map(y => [...x, y]));
            }, [[]]);
        };

        const combinations = cartesian(optionsArrays);
        const basePrice = methods.getValues('basePrice') || 0;

        const newVariations = combinations.map(combo => {
            const combinationRecord: Record<string, string> = {};
            let skuParts: string[] = [];
            let priceMod = 0;

            combo.forEach((optName, index) => {
                const attrName = watchedAttributes[index].name;
                combinationRecord[attrName] = optName;
                skuParts.push(optName.substring(0, 3).toUpperCase());
                const optDef = watchedAttributes[index].options.find((o: any) => o.name === optName);
                if (optDef?.priceModifier) priceMod += Number(optDef.priceModifier);
            });

            return {
                combination: combinationRecord,
                sku: `PROD-${skuParts.join('-')}`,
                price: Number(basePrice) + priceMod,
                stock: 0,
                available: true,
            };
        });

        methods.setValue('variations', newVariations);
        return true;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Add New Product</h1>
                    <p className="text-slate-500">Follow the steps to create a new product in the catalog.</p>
                </div>
                <Button variant="outline" onClick={() => router.push('/admin/products')}>
                    Cancel
                </Button>
            </div>

            {/* Stepper */}
            <div className="grid grid-cols-3 gap-4">
                {STEPS.map((step) => {
                    const Icon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;

                    return (
                        <div
                            key={step.id}
                            className={cn(
                                "relative p-4 rounded-xl border-2 transition-all",
                                isActive ? "border-orange-500 bg-orange-50/30" : "border-slate-100 bg-white",
                                isCompleted && "border-emerald-500 bg-emerald-50/30"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                                    isActive ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400",
                                    isCompleted && "bg-emerald-500 text-white"
                                )}>
                                    {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-5 w-5" />}
                                </div>
                                <div>
                                    <p className={cn(
                                        "text-sm font-bold",
                                        isActive ? "text-orange-700" : "text-slate-500",
                                        isCompleted && "text-emerald-700"
                                    )}>
                                        Step {step.id}
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium truncate">{step.title}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Form Content */}
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
                    {/* Step 1: Basic Information */}
                    {currentStep === 1 && (
                        <Card className="border-0 shadow-sm">
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>Start with the core details of your product.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Product Title</Label>
                                    <Input
                                        id="title"
                                        {...methods.register('title')}
                                        placeholder="e.g. Premium Cotton T-Shirt"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        {...methods.register('description')}
                                        placeholder="Describe your product in detail..."
                                        rows={5}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="basePrice">Base Price (£)</Label>
                                        <Input
                                            id="basePrice"
                                            type="number"
                                            step="0.01"
                                            {...methods.register('basePrice')}
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select
                                            onValueChange={(value) => methods.setValue('category', value)}
                                            defaultValue={methods.getValues('category')}
                                        >
                                            <SelectTrigger id="category">
                                                <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Select category"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((cat: any) => (
                                                    <SelectItem key={cat.id} value={cat.name}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Attributes */}
                    {currentStep === 2 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <VariantManager showVariations={false} />
                        </div>
                    )}

                    {/* Step 3: Variations */}
                    {currentStep === 3 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <VariantManager showAttributes={false} />
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="text-slate-600"
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>

                        {currentStep < 3 ? (
                            <Button
                                key="next-step-btn"
                                type="button"
                                onClick={nextStep}
                                className="bg-slate-900 hover:bg-slate-800"
                            >
                                Next Step
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                key="submit-product-btn"
                                type="submit"
                                className="bg-orange-500 hover:bg-orange-600 px-8"
                            >
                                Create Product
                            </Button>
                        )}
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
