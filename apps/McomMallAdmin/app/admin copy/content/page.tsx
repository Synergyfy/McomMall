'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
    Plus,
    Edit,
    Trash2,
    FolderTree,
    Image as ImageIcon,
    FileText,
    LayoutGrid,
    ChevronRight,
    GripVertical,
    Layers,
    ArrowRight,
    AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    fetchSectors,
    createSector,
    updateSector,
    deleteSector,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
} from './api';
import { Sector, Category, Subcategory } from '@/app/admin/types';
import { ImageUpload } from '@/components/ui/image-upload';

// --- Dialog Components ---

interface SectorFormData {
    name: string;
    description: string;
    image: string;
}

function SectorDialog({
    open,
    onOpenChange,
    sector,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sector?: Sector;
    onSubmit: (data: SectorFormData) => void;
}) {
    const isEdit = !!sector;
    const [formData, setFormData] = useState({
        name: sector?.name || '',
        description: sector?.shortDescription || '',
        image: sector?.icon || '',
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Sector' : 'Create Sector'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update sector details' : 'Add a new sector to the platform'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Food & Beverage"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Image</Label>
                        <ImageUpload
                            value={formData.image}
                            onChange={(url) => setFormData({ ...formData, image: url })}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={() => onSubmit(formData)}
                    >
                        {isEdit ? 'Save Changes' : 'Create Sector'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface CategoryFormData {
    name: string;
    description: string;
    image: string;
}

function CategoryDialog({
    open,
    onOpenChange,
    category,
    sectorName,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: Category;
    sectorName: string;
    onSubmit: (data: CategoryFormData) => void;
}) {
    const isEdit = !!category;
    const [formData, setFormData] = useState({
        name: category?.name || '',
        description: category?.shortDescription || '',
        image: category?.image || '',
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Category' : 'Create Category'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update category details' : `Add a new category to ${sectorName}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Restaurants"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Image</Label>
                        <ImageUpload
                            value={formData.image}
                            onChange={(url) => setFormData({ ...formData, image: url })}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={() => onSubmit(formData)}
                    >
                        {isEdit ? 'Save Changes' : 'Create Category'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface SubcategoryFormData {
    name: string;
    description: string;
    image: string;
}

function SubcategoryDialog({
    open,
    onOpenChange,
    subcategory,
    categoryName,
    onSubmit,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subcategory?: Subcategory;
    categoryName: string;
    onSubmit: (data: SubcategoryFormData) => void;
}) {
    const isEdit = !!subcategory;
    const [formData, setFormData] = useState({
        name: subcategory?.name || '',
        description: subcategory?.description || '',
        image: subcategory?.image || '',
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Subcategory' : 'Create Subcategory'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update subcategory details' : `Add a new subcategory to ${categoryName}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Italian"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Image</Label>
                        <ImageUpload
                            value={formData.image}
                            onChange={(url) => setFormData({ ...formData, image: url })}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={() => onSubmit(formData)}
                    >
                        {isEdit ? 'Save Changes' : 'Create Subcategory'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ContentPage() {
    const [activeTab, setActiveTab] = useState('sectors');
    const queryClient = useQueryClient();

    // Selection State
    const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

    // Dialog State
    const [sectorDialogOpen, setSectorDialogOpen] = useState(false);
    const [editingSector, setEditingSector] = useState<Sector | undefined>();

    const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | undefined>();

    const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
    const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | undefined>();

    // --- Data Queries ---
    const { data: sectors = [], isLoading: isLoadingSectors } = useQuery({
        queryKey: ['sectors'],
        queryFn: fetchSectors,
    });

    const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
    });

    const { data: subcategories = [], isLoading: isLoadingSubcategories } = useQuery({
        queryKey: ['subcategories', selectedCategoryId],
        queryFn: () => fetchSubcategories(selectedCategoryId!),
        enabled: !!selectedCategoryId,
    });

    // Derived Data
    const selectedSector = sectors.find(s => s.id === selectedSectorId);
    const selectedCategory = categories.find(c => c.id === selectedCategoryId);

    const sectorCategories = categories.filter(c => c.sectorId === selectedSectorId);
    // No longer need to filter locally since we fetch by category ID
    const categorySubcategories = subcategories;

    // --- Mutations ---

    // Sector Mutations
    const createSectorMutation = useMutation({
        mutationFn: createSector,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sectors'] });
            setSectorDialogOpen(false);
            toast.success('Sector created successfully');
        },
        onError: () => toast.error('Failed to create sector'),
    });

    const updateSectorMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { name: string; image?: string; description?: string } }) => updateSector(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sectors'] });
            setSectorDialogOpen(false);
            toast.success('Sector updated successfully');
        },
        onError: () => toast.error('Failed to update sector'),
    });

    const deleteSectorMutation = useMutation({
        mutationFn: deleteSector,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sectors'] });
            if (selectedSectorId === editingSector?.id) setSelectedSectorId(null);
            toast.success('Sector deleted successfully');
        },
        onError: () => toast.error('Failed to delete sector'),
    });

    // Category Mutations
    const createCategoryMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['sectors'] }); // Update counts
            setCategoryDialogOpen(false);
            toast.success('Category created successfully');
        },
        onError: () => toast.error('Failed to create category'),
    });

    const updateCategoryMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { name: string; sectorId: string; image?: string; description?: string } }) => updateCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setCategoryDialogOpen(false);
            toast.success('Category updated successfully');
        },
        onError: () => toast.error('Failed to update category'),
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            queryClient.invalidateQueries({ queryKey: ['sectors'] });
            if (selectedCategoryId === editingCategory?.id) setSelectedCategoryId(null);
            toast.success('Category deleted successfully');
        },
        onError: () => toast.error('Failed to delete category'),
    });

    // Subcategory Mutations
    const createSubcategoryMutation = useMutation({
        mutationFn: createSubcategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subcategories', selectedCategoryId] });
            queryClient.invalidateQueries({ queryKey: ['categories'] }); // Update counts
            setSubcategoryDialogOpen(false);
            toast.success('Subcategory created successfully');
        },
        onError: () => toast.error('Failed to create subcategory'),
    });

    const updateSubcategoryMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: { name: string; categoryId: string; image?: string; description?: string } }) => updateSubcategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subcategories', selectedCategoryId] });
            setSubcategoryDialogOpen(false);
            toast.success('Subcategory updated successfully');
        },
        onError: () => toast.error('Failed to update subcategory'),
    });

    const deleteSubcategoryMutation = useMutation({
        mutationFn: deleteSubcategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['subcategories', selectedCategoryId] });
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            toast.success('Subcategory deleted successfully');
        },
        onError: () => toast.error('Failed to delete subcategory'),
    });


    // --- Handlers ---

    const handleSectorSubmit = (data: SectorFormData) => {
        if (editingSector) {
            updateSectorMutation.mutate({ id: editingSector.id, data });
        } else {
            createSectorMutation.mutate(data);
        }
    };

    const handleCategorySubmit = (data: CategoryFormData) => {
        if (editingCategory) {
            updateCategoryMutation.mutate({
                id: editingCategory.id,
                data: { ...data, sectorId: editingCategory.sectorId }
            });
        } else if (selectedSectorId) {
            createCategoryMutation.mutate({
                ...data,
                sectorId: selectedSectorId
            });
        }
    };

    const handleSubcategorySubmit = (data: SubcategoryFormData) => {
        if (editingSubcategory) {
            updateSubcategoryMutation.mutate({
                id: editingSubcategory.id,
                data: { ...data, categoryId: editingSubcategory.categoryId }
            });
        } else if (selectedCategoryId) {
            createSubcategoryMutation.mutate({
                ...data,
                categoryId: selectedCategoryId
            });
        }
    };


    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Content Taxonomy</h1>
                    <p className="text-slate-500">Manage sectors, categories, and subcategories</p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex flex-shrink-0">
                    <TabsTrigger value="sectors" className="gap-2">
                        <FolderTree className="h-4 w-4" />
                        <span className="hidden sm:inline">Taxonomy</span>
                    </TabsTrigger>
                    {/* Other tabs placeholders */}
                    <TabsTrigger value="pages" className="gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">Pages</span>
                    </TabsTrigger>
                    <TabsTrigger value="banners" className="gap-2">
                        <ImageIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Banners</span>
                    </TabsTrigger>
                    <TabsTrigger value="faqs" className="gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        <span className="hidden sm:inline">FAQs</span>
                    </TabsTrigger>
                </TabsList>

                {/* Sectors & Categories & Subcategories View */}
                <TabsContent value="sectors" className="flex-1 overflow-hidden mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">

                        {/* Column 1: Sectors */}
                        <Card className="flex flex-col border-0 shadow-sm h-full overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0 bg-white z-10 border-b">
                                <div>
                                    <CardTitle className="text-base font-semibold">Sectors</CardTitle>
                                    <CardDescription className="text-xs">{sectors.length} items</CardDescription>
                                </div>
                                <Button
                                    size="sm"
                                    className="h-8 w-8 p-0 bg-orange-500 hover:bg-orange-600"
                                    onClick={() => {
                                        setEditingSector(undefined);
                                        setSectorDialogOpen(true);
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/50">
                                {sectors.map((sector) => (
                                    <div
                                        key={sector.id}
                                        onClick={() => {
                                            setSelectedSectorId(sector.id);
                                            setSelectedCategoryId(null); // Reset category when sector changes
                                        }}
                                        className={cn(
                                            "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border",
                                            selectedSectorId === sector.id
                                                ? "bg-white border-orange-500 shadow-sm"
                                                : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                                        )}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {sector.icon && <img src={sector.icon} alt="" className="w-8 h-8 rounded bg-slate-100 object-cover" />}
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm text-slate-900 truncate">{sector.name}</p>
                                                <p className="text-xs text-slate-500 truncate">{sector.categoryCount} categories</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {selectedSectorId === sector.id && (
                                                <ChevronRight className="h-4 w-4 text-orange-500" />
                                            )}
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingSector(sector);
                                                        setSectorDialogOpen(true);
                                                    }}
                                                >
                                                    <Edit className="h-3 w-3 text-slate-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 hover:bg-red-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm('Delete this sector?')) deleteSectorMutation.mutate(sector.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Column 2: Categories */}
                        <Card className="flex flex-col border-0 shadow-sm h-full overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0 bg-white z-10 border-b">
                                <div>
                                    <CardTitle className="text-base font-semibold">Categories</CardTitle>
                                    <CardDescription className="text-xs">
                                        {selectedSector ? `In ${selectedSector.name}` : 'Select a sector'}
                                    </CardDescription>
                                </div>
                                <Button
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={!selectedSectorId}
                                    variant="outline"
                                    onClick={() => {
                                        setEditingCategory(undefined);
                                        setCategoryDialogOpen(true);
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/50">
                                {!selectedSectorId ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <ArrowRight className="h-8 w-8 mb-2 opacity-50" />
                                        <p className="text-sm">Select a sector</p>
                                    </div>
                                ) : sectorCategories.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <Layers className="h-8 w-8 mb-2 opacity-50" />
                                        <p className="text-sm">No categories</p>
                                    </div>
                                ) : (
                                    sectorCategories.map((category) => (
                                        <div
                                            key={category.id}
                                            onClick={() => setSelectedCategoryId(category.id)}
                                            className={cn(
                                                "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border",
                                                selectedCategoryId === category.id
                                                    ? "bg-white border-orange-500 shadow-sm"
                                                    : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200"
                                            )}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {category.image && <img src={category.image} alt="" className="w-8 h-8 rounded bg-slate-100 object-cover" />}
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm text-slate-900 truncate">{category.name}</p>
                                                    <p className="text-xs text-slate-500 truncate">{category.subcategoryCount} subcategories</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {selectedCategoryId === category.id && (
                                                    <ChevronRight className="h-4 w-4 text-orange-500" />
                                                )}
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingCategory(category);
                                                            setCategoryDialogOpen(true);
                                                        }}
                                                    >
                                                        <Edit className="h-3 w-3 text-slate-500" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 hover:bg-red-50"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm('Delete this category?')) deleteCategoryMutation.mutate(category.id);
                                                        }}
                                                    >
                                                        <Trash2 className="h-3 w-3 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* Column 3: Subcategories */}
                        <Card className="flex flex-col border-0 shadow-sm h-full overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-4 flex-shrink-0 bg-white z-10 border-b">
                                <div>
                                    <CardTitle className="text-base font-semibold">Subcategories</CardTitle>
                                    <CardDescription className="text-xs">
                                        {selectedCategory ? `In ${selectedCategory.name}` : 'Select a category'}
                                    </CardDescription>
                                </div>
                                <Button
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={!selectedCategoryId}
                                    variant="outline"
                                    onClick={() => {
                                        setEditingSubcategory(undefined);
                                        setSubcategoryDialogOpen(true);
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto p-2 space-y-2 bg-slate-50/50">
                                {!selectedCategoryId ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <ArrowRight className="h-8 w-8 mb-2 opacity-50" />
                                        <p className="text-sm">Select a category</p>
                                    </div>
                                ) : categorySubcategories.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                                        <Layers className="h-8 w-8 mb-2 opacity-50" />
                                        <p className="text-sm">No subcategories</p>
                                    </div>
                                ) : (
                                    categorySubcategories.map((sub) => (
                                        <div
                                            key={sub.id}
                                            className="group flex items-center justify-between p-3 rounded-lg bg-white border border-transparent hover:border-slate-200 shadow-sm"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <GripVertical className="h-4 w-4 text-slate-300 cursor-grab" />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-sm text-slate-900 truncate">{sub.name}</p>
                                                    <p className="text-xs text-slate-500 truncate">{sub.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => {
                                                        setEditingSubcategory(sub);
                                                        setSubcategoryDialogOpen(true);
                                                    }}
                                                >
                                                    <Edit className="h-3 w-3 text-slate-500" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 hover:bg-red-50"
                                                    onClick={() => {
                                                        if (confirm('Delete this subcategory?')) deleteSubcategoryMutation.mutate(sub.id);
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3 text-red-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                    </div>
                </TabsContent>

                {/* Other Tabs Content placeholders */}
                <TabsContent value="pages">
                    <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center text-slate-500">
                        Pages content not implemented in this task
                    </div>
                </TabsContent>
                <TabsContent value="banners">
                     <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center text-slate-500">
                        Banners content not implemented in this task
                    </div>
                </TabsContent>
                <TabsContent value="faqs">
                     <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center text-slate-500">
                        FAQs content not implemented in this task
                    </div>
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <SectorDialog
                open={sectorDialogOpen}
                onOpenChange={setSectorDialogOpen}
                sector={editingSector}
                onSubmit={handleSectorSubmit}
            />
            <CategoryDialog
                open={categoryDialogOpen}
                onOpenChange={setCategoryDialogOpen}
                category={editingCategory}
                sectorName={selectedSector?.name || ''}
                onSubmit={handleCategorySubmit}
            />
            <SubcategoryDialog
                open={subcategoryDialogOpen}
                onOpenChange={setSubcategoryDialogOpen}
                subcategory={editingSubcategory}
                categoryName={selectedCategory?.name || ''}
                onSubmit={handleSubcategorySubmit}
            />
        </div>
    );
}
