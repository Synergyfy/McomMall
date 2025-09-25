"use client";

import React, { useState } from "react";
import { useGetGiftCardTemplates, useCreateGiftCardTemplate, useUpdateGiftCardTemplate, useDeleteGiftCardTemplate, GiftCardTemplate, CreateGiftCardTemplateDto } from "@/service/gift-card/hook";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PlusCircle, Edit, Trash2, Loader2 } from "lucide-react";
import Image from 'next/image';
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/service/api";

const templateFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    fixedAmounts: z.string().optional(),
    allowCustomAmount: z.boolean(),
    minCustomAmount: z.coerce.number().optional(),
    maxCustomAmount: z.coerce.number().optional(),
    imageUrl: z.string().optional(),
}).refine(data => {
    if (data.fixedAmounts) {
        return data.fixedAmounts.split(',').every(item => !item.trim() || !isNaN(parseFloat(item.trim())));
    }
    return true;
}, {
    message: "Must be a comma-separated list of valid numbers",
    path: ["fixedAmounts"],
});

const processingSchema = templateFormSchema.transform(data => ({
    ...data,
    fixedAmounts: data.fixedAmounts ? data.fixedAmounts.split(',').map(s => s.trim()).filter(Boolean).map(s => parseFloat(s)) : [],
}));

type TemplateFormValues = z.infer<typeof templateFormSchema>;

const GiftCardTemplatesPage = () => {
    const { data: templates, isLoading, error } = useGetGiftCardTemplates();
    const createTemplate = useCreateGiftCardTemplate();
    const updateTemplate = useUpdateGiftCardTemplate();
    const deleteTemplate = useDeleteGiftCardTemplate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<GiftCardTemplate | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const { register, handleSubmit, control, reset, watch } = useForm<TemplateFormValues>({
        resolver: zodResolver(templateFormSchema),
        defaultValues: {
            name: "",
            description: "",
            fixedAmounts: "",
            allowCustomAmount: false,
        }
    });

    const allowCustomAmount = watch("allowCustomAmount");

    const openModal = (template: GiftCardTemplate | null = null) => {
        setEditingTemplate(template);
        setImageFile(null);
        if (template) {
            setImagePreview(template.imageUrl || null);
            reset({
                name: template.name,
                description: template.description || "",
                fixedAmounts: template.fixedAmounts.join(','),
                allowCustomAmount: template.allowCustomAmount,
                minCustomAmount: template.minCustomAmount,
                maxCustomAmount: template.maxCustomAmount,
                imageUrl: template.imageUrl
            });
        } else {
            setImagePreview(null);
            reset({
                name: "",
                description: "",
                fixedAmounts: "",
                allowCustomAmount: false,
                minCustomAmount: undefined,
                maxCustomAmount: undefined,
                imageUrl: ""
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTemplate(null);
        reset();
        setImageFile(null);
        setImagePreview(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const onSubmit: SubmitHandler<TemplateFormValues> = async (data) => {
        const processedData = processingSchema.parse(data);

        setIsUploading(true);
        let imageUrl = editingTemplate?.imageUrl || processedData.imageUrl || "";

        if (imageFile) {
            const formData = new FormData();
            formData.append('file', imageFile);
            try {
                const response = await api.post('/api/template', formData);
                imageUrl = response.data.secure_url;
            } catch (error) {
                console.error("Image upload failed:", error);
                setIsUploading(false);
                return;
            }
        }

        const templateData: CreateGiftCardTemplateDto = {
            name: processedData.name,
            description: processedData.description,
            fixedAmounts: processedData.fixedAmounts,
            allowCustomAmount: processedData.allowCustomAmount,
            minCustomAmount: processedData.minCustomAmount,
            maxCustomAmount: processedData.maxCustomAmount,
            imageUrl
        };

        if (editingTemplate) {
            await updateTemplate.mutateAsync({ id: editingTemplate.id, ...templateData });
        } else {
            await createTemplate.mutateAsync(templateData);
        }

        setIsUploading(false);
        closeModal();
    };


    if (isLoading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-orange-600" /></div>;
    }

    if (error) {
        return <div className="text-red-500 text-center">Error loading templates: {error.message}</div>;
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Gift Card Templates</h1>
                <Button onClick={() => openModal()} className="bg-orange-600 hover:bg-orange-700">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Template
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates?.map(template => (
                    <Card key={template.id} className="flex flex-col">
                        <CardHeader>
                            <CardTitle>{template.name}</CardTitle>
                            {template.imageUrl && (
                                <div className="relative h-40 mt-2">
                                    <Image src={template.imageUrl} alt={template.name} layout="fill" objectFit="cover" className="rounded-md" />
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <CardDescription>{template.description}</CardDescription>
                            <div className="mt-4">
                                <p className="font-semibold">Amounts:</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                    {template.fixedAmounts.map(amount => (
                                        <span key={amount} className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm">
                                            £{amount}
                                        </span>
                                    ))}
                                </div>
                                {template.allowCustomAmount && (
                                    <p className="text-sm mt-2">Custom amounts from £{template.minCustomAmount} to £{template.maxCustomAmount}</p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => openModal(template)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="destructive" size="sm" onClick={() => deleteTemplate.mutate(template.id)}><Trash2 className="h-4 w-4" /></Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>{editingTemplate ? 'Edit Template' : 'Create New Template'}</DialogTitle>
                        <DialogDescription>
                            {editingTemplate ? 'Update the details of your gift card template.' : 'Fill in the details to create a new gift card template.'}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input id="name" {...register("name")} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="description" className="text-right">Description</Label>
                                <Textarea id="description" {...register("description")} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="fixedAmounts" className="text-right">Fixed Amounts</Label>
                                <Input id="fixedAmounts" {...register("fixedAmounts")} className="col-span-3" placeholder="e.g., 10,25,50" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="imageUrl" className="text-right">Image</Label>
                                <div className="col-span-3">
                                    <Input id="imageUrl" type="file" onChange={handleImageChange} accept="image/*" className="mb-2" />
                                    {imagePreview && (
                                        <div className="relative h-40">
                                            <Image src={imagePreview} alt="Preview" layout="fill" objectFit="cover" className="rounded-md" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="allowCustomAmount" className="text-right">Allow Custom Amount</Label>
                                <Controller
                                    name="allowCustomAmount"
                                    control={control}
                                    render={({ field }) => (
                                        <Switch
                                            id="allowCustomAmount"
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    )}
                                />
                            </div>
                            {allowCustomAmount && (
                                <>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="minCustomAmount" className="text-right">Min Amount</Label>
                                        <Input id="minCustomAmount" type="number" {...register("minCustomAmount")} className="col-span-3" />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="maxCustomAmount" className="text-right">Max Amount</Label>
                                        <Input id="maxCustomAmount" type="number" {...register("maxCustomAmount")} className="col-span-3" />
                                    </div>
                                </>
                            )}
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={isUploading || createTemplate.isPending || updateTemplate.isPending} className="bg-orange-600 hover:bg-orange-700">
                                {(isUploading || createTemplate.isPending || updateTemplate.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingTemplate ? 'Save Changes' : 'Create Template'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GiftCardTemplatesPage;