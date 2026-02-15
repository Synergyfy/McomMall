"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VariantManager } from "@/app/admin/components/products/VariantManager";
import { VisualVariantSelector } from "@/app/admin/components/products/VisualVariantSelector";
import { Product } from "@/app/admin/types/product-variant";
import {
    Plus,
    LayoutTemplate,
    Box,
    CheckCircle2,
    Tag,
    Settings2,
    Package,
    ChevronLeft,
    ChevronRight,
    Eye,
    Pencil,
    Trash2,
    Loader2
} from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
    useCreateProductTemplate,
    useGetProductTemplates,
    useGetProductTemplate,
    useUpdateProductTemplate,
    useDeleteProductTemplate
} from "@/service/product/template-hook";
import { fetchCategories, fetchSubcategories } from "@/app/admin/content/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

// Extended Product type to include template metadata
interface TemplateFormValues extends Product {
    id?: string;
    name: string;
    category: string;
    subCategory: string;
    productType: string;
}

const STEPS = [
    { id: 1, title: 'Details & Attributes', description: 'Setup template info and options', icon: Tag },
    { id: 2, title: 'Manage Variations', description: 'Configure SKUs & prices', icon: Settings2 },
    { id: 3, title: 'Preview', description: 'Check client view', icon: Eye },
];

