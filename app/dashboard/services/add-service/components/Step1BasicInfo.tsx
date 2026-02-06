'use client';

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Settings, Check, ChevronsUpDown, HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useGetCategories, useGetSubCategoriesByCategory } from '@/service/taxonomy/hook';
import { useGetUserListings } from '@/service/listings/hook';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface Step1Props {
  userListings?: any[];
}

const AUDIENCE_OPTIONS = [
  "Families", "Seniors", "Students", "Professionals", "Couples", "Children", "Business Owners", "Everyone"
];

const COMMON_TAGS = [
  "Reliable", "Fast", "Affordable", "Premium", "Eco-friendly", "Expert", "Licensed", "Insured", "24/7 Service"
];

export function Step1BasicInfo({ userListings = [] }: Step1Props) {
  const form = useFormContext();
  const selectedCategory = form.watch('category');

  const { data: categories } = useGetCategories();
  const { data: subCategories } = useGetSubCategoriesByCategory(selectedCategory);

  const [audienceOpen, setAudienceOpen] = useState(false);
  const [tagsOpen, setTagsOpen] = useState(false);

  const toggleSelection = (fieldName: string, value: string) => {
    const currentValues = form.getValues(fieldName)?.split(',').map((v: string) => v.trim()).filter(Boolean) || [];
    let newValues;
    if (currentValues.includes(value)) {
      newValues = currentValues.filter((v: string) => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    form.setValue(fieldName, newValues.join(', '));
  };

  const removeValue = (fieldName: string, value: string) => {
    const currentValues = form.getValues(fieldName)?.split(',').map((v: string) => v.trim()).filter(Boolean) || [];
    const newValues = currentValues.filter((v: string) => v !== value);
    form.setValue(fieldName, newValues.join(', '));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Settings className="w-5 h-5 text-primary" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Start by providing the fundamental details of your service.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Business Selection */}
          <FormField
            control={form.control}
            name="businessId"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2 mb-2">
                  <FormLabel className="text-base font-semibold">
                    Business <span className="text-red-500">*</span>
                  </FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Select which business will offer this service.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="py-6">
                      <SelectValue
                        placeholder="Select Business"
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {userListings.length > 0 ? (
                      userListings.map((b: any) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.businessName}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No service businesses available
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Service Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel className="text-base font-semibold">
                    Service Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Enter a clear, descriptive name for your service.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <FormControl>
                  <Input placeholder="e.g. Professional House Cleaning" {...field} className="py-6 text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <FormLabel className="text-base font-semibold">
                      Category <span className="text-red-500">*</span>
                    </FormLabel>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Select the primary category that fits your service.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between py-6",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? categories?.find(
                                (category) => category.id === field.value
                              )?.name
                            : "Select category"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput placeholder="Search category..." />
                        <CommandList>
                          <CommandEmpty>No category found.</CommandEmpty>
                          <CommandGroup>
                            {categories?.map((category) => (
                              <CommandItem
                                value={category.name}
                                key={category.id}
                                onSelect={() => {
                                  form.setValue("category", category.id);
                                  form.setValue("subcategory", ""); // Reset subcategory
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    category.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {category.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subcategory"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <FormLabel className="text-base font-semibold">Subcategory</FormLabel>
                    <span className="text-xs text-muted-foreground">(Optional)</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Refine your service classification with a subcategory.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Popover>
                    <PopoverTrigger asChild disabled={!selectedCategory}>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between py-6",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? subCategories?.find(
                                (sub) => sub.id === field.value
                              )?.name
                            : "Select subcategory"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput placeholder="Search subcategory..." />
                        <CommandList>
                          <CommandEmpty>No subcategory found.</CommandEmpty>
                          <CommandGroup>
                            {subCategories?.map((sub) => (
                              <CommandItem
                                value={sub.name}
                                key={sub.id}
                                onSelect={() => {
                                  form.setValue("subcategory", sub.id);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    sub.id === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {sub.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Short Description */}
          <FormField
            control={form.control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel className="text-base font-semibold">Short Description</FormLabel>
                  <span className="text-xs text-muted-foreground">(Optional) - Brief catchphrase for search results.</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      A short summary (max 150 chars) shown in listings.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <FormControl>
                  <Input placeholder="e.g. Expert cleaning for busy homes" {...field} maxLength={150} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Full Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel className="text-base font-semibold">Full Description</FormLabel>
                  <span className="text-xs text-muted-foreground">(Optional) - Detailed explanation of what you offer.</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Provide all the details customers need to know.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Describe your service in detail..."
                    className="min-h-[120px] text-base"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Target Audience & Tags (Dropdowns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <FormLabel className="text-base font-semibold">Target Audience</FormLabel>
                    <span className="text-xs text-muted-foreground">(Optional)</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Who is this service primarily for?
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Popover open={audienceOpen} onOpenChange={setAudienceOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full justify-between h-auto min-h-[48px] py-2 px-3"
                        >
                          <div className="flex flex-wrap gap-1">
                            {field.value ? field.value.split(',').map((v: string) => v.trim()).filter(Boolean).map((v: string) => (
                              <Badge key={v} variant="secondary" className="flex items-center gap-1">
                                {v}
                                <X
                                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeValue("targetAudience", v);
                                  }}
                                />
                              </Badge>
                            )) : <span className="text-muted-foreground">Select audience...</span>}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput placeholder="Search audience..." />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup>
                            {AUDIENCE_OPTIONS.map((option) => (
                              <CommandItem
                                key={option}
                                onSelect={() => toggleSelection("targetAudience", option)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value?.split(',').map((v: string) => v.trim()).includes(option)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {option}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <div className="flex items-center gap-2 mb-2">
                    <FormLabel className="text-base font-semibold">Tags</FormLabel>
                    <span className="text-xs text-muted-foreground">(Optional)</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Add keywords to help customers find your service.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full justify-between h-auto min-h-[48px] py-2 px-3"
                        >
                          <div className="flex flex-wrap gap-1">
                            {field.value ? field.value.split(',').map((v: string) => v.trim()).filter(Boolean).map((v: string) => (
                              <Badge key={v} variant="secondary" className="flex items-center gap-1">
                                {v}
                                <X
                                  className="w-3 h-3 cursor-pointer hover:text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeValue("tags", v);
                                  }}
                                />
                              </Badge>
                            )) : <span className="text-muted-foreground">Select tags...</span>}
                          </div>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                      <Command>
                        <CommandInput placeholder="Search tags..." />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup>
                            {COMMON_TAGS.map((tag) => (
                              <CommandItem
                                key={tag}
                                onSelect={() => toggleSelection("tags", tag)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value?.split(',').map((v: string) => v.trim()).includes(tag)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {tag}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
