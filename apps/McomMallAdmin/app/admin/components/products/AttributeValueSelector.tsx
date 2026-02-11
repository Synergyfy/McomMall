"use client";

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface AttributeValueSelectorProps {
    attributeName: string;
    onSelect: (value: string) => void;
    placeholder?: string;
    excludedValues?: string[];
    trigger?: React.ReactNode;
}

const COMMON_VALUES: Record<string, string[]> = {
    color: ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Orange', 'Pink', 'Grey', 'Brown', 'Beige', 'Gold', 'Silver', 'Multi-color'],
    size: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'One Size'],
    material: ['Cotton', 'Polyester', 'Wool', 'Silk', 'Leather', 'Denim', 'Linen', 'Velvet', 'Nylon', 'Rayon', 'Spandex', 'Acrylic'],
    style: ['Casual', 'Formal', 'Sport', 'Vintage', 'Modern', 'Classic', 'Bohemian', 'Streetwear', 'Business', 'Minimalist'],
    gender: ['Men', 'Women', 'Unisex', 'Kids', 'Boys', 'Girls'],
    storage: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB', '4TB'],
    ram: ['4GB', '8GB', '16GB', '32GB', '64GB', '128GB'],
    processor: ['i3', 'i5', 'i7', 'i9', 'M1', 'M2', 'M3', 'Ryzen 3', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9', 'Snapdragon'],
    fabric: ['Cotton', 'Silk', 'Wool', 'Polyester', 'Linen', 'Velvet', 'Chiffon', 'Satin', 'Denim'],
    voltage: ['110V', '220V', '110-240V', '12V', '24V'],
    wattage: ['5W', '10W', '20W', '40W', '60W', '100W', '1000W'],
    capacity: ['100ml', '250ml', '500ml', '1L', '2L', '5L', '10L']
};

export function AttributeValueSelector({ attributeName, onSelect, placeholder, excludedValues = [], trigger }: AttributeValueSelectorProps) {
    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");

    // Get suggestions based on attribute name (case-insensitive)
    const suggestions = useMemo(() => {
        const lowerName = attributeName.toLowerCase();
        // Check for exact match or partial match (e.g. "Main Color" -> "color")
        const key = Object.keys(COMMON_VALUES).find(k => lowerName.includes(k));
        const values = key ? COMMON_VALUES[key] : [];
        return values.filter(v => !excludedValues.includes(v));
    }, [attributeName, excludedValues]);

    const handleSelect = (currentValue: string) => {
        onSelect(currentValue);
        setOpen(false);
        setInputValue("");
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>

            <PopoverTrigger asChild>
                {trigger ? (
                    trigger
                ) : (
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between bg-white font-normal text-xs h-9",
                            !inputValue && "text-muted-foreground"
                        )}
                    >
                        {placeholder || `Select ${attributeName}...`}
                        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
                <Command>
                    <CommandInput
                        placeholder={`Search ${attributeName}...`}
                        value={inputValue}
                        onValueChange={setInputValue}
                        className="h-8 text-xs"
                    />
                    <CommandList>
                        <CommandEmpty className="py-2 text-xs text-center text-slate-500">
                            Type to create "{inputValue}"
                        </CommandEmpty>

                        {suggestions.length > 0 && (
                            <CommandGroup heading="Suggestions">
                                {suggestions.map((val) => (
                                    <CommandItem
                                        key={val}
                                        value={val}
                                        onSelect={handleSelect}
                                        className="text-xs"
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-3 w-3 opacity-0" // We don't track selection state here per se, just distinct values
                                            )}
                                        />
                                        {val}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}

                        {inputValue && !excludedValues.includes(inputValue) && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem onSelect={() => handleSelect(inputValue)} className="text-orange-600 text-xs">
                                        <Plus className="mr-2 h-3 w-3" />
                                        Create "{inputValue}"
                                    </CommandItem>
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
