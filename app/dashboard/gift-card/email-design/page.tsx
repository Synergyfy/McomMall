'use client';

import React, { useState } from 'react';
import { Gift, Mail, Info, PlusCircle, CreditCard } from 'lucide-react';

import AnniversaryChampagne from '@/components/svgs/gift-card/AnniversaryChampagne';
import AnniversaryHearts from '@/components/svgs/gift-card/AnniversaryHearts';
import AnniversaryRings from '@/components/svgs/gift-card/AnniversaryRings';
import BirthdayBalloons from '@/components/svgs/gift-card/BirthdayBalloons';
import BirthdayCake from '@/components/svgs/gift-card/BirthdayCake';
import BirthdayGift from '@/components/svgs/gift-card/BirthdayGift';
import HolidayPresents from '@/components/svgs/gift-card/HolidayPresents';
import HolidaySnowman from '@/components/svgs/gift-card/HolidaySnowman';
import HolidayTree from '@/components/svgs/gift-card/HolidayTree';
import OtherCelebration from '@/components/svgs/gift-card/OtherCelebration';
import OtherCongrats from '@/components/svgs/gift-card/OtherCongrats';
import OtherThankYou from '@/components/svgs/gift-card/OtherThankYou';
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
import { cn, CURRENCY } from '@/lib/utils';

type SvgComponent = React.ComponentType<{ className?: string }>;

const themes: Record<string, SvgComponent[]> = {
  birthday: [BirthdayCake, BirthdayBalloons, BirthdayGift],
  anniversary: [AnniversaryRings, AnniversaryChampagne, AnniversaryHearts],
  holiday: [HolidaySnowman, HolidayTree, HolidayPresents],
  default: [OtherThankYou, OtherCongrats, OtherCelebration],
};

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
  onSave,
}: {
  design: GiftCardDesign;
  setDesign: React.Dispatch<React.SetStateAction<GiftCardDesign>>;
  onSave: () => void;
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
                <Label htmlFor="designName" className="text-sm font-medium mb-2 block">
                  Design name (visible to customers)
                </Label>
                <Input
                  id="designName"
                  name="designName"
                  value={design.designName}
                  onChange={handleInputChange}
                  className="text-base p-2.5"
                />
              </div>
              <div>
                <Label htmlFor="title" className="text-sm font-medium mb-2 block">Gift card title</Label>
                <Input
                  id="title"
                  name="title"
                  value={design.title}
                  onChange={handleInputChange}
                  className="text-base p-2.5"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titleColor" className="text-sm font-medium mb-2 block">Gift card title color</Label>
                  <Input
                    id="titleColor"
                    name="titleColor"
                    type="color"
                    value={design.titleColor}
                    onChange={handleInputChange}
                    className="h-12 p-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cardColor" className="text-sm font-medium mb-2 block">Gift card color</Label>
                  <Input
                    id="cardColor"
                    name="cardColor"
                    type="color"
                    value={design.cardColor}
                    onChange={handleInputChange}
                    className="h-12 p-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="additionalContent" className="text-sm font-medium mb-2 block">
                  Additional content (HTML allowed)
                </Label>
                <Textarea
                  id="additionalContent"
                  name="additionalContent"
                  value={design.additionalContent}
                  onChange={handleInputChange}
                  className="text-base p-2.5"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Additional content location</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    value={design.contentLocation}
                    onValueChange={handleSelectChange('contentLocation')}
                  >
                    <SelectTrigger className="text-base p-2.5 h-12">
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
                    <SelectTrigger className="text-base p-2.5 h-12">
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
                <Label htmlFor="redeemButtonText" className="text-sm font-medium mb-2 block">Button Text</Label>
                <Input
                  id="redeemButtonText"
                  name="redeemButtonText"
                  value={design.redeemButtonText}
                  onChange={handleInputChange}
                  className="text-base p-2.5"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="redeemButtonColor" className="text-sm font-medium mb-2 block">Button color</Label>
                  <Input
                    id="redeemButtonColor"
                    name="redeemButtonColor"
                    type="color"
                    value={design.redeemButtonColor}
                    onChange={handleInputChange}
                    className="h-12 p-1"
                  />
                </div>
                <div>
                  <Label htmlFor="redeemButtonTextColor" className="text-sm font-medium mb-2 block">
                    Button text color
                  </Label>
                  <Input
                    id="redeemButtonTextColor"
                    name="redeemButtonTextColor"
                    type="color"
                    value={design.redeemButtonTextColor}
                    onChange={handleInputChange}
                    className="h-12 p-1"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="flex items-center space-x-2">
        <Button onClick={onSave}>Save design</Button>
        <Button variant="destructive">Delete design</Button>
      </div>
    </div>
  );
};

const CardPreview = React.forwardRef<
  HTMLDivElement,
  {
    design: GiftCardDesign;
    selectedSvg: SvgComponent | null;
  }
