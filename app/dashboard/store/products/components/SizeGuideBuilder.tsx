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
import { Plus, Trash2, Ruler, ImageIcon, Upload, X } from 'lucide-react';
import { SizeGuideConfig, SizeGuideMeasurement } from '@/service/store/products/types';

interface SizeGuideBuilderProps {
    value?: SizeGuideConfig;
    onChange: (config: SizeGuideConfig) => void;
    detectedSizes?: string[]; // Optional: Sizes detected from Variant Matrix
}

const DEFAULT_MEASUREMENT_FIELDS = ['Bust', 'Waist', 'Hip', 'Length'];
const SHOE_MEASUREMENT_FIELDS = ['Foot Length', 'EU', 'UK', 'US'];

export default function SizeGuideBuilder({ value, onChange, detectedSizes = [] }: SizeGuideBuilderProps) {
    const [enabled, setEnabled] = useState(value?.enabled || false);
    const [system, setSystem] = useState<SizeGuideConfig['system']>(value?.system || 'international');
    const [measurements, setMeasurements] = useState<SizeGuideMeasurement[]>(value?.measurements || []);
    const [imageUrl, setImageUrl] = useState(value?.imageUrl || '');
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

    const updateConfig = (isEnabled: boolean, sys: SizeGuideConfig['system'], meas: SizeGuideMeasurement[]) => {
        onChange({
            enabled: isEnabled,
            system: sys,
            measurements: meas,
            imageUrl: imageUrl,
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

        // Auto-switch columns for shoes?
        // (Simplified logic for now)
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
                    <Label className="mb-2 block">Body Diagram / Guide Image</Label>
                    <div className="flex items-center gap-4">
                        {imageUrl ? (
                            <div className="relative group w-20 h-20">
                                <img
                                    src={imageUrl}
                                    alt="Size Guide Diagram"
                                    className="w-full h-full object-cover rounded-md border"
                                />
                                <button
                                    type="button"
                                    onClick={() => { setImageUrl(''); updateConfig(enabled, system, measurements); }}
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
                                            setImageUrl(url);
                                            // Trigger config update with new image
                                            onChange({
                                                enabled,
                                                system,
                                                measurements,
                                                imageUrl: url
                                            });
                                        }
                                    }}
                                />
                            </label>
                        )}
                        <div className="text-xs text-gray-500">
                            <p className="font-medium text-gray-700">Measurement Visual</p>
                            <p>Upload a diagram showing where to measure.</p>
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
        </div>
    );
}
