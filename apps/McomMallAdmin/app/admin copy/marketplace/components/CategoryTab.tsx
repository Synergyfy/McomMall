'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/service/marketplace';
import { MarketplaceCategory, CreateCategoryDTO } from '@/app/admin/marketplace/types';
import { fetchCategories as fetchTaxonomyCategories } from '@/app/admin/content/api';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Loader2, GripVertical, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

// --- Category Dialog ---

interface CategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: MarketplaceCategory;
    onSubmit: (data: CreateCategoryDTO) => void;
    isLoading?: boolean;
    taxonomyCategories: { id: string; name: string }[];
}

function CategoryDialog({ open, onOpenChange, category, onSubmit, isLoading, taxonomyCategories }: CategoryDialogProps) {
    const isEdit = !!category;
    const [formData, setFormData] = useState<CreateCategoryDTO>({
        name: category?.name || '',
        targetCategoryId: category?.targetCategoryId || '',
        iconName: category?.iconName || '',
        displayOrder: category?.displayOrder || 0,
        isVisible: category?.isVisible ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Category' : 'Create Sidebar Category'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update category details' : 'Add a new category to the marketplace sidebar'}
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto pr-2 -mr-2 flex-1">
                    <form id="category-form" onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Display Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Tech Deals"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Target Taxonomy Category</Label>
                            <Select
                                value={formData.targetCategoryId}
                                onValueChange={(val) => setFormData({ ...formData, targetCategoryId: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {taxonomyCategories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500">
                                This maps the sidebar item to a real product category in the system.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Icon Name (Lucide)</Label>
                            <Input
                                value={formData.iconName}
                                onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                                placeholder="e.g., Smartphone, Shirt, Home"
                            />
                            <p className="text-xs text-slate-500">
                                Enter the name of a Lucide React icon.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 items-center">
                            <div className="space-y-2">
                                <Label>Display Order</Label>
                                <Input
                                    type="number"
                                    value={formData.displayOrder}
                                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                                <Switch
                                    checked={formData.isVisible}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
                                />
                                <Label>Visible</Label>
                            </div>
                        </div>
                    </form>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
                        Cancel
                    </Button>
                    <Button type="submit" form="category-form" disabled={isLoading} className="bg-orange-500 hover:bg-orange-600">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? 'Save Changes' : 'Create Category'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- Main Component ---

export function CategoryTab() {
    const queryClient = useQueryClient();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<MarketplaceCategory | undefined>();

    const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
        queryKey: ['marketplace-categories'],
        queryFn: getCategories,
    });

    const { data: taxonomyCategories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchTaxonomyCategories,
    });

    const createMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['marketplace-categories'] });
            setDialogOpen(false);
            toast.success('Category created successfully');
        },
        onError: () => toast.error('Failed to create category'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateCategoryDTO }) => updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['marketplace-categories'] });
            setDialogOpen(false);
            toast.success('Category updated successfully');
        },
        onError: () => toast.error('Failed to update category'),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['marketplace-categories'] });
            toast.success('Category deleted successfully');
        },
        onError: () => toast.error('Failed to delete category'),
    });

    const handleCreate = () => {
        setEditingCategory(undefined);
        setDialogOpen(true);
    };

    const handleEdit = (category: MarketplaceCategory) => {
        setEditingCategory(category);
        setDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this category?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleSubmit = (data: CreateCategoryDTO) => {
        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    if (isLoadingCategories) {
        return <div className="p-8 text-center">Loading categories...</div>;
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-white">
                <h3 className="font-semibold text-lg">Sidebar Categories</h3>
                <Button onClick={handleCreate} className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
            </div>

            <div className="flex-1 overflow-auto p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Display Name</TableHead>
                            <TableHead>Target Category</TableHead>
                            <TableHead>Icon</TableHead>
                            <TableHead>Visible</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                    No categories found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category) => {
                                const targetName = taxonomyCategories.find(c => c.id === category.targetCategoryId)?.name || category.targetCategoryName || category.targetCategoryId;
                                return (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            <GripVertical className="h-4 w-4 text-slate-300 cursor-grab" />
                                        </TableCell>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 rounded-full bg-slate-100 text-xs text-slate-600">
                                                {targetName}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{category.iconName}</TableCell>
                                        <TableCell>
                                             {category.isVisible ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                             ) : (
                                                <XCircle className="h-4 w-4 text-slate-300" />
                                             )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                                                    <Edit className="h-4 w-4 text-slate-500" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {dialogOpen && (
                <CategoryDialog
                    key={editingCategory?.id || 'create'}
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    category={editingCategory}
                    onSubmit={handleSubmit}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                    taxonomyCategories={taxonomyCategories}
                />
            )}
        </div>
    );
}
