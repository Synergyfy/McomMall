"use client";

import { useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttributeSelector } from "./AttributeSelector";
import { AttributeValueSelector } from "./AttributeValueSelector";

interface VariantBuilderProps {
    baseAttributeName: string;
    baseAttributeValue: string;
    existingAttributes?: string[]; // Attributes already used
    onGenerate: (attributes: { name: string; values: string[] }[]) => void;
    trigger?: React.ReactNode;
}

export function VariantBuilder({
    baseAttributeName,
    baseAttributeValue,
    existingAttributes = [],
    onGenerate,
    trigger,
}: VariantBuilderProps) {
    const [open, setOpen] = useState(false);
    const [selectedAttributes, setSelectedAttributes] = useState<
        { name: string; values: string[]; type?: "tag" | "select" }[]
    >([]);

    // Size helper state
    const [sizeRegion, setSizeRegion] = useState<"Standard" | "UK">("Standard");
    const [sizeInput, setSizeInput] = useState("");

    const handleAddAttribute = (name: string) => {
        if (selectedAttributes.find((a) => a.name === name)) return;
        setSelectedAttributes([...selectedAttributes, { name, values: [] }]);
    };

    const removeAttribute = (index: number) => {
        const newAttrs = [...selectedAttributes];
        newAttrs.splice(index, 1);
        setSelectedAttributes(newAttrs);
    };

    const addValueToAttribute = (index: number, value: string) => {
        if (!value.trim()) return;
        const attr = selectedAttributes[index];
        if (attr.values.includes(value.trim())) return;

        const newAttrs = [...selectedAttributes];
        newAttrs[index].values = [...attr.values, value.trim()];
        setSelectedAttributes(newAttrs);
    };

    const removeValueFromAttribute = (attrIndex: number, valIndex: number) => {
        const newAttrs = [...selectedAttributes];
        newAttrs[attrIndex].values.splice(valIndex, 1);
        setSelectedAttributes(newAttrs);
    };

    const handleGenerate = () => {
        onGenerate(selectedAttributes);
        setOpen(false);
        setSelectedAttributes([]); // Reset after generating? Or keep? Resetting seems safer.
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {trigger ? (
                    trigger
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        className="ml-2 h-6 w-6 p-0 rounded-full border-dashed border-orange-300 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                )}
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-4" align="start">
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                        <div>
                            <h4 className="font-semibold text-sm">Build Variation</h4>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                                Adding under {baseAttributeValue}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setSelectedAttributes([])}
                        >
                            <span className="text-xs text-slate-400">Reset</span>
                        </Button>
                    </div>

                    {/* Add Attributes Section */}
                    <div className="space-y-2">
                        <Label className="text-xs text-slate-500 font-bold">
                            SELECT ATTRIBUTES FOR THIS VARIANT:
                        </Label>
                        <div className="w-full">
                            <AttributeSelector
                                onSelect={handleAddAttribute}
                                excludedAttributes={[
                                    baseAttributeName,
                                    ...existingAttributes,
                                    ...selectedAttributes.map((a) => a.name),
                                ]}
                            />
                        </div>
                    </div>

                    {/* Configure Attributes */}
                    {selectedAttributes.length > 0 && (
                        <div className="space-y-3 pt-2 border-t">
                            <Label className="text-xs text-slate-500 font-bold">
                                CONFIGURE SELECTED ATTRIBUTES:
                            </Label>
                            {selectedAttributes.map((attr, index) => (
                                <div
                                    key={index}
                                    className="p-3 bg-slate-50 rounded-lg border space-y-2 relative group"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs font-bold text-orange-600 uppercase">
                                            {attr.name}
                                        </span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5 text-slate-400 hover:text-red-500"
                                            onClick={() => removeAttribute(index)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>

                                    {/* Special Handling for 'Size' */}
                                    {attr.name === "Size" ? (
                                        <div className="space-y-2">
                                            <div className="flex bg-slate-200 p-0.5 rounded-md w-fit">
                                                <button
                                                    type="button"
                                                    onClick={() => setSizeRegion("Standard")}
                                                    className={`text-[10px] px-3 py-1 rounded-sm font-medium transition-all ${sizeRegion === "Standard"
                                                        ? "bg-white text-slate-900 shadow-sm"
                                                        : "text-slate-500 hover:text-slate-700"
                                                        }`}
                                                >
                                                    Standard
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setSizeRegion("UK")}
                                                    className={`text-[10px] px-3 py-1 rounded-sm font-medium transition-all ${sizeRegion === "UK"
                                                        ? "bg-white text-slate-900 shadow-sm"
                                                        : "text-slate-500 hover:text-slate-700"
                                                        }`}
                                                >
                                                    UK
                                                </button>
                                            </div>

                                            <div className="flex gap-2">
                                                <AttributeValueSelector
                                                    attributeName="size"
                                                    onSelect={(val) => addValueToAttribute(index, val)}
                                                    placeholder={`Select ${sizeRegion} Size...`}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        // Generic Attribute Input
                                        <div>
                                            <AttributeValueSelector
                                                attributeName={attr.name}
                                                onSelect={(val) => addValueToAttribute(index, val)}
                                                placeholder={`Select ${attr.name}...`}
                                            />
                                        </div>
                                    )}

                                    {/* Selected Values Chips */}
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {attr.values.length === 0 && (
                                            <p className="text-[10px] text-slate-400 italic">No options added yet.</p>
                                        )}
                                        {attr.values.map((val, vIndex) => (
                                            <Badge
                                                key={vIndex}
                                                variant="secondary"
                                                className="bg-white border text-slate-600 font-normal pr-1"
                                            >
                                                {val}
                                                <button
                                                    onClick={() => removeValueFromAttribute(index, vIndex)}
                                                    className="ml-1 text-slate-300 hover:text-red-500"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <Button
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={handleGenerate}
                        disabled={selectedAttributes.length === 0 || selectedAttributes.some(a => a.values.length === 0)}
                    >
                        Add Variants
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
