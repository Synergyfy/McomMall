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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
  recipientName,
  personalMessage,
  title,
  titleColor,
  cardColor,
  additionalContent,
  redeemButtonText,
  redeemButtonColor,
  redeemButtonTextColor,
}: {
  selectedSvg: SvgComponent | null;
  customImage: string | null;
  amount: number;
  recipientName: string;
  personalMessage: string;
  title: string;
  titleColor: string;
  cardColor: string;
  additionalContent: string;
  redeemButtonText: string;
  redeemButtonColor: string;
  redeemButtonTextColor: string;
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
        {additionalContent && (
            <div className="text-sm text-gray-600 text-center">
                <p>{additionalContent}</p>
            </div>
        )}
        <div
          className="rounded-lg p-6 text-center shadow-md transition-colors duration-300"
          style={{ backgroundColor: cardColor, color: titleColor }}
        >
          <h3 className="text-2xl font-bold" style={{ color: titleColor }}>{title || "You've received a gift card!"}</h3>
          <p className="text-sm mt-2">For: {recipientName || "Recipient"}</p>
          <p className="text-4xl font-light my-4">
            {CURRENCY}
            {amount.toFixed(2)}
          </p>
          <p className="font-mono text-sm opacity-80">
            1234-WXYZ-5678-ABCD
          </p>
          <p className="mt-4 italic">
            &quot;{personalMessage || "Enjoy your gift!"}&quot;
          </p>
          <button
            className="mt-6 px-8 py-3 rounded-md font-semibold transition-colors duration-300"
            style={{
              backgroundColor: redeemButtonColor,
              color: redeemButtonTextColor,
            }}
          >
            {redeemButtonText || "Redeem"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

interface DesignStepProps {
  onSave: (data: {
    theme: string;
    svg: string | null;
    customImage: string | null;
    recipientName: string;
    recipientEmail: string;
    personalMessage: string;
    title: string;
    titleColor: string;
    cardColor: string;
    additionalContent: string;
    redeemButtonText: string;
    redeemButtonColor: string;
    redeemButtonTextColor: string;
  }) => void;
  amount: number;
  recipientType: "myself" | "someoneElse";
}

const DesignStep = ({ onSave, amount, recipientType }: DesignStepProps) => {
  const [selectedTheme, setSelectedTheme] = useState<string>("birthday");
  const [selectedSvg, setSelectedSvg] = useState<SvgComponent | null>(() => BirthdayCake);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [title, setTitle] = useState("A Gift For You");
  const [titleColor, setTitleColor] = useState("#000000");
  const [cardColor, setCardColor] = useState("#f0f0f0");
  const [additionalContent, setAdditionalContent] = useState("");
  const [redeemButtonText, setRedeemButtonText] = useState("Redeem Gift");
  const [redeemButtonColor, setRedeemButtonColor] = useState("#ea580c");
  const [redeemButtonTextColor, setRedeemButtonTextColor] = useState("#ffffff");

  const handleThemeChange = (theme: string) => {
    setSelectedTheme(theme);
    setSelectedSvg(null);
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
    onSave({
      theme: selectedTheme,
      svg: svgName,
      customImage,
      recipientName,
      recipientEmail,
      personalMessage,
      title,
      titleColor,
      cardColor,
      additionalContent,
      redeemButtonText,
      redeemButtonColor,
      redeemButtonTextColor,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      <div className="space-y-6">
        <Accordion type="multiple" defaultValue={["recipient", "design", "theme"]}>
          <AccordionItem value="recipient">
            <AccordionTrigger>Recipient Details</AccordionTrigger>
            <AccordionContent className="space-y-4">
              {recipientType === "someoneElse" && (
                <>
                  <div>
                    <Label htmlFor="recipientName">Recipient Name</Label>
                    <Input
                      id="recipientName"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipientEmail">Recipient Email</Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      placeholder="jane.doe@example.com"
                    />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="personalMessage">Personal Message</Label>
                <Textarea
                  id="personalMessage"
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Happy Birthday!"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="design">
            <AccordionTrigger>Card Design</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div>
                <Label htmlFor="title">Gift Card Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
               <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titleColor">Title Color</Label>
                  <Input
                    id="titleColor"
                    type="color"
                    value={titleColor}
                    onChange={(e) => setTitleColor(e.target.value)}
                    className="h-12 p-1"
                  />
                </div>
                <div>
                  <Label htmlFor="cardColor">Card Background Color</Label>
                  <Input
                    id="cardColor"
                    type="color"
                    value={cardColor}
                    onChange={(e) => setCardColor(e.target.value)}
                    className="h-12 p-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="additionalContent">Additional Content</Label>
                <Textarea
                  id="additionalContent"
                  value={additionalContent}
                  onChange={(e) => setAdditionalContent(e.target.value)}
                  placeholder="Optional text to display above the card"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="button">
             <AccordionTrigger>Redeem Button</AccordionTrigger>
             <AccordionContent className="space-y-4">
                <div>
                  <Label htmlFor="redeemButtonText">Button Text</Label>
                  <Input
                    id="redeemButtonText"
                    value={redeemButtonText}
                    onChange={(e) => setRedeemButtonText(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="redeemButtonColor">Button Color</Label>
                        <Input
                        id="redeemButtonColor"
                        type="color"
                        value={redeemButtonColor}
                        onChange={(e) => setRedeemButtonColor(e.target.value)}
                        className="h-12 p-1"
                        />
                    </div>
                    <div>
                        <Label htmlFor="redeemButtonTextColor">Button Text Color</Label>
                        <Input
                        id="redeemButtonTextColor"
                        type="color"
                        value={redeemButtonTextColor}
                        onChange={(e) => setRedeemButtonTextColor(e.target.value)}
                        className="h-12 p-1"
                        />
                    </div>
                </div>
             </AccordionContent>
          </AccordionItem>

          <AccordionItem value="theme">
            <AccordionTrigger>Theme &amp; Image</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div>
                <Label>Select a theme</Label>
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
                <Label>Choose a design</Label>
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
                <Label htmlFor="customImageUpload" className="w-full">Or upload your own</Label>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
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
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex space-x-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">Preview</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Email Preview</DialogTitle>
              </DialogHeader>
              <CardPreview
                selectedSvg={selectedSvg}
                customImage={customImage}
                amount={amount}
                recipientName={recipientName}
                personalMessage={personalMessage}
                title={title}
                titleColor={titleColor}
                cardColor={cardColor}
                additionalContent={additionalContent}
                redeemButtonText={redeemButtonText}
                redeemButtonColor={redeemButtonColor}
                redeemButtonTextColor={redeemButtonTextColor}
              />
            </DialogContent>
          </Dialog>
          <Button onClick={handleSave} className="w-full">
            Save and continue
          </Button>
        </div>
      </div>
      <div className="hidden lg:block">
        <CardPreview
          selectedSvg={selectedSvg}
          customImage={customImage}
          amount={amount}
          recipientName={recipientName}
          personalMessage={personalMessage}
          title={title}
          titleColor={titleColor}
          cardColor={cardColor}
          additionalContent={additionalContent}
          redeemButtonText={redeemButtonText}
          redeemButtonColor={redeemButtonColor}
          redeemButtonTextColor={redeemButtonTextColor}
        />
      </div>
    </motion.div>
  );
};

export default DesignStep;