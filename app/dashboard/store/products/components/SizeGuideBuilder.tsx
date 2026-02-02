"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Plus, Trash2, Ruler, ImageIcon, Upload, X, Info, Search } from 'lucide-react';
import { SizeGuideConfig, SizeGuideMeasurement } from '@/service/store/products/types';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface SizeGuideBuilderProps {
    value?: SizeGuideConfig;
    onChange: (config: SizeGuideConfig) => void;
    detectedSizes?: string[]; // Optional: Sizes detected from Variant Matrix
    gender?: 'male' | 'female' | 'unisex' | 'none' | string;
}

const DEFAULT_MEASUREMENT_FIELDS = ['Bust', 'Waist', 'Hip', 'Length', 'UK', 'EU'];
const SHOE_MEASUREMENT_FIELDS = ['Foot Length', 'Width', 'EU', 'UK', 'US'];

export default function SizeGuideBuilder({ value, onChange, detectedSizes = [], gender }: SizeGuideBuilderProps) {
    const [enabled, setEnabled] = useState(value?.enabled || false);
    const [system, setSystem] = useState<SizeGuideConfig['system']>(value?.system || 'international');
    const [measurements, setMeasurements] = useState<SizeGuideMeasurement[]>(value?.measurements || []);
    const [imageUrl, setImageUrl] = useState(value?.imageUrl || '');
    const [diagrams, setDiagrams] = useState(value?.diagrams || { male: '', female: '', unisex: '' });
    const [conversionMap, setConversionMap] = useState<Record<string, string>>(value?.conversionMap || {});
    const [columns, setColumns] = useState<string[]>(DEFAULT_MEASUREMENT_FIELDS);

    // Sync with external value if needed, but avoiding infinite loops
    useEffect(() => {
        if (value) {
            setEnabled(value.enabled);
            setSystem(value.system);
            if (value.measurements && value.measurements.length > 0) {
                setMeasurements(value.measurements);
                // Detect columns from first row + defaults
                const keys = Object.keys(value.measurements[0]).filter(k => k !== 'size');
                if (keys.length > 0) setColumns(Array.from(new Set([...DEFAULT_MEASUREMENT_FIELDS, ...keys])));
            }
            setImageUrl(value.imageUrl || '');
            setDiagrams(value.diagrams || { male: '', female: '', unisex: '' });
            setConversionMap(value.conversionMap || {});
        }
    }, [value]);

    // Auto-populate from detected sizes if empty
    useEffect(() => {
        if (enabled && measurements.length === 0 && detectedSizes.length > 0) {
            const newMeasurements = detectedSizes.map(size => ({
                size,
                bust: '',
                waist: '',
                hip: '',
                length: ''
            }));
            setMeasurements(newMeasurements);
            updateConfig(true, system, newMeasurements);
        }
    }, [enabled, detectedSizes]);

    const updateConfig = (isEnabled: boolean, sys: SizeGuideConfig['system'], meas: SizeGuideMeasurement[], diag = diagrams) => {
        onChange({
            enabled: isEnabled,
            system: sys,
            measurements: meas,
            imageUrl: imageUrl,
            diagrams: diag,
            conversionMap: conversionMap
        });
    };

    const handleEnableToggle = (checked: boolean) => {
        setEnabled(checked);
        updateConfig(checked, system, measurements);
    };

    const handleSystemChange = (val: SizeGuideConfig['system']) => {
        setSystem(val);
        updateConfig(enabled, val, measurements);
    };

    const handleMeasurementChange = (index: number, field: string, val: string) => {
        const newMeasurements = [...measurements];
        newMeasurements[index] = { ...newMeasurements[index], [field.toLowerCase()]: val };
        setMeasurements(newMeasurements);
        updateConfig(enabled, system, newMeasurements);
    };

    const addRow = () => {
        const newMeasurements = [...measurements, { size: 'New Size' }];
        setMeasurements(newMeasurements);
        updateConfig(enabled, system, newMeasurements);
    };

    const removeRow = (index: number) => {
        const newMeasurements = measurements.filter((_, i) => i !== index);
        setMeasurements(newMeasurements);
        updateConfig(enabled, system, newMeasurements);
    };

    const addColumn = () => {
        const name = prompt("Enter measurement name (e.g., Inseam):");
        if (name && !columns.includes(name)) {
            setColumns([...columns, name]);
        }
    };

    if (!enabled) {
        return (
            <div className="p-4 border rounded-lg bg-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-full border">
                        <Ruler className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900">Size Guide</h4>
                        <p className="text-sm text-gray-500">Add a size chart to help customers choose the right fit.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="size-guide-toggle">Enable</Label>
                    <Switch id="size-guide-toggle" checked={enabled} onCheckedChange={handleEnableToggle} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 border rounded-lg p-6 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-full border border-orange-100">
                        <Ruler className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-900">Size Guide Configuration</h4>
                        <p className="text-sm text-gray-500">Define measurements for each size variant.</p>
                    </div>
                </div>
                <Switch id="size-guide-toggle-active" checked={enabled} onCheckedChange={handleEnableToggle} />
            </div>

            <div className="flex gap-4 items-end">
                <div className="space-y-2 w-48">
                    <Label>Sizing System</Label>
                    <Select value={system} onValueChange={(val: any) => handleSystemChange(val)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="international">International (S/M/L)</SelectItem>
                            <SelectItem value="us">US Sizes</SelectItem>
                            <SelectItem value="uk">UK Sizes</SelectItem>
                            <SelectItem value="eu">EU Sizes</SelectItem>
                            <SelectItem value="asian">Asian Sizes</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1">
                    <Label className="mb-2 block">Body Diagrams (Male / Female / Unisex)</Label>
                    <div className="flex items-center gap-4">
                        {(['male', 'female', 'unisex'] as const).map((type) => (
                            <div key={type} className="flex flex-col items-center gap-1">
                                {diagrams[type] ? (
                                    <div className={cn(
                                        "relative group w-20 h-20",
                                        gender === type && "ring-2 ring-[#f48c25] ring-offset-2 rounded-md"
                                    )}>
                                        <img
                                            src={diagrams[type]}
                                            alt={`${type} Diagram`}
                                            className="w-full h-full object-cover rounded-md border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const newDiag = { ...diagrams, [type]: '' };
                                                setDiagrams(newDiag);
                                                updateConfig(enabled, system, measurements, newDiag);
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-20 h-20 border-2 border-dashed rounded-md flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                                        <ImageIcon className="w-6 h-6 text-gray-400" />
                                        <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Upload</span>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const url = URL.createObjectURL(file);
                                                    const newDiag = { ...diagrams, [type]: url };
                                                    setDiagrams(newDiag);
                                                    updateConfig(enabled, system, measurements, newDiag);
                                                }
                                            }}
                                        />
                                    </label>
                                )}
                                <span className="text-[10px] font-bold text-[#9c7349] uppercase">{type}</span>
                            </div>
                        ))}
                        <div className="text-xs text-gray-500 ml-4">
                            <p className="font-medium text-gray-700">Measurement Visuals</p>
                            <p>Upload diagrams for different genders.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border rounded-md overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[100px]">Size</TableHead>
                            {columns.map(col => (
                                <TableHead key={col}>{col}</TableHead>
                            ))}
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {measurements.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Input
                                        value={row.size}
                                        onChange={(e) => handleMeasurementChange(index, 'size', e.target.value)}
                                        className="h-8 font-medium"
                                    />
                                </TableCell>
                                {columns.map(col => (
                                    <TableCell key={col}>
                                        <Input
                                            value={row[col.toLowerCase()] || ''}
                                            onChange={(e) => handleMeasurementChange(index, col, e.target.value)}
                                            className="h-8"
                                            placeholder="cm"
                                        />
                                    </TableCell>
                                ))}
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => removeRow(index)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={addRow}>
                    <Plus className="w-4 h-4 mr-2" /> Add Size Row
                </Button>
                <Button variant="outline" size="sm" onClick={addColumn}>
                    <Plus className="w-4 h-4 mr-2" /> Add Measurement Column
                </Button>
            </div>

            {/* Buyer Preview Section */}
            <div className="mt-8 pt-8 border-t">
                <h4 className="font-bold text-[#1c140d] mb-4 flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#f48c25]" />
                    Buyer View Preview
                </h4>
                <div className="p-4 rounded-xl border border-dashed border-[#e8dbce] bg-gray-50/50">
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm font-medium mr-2">Size:</span>
                        {measurements.map((m, idx) => (
                            <TooltipProvider key={idx}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button className="h-10 w-12 border rounded-md bg-white hover:border-[#f48c25] hover:text-[#f48c25] transition-all text-sm font-bold">
                                            {m.size}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent className="p-3">
                                        <div className="text-xs space-y-1">
                                            <p className="font-bold border-b pb-1 mb-1">Measurements ({m.size})</p>
                                            {columns.map(col => (
                                                <p key={col}>{col}: <span className="font-semibold">{m[col.toLowerCase()] || '-'} cm</span></p>
                                            ))}
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                         <button className="text-[#f48c25] text-sm font-bold underline flex items-center gap-1">
                            <Ruler className="w-4 h-4" /> Size Guide
                         </button>
                         <div className="text-[10px] text-[#9c7349] italic bg-white px-2 py-1 rounded border">
                            "Recommended for you: M" (based on your profile)
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
