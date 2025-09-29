"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CardPreview from "./CardPreview";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type SvgComponent = React.ComponentType<{ className?: string }>;

const themes: Record<string, { name: string, component: SvgComponent }[]> = {
  birthday: [{name: "BirthdayCake", component: BirthdayCake}, {name: "BirthdayBalloons", component: BirthdayBalloons}, {name: "BirthdayGift", component: BirthdayGift}],
  anniversary: [{name: "AnniversaryRings", component: AnniversaryRings}, {name: "AnniversaryChampagne", component: AnniversaryChampagne}, {name: "AnniversaryHearts", component: AnniversaryHearts}],
  holiday: [{name: "HolidaySnowman", component: HolidaySnowman}, {name: "HolidayTree", component: HolidayTree}, {name: "HolidayPresents", component: HolidayPresents}],
  default: [{name: "OtherThankYou", component: OtherThankYou}, {name: "OtherCongrats", component: OtherCongrats}, {name: "OtherCelebration", component: OtherCelebration}],
};

const svgMap: Record<string, SvgComponent> = Object.values(themes).flat().reduce((acc, {name, component}) => ({...acc, [name]: component}), {});

const createDesignFormSchema = (recipientType: "myself" | "someoneElse") => z.object({
  recipientName: z.string().refine((val) => recipientType === "myself" || (val && val.length > 0), {
    message: "Recipient's name is required.",
  }),
  recipientEmail: z.string().email("Invalid email format.").refine((val) => recipientType === "myself" || (val && val.length > 0), {
    message: "Recipient's email is required.",
  }),
  personalMessage: z.string().optional(),
  theme: z.string(),
  svg: z.string().nullable(),
  customImage: z.string().nullable(),
  title: z.string().min(1, "Title is required."),
  titleColor: z.string(),
  cardColor: z.string(),
  additionalContent: z.string().optional(),
  redeemButtonText: z.string().min(1, "Button text is required."),
  redeemButtonColor: z.string(),
  redeemButtonTextColor: z.string(),
});

interface DesignStepProps {
  onSave: (data: z.infer<ReturnType<typeof createDesignFormSchema>>) => void;
  amount: number;
  recipientType: "myself" | "someoneElse";
}

const DesignStep = ({ onSave, amount, recipientType }: DesignStepProps) => {
  const formSchema = createDesignFormSchema(recipientType);
  type DesignFormValues = z.infer<typeof formSchema>;

  const form = useForm<DesignFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipientName: "",
      recipientEmail: "",
      personalMessage: "",
      theme: "birthday",
      svg: "BirthdayCake",
      customImage: null,
      title: "A Gift For You",
      titleColor: "#000000",
      cardColor: "#f0f0f0",
      additionalContent: "",
      redeemButtonText: "Redeem Gift",
      redeemButtonColor: "#ea580c",
      redeemButtonTextColor: "#ffffff",
    },
  });

  const formData = form.watch();

  const handleThemeChange = (theme: string) => {
    form.setValue("theme", theme);
    form.setValue("svg", null);
    form.setValue("customImage", null);
  };

  const handleSvgSelect = (svgName: string) => {
    form.setValue("svg", svgName);
    form.setValue("customImage", null);
  };

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("customImage", reader.result as string);
        form.setValue("svg", null);
      };
      reader.readAsDataURL(file);
    }
  };

  const SelectedSvg = formData.svg ? svgMap[formData.svg] : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      <div className="space-y-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)}>
            <Accordion type="multiple" defaultValue={["recipient", "design", "theme"]} className="space-y-6">
              <AccordionItem value="recipient">
                <AccordionTrigger>Recipient Details</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  {recipientType === "someoneElse" && (
                    <>
                      <FormField
                        control={form.control}
                        name="recipientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recipient Name</FormLabel>
                            <FormControl><Input placeholder="Jane Doe" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="recipientEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Recipient Email</FormLabel>
                            <FormControl><Input type="email" placeholder="jane.doe@example.com" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  <FormField
                    control={form.control}
                    name="personalMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Personal Message</FormLabel>
                        <FormControl><Textarea placeholder="Happy Birthday!" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="design">
                <AccordionTrigger>Card Design</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gift Card Title</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="titleColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title Color</FormLabel>
                          <FormControl><Input type="color" className="h-12 p-1" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cardColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Background Color</FormLabel>
                          <FormControl><Input type="color" className="h-12 p-1" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="additionalContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Content</FormLabel>
                        <FormControl><Textarea placeholder="Optional text to display above the card" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="button">
                <AccordionTrigger>Redeem Button</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="redeemButtonText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button Text</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="redeemButtonColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Color</FormLabel>
                          <FormControl><Input type="color" className="h-12 p-1" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="redeemButtonTextColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Text Color</FormLabel>
                          <FormControl><Input type="color" className="h-12 p-1" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="theme">
                <AccordionTrigger>Theme &amp; Image</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select a theme</FormLabel>
                        <Select onValueChange={handleThemeChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select a theme" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="birthday">Birthday</SelectItem>
                            <SelectItem value="anniversary">Anniversary</SelectItem>
                            <SelectItem value="holiday">Holiday</SelectItem>
                            <SelectItem value="default">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div>
                    <FormLabel>Choose a design</FormLabel>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      {themes[formData.theme].map(({ name, component: Svg }) => (
                        <motion.div
                          key={name}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSvgSelect(name)}
                          className={cn(
                            "cursor-pointer rounded-lg border-2 p-2 transition-all",
                            "hover:border-orange-500",
                            formData.svg === name ? "border-orange-600" : "border-gray-200"
                          )}
                        >
                          <Svg className="w-full h-auto rounded-md" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <FormLabel htmlFor="customImageUpload" className="w-full">Or upload your own</FormLabel>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="mt-2 flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <label htmlFor="customImageUpload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                        <UploadCloud className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                        <input id="customImageUpload" type="file" className="hidden" onChange={handleCustomImageUpload} accept="image/*" />
                      </label>
                    </motion.div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="flex space-x-4 pt-6">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">Preview</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader><DialogTitle>Email Preview</DialogTitle></DialogHeader>
                  <CardPreview
                    selectedSvg={SelectedSvg}
                    customImage={formData.customImage}
                    amount={amount}
                    recipientName={formData.recipientName}
                    personalMessage={formData.personalMessage || ""}
                    title={formData.title}
                    titleColor={formData.titleColor}
                    cardColor={formData.cardColor}
                    additionalContent={formData.additionalContent || ""}
                    redeemButtonText={formData.redeemButtonText}
                    redeemButtonColor={formData.redeemButtonColor}
                    redeemButtonTextColor={formData.redeemButtonTextColor}
                  />
                </DialogContent>
              </Dialog>
              <Button type="submit" className="w-full">
                Save and continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <div className="hidden lg:block">
        <CardPreview
          selectedSvg={SelectedSvg}
          customImage={formData.customImage}
          amount={amount}
          recipientName={formData.recipientName}
          personalMessage={formData.personalMessage || ""}
          title={formData.title}
          titleColor={formData.titleColor}
          cardColor={formData.cardColor}
          additionalContent={formData.additionalContent || ""}
          redeemButtonText={formData.redeemButtonText}
          redeemButtonColor={formData.redeemButtonColor}
          redeemButtonTextColor={formData.redeemButtonTextColor}
        />
      </div>
    </motion.div>
  );
};

export default DesignStep;