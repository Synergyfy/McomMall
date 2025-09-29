"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InitiatePurchaseDto,
  GiftCardTemplate,
} from "@/service/gift-card/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CURRENCY } from "@/lib/utils";
import CardPreview from "./CardPreview";
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
import { Calendar } from "@/components/ui/calendar";
import { Clock } from "lucide-react";

type SvgComponent = React.ComponentType<{ className?: string }>;

const svgMap: Record<string, SvgComponent> = {
    BirthdayCake,
    BirthdayBalloons,
    BirthdayGift,
    AnniversaryRings,
    AnniversaryChampagne,
    AnniversaryHearts,
    HolidaySnowman,
    HolidayTree,
    HolidayPresents,
    OtherThankYou,
    OtherCongrats,
    OtherCelebration,
};

const checkoutFormSchema = z
  .object({
    senderName: z.string().min(1, "Sender name is required."),
    senderEmail: z.string().email("Your email is required.").optional(),
    paymentProvider: z.enum(["stripe", "paypal"]),
    recipientType: z.enum(["myself", "someoneElse"]),
    deliveryType: z.enum(["now", "scheduled"]),
    deliveryDate: z.date().optional(),
    deliveryTime: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.recipientType === "myself") {
        return !!data.senderEmail;
      }
      return true;
    },
    {
      message: "Your email is required.",
      path: ["senderEmail"],
    }
  )
  .refine(
    (data) => {
      if (data.deliveryType === "scheduled") {
        return !!data.deliveryDate;
      }
      return true;
    },
    {
      message: "Please select a delivery date.",
      path: ["deliveryDate"],
    }
  );

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

interface CheckoutStepProps {
  template: GiftCardTemplate;
  formData: {
    amount: number;
    recipientType: "myself" | "someoneElse";
    recipientName: string;
    recipientEmail: string;
    personalMessage: string;
    design: {
      theme: string;
      svg: string | null;
      customImage: string | null;
      title: string;
      titleColor: string;
      cardColor: string;
      additionalContent: string;
      redeemButtonText: string;
      redeemButtonColor: string;
      redeemButtonTextColor: string;
    }
  };
  onPurchase: (details: InitiatePurchaseDto) => void;
  isInitiating: boolean;
}

const CheckoutStep = ({
  template,
  formData,
  onPurchase,
  isInitiating,
}: CheckoutStepProps) => {
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      paymentProvider: "stripe",
      recipientType: formData.recipientType,
      deliveryType: "now",
      deliveryTime: "10:00",
    },
  });

  const onSubmit = (values: CheckoutFormValues) => {
    let scheduledAt: Date | undefined = undefined;
    if (values.deliveryType === "scheduled" && values.deliveryDate) {
      const [hours, minutes] = (values.deliveryTime || "00:00").split(":").map(Number);
      scheduledAt = new Date(values.deliveryDate);
      scheduledAt.setHours(hours, minutes);
    }

    const purchaseDetails: InitiatePurchaseDto = {
      recipientName:
        formData.recipientType === "myself"
          ? values.senderName
          : formData.recipientName,
      recipientEmail:
        formData.recipientType === "myself"
          ? values.senderEmail!
          : formData.recipientEmail,
      senderName: values.senderName,
      personalMessage: formData.personalMessage,
      paymentProvider: values.paymentProvider,
      templateId: template.id,
      amount: formData.amount,
      // scheduledAt: scheduledAt, // Assuming the DTO will be updated to accept this
    };
    onPurchase(purchaseDetails);
  };

  const SelectedSvg = formData.design.svg ? svgMap[formData.design.svg] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      <div>
        <h2 className="text-2xl font-bold mb-4">Final Preview</h2>
        <CardPreview
            selectedSvg={SelectedSvg}
            customImage={formData.design.customImage}
            amount={formData.amount}
            recipientName={formData.recipientName}
            personalMessage={formData.personalMessage}
            title={formData.design.title}
            titleColor={formData.design.titleColor}
            cardColor={formData.design.cardColor}
            additionalContent={formData.design.additionalContent}
            redeemButtonText={formData.design.redeemButtonText}
            redeemButtonColor={formData.design.redeemButtonColor}
            redeemButtonTextColor={formData.design.redeemButtonTextColor}
        />
      </div>
      <div>
        <h2 className="text-2xl font-bold mb-4">Payment & Delivery</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Your Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                        control={form.control}
                        name="senderName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Your Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        {formData.recipientType === "myself" && (
                        <FormField
                            control={form.control}
                            name="senderEmail"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your Email</FormLabel>
                                <FormControl>
                                <Input placeholder="you@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Delivery</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <FormField
                        control={form.control}
                        name="deliveryType"
                        render={({ field }) => (
                            <FormItem>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select delivery option" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="now">Send Now</SelectItem>
                                        <SelectItem value="scheduled">Schedule for later</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                     />
                    {form.watch("deliveryType") === "scheduled" && (
                         <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="flex flex-col md:flex-row gap-4 pt-4"
                        >
                            <FormField
                                control={form.control}
                                name="deliveryDate"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <Label>Date</Label>
                                        <FormControl>
                                             <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={{ before: new Date() }}
                                                className="rounded-md border"
                                                />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="deliveryTime"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <Label>Time</Label>
                                        <FormControl>
                                            <div className="relative">
                                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <Input type="time" {...field} className="pl-10 h-12" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </motion.div>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Payment</CardTitle>
                </CardHeader>
                <CardContent>
                    <FormField
                    control={form.control}
                    name="paymentProvider"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                        >
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a payment method" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="stripe">Stripe</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={isInitiating}
              className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6"
            >
              {isInitiating ? "Processing..." : `Pay ${CURRENCY}${formData.amount.toFixed(2)}`}
            </Button>
          </form>
        </Form>
      </div>
    </motion.div>
  );
};

export default CheckoutStep;