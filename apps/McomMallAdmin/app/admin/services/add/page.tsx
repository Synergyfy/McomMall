'use client';

import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useCreateAdminService } from '@/service/services/hook';
import { useGetAdminBusinesses } from '@/service/admin/hook';

interface ServiceFormValues {
    name: string;
    description: string;
    price: number;
    duration: number;
    category: string;
    businessId: string;
    status: 'active' | 'inactive';
}

export default function AddServicePage() {
    const router = useRouter();
    const createService = useCreateAdminService();
    const { data: businessesData, isLoading: businessesLoading } = useGetAdminBusinesses({
        page: 1,
        limit: 50,
    });

    const methods = useForm<ServiceFormValues>({
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            duration: 60,
            category: '',
            businessId: '',
            status: 'active',
        },
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = methods;

    const onSubmit = (data: ServiceFormValues) => {
        createService.mutate(
            {
                name: data.name.trim(),
                businessId: data.businessId,
                description: data.description || undefined,
                category: data.category || undefined,
                fixedPrice: Number(data.price) || 0,
                duration: Number(data.duration) || 0,
                status: data.status,
            },
            { onSuccess: () => router.push('/admin/services') },
        );
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Add New Service</h1>
                    <p className="text-slate-500">Creates a live service via POST /admin/services.</p>
                </div>
                <Button variant="outline" onClick={() => router.push('/admin/services')}>
                    Cancel
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Service Details</CardTitle>
                    <CardDescription>Enter the details for the new service.</CardDescription>
                </CardHeader>
                <CardContent>
                    <FormProvider {...methods}>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="businessId">Business *</Label>
                                <Select
                                    value={watch('businessId')}
                                    onValueChange={(val) => setValue('businessId', val, { shouldValidate: true })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={businessesLoading ? 'Loading businesses…' : 'Select business'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(businessesData?.data ?? []).map((b) => (
                                            <SelectItem key={b.id} value={b.id}>
                                                {b.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input
                                    type="hidden"
                                    {...register('businessId', { required: 'Business is required' })}
                                />
                                {errors.businessId && (
                                    <p className="text-xs text-red-600">{errors.businessId.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Service Name *</Label>
                                <Input
                                    id="name"
                                    {...register('name', { required: 'Service name is required' })}
                                    placeholder="e.g. Full Body Massage"
                                />
                                {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    {...register('description')}
                                    placeholder="Describe the service..."
                                    rows={4}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (£)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        {...register('price', { valueAsNumber: true })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration (minutes)</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        min="0"
                                        {...register('duration', { valueAsNumber: true })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select onValueChange={(val) => setValue('category', val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Spa">Spa</SelectItem>
                                            <SelectItem value="Auto Services">Auto Services</SelectItem>
                                            <SelectItem value="Tech Services">Tech Services</SelectItem>
                                            <SelectItem value="Cleaning">Cleaning</SelectItem>
                                            <SelectItem value="Education">Education</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        onValueChange={(val) => setValue('status', val as 'active' | 'inactive')}
                                        defaultValue="active"
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    type="submit"
                                    className="bg-orange-500 hover:bg-orange-600"
                                    disabled={createService.isPending}
                                >
                                    {createService.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                    Create Service
                                </Button>
                            </div>
                        </form>
                    </FormProvider>
                </CardContent>
            </Card>
        </div>
    );
}