export default function ProductTemplatesPage() {
    const methods = useForm<TemplateFormValues>({
        defaultValues: {
            name: "",
            title: "", // Required by Product interface
            description: "", // Required by Product interface
            category: "",
            subCategory: "",
            productType: "physical",
            attributes: [],
            variations: [],
            basePrice: 29.99,
        },
    });

    const [activeTab, setActiveTab] = useState("list");
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

    // Preview state
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

    // API Hooks
    const { data: templatesData, isLoading: isLoadingTemplates } = useGetProductTemplates();
    const { data: templateDetails, isLoading: isLoadingDetails } = useGetProductTemplate(selectedTemplateId);
    const createMutation = useCreateProductTemplate();
    const updateMutation = useUpdateProductTemplate();
    const deleteMutation = useDeleteProductTemplate();

    // Taxonomy Hooks
    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories
    });

    const watchedCategory = methods.watch("category");
    const { data: subcategories = [] } = useQuery({
        queryKey: ['subcategories', watchedCategory],
        queryFn: () => fetchSubcategories(watchedCategory),
        enabled: !!watchedCategory
    });

    // Populate form when editing
    useEffect(() => {
        if (selectedTemplateId && templateDetails) {
            methods.reset({
                id: templateDetails.id,
                name: templateDetails.name,
                category: templateDetails.category,
                subCategory: templateDetails.subCategory,
                productType: templateDetails.productType,
                attributes: templateDetails.attributes.map((attr: any) => ({
                    name: attr.name,
                    options: attr.options.map((opt: string) => ({ name: opt, priceModifier: 0 }))
                })),
                variations: [], // Templates might not store exact variations, just structure. But we keep it blank or mock.
                basePrice: 29.99, // Default
            });
            setCurrentStep(1);
        }
    }, [selectedTemplateId, templateDetails, methods]);

    const handleCreateNew = () => {
        setSelectedTemplateId(null);
        methods.reset({
            name: "",
            category: "",
            subCategory: "",
            productType: "physical",
            attributes: [],
            variations: [],
            basePrice: 29.99,
        });
        setCurrentStep(1);
        setActiveTab("wizard");
    };

    const handleEdit = (id: string) => {
        setSelectedTemplateId(id);
        setActiveTab("wizard");
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this template?")) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleSave = async () => {
        const data = methods.getValues();
        const payload = {
            name: data.name,
            productType: data.productType,
            category: data.category,
            subCategory: data.subCategory,
            attributes: data.attributes.map(attr => ({
                name: attr.name,
                options: attr.options.map(o => o.name)
            }))
        };

        try {
            if (selectedTemplateId) {
                await updateMutation.mutateAsync({ id: selectedTemplateId, data: payload });
            } else {
                await createMutation.mutateAsync(payload);
            }
            setActiveTab("list");
        } catch (error) {
            // Error handling is done in hook
        }
    };

    // Watchers for Preview
    const watchedAttributes = methods.watch("attributes");
    const watchedVariations = methods.watch("variations");
    const watchedBasePrice = methods.watch("basePrice");

    const handleSelectionChange = (attr: string, val: string) => {
        setSelectedVariants((prev) => ({ ...prev, [attr]: val }));
    };

    const currentVariation = watchedVariations.find((v) =>
        Object.entries(selectedVariants).every(([key, val]) => v.combination[key] === val)
    );

    const nextStep = async () => {
        const isValid = await methods.trigger(['name', 'category', 'subCategory']); // Basic validation - Fixed
        if (isValid) {
            if (currentStep < STEPS.length) setCurrentStep((p) => p + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep((p) => p - 1);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Product Templates</h1>
                    <p className="text-slate-500">Manage standard product structures and variant logic</p>
                </div>
                <Button onClick={handleCreateNew} className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="list">All Templates</TabsTrigger>
                    <TabsTrigger value="wizard" disabled={!selectedTemplateId && activeTab === 'list'}>
                        {selectedTemplateId ? 'Edit Template' : 'Create Template'}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list" className="space-y-4">
                    <Card>
                        <CardContent className="p-0">
                            {isLoadingTemplates ? (
                                <div className="p-8 text-center text-slate-500">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                    Loading templates...
                                </div>
                            ) : templatesData && templatesData.data.length > 0 ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Template Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Attributes</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {templatesData.data.map((template) => (
                                            <TableRow key={template.id}>
                                                <TableCell className="font-medium">{template.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span>{template.category}</span>
                                                        <span className="text-xs text-slate-400">{template.subCategory}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1 flex-wrap">
                                                        {template.attributes.map((attr, i) => (
                                                            <span key={i} className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 border">
                                                                {attr.name} ({attr.options.length})
                                                            </span>
                                                        ))}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(template.id)}>
                                                        <Pencil className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-8 text-center text-slate-500">
                                    <LayoutTemplate className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                    <h3 className="text-lg font-medium text-slate-900">No Templates Found</h3>
                                    <p>Create your first product template to standardize your catalog.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="wizard" className="space-y-6">
                    {/* Stepper Header */}
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
                                        <div
                                            className={cn(
                                                "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                                                isActive ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-400",
                                                isCompleted && "bg-emerald-500 text-white"
                                            )}
                                        >
                                            {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p
                                                className={cn(
                                                    "text-sm font-bold",
                                                    isActive ? "text-orange-700" : "text-slate-500",
                                                    isCompleted && "text-emerald-700"
                                                )}
                                            >
                                                Step {step.id}
                                            </p>
                                            <p className="text-xs text-slate-500 font-medium truncate">{step.title}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Wizard Content */}
                    <Card className="border-0 shadow-sm min-h-[500px]">
                        <CardHeader className="border-b bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>
                                        {STEPS[currentStep - 1].title}
                                    </CardTitle>
                                    <CardDescription>
                                        {STEPS[currentStep - 1].description}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-500">Base Price:</span>
                                    <Input
                                        type="number"
                                        {...methods.register('basePrice')}
                                        className="w-24 h-9 bg-white"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <FormProvider {...methods}>
                                {currentStep === 1 && (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                                        {/* Metadata Fields */}
                                        <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Template Name</label>
                                                <Input {...methods.register('name', { required: true })} placeholder="e.g. Summer T-Shirts" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Product Type</label>
                                                <Select onValueChange={(val) => methods.setValue('productType', val)} defaultValue={methods.getValues('productType')}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="physical">Physical Product</SelectItem>
                                                        <SelectItem value="digital">Digital Product</SelectItem>
                                                        <SelectItem value="service">Service</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Category</label>
                                                <Select onValueChange={(val) => methods.setValue('category', val)} defaultValue={methods.getValues('category')}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select Category" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((cat) => (
                                                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Sub-Category</label>
                                                {subcategories.length > 0 ? (
                                                    <Select onValueChange={(val) => methods.setValue('subCategory', val)} defaultValue={methods.getValues('subCategory')}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select Sub-Category" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {subcategories.map((sub) => (
                                                                <SelectItem key={sub.id} value={sub.name}>{sub.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Input {...methods.register('subCategory')} placeholder="Type sub-category name" />
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t pt-4">
                                            <h3 className="text-sm font-bold mb-4 uppercase text-slate-500">Attribute Definition</h3>
                                            <VariantManager showVariations={false} />
                                        </div>
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                        <VariantManager showAttributes={false} />
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-4xl mx-auto">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            {/* Preview Image */}
                                            <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center relative overflow-hidden border">
                                                <Box className="h-32 w-32 text-slate-300" />
                                                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md">
                                                    Preview Mode
                                                </div>
                                                <div className="absolute bottom-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-mono border shadow-sm text-slate-600">
                                                    {currentVariation ? currentVariation.sku : "PROD-???"}
                                                </div>
                                            </div>

                                            {/* Preview Details */}
                                            <div className="space-y-8">
                                                <div>
                                                    <h2 className="text-3xl font-bold text-slate-900">{methods.watch('name') || "Template Title"}</h2>
                                                    <p className="text-2xl font-medium text-orange-600 mt-2">
                                                        £{currentVariation ? currentVariation.price.toFixed(2) : Number(watchedBasePrice).toFixed(2)}
                                                    </p>
                                                </div>

                                                <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
                                                    <VisualVariantSelector
                                                        attributes={watchedAttributes}
                                                        variations={watchedVariations}
                                                        selectedVariants={selectedVariants}
                                                        onChange={handleSelectionChange}
                                                        ignoreStock={true}
                                                    />
                                                </div>

                                                <Button
                                                    className="w-full h-12 text-lg font-bold bg-slate-900 hover:bg-slate-800"
                                                    disabled={!currentVariation}
                                                >
                                                    {currentVariation
                                                        ? "Add to Cart (Preview)"
                                                        : "Select Options"}
                                                </Button>

                                                <p className="text-center text-xs text-slate-400">
                                                    * This is a preview of how customers will see your variations.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </FormProvider>
                        </CardContent>
                    </Card>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="w-32"
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>

                        {currentStep < 3 ? (
                            <Button
                                onClick={nextStep}
                                className="w-32 bg-slate-900 hover:bg-slate-800"
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                className="w-32 bg-emerald-600 hover:bg-emerald-700"
                                onClick={handleSave}
                                disabled={createMutation.isPending || updateMutation.isPending}
                            >
                                {createMutation.isPending || updateMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                )}
                                Save Template
                            </Button>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
