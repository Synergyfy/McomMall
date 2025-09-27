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

const checkoutFormSchema = z.object({
  recipientName: z.string().min(1, "Recipient name is required."),
  recipientEmail: z.string().email("Invalid email address."),
  senderName: z.string().min(1, "Sender name is required."),
  personalMessage: z.string().optional(),
  paymentProvider: z.enum(["stripe", "paypal"]),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

interface CheckoutStepProps {
  template: GiftCardTemplate;
  formData: {
    amount: number;
    recipientType: "myself" | "someoneElse";
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
    },
  });

  const onSubmit = (values: CheckoutFormValues) => {
    const purchaseDetails: InitiatePurchaseDto = {
      ...values,
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
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="recipientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jane Doe" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input placeholder="recipient@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
              <FormField
                control={form.control}
                name="personalMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Message (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Happy Birthday!" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
            {isInitiating ? "Processing..." : "Proceed to Payment"}
          </Button>
        </form>
      </Form>
    </motion.div>
  );
};

export default CheckoutStep;