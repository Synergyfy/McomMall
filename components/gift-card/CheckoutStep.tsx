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

const checkoutFormSchema = z
  .object({
    senderName: z.string().min(1, "Sender name is required."),
    senderEmail: z.string().email("Your email is required.").optional(),
    paymentProvider: z.enum(["stripe", "paypal"]),
    recipientType: z.enum(["myself", "someoneElse"]),
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
    },
  });

  const onSubmit = (values: CheckoutFormValues) => {
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
    };
    onPurchase(purchaseDetails);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Gift Card Value</span>
              <span>{CURRENCY}{formData.amount.toFixed(2)}</span>
            </div>
            {formData.recipientType === "someoneElse" && (
              <>
                <div className="flex justify-between">
                  <span>Recipient Name</span>
                  <span>{formData.recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Recipient Email</span>
                  <span>{formData.recipientEmail}</span>
                </div>
              </>
            )}
            {formData.personalMessage && (
               <div className="flex justify-between">
                <span>Message</span>
                <span className="italic">&quot;{formData.personalMessage}&quot;</span>
              </div>
            )}
             <div className="flex justify-between font-bold text-lg border-t pt-4">
              <span>Total</span>
              <span>{CURRENCY}{formData.amount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
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
            </div>

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