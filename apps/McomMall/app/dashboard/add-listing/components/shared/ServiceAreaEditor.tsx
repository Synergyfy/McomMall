import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface ServiceArea {
    type: 'radius' | 'postcodes';
    value: string;
}

interface ServiceAreaEditorProps {
    area: ServiceArea;
    onAreaChange: (area: ServiceArea) => void;
    error?: string;
}

const ServiceAreaEditor: React.FC<ServiceAreaEditorProps> = ({ area, onAreaChange, error }) => {

    const handleTypeChange = (type: 'radius' | 'postcodes') => {
        onAreaChange({ ...area, type });
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onAreaChange({ ...area, value: e.target.value });
    };

    return (
        <div className="border-t pt-6">
            <div className="flex items-center space-x-2">
                <Label>Define Service Area</Label>
                <TooltipProvider>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Define the geographic area you cover.</p>
                    </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <RadioGroup
                value={area.type}
                onValueChange={handleTypeChange}
                className="mt-2"
            >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="radius" id="s-radius" />
                    <Label htmlFor="s-radius">By radius (in miles)</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="postcodes" id="s-postcodes" />
                    <Label htmlFor="s-postcodes">By list of postcodes</Label>
                </div>
            </RadioGroup>

            <div className="mt-4">
            {area.type === 'radius' ? (
                <Input
                placeholder="e.g., 10"
                type="number"
                value={area.value}
                onChange={handleValueChange}
                />
            ) : (
                <Input
                placeholder="e.g., SW1A, WC2N, SE1"
                value={area.value}
                onChange={handleValueChange}
                />
            )}
            </div>
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      </div>
    )
}

export default ServiceAreaEditor;
