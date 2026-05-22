'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Image as ImageIcon, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Upload failed');
            }

            const data = await res.json();
            // Cloudinary returns 'secure_url'
            onChange(data.secure_url || data.url);
            toast.success('Image uploaded successfully');
        } catch (error: any) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to upload image');
        } finally {
            setIsUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleRemove = () => {
        onChange('');
    };

    return (
        <div className="space-y-4 w-full">
            <div className="flex items-center gap-4">
                {value ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 group">
                        <img
                            src={value}
                            alt="Upload preview"
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={handleRemove}
                            type="button"
                            disabled={disabled}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <div className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 text-slate-400">
                        <img Icon />
                    </div>
                )}

                <div className="flex-1 space-y-2">
                    <Label htmlFor="image-upload" className="cursor-pointer">
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="secondary"
                                disabled={disabled || isUploading}
                                className="pointer-events-none" // The label triggers the input
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    'Upload Image'
                                )}
                            </Button>
                        </div>
                    </Label>
                    <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={disabled || isUploading}
                    />
                    <p className="text-xs text-slate-500">
                        Max 5MB. Formats: JPG, PNG, WEBP.
                    </p>
                </div>
            </div>
            {/* Fallback text input for manual URL entry if needed */}
            <div className="flex gap-2">
                 <Input
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Or enter image URL..."
                    disabled={disabled}
                    className="text-xs h-8"
                />
            </div>
        </div>
    );
}
