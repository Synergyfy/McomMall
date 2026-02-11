'use client';

import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function AddServicePage() {
    const router = useRouter();
    const methods = useForm({
        defaultValues: {
            name: '',
            description: '',
            price: 0,
            duration: 60,
            category: '',
            businessName: '',
            businessId: '',
            images: [],
            status: 'active'
        }
    });

    const onSubmit = (data: any) => {
        console.log('Final Service Data:', data);
        toast.success('Service created successfully!');
        router.push('/admin/services');
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Add New Service</h1>
                    <p className="text-slate-500">Create a new service offering.</p>
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
                        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Service Name</Label>
                                <Input id="name" {...methods.register('name')} placeholder="e.g. Full Body Massage" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" {...methods.register('description')} placeholder="Describe the service..." rows={4} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (£)</Label>
                                    <Input id="price" type="number" step="0.01" {...methods.register('price')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration (minutes)</Label>
                                    <Input id="duration" type="number" {...methods.register('duration')} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Category</Label>
                                    <Select onValueChange={(val) => methods.setValue('category', val)}>
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
                                    <Select onValueChange={(val) => methods.setValue('status', val)} defaultValue="active">
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="businessName">Business Name</Label>
                                    <Input id="businessName" {...methods.register('businessName')} placeholder="Provider Name" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="businessId">Business ID (Optional)</Label>
                                    <Input id="businessId" {...methods.register('businessId')} placeholder="Provider ID" />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" className="bg-orange-500 hover:bg-orange-600">Create Service</Button>
                            </div>
                        </form>
                    </FormProvider>
                </CardContent>
            </Card>
        </div>
    );
}
