"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useParams } from 'next/navigation';
import { useGetGiftCardTemplateById, useUpdateGiftCardTemplate } from '@/service/gift-card/hook';
import { CreateGiftCardTemplateDto } from '@/service/gift-card/types';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X, Info, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import GiftCardPreview from '@/components/gift-card/gift-card-preview';

const EditGiftCardTemplatePage = () => {
    const params = useParams();
    const id = params.id as string;
    const router = useRouter();

    const { data: template, isLoading: isLoadingTemplate } = useGetGiftCardTemplateById(id);
    const { mutate, isPending } = useUpdateGiftCardTemplate();

    const [formData, setFormData] = useState<Partial<CreateGiftCardTemplateDto>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isUploading, setIsUploading] = useState(false);
    const [fixedAmountInput, setFixedAmountInput] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    useEffect(() => {
        if (template) {
            setFormData({
                name: template.name,
                description: template.description,
                backgroundImageUrl: template.backgroundImageUrl || undefined,
                backgroundColor: template.backgroundColor || '#ffffff',
                textColor: template.textColor || '#000000',
                fixedAmounts: template.fixedAmounts || [],
                allowCustomAmount: template.allowCustomAmount,
                minCustomAmount: template.minCustomAmount,
                maxCustomAmount: template.maxCustomAmount,
                allowReloading: template.allowReloading,
                bonusThreshold: template.bonusThreshold,
                bonusAmount: template.bonusAmount,
                logoUrl: template.logoUrl || undefined,
            });
            if (template.backgroundImageUrl) {
                setImagePreview(template.backgroundImageUrl);
            }
            if (template.logoUrl) {
                setLogoPreview(template.logoUrl);
            }
        }
    }, [template]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (["minCustomAmount", "maxCustomAmount", "bonusThreshold", "bonusAmount"].includes(name)) {
            const parsedValue = parseFloat(value);
            setFormData((prev) => ({
                ...prev,
                [name]: isNaN(parsedValue) ? undefined : parsedValue,
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleColorChange = (hex: string, field: 'backgroundColor' | 'textColor') => {
        setFormData((prev) => ({ ...prev, [field]: hex }));
    };

    const handleSwitchChange = (checked: boolean, field: 'allowCustomAmount' | 'allowReloading') => {
        setFormData((prev) => ({ ...prev, [field]: checked }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setFormData(prev => ({ ...prev, backgroundImageUrl: URL.createObjectURL(file) }));
        }
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
            setFormData(prev => ({ ...prev, logoUrl: URL.createObjectURL(file) }));
        }
    };

    const handleFixedAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === ',' || e.key === 'Enter') {
            e.preventDefault();
            const value = parseFloat(fixedAmountInput.trim());
            if (!isNaN(value) && value > 0 && !formData.fixedAmounts?.includes(value)) {
                setFormData((prev) => ({
                    ...prev,
                    fixedAmounts: [...(prev.fixedAmounts || []), value],
                }));
            }
            setFixedAmountInput('');
        }
    };

    const removeFixedAmount = (amount: number) => {
        setFormData((prev) => ({
            ...prev,
            fixedAmounts: prev.fixedAmounts?.filter((a) => a !== amount),
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name) newErrors.name = "Template name is required";
        if (!formData.description) newErrors.description = "Description is required";
        if (!formData.allowCustomAmount && (!formData.fixedAmounts || formData.fixedAmounts.length === 0)) {
            newErrors.fixedAmounts = "At least one fixed amount is required if custom amounts are not allowed.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Please fill in all required fields correctly.");
            return;
        }

        setIsUploading(true);
        const submissionData: Partial<CreateGiftCardTemplateDto> = { ...formData };

        if (imageFile) {
            const uploadFormData = new FormData();
            uploadFormData.append('file', imageFile);
            try {
                const response = await fetch('/api/upload/gift-card', {
                    method: 'POST',
                    body: uploadFormData,
                });
                if (!response.ok) throw new Error('Image upload failed');
                const result = await response.json();
                submissionData.backgroundImageUrl = result.secure_url;
            } catch (error) {
                toast.error("Image upload failed");
                setIsUploading(false);
                return;
            }
        }

        if (logoFile) {
            const uploadFormData = new FormData();
            uploadFormData.append('file', logoFile);
            try {
                const response = await fetch('/api/upload/gift-card', {
                    method: 'POST',
                    body: uploadFormData,
                });
                if (!response.ok) throw new Error('Logo upload failed');
                const result = await response.json();
                submissionData.logoUrl = result.secure_url;
            } catch (error) {
                toast.error("Logo upload failed");
                setIsUploading(false);
                return;
            }
        }

        mutate({ id, templateData: submissionData }, {
            onSuccess: () => {
                toast.success("Template updated successfully!");
                router.push('/admin/templates');
            },
            onError: () => toast.error("Failed to update template"),
            onSettled: () => setIsUploading(false),
        });
    };

    if (isLoadingTemplate) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-gray-800">Edit Gift Card Template</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="name">Template Name</Label>
                                <Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} />
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Background Color</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                <div className="w-6 h-6 rounded-full border mr-2" style={{ backgroundColor: formData.backgroundColor }} />
                                                {formData.backgroundColor}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-2">
                                            <input
                                                type="color"
                                                value={formData.backgroundColor}
                                                onChange={(e) => handleColorChange(e.target.value, 'backgroundColor')}
                                                className="w-40 h-40 cursor-pointer border-0 p-0 bg-transparent"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div>
                                    <Label>Text Color</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                                                <div className="w-6 h-6 rounded-full border mr-2" style={{ backgroundColor: formData.textColor }} />
                                                {formData.textColor}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="p-2">
                                            <input
                                                type="color"
                                                value={formData.textColor}
                                                onChange={(e) => handleColorChange(e.target.value, 'textColor')}
                                                className="w-40 h-40 cursor-pointer border-0 p-0 bg-transparent"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="image">Background Image (optional)</Label>
                                <Input id="image" type="file" onChange={handleImageChange} disabled={isPending || isUploading} />
                                {imagePreview && (
                                    <div className="mt-4 relative h-48 w-full">
                                        <Image src={imagePreview} alt="Preview" fill className="object-cover rounded-md" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="logo">Company Logo (optional)</Label>
                                <Input id="logo" type="file" onChange={handleLogoChange} disabled={isPending || isUploading} />
                                {logoPreview && (
                                    <div className="mt-4 flex justify-center p-4 bg-slate-50 rounded-xl border border-dashed">
                                        <div className="relative h-20 w-20">
                                            <Image src={logoPreview} alt="Logo preview" fill className="object-contain" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="fixedAmounts">Fixed Amounts (£)</Label>
                                <Input
                                    id="fixedAmounts"
                                    value={fixedAmountInput}
                                    onChange={(e) => setFixedAmountInput(e.target.value)}
                                    onKeyDown={handleFixedAmountKeyDown}
                                    placeholder="Enter amount and press , or Enter"
                                />
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.fixedAmounts?.map((amount) => (
                                        <div key={amount} className="flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm">
                                            £{amount}
                                            <button type="button" onClick={() => removeFixedAmount(amount)} className="ml-2">
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                {errors.fixedAmounts && <p className="text-red-500 text-xs mt-1">{errors.fixedAmounts}</p>}
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="allowCustomAmount" checked={formData.allowCustomAmount} onCheckedChange={(checked) => handleSwitchChange(checked, 'allowCustomAmount')} />
                                <Label htmlFor="allowCustomAmount">Allow Custom Amount</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Switch id="allowReloading" checked={formData.allowReloading} onCheckedChange={(checked) => handleSwitchChange(checked, 'allowReloading')} />
                                <Label htmlFor="allowReloading">Allow Reloading</Label>
                            </div>
                            <div className="flex justify-end space-x-4">
                                <Button type="button" variant="outline" onClick={() => router.push('/admin/templates')} disabled={isPending || isUploading}>
                                    Cancel
                                </Button>
                                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white" disabled={isPending || isUploading}>
                                    {isPending ? 'Saving...' : isUploading ? 'Uploading...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                <div>
                    <GiftCardPreview template={formData} />
                </div>
            </div>
        </div>
    );
};

export default EditGiftCardTemplatePage;
