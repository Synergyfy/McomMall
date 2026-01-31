"use client";

import React from 'react';
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
import { Ruler } from 'lucide-react';
import { SizeGuideConfig } from '@/service/store/products/types';

interface SizeGuideModalProps {
    config: SizeGuideConfig;
}

export default function SizeGuideModal({ config }: SizeGuideModalProps) {
    if (!config || !config.enabled || config.measurements.length === 0) return null;

    // Detect columns dynamically from the first measurement row
    const columns = Object.keys(config.measurements[0])
        .filter(key => key !== 'size')
        .map(key => key.charAt(0).toUpperCase() + key.slice(1)); // Capitalize

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="link" className="p-0 h-auto text-orange-600 underline font-medium flex items-center gap-1">
                    <Ruler className="w-4 h-4" /> Size Guide
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Size Guide</DialogTitle>
                    <DialogDescription>
                        Measurements for {config.system.toUpperCase()} sizes.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="font-bold text-black">Size</TableHead>
                                {columns.map(col => (
                                    <TableHead key={col} className="font-bold text-black">{col}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {config.measurements.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{row.size}</TableCell>
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

                {/* Future: Add Body Diagram Image here if config.imageUrl exists */}
                {config.imageUrl && (
                    <div className="mt-6 border-t pt-4">
                        <h4 className="font-medium mb-2">Measurement Guide</h4>
                        <img src={config.imageUrl} alt="Measurement Guide" className="w-full h-auto rounded-lg" />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
