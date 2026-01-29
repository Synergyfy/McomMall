import React from 'react';

interface Step2Props {
    formData: any;
    updateFormData: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
    onSaveDraft: () => void;
}

export default function Step2MediaContent({ formData, updateFormData, onNext, onBack, onSaveDraft }: Step2Props) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updateFormData({ [e.target.id]: e.target.value });
    };

    return (
        <div className="flex flex-col gap-8 pb-24">
            {/* Progress Bar */}
            <div className="flex flex-col gap-3">
                <div className="flex gap-6 justify-between items-center">
                    <p className="text-[#1c140d] dark:text-white text-base font-bold">Step 2: Media & Content</p>
                    <p className="text-[#9c7349] dark:text-[#cba885] text-sm font-medium">Step 2 of 4</p>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e8dbce] dark:bg-[#4a3b2e] overflow-hidden">
                    <div className="h-full rounded-full bg-[#f48c25] transition-all duration-500 ease-out" style={{ width: '50%' }}></div>
                </div>
                <div className="flex justify-between text-xs font-medium text-[#9c7349] dark:text-[#cba885]">
                    <span>Basic Info</span>
                    <span className="text-[#f48c25] font-bold">Media & Content</span>
                    <span>Pricing</span>
                    <span>Shipping</span>
                </div>
            </div>

            {/* Main Form Card */}
            <div className="bg-white dark:bg-[#2d241b] rounded-xl p-6 shadow-sm border border-[#e8dbce] dark:border-[#4a3b2e] flex flex-col gap-8">
                {/* Description Section */}
                <div className="flex flex-col gap-6">
                    <h2 className="text-lg font-bold text-[#1c140d] dark:text-[#ece0d6] border-b border-[#e8dbce] dark:border-[#4a3b2e] pb-2">Description</h2>
                    {/* Short Description */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[#1c140d] dark:text-[#ece0d6] text-sm font-semibold" htmlFor="shortDesc">Short Description</label>
                        <textarea
                            className="w-full resize-none rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] bg-[#f8f7f5] dark:bg-[#221910] focus:ring-2 focus:ring-[#f48c25]/20 focus:border-[#f48c25] text-[#1c140d] dark:text-[#ece0d6] placeholder-text-[#9c7349]/70 dark:placeholder-text-[#cba885]/70 p-4 text-sm min-h-[100px] transition-all outline-none"
                            id="shortDesc"
                            placeholder="Enter a brief summary of the product to appear in listings..."
                            value={formData.shortDesc || ''}
                            onChange={handleChange}
                        ></textarea>
                        <p className="text-xs text-[#9c7349] dark:text-[#cba885] text-right">0/160 characters</p>
                    </div>
                    {/* Full Description (Rich Text Mock) */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[#1c140d] dark:text-[#ece0d6] text-sm font-semibold" htmlFor="fullDesc">Full Description</label>
                        <div className="rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] bg-[#f8f7f5] dark:bg-[#221910] overflow-hidden focus-within:ring-2 focus-within:ring-[#f48c25]/20 focus-within:border-[#f48c25] transition-all">
                            {/* Toolbar */}
                            <div className="flex items-center gap-1 p-2 border-b border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b]">
                                <button className="p-1.5 rounded hover:bg-[#f8f7f5] dark:hover:bg-[#f8f7f5] text-[#9c7349] dark:text-[#cba885] hover:text-[#f48c25] transition-colors" title="Bold" type="button">
                                    <span className="material-symbols-outlined text-[20px]">format_bold</span>
                                </button>
                                <button className="p-1.5 rounded hover:bg-[#f8f7f5] dark:hover:bg-[#f8f7f5] text-[#9c7349] dark:text-[#cba885] hover:text-[#f48c25] transition-colors" title="Italic" type="button">
                                    <span className="material-symbols-outlined text-[20px]">format_italic</span>
                                </button>
                                <div className="w-px h-5 bg-[#e8dbce] dark:bg-[#4a3b2e] mx-1"></div>
                                <button className="p-1.5 rounded hover:bg-[#f8f7f5] dark:hover:bg-[#f8f7f5] text-[#9c7349] dark:text-[#cba885] hover:text-[#f48c25] transition-colors" title="Bullet List" type="button">
                                    <span className="material-symbols-outlined text-[20px]">format_list_bulleted</span>
                                </button>
                                <button className="p-1.5 rounded hover:bg-[#f8f7f5] dark:hover:bg-[#f8f7f5] text-[#9c7349] dark:text-[#cba885] hover:text-[#f48c25] transition-colors" title="Numbered List" type="button">
                                    <span className="material-symbols-outlined text-[20px]">format_list_numbered</span>
                                </button>
                                <div className="w-px h-5 bg-[#e8dbce] dark:bg-[#4a3b2e] mx-1"></div>
                                <button className="p-1.5 rounded hover:bg-[#f8f7f5] dark:hover:bg-[#f8f7f5] text-[#9c7349] dark:text-[#cba885] hover:text-[#f48c25] transition-colors" title="Insert Link" type="button">
                                    <span className="material-symbols-outlined text-[20px]">link</span>
                                </button>
                            </div>
                            <textarea
                                className="w-full resize-y bg-transparent border-none focus:ring-0 text-[#1c140d] dark:text-[#ece0d6] placeholder-text-[#9c7349]/70 dark:placeholder-text-[#cba885]/70 p-4 text-sm min-h-[200px] outline-none"
                                id="fullDesc"
                                placeholder="Describe your product in detail..."
                                value={formData.fullDesc || ''}
                                onChange={handleChange}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Media Section */}
                <div className="flex flex-col gap-6 pt-4">
                    <div className="flex justify-between items-end border-b border-[#e8dbce] dark:border-[#4a3b2e] pb-2">
                        <h2 className="text-lg font-bold text-[#1c140d] dark:text-[#ece0d6]">Product Media</h2>
                        <span className="text-xs text-[#9c7349] dark:text-[#cba885]">Max 5MB per file</span>
                    </div>
                    {/* Drag and Drop Zone */}
                    <div className="relative group cursor-pointer">
                        <input accept="image/*" className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" multiple type="file" />
                        <div className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#e8dbce] dark:border-[#4a3b2e] rounded-xl bg-[#f8f7f5]/50 dark:bg-[#221910]/50 group-hover:bg-[#f48c25]/5 group-hover:border-[#f48c25]/50 transition-all duration-300">
                            <div className="bg-[#f48c25]/10 p-3 rounded-full mb-3 group-hover:scale-110 transition-transform duration-300">
                                <span className="material-symbols-outlined text-[#f48c25] text-[32px]">cloud_upload</span>
                            </div>
                            <p className="text-sm font-semibold text-[#1c140d] dark:text-[#ece0d6] mb-1">Click to upload or drag and drop</p>
                            <p className="text-xs text-[#9c7349] dark:text-[#cba885]">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                        </div>
                    </div>
                    {/* Gallery Preview */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {/* Uploaded Item 1 */}
                        <div className="relative aspect-square rounded-lg overflow-hidden border border-[#e8dbce] dark:border-[#4a3b2e] group">
                            <img alt="Product watch side view" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-x-mQQoSG5rTNglJLTytLvwBELCoykPUylx3W9BLOJmV6V4Qndp5ha1_Ksixv2e_io66LaK0BWWx0aS_1UZ36OW7HU010AISo_t12gRIzNi-ycqQhoQocS7LuK05a2q0fXKyPVGK5RchS8etUB9d-6dDnT6VjzATLo1BEJJo3aW9udSt7UxrFUbgYVKXH_JgUivwhXxo6f1ho0sPwoYI8KdCj922-_UrGnadUGttSVOSX-kXHd8-eGL58e4bcGRQSd5WhrgpZGYaR" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                <button className="text-white hover:text-[#f48c25] transition-colors p-1 bg-black/20 rounded">
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                <button className="text-white hover:text-red-500 transition-colors p-1 bg-black/20 rounded">
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>
                            <div className="absolute top-2 left-2 bg-[#f48c25] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">Main</div>
                        </div>
                        {/* Uploaded Item 2 */}
                        <div className="relative aspect-square rounded-lg overflow-hidden border border-[#e8dbce] dark:border-[#4a3b2e] group">
                            <img alt="Product watch front view" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAfUa5Dm67-QEnVD5Fu7CY0D6lc7Rul-AiPmaGzMZvg2NEgl2eli7RGVOPGLEOu718zoq11xsOlrizs6DjMwBa9Ex2O02Y20mjUA8xmch9B2Ci0ed1AW2FVTp01pY8R4l1DvGKoNStYuk9I_V3mqJV5_xCuhpmuKjX0xw5zd_KRO56fBvQyG4Vjdu8Cv3mPkCOO0S5WU2pZkAIdkDF_lcaPOGVdb-KY4OMsFFcVYO6p8i73ANSCSX-I8wQMZM-GPHoc5sOwyY1pGzp" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                <button className="text-white hover:text-[#f48c25] transition-colors p-1 bg-black/20 rounded">
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                </button>
                                <button className="text-white hover:text-red-500 transition-colors p-1 bg-black/20 rounded">
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                            </div>
                        </div>
                        {/* Uploading Placeholder (optional UX detail) */}
                        <div className="relative aspect-square rounded-lg bg-[#f8f7f5] dark:bg-[#221910] border border-[#e8dbce] dark:border-[#4a3b2e] flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full border-2 border-[#f48c25] border-t-transparent animate-spin"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed Footer Actions */}
            <footer className="bg-white dark:bg-[#2d241b] border-t border-[#e8dbce] dark:border-[#4a3b2e] p-6 z-20">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <button onClick={onBack} className="px-6 py-2.5 rounded-lg border border-[#e8dbce] dark:border-[#4a3b2e] text-[#1c140d] dark:text-[#ece0d6] font-semibold hover:bg-[#f8f7f5] dark:hover:bg-[#221910] transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        Previous
                    </button>
                    <div className="flex gap-3">
                        <button onClick={onSaveDraft} className="px-6 py-2.5 rounded-lg text-[#9c7349] dark:text-[#cba885] font-medium hover:text-[#f48c25] transition-colors">
                            Save as Draft
                        </button>
                        <button onClick={onNext} className="px-6 py-2.5 rounded-lg bg-[#f48c25] text-white font-bold shadow-lg shadow-[#f48c25]/30 hover:bg-[#f48c25]/90 hover:shadow-[#f48c25]/40 transition-all flex items-center gap-2">
                            Save & Continue
                            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