>(({ design, selectedSvg: SelectedSvg }, ref) => {
  const alignmentClasses = {
    Left: 'items-start',
    Center: 'items-center',
    Right: 'items-end',
  };

  const textAlignClasses = {
    Left: 'text-left',
    Center: 'text-center',
    Right: 'text-right',
  }

  const AdditionalContent = () => (
    <div
      className={`w-full flex flex-col ${alignmentClasses[design.contentAlignment]} ${textAlignClasses[design.contentAlignment]}`}
    >
      <div dangerouslySetInnerHTML={{ __html: design.additionalContent }} />
    </div>
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Email Preview</h2>
        <Button variant="outline" size="sm">
          <Mail className="w-4 h-4 mr-2" />
          Send a preview email
        </Button>
      </div>
      <div ref={ref} className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-4 border-b border-gray-200">
            <p className="text-sm text-gray-500"><strong>From:</strong> Your Business Name &lt;noreply@example.com&gt;</p>
            <p className="text-sm text-gray-500"><strong>To:</strong> Recipient Name &lt;recipient@example.com&gt;</p>
            <h3 className="text-lg font-semibold text-gray-800 mt-2">You&apos;ve received a gift card!</h3>
        </div>
        <div className="p-6 bg-gray-50 space-y-6">
            <div className="w-full max-w-md mx-auto h-40 flex items-center justify-center">
                {SelectedSvg ? (
                <SelectedSvg className="w-3/4 h-3/4" />
                ) : (
                <Gift className="w-12 h-12 text-gray-400" />
                )}
            </div>

            <div className="text-center text-gray-700">
                <p>Gift card message to the recipient from the sender will appear here.</p>
            </div>

            {design.contentLocation === 'Top' && <AdditionalContent />}

            <div
                className="w-full max-w-md mx-auto aspect-[1.586] rounded-2xl shadow-lg p-6 flex flex-col justify-between border"
                style={{ backgroundColor: design.cardColor }}
            >
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-semibold" style={{ color: design.titleColor }}>{design.title}</h2>
                    <CreditCard size={24} style={{ color: design.titleColor }}/>
                </div>

                <div className="text-left">
                    <p className="text-2xl md:text-3xl font-mono tracking-wider" style={{ color: design.titleColor }}>
                        4000 1234 5678 9010
                    </p>
                </div>

                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-xs uppercase" style={{ color: design.titleColor, opacity: 0.8 }}>Card Holder</p>
                        <p className="font-medium" style={{ color: design.titleColor }}>Recipient Name</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase" style={{ color: design.titleColor, opacity: 0.8 }}>Expires</p>
                        <p className="font-medium" style={{ color: design.titleColor }}>12/28</p>
                    </div>
                    <div className="text-3xl font-bold" style={{ color: design.titleColor }}>
                        {CURRENCY}123.45
                    </div>
                </div>
            </div>

             {design.contentLocation === 'Bottom' && <AdditionalContent />}

            <div className="text-center mt-4">
                <button
                    className="mt-4 px-10 py-3 rounded-lg font-bold text-lg shadow-md transition-transform transform hover:scale-105"
                    style={{
                    backgroundColor: design.redeemButtonColor,
                    color: design.redeemButtonTextColor,
                    }}
                >
                    {design.redeemButtonText}
                </button>
            </div>
        </div>
        <div className="p-4 border-t border-gray-200 text-center">
             <a href="#" className="text-sm text-orange-600 hover:underline">
              View or print your gift card
            </a>
        </div>
      </div>
    </div>
  );
});
CardPreview.displayName = 'CardPreview';

// --- MAIN PAGE COMPONENT ---
export default function GiftCardEditorPage() {
  const [design, setDesign] = useState<GiftCardDesign>(initialDesign);
  const [selectedTheme, setSelectedTheme] = useState<string>('birthday');
  const [selectedSvg, setSelectedSvg] = useState<SvgComponent | null>(
    () => BirthdayCake
  );
  const emailPreviewRef = React.useRef<HTMLDivElement>(null);

  const handleSave = () => {
    if (emailPreviewRef.current) {
      const originalNode = emailPreviewRef.current;
      const clonedNode = originalNode.cloneNode(true) as HTMLElement;

      const allOriginalNodes = Array.from(originalNode.querySelectorAll('*'));
      const allClonedNodes = Array.from(clonedNode.querySelectorAll('*'));

      allOriginalNodes.unshift(originalNode);
      allClonedNodes.unshift(clonedNode);

      allOriginalNodes.forEach((node, index) => {
        const cloned = allClonedNodes[index] as HTMLElement;
        const computedStyle = window.getComputedStyle(node);
        for (let i = 0; i < computedStyle.length; i++) {
          const propName = computedStyle[i];
          const propValue = computedStyle.getPropertyValue(propName);
          cloned.style.setProperty(propName, propValue);
        }
      });

      const emailHtml = clonedNode.outerHTML;

      const fullHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Preview</title>
            </head>
            <body>
                ${emailHtml}
            </body>
            </html>
        `;
      console.log(fullHtml);
    }
  };

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    setSelectedSvg(null);
  };

  const handleSvgSelect = (svg: SvgComponent) => {
    setSelectedSvg(() => svg);
  };

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-grow">
              <Label htmlFor="design-select" className="mb-2 block">
                Select a theme for your gift card.
              </Label>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedTheme}
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger id="design-select" className="max-w-xs">
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="birthday">Birthday Theme</SelectItem>
                    <SelectItem value="anniversary">
                      Anniversary Theme
                    </SelectItem>
                    <SelectItem value="holiday">Holiday Special</SelectItem>
                    <SelectItem value="default">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create a new design
                </Button>
              </div>
            </div>
          </div>
          {selectedTheme && themes[selectedTheme] && (
            <div className="mt-6">
              <Label>Select a design</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                {themes[selectedTheme].map((Svg, index) => (
                  <div
                    key={index}
                    onClick={() => handleSvgSelect(Svg)}
                    className={cn(
                      'cursor-pointer rounded-lg border-2 transition-all',
                      'hover:border-orange-500 hover:shadow-lg',
                      selectedSvg === Svg
                        ? 'border-orange-600'
                        : 'border-transparent'
                    )}
                  >
                    <Svg className="w-full h-auto rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          )}
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
            <DesignForm design={design} setDesign={setDesign} onSave={handleSave} />
          </div>

          {/* Right Column: Preview */}
          <div>
            <CardPreview design={design} selectedSvg={selectedSvg} ref={emailPreviewRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
