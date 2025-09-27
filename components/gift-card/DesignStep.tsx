"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Gift, UploadCloud } from "lucide-react";
import AnniversaryChampagne from "@/components/svgs/gift-card/AnniversaryChampagne";
import AnniversaryHearts from "@/components/svgs/gift-card/AnniversaryHearts";
import AnniversaryRings from "@/components/svgs/gift-card/AnniversaryRings";
import BirthdayBalloons from "@/components/svgs/gift-card/BirthdayBalloons";
import BirthdayCake from "@/components/svgs/gift-card/BirthdayCake";
import BirthdayGift from "@/components/svgs/gift-card/BirthdayGift";
import HolidayPresents from "@/components/svgs/gift-card/HolidayPresents";
import HolidaySnowman from "@/components/svgs/gift-card/HolidaySnowman";
import HolidayTree from "@/components/svgs/gift-card/HolidayTree";
import OtherCelebration from "@/components/svgs/gift-card/OtherCelebration";
import OtherCongrats from "@/components/svgs/gift-card/OtherCongrats";
import OtherThankYou from "@/components/svgs/gift-card/OtherThankYou";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, CURRENCY } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type SvgComponent = React.ComponentType<{ className?: string }>;

const themes: Record<string, SvgComponent[]> = {
  birthday: [BirthdayCake, BirthdayBalloons, BirthdayGift],
  anniversary: [AnniversaryRings, AnniversaryChampagne, AnniversaryHearts],
  holiday: [HolidaySnowman, HolidayTree, HolidayPresents],
  default: [OtherThankYou, OtherCongrats, OtherCelebration],
};

const CardPreview = ({
  selectedSvg: SelectedSvg,
  customImage,
  amount,
}: {
  selectedSvg: SvgComponent | null;
  customImage: string | null;
  amount: number;
}) => {
  return (
    <Card className="bg-gray-50">
      <CardContent className="space-y-4 pt-6">
        <div className="text-center">
          {customImage ? (
            <Image
              src={customImage}
              alt="Custom design"
              width={400}
              height={200}
              className="mx-auto w-full h-auto rounded-lg"
            />
          ) : SelectedSvg ? (
            <SelectedSvg className="mx-auto w-full h-auto rounded-lg" />
          ) : (
            <Gift className="mx-auto h-12 w-12 text-gray-400" />
          )}
        </div>
        <div
          className="rounded-lg p-6 text-center shadow-md"
          style={{ backgroundColor: "#f0f0f0" }}
        >
          <h3 className="text-2xl font-bold">You&apos;ve received a gift card!</h3>
          <p className="text-4xl font-light my-4">
            {CURRENCY}
            {amount.toFixed(2)}
          </p>
          <p className="font-mono text-sm opacity-80">
            1234-WXYZ-5678-ABCD
          </p>
          <button
            className="mt-6 px-8 py-3 rounded-md font-semibold text-white"
            style={{
              backgroundColor: "#ea580c",
              color: "#ffffff",
            }}
          >
            Redeem
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

interface DesignStepProps {
  onSave: (design: { theme: string; svg: string | null; customImage: string | null }) => void;
  amount: number;
}

const DesignStep = ({ onSave, amount }: DesignStepProps) => {
  const [selectedTheme, setSelectedTheme] = useState<string>("birthday");
  const [selectedSvg, setSelectedSvg] = useState<SvgComponent | null>(() => BirthdayCake);
  const [customImage, setCustomImage] = useState<string | null>(null);

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    setSelectedSvg(themes[theme][0] || null);
    setCustomImage(null);
  };

  const handleSvgSelect = (svg: SvgComponent) => {
    setSelectedSvg(() => svg);
    setCustomImage(null);
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomImage(reader.result as string);
        setSelectedSvg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    const svgName = selectedSvg ? selectedSvg.name : null;
    onSave({ theme: selectedTheme, svg: svgName, customImage });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      <div className="space-y-6">
        <div>
          <label className="text-lg font-semibold mb-2 block">
            Select a theme
          </label>
          <Select value={selectedTheme} onValueChange={handleThemeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="birthday">Birthday</SelectItem>
              <SelectItem value="anniversary">Anniversary</SelectItem>
              <SelectItem value="holiday">Holiday</SelectItem>
              <SelectItem value="default">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-lg font-semibold mb-2 block">
            Choose a design
          </label>
          <div className="grid grid-cols-3 gap-4">
            {themes[selectedTheme].map((Svg, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSvgSelect(Svg)}
                className={cn(
                  "cursor-pointer rounded-lg border-2 p-2 transition-all",
                  "hover:border-orange-500",
                  selectedSvg === Svg ? "border-orange-600" : "border-gray-200"
                )}
              >
                <Svg className="w-full h-auto rounded-md" />
              </motion.div>
            ))}
          </div>
        </div>

        <div>
           <label htmlFor="customImageUpload" className="w-full">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="mt-4 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
              </div>
              <input id="customImageUpload" type="file" className="hidden" onChange={handleCustomImageUpload} accept="image/*" />
            </motion.div>
          </label>
        </div>

        <div className="flex space-x-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">Preview</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Email Preview</DialogTitle>
              </DialogHeader>
              <CardPreview selectedSvg={selectedSvg} customImage={customImage} amount={amount} />
            </DialogContent>
          </Dialog>
          <Button onClick={handleSave} className="w-full">
            Save and continue
          </Button>
        </div>
      </div>

      <div className="hidden lg:block">
        <CardPreview selectedSvg={selectedSvg} customImage={customImage} amount={amount} />
      </div>
    </motion.div>
  );
};

export default DesignStep;