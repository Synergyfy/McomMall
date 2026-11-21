import React, { useEffect } from 'react';
import {
  ChevronDown,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  X,
  ArrowRight,
  Layers,
  HelpCircle,
  Package,
  Download,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FieldError } from '@/lib/form-validation';

interface Step1Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onCancel: () => void;
  errors?: Record<string, string>;
}

function ClassificationItem({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9c7349] dark:text-[#cba885]">
        {label}
      </span>
      <span className="text-sm font-semibold text-[#1c140d] dark:text-white">
        {value || '—'}
      </span>
    </div>
  );
}

export default function Step1BasicInfo({ formData, updateFormData, onNext, onCancel, errors }: Step1Props) {
  const isGenderRelated = React.useMemo(() => {
    if (!formData.categoryName && !formData.subCategoryName) return false;
    const combined = `${formData.categoryName} ${formData.subCategoryName}`.toLowerCase();
    const genderKeywords = /\b(men|man|male|women|woman|female|lady|ladies|girl|boy|kids|children|unisex|gent|gentlemen|clothing|apparel|wear|dress|shirt|pants|trousers|skirt|suit|jacket|coat|sweater|hoodie|shoes|footwear|boots|sneakers|sandals|slippers|accessories|watch|jewelry|jewellery|bags|handbags|fashion|beauty|cosmetics|fragrance|perfume|underwear|lingerie|outerwear|activewear|sportswear)\b/i;
    return genderKeywords.test(combined);
  }, [formData.categoryName, formData.subCategoryName]);

  useEffect(() => {
    if (!isGenderRelated && formData.gender !== 'none') {
      updateFormData({ gender: 'none' });
    }
  }, [isGenderRelated, formData.gender, updateFormData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    updateFormData({ [id]: value });
  };

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 md:pb-16">
      {/* Progress Bar */}
      <div className="w-full bg-white dark:bg-[#291e15] rounded-xl p-4 md:p-6 shadow-sm border border-[#e8dbce] dark:border-[#4a3b2f]">
        <div className="flex flex-col gap-3 md:gap-4">
          <div className="flex justify-between items-end">
            <span className="text-[#f48c25] text-xs md:text-sm font-bold uppercase tracking-wider">Step 1 of 4</span>
            <span className="text-[#1c140d] dark:text-white text-xs md:text-sm font-semibold">Basic Information</span>
          </div>
          <div className="relative w-full h-1.5 md:h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
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
            {/* Product Type Section */}
            <div className="flex flex-col gap-4">
              <label className="text-sm font-semibold text-[#1c140d] dark:text-gray-200 flex items-center gap-2">
                Product Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'physical', label: 'Physical', desc: 'Tangible items', icon: <Package size={20} /> },
                  { id: 'downloadable', label: 'Digital', desc: 'Files & Media', icon: <Download size={20} /> }
                ].map((type) => (
                  <label key={type.id} className="cursor-pointer relative group">
                    <input
                      className="peer sr-only"
                      name="product_type"
                      type="radio"
                      value={type.id}
                      checked={formData.product_type === type.id}
                      onChange={() => updateFormData({ product_type: type.id })}
                    />
                    <div className="h-full flex items-center gap-4 rounded-xl border-2 border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] p-4 transition-all peer-checked:border-[#f48c25] peer-checked:bg-[#fff8f1] dark:peer-checked:bg-[#f48c25]/10">
                      <div className="flex-shrink-0 size-10 rounded-full bg-[#f4ede7] dark:bg-[#3a2e26] flex items-center justify-center text-[#1c140d] dark:text-white peer-checked:text-[#f48c25]">
                        {type.icon}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[#1c140d] dark:text-white font-bold text-sm">{type.label}</p>
                        <p className="text-[#9c7349] dark:text-[#cba885] text-xs">{type.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Attached platform business */}
            <div className="flex items-center gap-3 rounded-xl border border-[#e8dbce] dark:border-[#4a3b2f] bg-[#fcfaf8] dark:bg-[#1c140d] px-4 py-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f4ede7] dark:bg-[#3a2e26] text-[#f48c25]">
                <Package size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#9c7349] dark:text-[#cba885]">Adding this product to the MCOM Mall Admin business</p>
                <p className="truncate text-sm font-semibold text-[#1c140d] dark:text-white">
                  {formData.businessName || 'Your registered business'}
                </p>
              </div>
            </div>

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
                  className={`w-full rounded-lg border-[#e8dbce] dark:border-[#4a3b2f] bg-[#fcfaf8] dark:bg-[#1c140d] text-[#1c140d] dark:text-white h-12 px-4 focus:ring-2 focus:ring-[#f48c25]/50 focus:border-[#f48c25] placeholder:text-[#9c7349]/60 transition-all border outline-none ${errors?.productName ? 'border-destructive ring-1 ring-destructive' : ''}`}
                  id="productName"
                  placeholder="e.g. Men's Cotton Summer Jacket"
                  type="text"
                  value={formData.productName || ''}
                  onChange={handleChange}
                  aria-invalid={!!errors?.productName}
                />
              </div>
              <FieldError message={errors?.productName} />
              <p className="text-xs text-[#9c7349]">Keep it short and descriptive. Recommended length: 20-60 characters.</p>
            </div>

            {/* Business classification inherited from the platform business */}
            <div className="flex flex-col gap-4 rounded-xl border border-[#e8dbce] dark:border-[#4a3b2f] bg-[#fcfaf8] dark:bg-[#1c140d] p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#f48c25]" />
                  <p className="text-sm font-semibold text-[#1c140d] dark:text-white">
                    Business classification
                  </p>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#9c7349] dark:text-[#cba885]">
                  Managed by MCOM Mall Admin
                </span>
              </div>
              <p className="text-xs text-[#9c7349] dark:text-[#cba885]">
                Sector, category and sub-category are taken from the platform business profile so
                products stay consistent with the admin catalog.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-lg border border-[#e8dbce] dark:border-[#4a3b2f] bg-white dark:bg-[#2d241b] px-4 py-3">
                <ClassificationItem label="Sector" value={formData.sectorName} />
                <ClassificationItem
                  label="Category"
                  value={formData.categoryName || formData.category}
                />
                <ClassificationItem
                  label="Sub-category"
                  value={formData.subCategoryName || formData.subCategory}
                />
              </div>
              {!formData.categoryName && !formData.category && (
                <div className="flex flex-col gap-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <span>
                    The MCOM Mall Admin business needs a category before products can
                    be published.
                  </span>
                </div>
              )}
              <FieldError message={errors?.category} />
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
                    className={`w-full appearance-none rounded-lg border-[#e8dbce] dark:border-[#4a3b2f] bg-[#fcfaf8] dark:bg-[#1c140d] text-[#1c140d] dark:text-white h-12 px-4 pr-10 focus:ring-2 focus:ring-[#f48c25]/50 focus:border-[#f48c25] transition-all border outline-none ${!isGenderRelated ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' : 'cursor-pointer'}`}
                    id="gender"
                    value={formData.gender || ''}
                    onChange={handleChange}
                    disabled={!isGenderRelated}
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
                {formData.tags?.map((tag: string, index: number) => (
                  <span key={index} className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#f48c25]/10 text-[#f48c25] text-sm font-medium">
                    {tag}
                    <button
                      className="hover:text-red-500"
                      type="button"
                      onClick={() => {
                        const newTags = formData.tags.filter((_: any, i: number) => i !== index);
                        updateFormData({ tags: newTags });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
                <input
                  className="flex-1 min-w-[120px] bg-transparent border-none p-1 focus:ring-0 text-[#1c140d] dark:text-white placeholder:text-[#9c7349]/60 outline-none"
                  placeholder="Add a tag..."
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = e.currentTarget.value.trim();
                      if (value && !formData.tags?.includes(value)) {
                        updateFormData({ tags: [...(formData.tags || []), value] });
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                />
              </div>
              <p className="text-xs text-[#9c7349]">Press enter to add tags. Used for internal search and filters.</p>
            </div>
          </form>
        </div>

        {/* Mobile-First Sticky-Free Footer */}
        <div className="relative p-4 bg-white dark:bg-[#2d241b] border-t border-[#e8dbce] dark:border-[#4a3b2e] md:relative md:bg-transparent md:border-none md:p-0 md:mt-8 md:shadow-none w-full">
            <div className="flex items-center justify-between md:justify-end gap-4 max-w-5xl mx-auto">
                <button
                    onClick={onCancel}
                    className="flex-1 md:flex-none px-6 py-3.5 rounded-xl border border-[#e8dbce] dark:border-[#4a3b2e] bg-white dark:bg-[#2d241b] text-[#1c140d] dark:text-white font-bold text-sm flex items-center justify-center gap-2"
                    type="button"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    className="flex-[2] md:flex-none px-8 py-3.5 rounded-xl bg-[#f48c25] hover:bg-[#f48c25]/90 text-white font-bold text-sm shadow-lg shadow-[#f48c25]/20 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                    type="button"
                >
                    Next Step
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}