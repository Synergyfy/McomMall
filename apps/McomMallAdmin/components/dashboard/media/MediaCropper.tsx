'use client';
import React, { useState, useCallback } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

interface MediaCropperProps {
    isOpen: boolean;
    onClose: () => void;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    onCropSave: (croppedFile: File) => void;
    aspect?: number;
}

const MediaCropper: React.FC<MediaCropperProps> = ({
    isOpen,
    onClose,
    mediaUrl,
    mediaType,
    onCropSave,
    aspect = 4 / 3,
}) => {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const onCropChange = (crop: Point) => {
        setCrop(crop);
    };

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area
    ): Promise<File | null> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return null;
        }

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'));
                    return;
                }
                const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
                resolve(file);
            }, 'image/jpeg');
        });
    };

    const handleSave = async () => {
        if (mediaType === 'image' && croppedAreaPixels) {
            try {
                const croppedFile = await getCroppedImg(mediaUrl, croppedAreaPixels);
                if (croppedFile) {
                    onCropSave(croppedFile);
                    onClose();
                }
            } catch (e) {
                console.error(e);
            }
        } else {
            // For video, we might just return the original or implement spatial crop coordinates
            // Since browser-side video cropping is complex, we'll just close for now
            // or handle it with better tools if needed.
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Crop Your {mediaType === 'image' ? 'Image' : 'Video'}</DialogTitle>
                </DialogHeader>
                <div className="relative flex-grow bg-slate-100 rounded-md overflow-hidden">
                    <Cropper
                        image={mediaType === 'image' ? mediaUrl : undefined}
                        video={mediaType === 'video' ? mediaUrl : undefined}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                </div>
                <div className="py-4 space-y-2">
                    <p className="text-sm text-muted-foreground text-center">Zoom</p>
                    <Slider
                        value={[zoom]}
                        min={1}
                        max={3}
                        step={0.1}
                        onValueChange={(value) => onZoomChange(value[0])}
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 text-white">
                        Save Crop
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MediaCropper;
