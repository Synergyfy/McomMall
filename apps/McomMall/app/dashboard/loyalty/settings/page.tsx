'use client';

import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Tag,
  Gift,
  Settings,
  HelpCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// --- Preview Components ---

const PreviewCard = ({
  name,
  primaryColor,
  textColor,
}: {
  name: string;
  primaryColor: string;
  textColor: string;
}) => (
  <div
    className="rounded-lg p-6 text-white shadow-md"
    style={{ backgroundColor: primaryColor }}
  >
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Gift size={40} />
        <div>
          <h2 className="text-xl font-bold" style={{ color: textColor }}>
            {name}
          </h2>
        </div>
      </div>
      <div className="text-right">
        <p className="text-3xl font-bold" style={{ color: textColor }}>
          12,345
        </p>
        <p className="text-sm" style={{ color: textColor }}>
          Points
        </p>
      </div>
    </div>
    <div className="mt-4">
      <Button
        variant="secondary"
        className="w-auto px-4 py-2 h-auto text-sm bg-white hover:bg-gray-100"
        style={{ color: primaryColor }}
      >
        View Points History
      </Button>
    </div>
  </div>
);

const PreviewOffer = ({
  primaryColor,
  secondaryColor,
  textColor,
  bgColor,
}: {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  bgColor: string;
}) => (
  <Card style={{ backgroundColor: bgColor }}>
    <CardContent className="pt-6 space-y-4">
      <div>
        <h3 className="font-bold text-lg" style={{ color: secondaryColor }}>
          Offer
        </h3>
        <p className="text-sm" style={{ color: secondaryColor }}>
          This is a sample offer description.
        </p>
      </div>
      <Button
        className="w-full text-white"
        style={{ backgroundColor: primaryColor }}
      >
        Claim for free
      </Button>
    </CardContent>
  </Card>
);

// --- Main Page Component ---

export default function SettingsPage() {
  const [programName, setProgramName] = useState('My Rewards!');
  const [primaryColor, setPrimaryColor] = useState('#8A3FFC');
  const [secondaryColor, setSecondaryColor] = useState('#3D3D3D');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column: Settings Form */}
          <div className="space-y-8">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Rewards program status
                  </h2>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox id="status" defaultChecked />
                    <Label
                      htmlFor="status"
                      className="text-sm font-medium text-gray-700"
                    >
                      Active
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program-name">Program name</Label>
                  <Input
                    id="program-name"
                    value={programName}
                    onChange={e => setProgramName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image</Label>
                  <Select>
                    <SelectTrigger id="image">
                      <SelectValue placeholder="Gifts (Light)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gifts-light">Gifts (Light)</SelectItem>
                      <SelectItem value="gifts-dark">Gifts (Dark)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary color</Label>
                    <Input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={e => setPrimaryColor(e.target.value)}
                      className="p-1 h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Secondary color</Label>
                    <Input
                      id="secondary-color"
                      type="color"
                      value={secondaryColor}
                      onChange={e => setSecondaryColor(e.target.value)}
                      className="p-1 h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="text-color">Text color</Label>
                    <Input
                      id="text-color"
                      type="color"
                      value={textColor}
                      onChange={e => setTextColor(e.target.value)}
                      className="p-1 h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="background-color">Background color</Label>
                    <Input
                      id="background-color"
                      type="color"
                      value={backgroundColor}
                      onChange={e => setBackgroundColor(e.target.value)}
                      className="p-1 h-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Offer categories
                </h2>
                {/* Add offer categories content here */}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Preview */}
          <div className="space-y-6">
            <PreviewCard
              name={programName}
              primaryColor={primaryColor}
              textColor={textColor}
            />
            <PreviewOffer
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              textColor={textColor}
              bgColor={backgroundColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
