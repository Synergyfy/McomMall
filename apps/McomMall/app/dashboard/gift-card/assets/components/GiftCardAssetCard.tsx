import React from 'react';
import { GiftCardAsset } from '@/service/gift-card/asset-types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Pencil, Trash2, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
    asset: GiftCardAsset;
    onEdit: (asset: GiftCardAsset) => void;
    onDelete: (id: string) => void;
    isDeleting: boolean;
}

const GoldenRibbon = () => (
    <div className="absolute bottom-[35%] left-0 w-full h-2.5 z-10">
        <div className="w-full h-full bg-gradient-to-b from-amber-300 via-yellow-500 to-amber-600 shadow-sm" />
    </div>
);

const GoldenBow = () => (
    <div className="absolute bottom-[35%] left-1/2 -translate-x-1/2 -translate-y-[calc(50%-5px)] z-20 scale-75">
        <div className="relative w-12 h-8 flex items-center justify-center">
            <div className="absolute -left-1.5 w-6 h-6 border-[2px] border-yellow-500 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 rotate-[-15deg] shadow-md" />
            <div className="absolute -right-1.5 w-6 h-6 border-[2px] border-yellow-500 rounded-full bg-gradient-to-bl from-amber-400 to-yellow-600 rotate-[15deg] shadow-md" />
            <div className="relative w-3 h-3 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-yellow-600 border border-yellow-200 z-10 shadow-lg" />
        </div>
    </div>
);

export const GiftCardAssetCard: React.FC<Props> = ({ asset, onEdit, onDelete, isDeleting }) => {
    return (
        <div className="group relative w-full rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 bg-white flex flex-col">

            {/* Gift Card Visual Area */}
            <div className="relative p-4 bg-gray-50/50 overflow-hidden">
                <div className="w-full h-40 rounded-xl shadow-md relative overflow-hidden bg-zinc-900">
                    {/* Background Image */}
                    <img
                        src={asset.url}
                        alt={asset.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Premium Overlays */}
                    <GoldenRibbon />
                    <GoldenBow />

                    {/* Content Overlay */}
                    <div className="absolute inset-0 z-20 flex flex-col justify-between p-4">
                        <div className="flex justify-between items-start">
                            <h4 className="text-[10px] font-black text-yellow-500 italic uppercase tracking-tighter">PREMIUM <span className="text-yellow-400">ASSET</span></h4>
                            <Sparkles className="w-3.5 h-3.5 text-yellow-400 opacity-60" />
                        </div>

                        <div className="mt-auto">
                            <p className="text-white text-sm font-black uppercase tracking-widest drop-shadow-md truncate">
                                {asset.name}
                            </p>
                        </div>
                    </div>

                    {/* Glare effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" />
                </div>

                {/* Status Badge */}
                <Badge className="absolute top-1.5 left-1.5 bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-0 shadow-md z-10 px-2 py-0.5 text-[10px]">
                    <Gift className="w-3 h-3 mr-1" />
                    ASSET
                </Badge>
            </div>

            {/* Actions & Details */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex flex-wrap gap-1 mb-4">
                    {asset.categories?.map((category) => (
                        <Badge key={category.id} variant="secondary" className="text-[10px] px-2 py-0">
                            {category.name}
                        </Badge>
                    ))}
                    {asset.categories?.length === 0 && (
                        <span className="text-[10px] text-muted-foreground italic">No Category</span>
                    )}
                </div>

                <div className="mt-auto flex justify-end gap-2 border-t pt-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(asset)}
                        className="h-8 text-xs font-bold rounded-lg border-gray-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-colors"
                    >
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Edit
                    </Button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isDeleting}
                                className="h-8 text-xs font-bold rounded-lg border-gray-200 text-red-500 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
                            >
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="rounded-2xl">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="font-bold">Delete Asset?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to remove <span className="font-bold text-gray-900">"{asset.name}"</span>? This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => onDelete(asset.id)}
                                    className="bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
};
