'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSections, updateSection } from '@/service/marketplace';
import { MarketplaceSection, UpdateSectionDTO } from '@/app/admin/marketplace/types';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Edit, Loader2, Code, ShoppingBag, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ProductSelector } from './ProductSelector';

// --- Section Dialog ---

interface SectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    section?: MarketplaceSection;
    onSubmit: (data: UpdateSectionDTO, type?: string) => void;
    isLoading?: boolean;
}

function SectionDialog({ open, onOpenChange, section, onSubmit, isLoading }: SectionDialogProps) {
    const isEditMode = !!section;
    const [selectedType, setSelectedType] = useState<string>(section?.type || '');

    // Resolve initial product IDs: use productIds if available, otherwise map from populated products
    const initialProductIds = section?.productIds ?? section?.products?.map((p: any) => p.id) ?? [];

    const [formData, setFormData] = useState<UpdateSectionDTO>({
        title: section?.title || '',
        isVisible: section?.isVisible ?? true,
        config: section?.config || {},
        productIds: initialProductIds,
    });

    const [jsonError, setJsonError] = useState<string | null>(null);
    const [configJson, setConfigJson] = useState(JSON.stringify(section?.config || {}, null, 2));

    const handleConfigChange = (value: string) => {
        setConfigJson(value);
        if (!value.trim()) {
            setFormData(prev => ({ ...prev, config: {} }));
            setJsonError(null);
            return;
        }
        try {
            const parsed = JSON.parse(value);
            setFormData(prev => ({ ...prev, config: parsed }));
            setJsonError(null);
        } catch (e) {
            setJsonError('Invalid JSON');
        }
    };

    const handleProductIdsChange = (ids: string[]) => {
        setFormData(prev => ({ ...prev, productIds: ids }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (jsonError) {
            toast.error('Please fix JSON errors');
            return;
        }
        if (!isEditMode && !selectedType) {
            toast.error('Please select a section type');
            return;
        }
        onSubmit(formData, selectedType);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Section Config' : 'Configure New Section'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? `Update configuration for ${section?.type} section` : 'Create or update configuration for a section type'}
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto pr-2 -mr-2 flex-1">
                    <form id="section-form" onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Section Type</Label>
                            <Select
                                disabled={isEditMode}
                                value={selectedType}
                                onValueChange={setSelectedType}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select section type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="featured_grid">Featured Grid</SelectItem>
                                    <SelectItem value="flash_sale">Flash Sale</SelectItem>
                                    <SelectItem value="promo_carousel">Promo Carousel</SelectItem>
                                </SelectContent>
                            </Select>
                            {!isEditMode && <p className="text-xs text-slate-500">Choose the type of section to configure.</p>}
                        </div>

                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Section Title"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2 pb-2">
                            <Switch
                                checked={formData.isVisible}
                                onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
                            />
                            <Label>Visible on Public Marketplace</Label>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <ShoppingBag className="h-4 w-4" /> Featured Products
                            </Label>
                            <ProductSelector
                                selectedIds={formData.productIds || []}
                                onChange={handleProductIdsChange}
                            />
                            <p className="text-xs text-slate-500">
                                Select products to display in this section.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="flex items-center gap-2">
                                    <Code className="h-4 w-4" /> Advanced Config (JSON)
                                </Label>
                                {jsonError && <span className="text-xs text-red-500">{jsonError}</span>}
                            </div>
                            <Textarea
                                value={configJson}
                                onChange={(e) => handleConfigChange(e.target.value)}
                                className="font-mono text-xs h-[150px]"
                            />
                        </div>
                    </form>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
                        Cancel
                    </Button>
                    <Button type="submit" form="section-form" disabled={isLoading || !!jsonError} className="bg-orange-500 hover:bg-orange-600">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- Main Component ---

export function SectionTab() {
    const queryClient = useQueryClient();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<MarketplaceSection | undefined>();

    const { data: sections = [], isLoading } = useQuery({
        queryKey: ['marketplace-sections'],
        queryFn: getSections,
    });

    const updateMutation = useMutation({
        mutationFn: ({ type, data }: { type: string; data: UpdateSectionDTO }) => updateSection(type, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['marketplace-sections'] });
            setDialogOpen(false);
            toast.success('Section updated successfully');
        },
        onError: () => toast.error('Failed to update section'),
    });

    const handleCreate = () => {
        setEditingSection(undefined);
        setDialogOpen(true);
    };

    const handleEdit = (section: MarketplaceSection) => {
        setEditingSection(section);
        setDialogOpen(true);
    };

    const handleSubmit = (data: UpdateSectionDTO, type?: string) => {
        const targetType = editingSection ? editingSection.type : type;
        if (targetType) {
            updateMutation.mutate({ type: targetType, data });
        } else {
            toast.error('Section type is missing');
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading sections...</div>;
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b bg-white flex justify-between items-center">
                <div>
                    <h3 className="font-semibold text-lg">Page Sections</h3>
                    <p className="text-sm text-slate-500">Configure the layout and visibility of marketplace sections</p>
                </div>
                <Button onClick={handleCreate} className="bg-orange-500 hover:bg-orange-600 gap-2">
                    <Plus className="h-4 w-4" /> Configure Section
                </Button>
            </div>

            <div className="flex-1 overflow-auto p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sections.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                    No sections found. Click "Configure Section" to add one.
                                </TableCell>
                            </TableRow>
                        ) : (
                            sections.map((section) => (
                                <TableRow key={section.type}>
                                    <TableCell className="font-medium capitalize">{section.type.replace(/_/g, ' ')}</TableCell>
                                    <TableCell>{section.title}</TableCell>
                                    <TableCell>{section.products?.length ?? section.productIds?.length ?? 0} items</TableCell>
                                    <TableCell>
                                        <Badge variant={section.isVisible ? 'default' : 'secondary'} className={section.isVisible ? 'bg-green-500' : ''}>
                                            {section.isVisible ? 'Visible' : 'Hidden'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(section)}>
                                            <Edit className="h-4 w-4 text-slate-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {dialogOpen && (
                <SectionDialog
                    key={editingSection ? editingSection.type : 'new'}
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    section={editingSection}
                    onSubmit={handleSubmit}
                    isLoading={updateMutation.isPending}
                />
            )}
        </div>
    );
}
