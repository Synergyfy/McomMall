import React from 'react';

interface Step1Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onCancel: () => void;
}

export default function Step1BasicInfo({ formData, updateFormData, onNext, onCancel }: Step1Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    updateFormData({ [e.target.id]: e.target.value });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Progress Bar */}
      <div className="w-full bg-white dark:bg-[#291e15] rounded-xl p-6 shadow-sm border border-[#e8dbce] dark:border-[#4a3b2f]">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-end">
            <span className="text-[#f48c25] text-sm font-bold uppercase tracking-wider">Step 1 of 4</span>
            <span className="text-[#1c140d] dark:text-white text-sm font-semibold">Basic Information</span>
          </div>
          {/* Stepper Visual */}
          <div className="relative w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-[#f48c25] rounded-full" style={{ width: '25%' }}></div>
          </div>
          {/* Steps Text */}
          <div className="hidden sm:flex justify-between text-xs font-medium text-[#9c7349] mt-1">
            <div className="text-[#f48c25] font-bold">1. Basic Info</div>
            <div>2. Media & Content</div>
            <div>3. Pricing & Inventory</div>
            <div>4. Shipping</div>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white dark:bg-[#291e15] rounded-xl shadow-sm border border-[#e8dbce] dark:border-[#4a3b2f] overflow-hidden flex-1">
        <div className="p-6 md:p-8 flex flex-col gap-8">
          {/* Section Title */}
          <div className="border-b border-[#e8dbce] dark:border-[#4a3b2f] pb-4">
            <h2 className="text-xl font-bold text-[#1c140d] dark:text-white">Product Details</h2>
            <p className="text-sm text-[#9c7349] mt-1">Enter the core details for your item. Fields marked with * are required.</p>
          </div>

          {/* Form Fields */}
          <form className="flex flex-col gap-6 max-w-3xl">
            {/* Product Title */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#1c140d] dark:text-gray-200" htmlFor="productTitle">
                Product Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-lg border-[#e8dbce] dark:border-[#4a3b2f] bg-[#fcfaf8] dark:bg-[#1c140d] text-[#1c140d] dark:text-white h-12 px-4 focus:ring-2 focus:ring-[#f48c25]/50 focus:border-[#f48c25] placeholder:text-[#9c7349]/60 transition-all border outline-none"
                  id="productTitle"
                  placeholder="e.g. Men's Cotton Summer Jacket"
                  type="text"
                  value={formData.productTitle || ''}
                  onChange={handleChange}
                />
              </div>
              <p className="text-xs text-[#9c7349]">Keep it short and descriptive. Recommended length: 20-60 characters.</p>
            </div>

            {/* Row: Category & Sub-Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#1c140d] dark:text-gray-200" htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border-[#e8dbce] dark:border-[#4a3b2f] bg-[#fcfaf8] dark:bg-[#1c140d] text-[#1c140d] dark:text-white h-12 px-4 pr-10 focus:ring-2 focus:ring-[#f48c25]/50 focus:border-[#f48c25] transition-all cursor-pointer border outline-none"
                    id="category"
                    value={formData.category || ''}
                    onChange={handleChange}
                  >
                    <option disabled value="">Select a category...</option>
                    <option value="clothing">Clothing</option>
                    <option value="shoes">Shoes</option>
                    <option value="accessories">Accessories</option>
                    <option value="electronics">Electronics</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#9c7349]">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Sub-Category */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#1c140d] dark:text-gray-200" htmlFor="subCategory">
                  Sub-Category
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border-[#e8dbce] dark:border-[#4a3b2f] bg-[#fcfaf8] dark:bg-[#1c140d] text-[#1c140d] dark:text-white h-12 px-4 pr-10 focus:ring-2 focus:ring-[#f48c25]/50 focus:border-[#f48c25] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border outline-none"
                    id="subCategory"
                    value={formData.subCategory || ''}
                    onChange={handleChange}
                  >
                    <option disabled value="">Select sub-category...</option>
                    <option value="shirts">Shirts</option>
                    <option value="pants">Pants</option>
                    <option value="outerwear">Outerwear</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#9c7349]">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#1c140d] dark:text-gray-200" htmlFor="description">
                Description
              </label>
              <div className="relative">
                <textarea
                  className="w-full rounded-lg border-[#e8dbce] dark:border-[#4a3b2f] bg-[#fcfaf8] dark:bg-[#1c140d] text-[#1c140d] dark:text-white p-4 focus:ring-2 focus:ring-[#f48c25]/50 focus:border-[#f48c25] placeholder:text-[#9c7349]/60 resize-none transition-all border outline-none"
                  id="description"
                  placeholder="Describe your product features, materials, and care instructions..."
                  rows={5}
                  value={formData.description || ''}
                  onChange={handleChange}
                ></textarea>
                {/* Rich Text Toolbar Mock */}
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <button className="p-1 text-[#9c7349] hover:text-[#f48c25] hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors" type="button"><span className="material-symbols-outlined text-[20px]">format_bold</span></button>
                  <button className="p-1 text-[#9c7349] hover:text-[#f48c25] hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors" type="button"><span className="material-symbols-outlined text-[20px]">format_italic</span></button>
                  <button className="p-1 text-[#9c7349] hover:text-[#f48c25] hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors" type="button"><span className="material-symbols-outlined text-[20px]">format_list_bulleted</span></button>
                  <button className="p-1 text-[#9c7349] hover:text-[#f48c25] hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors" type="button"><span className="material-symbols-outlined text-[20px]">link</span></button>
                </div>
              </div>
            </div>

            {/* Tags Input Mockup */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#1c140d] dark:text-gray-200">
                Tags
              </label>
              <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg border border-[#e8dbce] dark:border-[#4a3b2f] bg-[#fcfaf8] dark:bg-[#1c140d] min-h-[48px] focus-within:ring-2 focus-within:ring-[#f48c25]/50 focus-within:border-[#f48c25] transition-all">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#f48c25]/10 text-[#f48c25] text-sm font-medium">
                  Summer
                  <button className="hover:text-red-500" type="button"><span className="material-symbols-outlined text-[16px]">close</span></button>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#f48c25]/10 text-[#f48c25] text-sm font-medium">
                  Casual
                  <button className="hover:text-red-500" type="button"><span className="material-symbols-outlined text-[16px]">close</span></button>
                </span>
                <input className="flex-1 min-w-[120px] bg-transparent border-none p-1 focus:ring-0 text-[#1c140d] dark:text-white placeholder:text-[#9c7349]/60 outline-none" placeholder="Add a tag..." type="text" />
              </div>
              <p className="text-xs text-[#9c7349]">Press enter to add tags. Used for internal search and filters.</p>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 md:px-8 md:py-6 bg-gray-50 dark:bg-black/20 border-t border-[#e8dbce] dark:border-[#4a3b2f] flex justify-end gap-4 items-center">
          <button onClick={onCancel} className="px-6 py-3 rounded-lg text-[#9c7349] font-semibold text-sm hover:text-[#1c140d] dark:hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={onNext} className="flex items-center gap-2 px-8 py-3 rounded-lg bg-[#f48c25] hover:bg-[#f48c25]/90 text-white font-bold text-sm shadow-md shadow-[#f48c25]/20 transition-all transform active:scale-95">
            Next Step
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
}
