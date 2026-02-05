import React, { useEffect } from 'react';
import { useGetCategories, useGetSubCategoriesByCategory } from '@/service/taxonomy/hook';
import {
  ChevronDown,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  X,
  ArrowRight,
  Layers,
  HelpCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Step1Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onCancel: () => void;
}

export default function Step1BasicInfo({ formData, updateFormData, onNext, onCancel }: Step1Props) {
  const { data: categories, isLoading: isLoadingCats } = useGetCategories();
  const { data: subCategories, isLoading: isLoadingSubs } = useGetSubCategoriesByCategory(formData.category);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    if (id === 'category') {
      updateFormData({ [id]: value, subCategory: '' });
    } else {
      updateFormData({ [id]: value });
    }
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
          <div className="relative w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="absolute top-0 left-0 h-full bg-[#f48c25] rounded-full" style={{ width: '25%' }}></div>
          </div>
          <div className="hidden sm:flex justify-between text-xs font-medium text-[#9c7349] mt-1">
            <div className="text-[#f48c25] font-bold">1. Basic Info</div>
            <div>2. Media & Content</div>
            <div>3. Pricing & Inventory</div>
            <div>4. Shipping</div>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e8dbce] overflow-hidden flex-1">
        <div className="p-6 md:p-8 flex flex-col gap-8">
          <div className="border-b border-[#e8dbce] dark:border-[#4a3b2f] pb-4">
            <h2 className="text-xl font-bold text-[#1c140d] dark:text-white">Product Details</h2>
            <p className="text-sm text-[#9c7349] mt-1">Enter the core details for your item. Fields marked with * are required.</p>
          </div>

          <form className="flex flex-col gap-6 max-w-3xl">
            {/* Product Name */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#1c140d] dark:text-gray-200 flex items-center gap-2" htmlFor="productName">
                Product Name <span className="text-red-500">*</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>The main title of your product as it will appear in search results.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <div className="relative">
                <input
                  className="w-full rounded-lg border-[#e8dbce] dark:border-[#4a3b2f] bg-[#fcfaf8] dark:bg-[#1c140d] text-[#1c140d] dark:text-white h-12 px-4 focus:ring-2 focus:ring-[#f48c25]/50 focus:border-[#f48c25] placeholder:text-[#9c7349]/60 transition-all border outline-none"
                  id="productName"
                  placeholder="e.g. Men's Cotton Summer Jacket"
                  type="text"
                  value={formData.productName || ''}
                  onChange={handleChange}
                />
              </div>
              <p className="text-xs text-[#9c7349]">Keep it short and descriptive. Recommended length: 20-60 characters.</p>
            </div>

            {/* Row: Category & Sub-Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#1c140d] dark:text-gray-200 flex items-center gap-2" htmlFor="category">
                  Category <span className="text-red-500">*</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Select the main category that best describes your product.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border-[#e8dbce] dark:border-[#4a3b2f] bg-[#fcfaf8] dark:bg-[#1c140d] text-[#1c140d] dark:text-white h-12 px-4 pr-10 focus:ring-2 focus:ring-[#f48c25]/50 focus:border-[#f48c25] transition-all cursor-pointer border outline-none disabled:opacity-50"
                    id="category"
                    value={formData.category || ''}
                    onChange={handleChange}
                    disabled={isLoadingCats}
                  >
                    <option disabled value="">{isLoadingCats ? 'Loading categories...' : 'Select a category...'}</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#9c7349]">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#1c140d] dark:text-gray-200 flex items-center gap-2" htmlFor="subCategory">
                  Sub-Category
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Select a sub-category to further refine your product listing.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border-[#e8dbce] dark:border-[#4a3b2f] bg-[#fcfaf8] dark:bg-[#1c140d] text-[#1c140d] dark:text-white h-12 px-4 pr-10 focus:ring-2 focus:ring-[#f48c25]/50 focus:border-[#f48c25] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border outline-none"
                    id="subCategory"
                    value={formData.subCategory || ''}
                    onChange={handleChange}
                    disabled={!formData.category || isLoadingSubs}
                  >
                    <option disabled value="">
                      {!formData.category
                        ? 'Select a category first'
                        : isLoadingSubs
                          ? 'Loading sub-categories...'
                          : 'Select sub-category...'}
                    </option>
                    {subCategories?.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#9c7349]">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Row: Status */}
            <div className="grid grid-cols-1 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#1c140d] dark:text-gray-200 flex items-center gap-2" htmlFor="productStatus">
                  Product Status
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Set to 'Publish' to make it visible immediately, or 'Draft' to save for later.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border-[#e8dbce] dark:border-[#4a3b2f] bg-[#fcfaf8] dark:bg-[#1c140d] text-[#1c140d] dark:text-white h-12 px-4 pr-10 focus:ring-2 focus:ring-[#f48c25]/50 focus:border-[#f48c25] transition-all cursor-pointer border outline-none"
                    id="productStatus"
                    value={formData.productStatus || 'publish'}
                    onChange={handleChange}
                  >
                    <option value="publish">Publish</option>
                    <option value="draft">Draft</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#9c7349]">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Row: Brand & Gender */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#1c140d] dark:text-gray-200 flex items-center gap-2" htmlFor="brand">
                  Brand
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>The brand or manufacturer of the product.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </label>
                <input
                  className="w-full rounded-lg border-[#e8dbce] dark:border-[#4a3b2f] bg-[#fcfaf8] dark:bg-[#1c140d] text-[#1c140d] dark:text-white h-12 px-4 focus:ring-2 focus:ring-[#f48c25]/50 focus:border-[#f48c25] placeholder:text-[#9c7349]/60 transition-all border outline-none"
                  id="brand"
                  placeholder="e.g. Nike, Apple"
                  type="text"
                  value={formData.brand || ''}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#1c140d] dark:text-gray-200 flex items-center gap-2" htmlFor="gender">
                  Gender
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Specify if this product is intended for a specific gender.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none rounded-lg border-[#e8dbce] dark:border-[#4a3b2f] bg-[#fcfaf8] dark:bg-[#1c140d] text-[#1c140d] dark:text-white h-12 px-4 pr-10 focus:ring-2 focus:ring-[#f48c25]/50 focus:border-[#f48c25] transition-all cursor-pointer border outline-none"
                    id="gender"
                    value={formData.gender || ''}
                    onChange={handleChange}
                  >
                    <option value="none">None</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unisex">Unisex</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#9c7349]">
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>


            {/* Tags Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-[#1c140d] dark:text-gray-200 flex items-center gap-2">
                Tags
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Keywords to help customers find your product.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </label>
              <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg border border-[#e8dbce] dark:border-[#4a3b2f] bg-[#fcfaf8] dark:bg-[#1c140d] min-h-[48px] focus-within:ring-2 focus-within:ring-[#f48c25]/50 focus-within:border-[#f48c25] transition-all">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#f48c25]/10 text-[#f48c25] text-sm font-medium">
                  Summer
                  <button className="hover:text-red-500" type="button"><X className="w-4 h-4" /></button>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#f48c25]/10 text-[#f48c25] text-sm font-medium">
                  Casual
                  <button className="hover:text-red-500" type="button"><X className="w-4 h-4" /></button>
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
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}