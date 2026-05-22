'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBanners, createBanner, updateBanner, deleteBanner } from '@/service/marketplace';
import { MarketplaceBanner, CreateBannerDTO } from '@/app/admin/marketplace/types';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/ui/image-upload';
import { Plus, Edit, Trash2, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

// --- Banner Dialog ---

interface BannerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    banner?: MarketplaceBanner;
    onSubmit: (data: CreateBannerDTO) => void;
    isLoading?: boolean;
}

function BannerDialog({ open, onOpenChange, banner, onSubmit, isLoading }: BannerDialogProps) {
    const isEdit = !!banner;
    const [formData, setFormData] = useState<CreateBannerDTO>({
        imageUrl: banner?.imageUrl || '',
        title: banner?.title || '',
        link: banner?.link || '',
        type: banner?.type || 'hero_slide',
        displayOrder: banner?.displayOrder || 0,
        isActive: banner?.isActive ?? true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg flex flex-col max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Banner' : 'Create Banner'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update banner details' : 'Add a new banner to the marketplace'}
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto pr-2 -mr-2 flex-1">
                    <form id="banner-form" onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Banner Image</Label>
                            <img Upload value={formData.imageUrl} onChange={(url) => setFormData({ ...formData, imageUrl: url })} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Summer Sale"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val: 'hero_slide' | 'sidebar_banner') =>
                                        setFormData({ ...formData, type: val })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hero_slide">Hero Slide</SelectItem>
                                        <SelectItem value="sidebar_banner">Sidebar Banner</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Link URL</Label>
                            <Input
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                placeholder="e.g., /search?tag=summer"
                            />
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
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                                <Label>Active Status</Label>
                            </div>
                        </div>
                    </form>
                </div>

                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} type="button">
                        Cancel
                    </Button>
                    <Button type="submit" form="banner-form" disabled={isLoading} className="bg-orange-500 hover:bg-orange-600">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? 'Save Changes' : 'Create Banner'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// --- Main Component ---

export function BannerTab() {
    const queryClient = useQueryClient();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<MarketplaceBanner | undefined>();

    const { data: banners = [], isLoading } = useQuery({
        queryKey: ['marketplace-banners'],
        queryFn: getBanners,
    });

    const createMutation = useMutation({
        mutationFn: createBanner,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['marketplace-banners'] });
            setDialogOpen(false);
            toast.success('Banner created successfully');
        },
        onError: () => toast.error('Failed to create banner'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: CreateBannerDTO }) => updateBanner(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['marketplace-banners'] });
            setDialogOpen(false);
            toast.success('Banner updated successfully');
        },
        onError: () => toast.error('Failed to update banner'),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteBanner,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['marketplace-banners'] });
            toast.success('Banner deleted successfully');
        },
        onError: () => toast.error('Failed to delete banner'),
    });

    const handleCreate = () => {
        setEditingBanner(undefined);
        setDialogOpen(true);
    };

    const handleEdit = (banner: MarketplaceBanner) => {
        setEditingBanner(banner);
        setDialogOpen(true);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this banner?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleSubmit = (data: CreateBannerDTO) => {
        if (editingBanner) {
            updateMutation.mutate({ id: editingBanner.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading banners...</div>;
    }

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b flex justify-between items-center bg-white">
                <h3 className="font-semibold text-lg">Banners</h3>
                <Button onClick={handleCreate} className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="mr-2 h-4 w-4" /> Add Banner
                </Button>
            </div>

            <div className="flex-1 overflow-auto p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Image</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Link</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {banners.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                    No banners found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            banners.map((banner) => (
                                <TableRow key={banner.id}>
                                    <TableCell>
                                        <div className="w-16 h-10 rounded overflow-hidden bg-slate-100">
                                            {banner.imageUrl ? (
                                                <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Img</div>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{banner.title}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {banner.type.replace('_', ' ')}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {banner.link && (
                                            <a href={banner.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 text-xs">
                                                Link <ExternalLink className="h-3 w-3" />
                                            </a>
                                        )}
                                    </TableCell>
                                    <TableCell>{banner.displayOrder}</TableCell>
                                    <TableCell>
                                        <Badge variant={banner.isActive ? 'default' : 'secondary'} className={banner.isActive ? 'bg-green-500' : ''}>
                                            {banner.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                                                <Edit className="h-4 w-4 text-slate-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {dialogOpen && (
                <BannerDialog
                    key={editingBanner?.id || 'create'}
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    banner={editingBanner}
                    onSubmit={handleSubmit}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                />
            )}
        </div>
    );
}
