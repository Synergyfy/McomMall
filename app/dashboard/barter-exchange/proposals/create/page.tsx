"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// ✅ Schema
const proposalSchema = z.object({
  offeredItem: z.string().min(2, "Enter the item you’re offering"),
  requestedItem: z.string().min(2, "Enter the item you want in return"),
  message: z.string().optional(),
  status: z.enum(["pending", "accepted", "declined"]).default("pending"),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

export default function CreateProposalPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      offeredItem: "",
      requestedItem: "",
      message: "",
    },
  });

  const onSubmit = async (values: ProposalFormValues) => {
    setIsSubmitting(true);
    console.log("Proposal created:", values);

    // TODO: Replace this with your backend call
    await new Promise((res) => setTimeout(res, 1000));

    toast.success("Exchange proposal created!");
    setIsSubmitting(false);
    form.reset();
  };

  return (
    <section className="max-w-3xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Create Exchange Proposal
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Offered Item */}
              <FormField
                control={form.control}
                name="offeredItem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offered Item</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. My old MacBook Air" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Requested Item */}
              <FormField
                control={form.control}
                name="requestedItem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requested Item</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. iPad Pro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Message */}
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message (optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add a note for the recipient..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Create Proposal"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}
