"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const PREDEFINED_ATTRIBUTES = [
    "Color",
    "Size",
    "Material",
    "Storage",
    "Voltage",
    "Wattage",
    "Style",
    "Fabric",
    "Processor",
    "RAM",
    "Capacity",
]

interface AttributeSelectorProps {
    onSelect: (attributeName: string) => void
    excludedAttributes?: string[]
}

export function AttributeSelector({ onSelect, excludedAttributes = [] }: AttributeSelectorProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")

    const availableAttributes = PREDEFINED_ATTRIBUTES.filter(
        (attr) => !excludedAttributes.includes(attr)
    )

    const handleSelect = (value: string) => {
        onSelect(value)
        setOpen(false)
        setInputValue("")
    }

    // Check if current input matches any existing attribute (case insensitive)
    const exactMatch = availableAttributes.find(
        attr => attr.toLowerCase() === inputValue.toLowerCase()
    )

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                >
                    Select Attribute...
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput
                        placeholder="Search attribute..."
                        value={inputValue}
                        onValueChange={setInputValue}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {inputValue && !exactMatch ? (
                                <div
                                    className="py-2 px-2 text-sm cursor-pointer hover:bg-slate-100 flex items-center gap-2 text-orange-600 font-medium"
                                    onClick={() => handleSelect(inputValue)}
                                >
                                    <Plus className="h-3 w-3" />
                                    Add "{inputValue}"
                                </div>
                            ) : (
                                <span className="p-2 text-sm text-slate-500">No attribute found.</span>
                            )}
                        </CommandEmpty>
                        <CommandGroup heading="Suggestions">
                            {availableAttributes.map((attr) => (
                                <CommandItem
                                    key={attr}
                                    value={attr}
                                    onSelect={() => handleSelect(attr)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            "opacity-0" // We don't need check icon here as it's a multiselect behavior from parent perspective or unique add
                                        )}
                                    />
                                    {attr}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        {inputValue && !exactMatch && (
                            <>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem onSelect={() => handleSelect(inputValue)} className="text-orange-600">
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
    )
}
