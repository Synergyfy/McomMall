'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { useGetTiers, useCreateTier, useUpdateTier, useDeleteTier } from '@/service/tiers/hook';
import { Tier, CreateTierInput, UpdateTierInput, TierType } from '@/app/admin/types/tier';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { TierForm } from './components/TierForm';
import { TierTypeModal } from './components/TierTypeModal';


function TiersContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: tiers, isLoading } = useGetTiers();

    const createTierMutation = useCreateTier();
    const updateTierMutation = useUpdateTier();
    const deleteTierMutation = useDeleteTier();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [selectedTier, setSelectedTier] = useState<Tier | undefined>(undefined);
    const [creationDefaults, setCreationDefaults] = useState<Partial<Tier> | undefined>(undefined);
    const [tierToDelete, setTierToDelete] = useState<string | null>(null);

    useEffect(() => {
        const type = searchParams.get('type');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        if (type === 'seasonal' && startDate && endDate) {
            setCreationDefaults({
                startDate,
                endDate,
                name: 'Seasonal Tier',
                type: TierType.SEASONAL,
            });
            setIsDialogOpen(true);
            // Clear params from URL without refreshing
            router.replace('/admin/tiers');
        }
    }, [searchParams, router]);



    const handleCreate = () => {
        setIsTypeModalOpen(true);
    };

    const handleSelectStandard = () => {
        setSelectedTier(undefined);
        setCreationDefaults({ type: TierType.STANDARD });
        setIsTypeModalOpen(false);
        setIsDialogOpen(true);
    };

    const handleSelectTrial = () => {
        setSelectedTier(undefined);
        setCreationDefaults({
            type: TierType.TRIAL,
            name: 'Free Trial',
            trialDuration: 14,
            monthlyPrice: 0,
            quarterlyPrice: 0,
            annualPrice: 0,
            isActive: true,
        });
        setIsTypeModalOpen(false);
        setIsDialogOpen(true);
    };



    const handleEdit = (tier: Tier) => {
        setSelectedTier(tier);
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (id: string) => {
        setTierToDelete(id);
    };

    const handleConfirmDelete = async () => {
        if (tierToDelete) {
            await deleteTierMutation.mutateAsync(tierToDelete);
            setTierToDelete(null);
        }
    };

    const handleSubmit = async (data: CreateTierInput | UpdateTierInput) => {
        if (selectedTier) {
            await updateTierMutation.mutateAsync({ id: selectedTier.id, data });
        } else {
            await createTierMutation.mutateAsync(data as CreateTierInput);
        }
        setIsDialogOpen(false);
    };

    const isSubmitting = createTierMutation.isPending || updateTierMutation.isPending;
    const formId = "tier-management-form";

    if (isLoading) {
        return <div className="p-8 text-center">Loading tiers...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Subscription Tiers</h1>
                    <p className="text-slate-500">Manage pricing plans and feature limits for businesses.</p>
                </div>
                <Button onClick={handleCreate} className="gap-2">
                    <Plus className="h-4 w-4" /> Create Tier
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {tiers?.map((tier) => (
                    <Card key={tier.id} className="flex flex-col relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                        {tier.isActive ? (
                            <div className="absolute top-0 right-0 p-4">
                                <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>
                            </div>
                        ) : (
                            <div className="absolute top-0 right-0 p-4">
                                <Badge variant="secondary">Inactive</Badge>
                            </div>
                        )}

                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                {tier.name}
                                {tier.type === TierType.TRIAL && <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">Trial</Badge>}
                                {tier.type === TierType.SEASONAL && <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Seasonal</Badge>}
                            </CardTitle>
                            <CardDescription className="line-clamp-2 min-h-[40px]">
                                {tier.description}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="flex-1 space-y-4">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold">£{tier.monthlyPrice}</span>
                                <span className="text-slate-500">/month</span>
                            </div>
                            <div className="text-sm text-slate-500">
                                or £{tier.annualPrice}/year
                            </div>

                            <div className="space-y-2 pt-4 border-t">
                                <div className="text-sm font-medium">Key Limits:</div>
                                <ul className="text-sm space-y-1 text-slate-600">
                                    <li className="flex justify-between">
                                        <span>Listings</span>
                                        <span className="font-medium">{tier.configuration.quotas.maxListings}</span>
                                    </li>
                                    <li className="flex justify-between">
                                        <span>Products/Services</span>
                                        <span className="font-medium">
                                            {tier.configuration.quotas.maxProducts} / {tier.configuration.quotas.maxServices}
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-end gap-2 pt-4 border-t bg-slate-50/50">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(tier)}>
                                <Pencil className="h-4 w-4 mr-2" /> Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteClick(tier.id)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>{selectedTier ? 'Edit Tier' : 'Create New Tier'}</DialogTitle>
                        <DialogDescription>
                            Configure the pricing, quotas, and feature flags for this subscription tier.
                        </DialogDescription>
                    </DialogHeader>

                    <TierForm
                        formId={formId}
                        initialData={selectedTier || (creationDefaults as Tier)}
                        onSubmit={handleSubmit}
                    />


                    <DialogFooter className="mt-auto border-t pt-4">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" form={formId} disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : selectedTier ? 'Update Tier' : 'Create Tier'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!tierToDelete} onOpenChange={(open) => !open && setTierToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the tier.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <TierTypeModal
                open={isTypeModalOpen}
                onOpenChange={setIsTypeModalOpen}
                onSelectStandard={handleSelectStandard}
                onSelectTrial={handleSelectTrial}
            />
        </div>

    );
}

export default function TiersPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <TiersContent />
        </Suspense>
    );
}
