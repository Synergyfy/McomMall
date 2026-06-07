import React from 'react';
import {
    Bold,
    Italic,
    List,
    ListOrdered,
    Link as LinkIcon,
    CloudUpload,
    Pencil,
    Trash2,
    ArrowLeft,
    ArrowRight,
    Video,
    Crop,
    HelpCircle,
    FileDown,
    FileText
} from 'lucide-react';
import MediaCropper from '@/app/dashboard/add-listing/components/steps/shared/MediaCropper';
import { uploadFile } from '@/lib/upload';
import { toast } from 'sonner';

interface Step2Props {
    formData: any;
    updateFormData: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
    onSaveDraft: () => void;
}

export default function Step2MediaContent({ formData, updateFormData, onNext, onBack, onSaveDraft }: Step2Props) {
    const [croppingIndex, setCroppingIndex] = React.useState<{ index: number, type: 'image' | 'video' } | null>(null);
    const [isUploadingImage, setIsUploadingImage] = React.useState(false);
    const [isUploadingVideo, setIsUploadingVideo] = React.useState(false);
    const [isUploadingDigital, setIsUploadingDigital] = React.useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updateFormData({ [e.target.id]: e.target.value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setIsUploadingImage(true);
        try {
            const files = Array.from(e.target.files);
            const uploadPromises = files.map(file => uploadFile(file));
            const results = await Promise.all(uploadPromises);
            const newImages = results.map(r => r.secure_url);
            updateFormData({ images: [...(formData.images || []), ...newImages] });
            toast.success(`${newImages.length} images uploaded successfully!`);
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload images.');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setIsUploadingVideo(true);
        try {
            const file = e.target.files[0];
            const { secure_url } = await uploadFile(file);
            updateFormData({ videos: [...(formData.videos || []), secure_url] });
            toast.success('Video uploaded successfully!');
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload video.');
        } finally {
            setIsUploadingVideo(false);
        }
    };

    const handleDigitalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setIsUploadingDigital(true);
        try {
            const files = Array.from(e.target.files);
            const uploadPromises = files.map(file => uploadFile(file));
            const results = await Promise.all(uploadPromises);
            const newFiles = results.map(r => r.secure_url);
            updateFormData({ fileUrls: [...(formData.fileUrls || []), ...newFiles] });
            toast.success(`${newFiles.length} digital files uploaded successfully!`);
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload digital files.');
        } finally {
            setIsUploadingDigital(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 md:gap-8 pb-32">
            {/* Progress Bar - Simplified for Mobile */}
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                    <p className="text-[#1c140d] dark:text-white text-sm md:text-base font-bold">Step 2: Media & Content</p>
                    <p className="text-[#9c7349] dark:text-[#cba885] text-xs md:text-sm font-medium">Step 2 of 4</p>
                </div>
                <div className="w-full h-1.5 md:h-2 rounded-full bg-[#e8dbce] dark:bg-[#4a3b2e] overflow-hidden">
                    <div className="h-full rounded-full bg-[#f48c25] transition-all duration-500 ease-out" style={{ width: '50%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] md:text-xs font-medium text-[#9c7349] dark:text-[#cba885]">
                    <span className="hidden xs:inline">Basic Info</span>
                    <span className="text-[#f48c25] font-bold">Media & Content</span>
                    <span className="hidden xs:inline">Pricing</span>
                    <span className="hidden xs:inline">Shipping</span>
                </div>
            </div>

            {/* Main Form Card */}
            <div className="bg-white dark:bg-[#2d241b] rounded-xl p-4 md:p-6 shadow-sm border border-[#e8dbce] dark:border-[#4a3b2e] flex flex-col gap-8">

                {/* Description Section */}
                <div className="flex flex-col gap-6">
                    <h2 className="text-md md:text-lg font-bold text-[#1c140d] dark:text-[#ece0d6] border-b border-[#e8dbce] dark:border-[#4a3b2e] pb-2">Description</h2>

                    <div className="flex flex-col gap-2">
                        <label className="text-[#1c140d] dark:text-[#ece0d6] text-sm font-semibold" htmlFor="shortDesc">
                            Short Description
                        </label>
                        <p className="text-xs text-gray-500 mb-1">A brief summary of your product that appears in list views.</p>
                        <textarea
                            className="w-full resize-none rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] bg-[#f8f7f5] dark:bg-[#221910] text-[#1c140d] dark:text-[#ece0d6] p-3 md:p-4 text-sm min-h-[100px] outline-none focus:ring-2 focus:ring-[#f48c25]/20 transition-all"
                            id="shortDesc"
                            placeholder="Enter a brief summary..."
                            value={formData.shortDesc || ''}
                            onChange={handleChange}
                        ></textarea>
                        <p className="text-xs text-[#9c7349]">Recommended length: 150-160 characters for best SEO results.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[#1c140d] dark:text-[#ece0d6] text-sm font-semibold" htmlFor="fullDesc">
                            Full Description
                        </label>
                        <p className="text-xs text-gray-500 mb-1">Detailed information about your product features and benefits.</p>
                        <div className="rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] bg-[#f8f7f5] dark:bg-[#221910] overflow-hidden">
                            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b]">
                                <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-white/10" type="button"><Bold size={18} /></button>
                                <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-white/10" type="button"><Italic size={18} /></button>
                                <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-white/10" type="button"><List size={18} /></button>
                                <button className="p-2 rounded hover:bg-gray-100 dark:hover:bg-white/10" type="button"><LinkIcon size={18} /></button>
                            </div>
                            <textarea
                                className="w-full bg-transparent p-3 md:p-4 text-sm min-h-[180px] outline-none"
                                id="fullDesc"
                                value={formData.fullDesc || ''}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Images Section */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col border-b border-[#e8dbce] dark:border-[#4a3b2e] pb-2">
                        <div className="flex justify-between items-center">
                            <h2 className="text-md md:text-lg font-bold">Product Images</h2>
                            <span className="text-[10px] md:text-xs text-[#9c7349]">Max 5MB per file</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Upload high-quality images to showcase your product.</p>
                    </div>

                    <div className="relative group">
                        <input
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer disabled:cursor-not-allowed"
                            multiple
                            type="file"
                            onChange={handleImageUpload}
                            disabled={isUploadingImage}
                        />
                        <div className="flex flex-col items-center justify-center w-full h-32 md:h-40 border-2 border-dashed border-[#e8dbce] dark:border-[#4a3b2e] rounded-xl bg-[#f8f7f5]/50 dark:bg-[#221910]/50 group-hover:bg-[#f48c25]/5 transition-all">
                            <CloudUpload size={24} className={`text-[#f48c25] mb-1 ${isUploadingImage ? 'animate-bounce' : ''}`} />
                            <p className="text-xs md:text-sm font-semibold text-center px-4">
                                {isUploadingImage ? 'Uploading...' : 'Tap to upload images'}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {formData.images?.map((img: string, index: number) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-[#e8dbce] dark:border-[#4a3b2e]">
                                <img alt="Preview" className="w-full h-full object-cover" src={img} />
                                <div className="absolute top-1 right-1 flex gap-1">
                                    <button
                                        onClick={() => setCroppingIndex({ index, type: 'image' })}
                                        className="p-1.5 bg-orange-600 text-white rounded-full hover:bg-orange-700"
                                        type="button"
                                    >
                                        <Crop size={14} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const newImages = formData.images.filter((_: any, i: number) => i !== index);
                                            updateFormData({ images: newImages });
                                        }}
                                        className="p-1.5 bg-black/50 text-white rounded-full hover:bg-red-600"
                                        type="button"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- RESPONSIVE VIDEO SECTION --- */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col border-b border-[#e8dbce] dark:border-[#4a3b2e] pb-2">
                        <div className="flex justify-between items-center">
                            <h2 className="text-md md:text-lg font-bold">Product Videos</h2>
                            <span className="text-[10px] md:text-xs text-[#9c7349]">Max 3 • 30MB Limit</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Add videos to demonstrate your product in action.</p>
                    </div>

                    <div className="relative group">
                        <input
                            accept="video/*"
                            className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer disabled:cursor-not-allowed"
                            type="file"
                            onChange={handleVideoUpload}
                            disabled={isUploadingVideo}
                        />
                        <div className="flex flex-col items-center justify-center w-full h-32 md:h-40 border-2 border-dashed border-[#e8dbce] dark:border-[#4a3b2e] rounded-xl bg-[#f8f7f5]/50 dark:bg-[#221910]/50 group-hover:bg-[#f48c25]/5 transition-all">
                            <div className={`bg-[#f48c25]/10 p-2 rounded-full mb-1 text-[#f48c25] ${isUploadingVideo ? 'animate-spin' : ''}`}>
                                <Video size={24} />
                            </div>
                            <p className="text-xs md:text-sm font-semibold text-center px-4">
                                {isUploadingVideo ? 'Processing...' : 'Tap to upload videos'}
                            </p>
                        </div>
                    </div>

                    {/* Video Grid - Larger aspect ratio for mobile previews */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {formData.videos?.map((video: string, index: number) => (
                            <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-[#e8dbce] dark:border-[#4a3b2e] bg-black/10 flex items-center justify-center">
                                <video src={video} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 flex gap-2">
                                    <button
                                        onClick={() => setCroppingIndex({ index, type: 'video' })}
                                        className="p-2 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700"
                                        type="button"
                                    >
                                        <Crop size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const newVideos = formData.videos.filter((_: any, i: number) => i !== index);
                                            updateFormData({ videos: newVideos });
                                        }}
                                        className="p-2 bg-red-500 text-white rounded-full shadow-lg"
                                        type="button"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Digital Assets Section (Conditional) */}
                {formData.product_type === 'downloadable' && (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col border-b border-[#e8dbce] dark:border-[#4a3b2e] pb-2">
                            <div className="flex justify-between items-center">
                                <h2 className="text-md md:text-lg font-bold text-[#f48c25]">Digital Product Assets</h2>
                                <span className="text-[10px] md:text-xs text-[#9c7349]">PDF, ZIP, MP3, etc.</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Upload the actual files that customers will receive after purchase.</p>
                        </div>

                        <div className="relative group">
                            <input
                                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer disabled:cursor-not-allowed"
                                multiple
                                type="file"
                                onChange={handleDigitalFileUpload}
                                disabled={isUploadingDigital}
                            />
                            <div className="flex flex-col items-center justify-center w-full h-32 md:h-40 border-2 border-dashed border-[#f48c25]/30 dark:border-[#f48c25]/20 rounded-xl bg-[#fff8f1] dark:bg-[#f48c25]/5 group-hover:bg-[#f48c25]/10 transition-all">
                                <div className={`bg-[#f48c25]/10 p-2 rounded-full mb-1 text-[#f48c25] ${isUploadingDigital ? 'animate-bounce' : ''}`}>
                                    <FileDown size={24} />
                                </div>
                                <p className="text-xs md:text-sm font-semibold text-center px-4">
                                    {isUploadingDigital ? 'Uploading Files...' : 'Tap to upload digital assets'}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            {formData.fileUrls?.map((file: string, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#1c140d]">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-2 rounded bg-gray-100 dark:bg-gray-800 text-[#9c7349]">
                                            <FileText size={18} />
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <p className="text-xs font-semibold text-[#1c140d] dark:text-white truncate">
                                                {file.split('/').pop() || `Digital Asset ${index + 1}`}
                                            </p>
                                            <p className="text-[10px] text-[#9c7349]">Securely Uploaded</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newFiles = formData.fileUrls.filter((_: any, i: number) => i !== index);
                                            updateFormData({ fileUrls: newFiles });
                                        }}
                                        className="p-2 text-[#9c7349] hover:text-red-500 transition-colors"
                                        type="button"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile-First Sticky Footer */}
            <footer className="fixed bottom-16 left-0 right-0 bg-white dark:bg-[#2d241b] border-t border-[#e8dbce] dark:border-[#4a3b2e] p-3 md:p-6 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-none">
                <div className="max-w-5xl mx-auto flex flex-row gap-2 md:gap-4 justify-between items-center w-full">
                    <button onClick={onBack} className="flex-1 md:flex-none px-1 sm:px-6 py-2.5 sm:py-3 rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] text-[#1c140d] dark:text-[#ece0d6] font-semibold flex justify-center items-center gap-1 sm:gap-2 text-[11px] sm:text-base whitespace-nowrap">
                        <ArrowLeft size={16} className="hidden sm:block" />
                        Back
                    </button>

                    <button onClick={onSaveDraft} className="flex-1 md:flex-none md:ml-auto px-1 sm:px-6 py-2.5 sm:py-3 rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] text-[#9c7349] dark:text-[#cba885] font-semibold flex justify-center items-center text-[11px] sm:text-base whitespace-nowrap">
                        Save Draft
                    </button>

                    <button onClick={onNext} className="flex-1 md:flex-none px-1 sm:px-8 py-2.5 sm:py-3 rounded-lg bg-[#f48c25] text-white font-bold shadow-lg shadow-[#f48c25]/20 flex justify-center items-center gap-1 sm:gap-2 text-[11px] sm:text-base whitespace-nowrap">
                        Continue
                        <ArrowRight size={16} className="hidden sm:block" />
                    </button>
                </div>
            </footer>

            {croppingIndex !== null && (
                <MediaCropper
                    isOpen={croppingIndex !== null}
                    onClose={() => setCroppingIndex(null)}
                    mediaUrl={croppingIndex.type === 'image' ? (formData.images?.[croppingIndex.index] || '') : (formData.videos?.[croppingIndex.index] || '')}
                    mediaType={croppingIndex.type}
                    onCropSave={async (croppedFile) => {
                        try {
                            const { secure_url } = await uploadFile(croppedFile);
                            const field = croppingIndex.type === 'image' ? 'images' : 'videos';
                            const newList = [...(formData[field] || [])];
                            newList[croppingIndex.index] = secure_url;
                            updateFormData({ [field]: newList });
                            toast.success('Cropped and uploaded successfully!');
                        } catch (error) {
                            console.error('Upload failed:', error);
                            toast.error('Failed to upload cropped media.');
                        }
                        setCroppingIndex(null);
                    }}
                />
            )}
        </div>
    );
}