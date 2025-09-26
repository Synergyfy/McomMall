"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  GiftCardTemplate,
  InitiatePurchaseDto,
  InitiatePurchaseResponse,
  GiftCard,
} from "@/service/gift-card/types";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  useInitiatePurchase,
  useVerifyPurchase,
} from "@/service/gift-card/hook";
import StripeCheckoutForm from "@/components/StripeCheckoutForm";
import PayPalCheckoutButton from "@/components/PayPalCheckoutButton";
import PaymentSuccessDialog from "@/components/PaymentSuccessModal";
import { toast } from "sonner";

const baseFormSchema = z.object({
  amount: z.coerce.number().min(1, "A valid amount is required."),
  recipientName: z.string().min(1, "Recipient name is required."),
  recipientEmail: z.string().email("Invalid email address."),
  senderName: z.string().min(1, "Sender name is required."),
  personalMessage: z.string().optional(),
  paymentProvider: z.enum(["stripe", "paypal"]),
});

type PurchaseFormValues = z.infer<typeof baseFormSchema>;

interface PurchaseFormProps {
  template: GiftCardTemplate;
}

const PurchaseForm = ({ template }: PurchaseFormProps) => {
  const [customAmount, setCustomAmount] = useState("");
  const [purchaseResponse, setPurchaseResponse] =
    useState<InitiatePurchaseResponse | null>(null);
  const [purchaseDetails, setPurchaseDetails] =
    useState<InitiatePurchaseDto | null>(null);
  const [createdGiftCard, setCreatedGiftCard] = useState<GiftCard | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const { mutate: initiatePurchase, isPending: isInitiating } =
    useInitiatePurchase();
  const { mutate: verifyPurchase, isPending: isVerifying } =
    useVerifyPurchase();

  const formSchema = useMemo(
    () =>
      baseFormSchema.refine(
        (data) => {
          if (!data.amount) return true; // Let required check from base schema handle it
          if (template.fixedAmounts.includes(data.amount)) {
            return true;
          }
          if (template.allowCustomAmount) {
            const min = template.minCustomAmount ?? -Infinity;
            const max = template.maxCustomAmount ?? Infinity;
            return data.amount >= min && data.amount <= max;
          }
          return false;
        },
        {
          message: `Custom amount must be between $${template.minCustomAmount} and $${template.maxCustomAmount}.`,
          path: ["amount"],
        }
      ),
    [template]
  );

  const form = useForm<PurchaseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentProvider: "stripe",
    },
  });

  const onSubmit = (values: PurchaseFormValues) => {
    const details: InitiatePurchaseDto = {
      ...values,
      templateId: template.id,
    };
    setPurchaseDetails(details);
    initiatePurchase(details, {
      onSuccess: (data) => {
        setPurchaseResponse(data);
      },
      onError: () => {
        toast.error("Failed to initiate purchase. Please try again.");
      },
    });
  };

  const handleVerification = (transactionId: string) => {
    if (!purchaseDetails || !purchaseResponse) return;

    verifyPurchase(
      {
        purchaseId: purchaseResponse.purchaseId,
        paymentIntentId: transactionId,
        paymentProvider: purchaseResponse.provider,
        transactionId,
        purchaseDetails: purchaseDetails,
      },
      {
        onSuccess: (data) => {
          setCreatedGiftCard(data);
          setShowSuccessDialog(true);
        },
        onError: () => {
          toast.error("Payment verification failed. Please contact support.");
        },
      }
    );
  };

  if (isVerifying) {
    return <div>Verifying payment...</div>;
  }

  if (showSuccessDialog && createdGiftCard) {
    return (
      <PaymentSuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        giftCard={createdGiftCard}
      />
    );
  }

  if (purchaseResponse && purchaseResponse.provider === "stripe" && purchaseResponse.clientSecret) {
    return (
      <StripeCheckoutForm
        clientSecret={purchaseResponse.clientSecret}
        onPaymentSuccess={(paymentIntentId) => handleVerification(paymentIntentId)}
      />
    );
  }

  if (purchaseResponse && purchaseResponse.provider === "paypal" && purchaseResponse.orderId) {
    return (
      <div className="flex justify-center">
        <PayPalCheckoutButton
          orderID={purchaseResponse.orderId}
          onSuccess={(orderID) => handleVerification(orderID)}
        />
      </div>
    );
  }

  return (
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <RadioGroup
                onValueChange={(value) => {
                  field.onChange(Number(value));
                  setCustomAmount("");
                }}
                value={
                  field.value && template.fixedAmounts.includes(field.value)
                    ? String(field.value)
                    : ""
                }
                className="flex flex-wrap items-center gap-4"
              >
                {template.fixedAmounts.map((amount) => (
                  <FormItem key={amount}>
                    <FormControl>
                      <RadioGroupItem
                        value={String(amount)}
                        id={String(amount)}
                        className="sr-only"
                      />
                    </FormControl>
                    <Label
                      htmlFor={String(amount)}
                      className={`cursor-pointer rounded-md border px-4 py-2 transition-colors hover:bg-orange-100 ${
                        field.value === amount
                          ? "border-orange-600 bg-orange-50 ring-2 ring-orange-500"
                          : "border-gray-300"
                      }`}
                    >
                      ${amount}
                    </Label>
                  </FormItem>
                ))}
                {template.allowCustomAmount && (
                  <div
                    className={`flex items-center rounded-md border transition-colors ${
                      field.value && !template.fixedAmounts.includes(field.value)
                        ? "border-orange-600 bg-orange-50 ring-2 ring-orange-500"
                        : "border-gray-300"
                    }`}
                  >
                    <span className="pl-3 text-gray-500">$</span>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Custom"
                        value={customAmount}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomAmount(val);
                          field.onChange(val ? Number(val) : undefined);
                        }}
                        onFocus={() => {
                          field.onChange(
                            customAmount ? Number(customAmount) : undefined
                          );
                        }}
                        min={template.minCustomAmount}
                        max={template.maxCustomAmount}
                        className="w-28 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </FormControl>
                  </div>
                )}
              </RadioGroup>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="paymentProvider"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        <Button type="submit" disabled={isInitiating} className="w-full bg-orange-600 hover:bg-orange-700">
          {isInitiating ? "Processing..." : "Proceed to Payment"}
        </Button>
      </form>
    </Form>
  );
};

export default PurchaseForm;