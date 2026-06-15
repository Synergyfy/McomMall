'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
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
                    <Card key={tier.id} className="flex flex-col relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 shadow-sm">
                        <div className={cn(
                            "absolute top-0 left-0 w-full h-1.5",
                            tier.type === TierType.TRIAL ? "bg-purple-500" :
                                tier.type === TierType.SEASONAL ? "bg-blue-500" :
                                    tier.name.toLowerCase().includes('platinum') ? "bg-slate-900" :
                                        tier.name.toLowerCase().includes('gold') ? "bg-yellow-400" :
                                            tier.name.toLowerCase().includes('silver') ? "bg-slate-400" :
                                                "bg-amber-700"
                        )} />

                        <div className="absolute top-4 right-4 z-10">
                            {tier.isActive ? (
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                                    Active
                                </Badge>
                            ) : (
                                <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-100">
                                    Inactive
                                </Badge>
                            )}
                        </div>

                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2 mb-1">
                                <CardTitle className="text-2xl font-bold text-slate-900">
                                    {tier.name}
                                </CardTitle>
                                {tier.type === TierType.TRIAL && (
                                    <Badge variant="outline" className="text-purple-600 border-purple-200 bg-purple-50">Trial</Badge>
                                )}
                                {tier.type === TierType.SEASONAL && (
                                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Seasonal</Badge>
                                )}
                            </div>
                            <CardDescription className="text-slate-500 line-clamp-2 min-h-[40px] text-sm">
                                {tier.description}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="flex-1 space-y-6">
                            <div className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-slate-900">£{tier.monthlyPrice}</span>
                                    <span className="text-slate-500 font-medium">/mo</span>
                                </div>
                                <div className="text-xs text-slate-400 mt-1 font-medium">
                                    or £{tier.annualPrice} billed annually
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Plan Limits</div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500">Listings</p>
                                        <p className="text-sm font-bold text-slate-900">{tier.configuration.quotas.maxListings}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500">Products</p>
                                        <p className="text-sm font-bold text-slate-900">{tier.configuration.quotas.maxProducts}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500">Services</p>
                                        <p className="text-sm font-bold text-slate-900">{tier.configuration.quotas.maxServices}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500">Team Size</p>
                                        <p className="text-sm font-bold text-slate-900">{tier.configuration.quotas.maxTeamMembers || 'Unlimited'}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-between items-center gap-2 pt-4 border-t bg-slate-50/30">
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(tier)} className="h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-white shadow-sm border border-transparent hover:border-slate-200 transition-all">
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 shadow-sm border border-transparent hover:border-red-100 transition-all" onClick={() => handleDeleteClick(tier.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(tier)} className="text-xs font-semibold h-9 px-4 rounded-lg bg-white shadow-sm border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all">
                                Manage Plan
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
