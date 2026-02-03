"use client";

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ruler, Sparkles, ChevronRight } from 'lucide-react';
import { SizeGuideConfig } from '@/service/store/products/types';
import { cn } from '@/lib/utils';

interface SizeGuideModalProps {
    config: SizeGuideConfig;
    productGender?: string;
    trigger?: React.ReactNode;
}

export default function SizeGuideModal({ config, productGender, trigger }: SizeGuideModalProps) {
    const [userMeasurements, setUserMeasurements] = useState<Record<string, string>>({});
    const [recommendation, setRecommendation] = useState<string | null>(null);

    if (!config || !config.enabled || config.measurements.length === 0) return null;

    const columns = Object.keys(config.measurements[0])
        .filter(key => key !== 'size' && key !== 'id')
        .map(key => key.charAt(0).toUpperCase() + key.slice(1));

    const handleRecommend = () => {
        let bestMatch = null;
        let minDiff = Infinity;

        config.measurements.forEach(m => {
            let totalDiff = 0;
            let matchCount = 0;

            Object.entries(userMeasurements).forEach(([key, val]) => {
                const target = m[key.toLowerCase()];
                if (target && val) {
                    const numVal = parseFloat(val);
                    // Handle ranges like "92-96"
                    let targetVal = 0;
                    if (typeof target === 'string' && target.includes('-')) {
                        const [min, max] = target.split('-').map(Number);
                        targetVal = (min + max) / 2;
                    } else {
                        targetVal = parseFloat(target as string);
                    }

                    if (!isNaN(numVal) && !isNaN(targetVal)) {
                        totalDiff += Math.abs(numVal - targetVal);
                        matchCount++;
                    }
                }
            });

            if (matchCount > 0 && totalDiff < minDiff) {
                minDiff = totalDiff;
                bestMatch = m.size;
            }
        });

        setRecommendation(bestMatch);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="link" className="p-0 h-auto text-orange-600 underline font-medium flex items-center gap-1">
                        <Ruler className="w-4 h-4" /> Size Guide
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl font-bold">
                        <Ruler className="text-orange-500" />
                        Size Guide & Fit Finder
                    </DialogTitle>
                    <DialogDescription>
                        Find your perfect fit using our {config.system.toUpperCase()} size chart.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    {/* Recommendation System */}
                    <div className="space-y-6 bg-orange-50/50 dark:bg-orange-900/10 p-6 rounded-2xl border border-orange-100 dark:border-orange-900/30">
                        <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400 font-bold">
                            <Sparkles size={18} />
                            <h3>Size Recommender</h3>
                        </div>
                        <p className="text-xs text-orange-600/80">Input your measurements to get a recommendation.</p>

                        <div className="grid grid-cols-2 gap-4">
                            {columns.slice(0, 4).map(col => (
                                <div key={col} className="space-y-1.5">
                                    <Label className="text-[10px] uppercase font-bold text-gray-500">{col} (cm)</Label>
                                    <Input
                                        className="h-9 bg-white"
                                        placeholder="--"
                                        value={userMeasurements[col] || ''}
                                        onChange={(e) => setUserMeasurements(prev => ({ ...prev, [col]: e.target.value }))}
                                    />
                                </div>
                            ))}
                        </div>

                        <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white" onClick={handleRecommend}>
                            Calculate Best Fit
                        </Button>

                        {recommendation && (
                            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border-2 border-orange-500 text-center animate-in zoom-in-95 duration-300">
                                <p className="text-sm font-medium text-gray-500">Recommended Size</p>
                                <p className="text-4xl font-black text-orange-600">{recommendation}</p>
                            </div>
                        )}
                    </div>

                    {/* Body Diagram */}
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4 w-full flex items-center justify-center aspect-[4/5] relative">
                            {config.diagrams && productGender && config.diagrams[productGender as keyof typeof config.diagrams] ? (
                                <img
                                    src={config.diagrams[productGender as keyof typeof config.diagrams]}
                                    alt="Measurement Guide"
                                    className="max-h-full w-auto object-contain"
                                />
                            ) : config.diagrams?.unisex ? (
                                <img
                                    src={config.diagrams.unisex}
                                    alt="Measurement Guide"
                                    className="max-h-full w-auto object-contain"
                                />
                            ) : config.imageUrl ? (
                                <img
                                    src={config.imageUrl}
                                    alt="Measurement Guide"
                                    className="max-h-full w-auto object-contain"
                                />
                            ) : (
                                <div className="text-gray-400 flex flex-col items-center gap-2">
                                    <Ruler size={48} className="opacity-20" />
                                    <span className="text-xs">No diagram available</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ChevronRight size={16} className="text-orange-500" />
                        Detailed Size Chart
                    </h4>
                    <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                                    <TableHead className="font-bold text-gray-900 dark:text-white">Size</TableHead>
                                    {columns.map(col => (
                                        <TableHead key={col} className="font-bold text-gray-900 dark:text-white">{col}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {config.measurements.map((row, index) => (
                                    <TableRow key={index} className={cn(recommendation === row.size && "bg-orange-50 dark:bg-orange-900/20")}>
                                        <TableCell className="font-black text-orange-600">{row.size}</TableCell>
                                        {columns.map(col => (
                                            <TableCell key={col}>
                                                {row[col.toLowerCase()] || '-'}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                <p className="text-[10px] text-gray-500 mt-6 text-center italic">
                    * All measurements are in centimeters unless otherwise stated. Please allow 1-2cm difference due to manual measurement.
                </p>
            </DialogContent>
        </Dialog>
    );
}
