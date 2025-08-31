'use client';

import React, { useState } from 'react';
import { Gift, Mail, Info, PlusCircle } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type GiftCardDesign = {
  designName: string;
  title: string;
  titleColor: string;
  cardColor: string;
  additionalContent: string;
  contentLocation: 'Top' | 'Bottom';
  contentAlignment: 'Left' | 'Center' | 'Right';
  redeemButtonText: string;
  redeemButtonColor: string;
  redeemButtonTextColor: string;
};

// --- MOCK DATA & DEFAULTS ---
const initialDesign: GiftCardDesign = {
  designName: 'Default',
  title: 'Pimwick Dev Gift Card',
  titleColor: '#000000',
  cardColor: '#f0f0f0',
  additionalContent: 'Here is some additional information for the recipient.',
  contentLocation: 'Top',
  contentAlignment: 'Left',
  redeemButtonText: 'Redeem',
  redeemButtonColor: '#ea580c', // orange-600
  redeemButtonTextColor: '#ffffff',
};

// --- SUB-COMPONENTS ---
const DesignForm = ({
  design,
  setDesign,
}: {
  design: GiftCardDesign;
  setDesign: React.Dispatch<React.SetStateAction<GiftCardDesign>>;
}) => {
  const [openSections, setOpenSections] = useState<string[]>([
    'general',
    'redeem',
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDesign(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange =
    (name: keyof GiftCardDesign) => (value: string) => {
      setDesign(prev => ({ ...prev, [name]: value }));
    };

  return (
    <div className="space-y-6">
      <Accordion
        type="multiple"
        value={openSections}
        onValueChange={setOpenSections}
      >
        <AccordionItem value="general">
          <AccordionTrigger>General</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="designName">
                  Design name (visible to customers)
                </Label>
                <Input
                  id="designName"
                  name="designName"
                  value={design.designName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="title">Gift card title</Label>
                <Input
                  id="title"
                  name="title"
                  value={design.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titleColor">Gift card title color</Label>
                  <Input
                    id="titleColor"
                    name="titleColor"
                    type="color"
                    value={design.titleColor}
                    onChange={handleInputChange}
                    className="h-10 p-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cardColor">Gift card color</Label>
                  <Input
                    id="cardColor"
                    name="cardColor"
                    type="color"
                    value={design.cardColor}
                    onChange={handleInputChange}
                    className="h-10 p-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="additionalContent">
                  Additional content (HTML allowed)
                </Label>
                <Textarea
                  id="additionalContent"
                  name="additionalContent"
                  value={design.additionalContent}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label>Additional content location</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={design.contentLocation}
                    onValueChange={handleSelectChange('contentLocation')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Top">Top</SelectItem>
                      <SelectItem value="Bottom">Bottom</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={design.contentAlignment}
                    onValueChange={handleSelectChange('contentAlignment')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Left">Left</SelectItem>
                      <SelectItem value="Center">Center</SelectItem>
                      <SelectItem value="Right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="redeem">
          <AccordionTrigger>Redeem Button</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="redeemButtonText">Button Text</Label>
                <Input
                  id="redeemButtonText"
                  name="redeemButtonText"
                  value={design.redeemButtonText}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="redeemButtonColor">Button color</Label>
                  <Input
                    id="redeemButtonColor"
                    name="redeemButtonColor"
                    type="color"
                    value={design.redeemButtonColor}
                    onChange={handleInputChange}
                    className="h-10 p-1"
                  />
                </div>
                <div>
                  <Label htmlFor="redeemButtonTextColor">
                    Button text color
                  </Label>
                  <Input
                    id="redeemButtonTextColor"
                    name="redeemButtonTextColor"
                    type="color"
                    value={design.redeemButtonTextColor}
                    onChange={handleInputChange}
                    className="h-10 p-1"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="flex items-center space-x-2">
        <Button>Save design</Button>
        <Button variant="destructive">Delete design</Button>
      </div>
    </div>
  );
};

const CardPreview = ({ design }: { design: GiftCardDesign }) => {
  const alignmentClasses = {
    Left: 'text-left',
    Center: 'text-center',
    Right: 'text-right',
  };

  const AdditionalContent = () => (
    <div
      className={`text-sm text-gray-600 ${
        alignmentClasses[design.contentAlignment]
      }`}
    >
      <p>{design.additionalContent}</p>
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Preview</h2>
        <Button variant="outline">
          <Mail className="w-4 h-4 mr-2" />
          Send a preview email
        </Button>
      </div>
      <Card className="bg-gray-50">
        <CardContent className="space-y-4 pt-6">
          <div className="text-center">
            <Gift className="mx-auto h-12 w-12 text-gray-400" />
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>To:</strong> Recipient Name
            </p>
            <p>
              <strong>From:</strong> The Purchasing Customer
            </p>
            <p>Gift card message to the recipient from the sender.</p>
          </div>

          {design.contentLocation === 'Top' && <AdditionalContent />}

          <div
            className="rounded-lg p-6 text-center shadow-md transition-colors duration-300"
            style={{ backgroundColor: design.cardColor }}
          >
            <h3
              className="text-2xl font-bold transition-colors duration-300"
              style={{ color: design.titleColor }}
            >
              {design.title}
            </h3>
            <p
              className="text-4xl font-light my-4"
              style={{ color: design.titleColor }}
            >
              $123.45
            </p>
            <p
              className="font-mono text-sm"
              style={{ color: design.titleColor, opacity: 0.8 }}
            >
              1234-WXYZ-5678-ABCD
            </p>
            <button
              className="mt-6 px-8 py-3 rounded-md font-semibold text-white transition-colors duration-300"
              style={{
                backgroundColor: design.redeemButtonColor,
                color: design.redeemButtonTextColor,
              }}
            >
              {design.redeemButtonText}
            </button>
            <p
              className="text-xs mt-4"
              style={{ color: design.titleColor, opacity: 0.7 }}
            >
              Expires June 17, 2026
            </p>
          </div>

          {design.contentLocation === 'Bottom' && <AdditionalContent />}

          <div className="text-center mt-4">
            <a href="#" className="text-sm text-orange-600 hover:underline">
              View or print your gift card.
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function GiftCardEditorPage() {
  const [design, setDesign] = useState<GiftCardDesign>(initialDesign);

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-grow">
              <Label htmlFor="design-select">
                Select a design to edit or add a new design.
              </Label>
              <div className="flex items-center gap-2">
                <Select defaultValue="default">
                  <SelectTrigger id="design-select" className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="holiday">Holiday Special</SelectItem>
                    <SelectItem value="birthday">Birthday Theme</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create a new design
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500 gap-2">
            <Info className="w-4 h-4" />
            <span>
              Edit the PW Gift Card product to specify which Email Designs can
              be selected by the purchasing customer.
            </span>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
          {/* Left Column: Form */}
          <div className="mb-8 lg:mb-0">
            <DesignForm design={design} setDesign={setDesign} />
          </div>

          {/* Right Column: Preview */}
          <div>
            <CardPreview design={design} />
          </div>
        </div>
      </div>
    </div>
  );
}
