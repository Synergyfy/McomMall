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
import { useGetMyProducts } from "@/service/store/products/hook";
import { useGetMyServices } from "@/service/services/hook";

// ✅ Schema
const proposalSchema = z.object({
  itemType: z.enum(["product", "service"]),
  productId: z.string().optional(),
  serviceId: z.string().optional(),
  offeredItem: z.string().min(2, "Enter the item you’re offering"),
  requestedItem: z.string().min(2, "Enter the item you want in return"),
});

type ProposalFormValues = z.infer<typeof proposalSchema>;

export default function CreateProposalPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      offeredItem: "",
      requestedItem: "",
      itemType: "product",
    },
  });

  const { data: products, isPending: isProductsLoading } = useGetMyProducts();
  const { data: services, isPending: isServicesLoading } = useGetMyServices();

  const selectedItemType = form.watch("itemType");

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
            <FormField
              control={form.control}
              name="itemType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Type</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select item type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              {selectedItemType === "product" && (
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Product</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={
                            isProductsLoading ||
                            !products ||
                            products.length === 0
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isProductsLoading
                                  ? "Loading products..."
                                  : products?.length
                                  ? "Select a product"
                                  : "No products available"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {products?.length ? (
                              products.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.title}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem disabled value="none">
                                No products available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Service Dropdown */}
              {selectedItemType === "service" && (
                <FormField
                  control={form.control}
                  name="serviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Service</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={
                            isServicesLoading ||
                            !services ||
                            services.length === 0
                          }
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                isServicesLoading
                                  ? "Loading services..."
                                  : services?.length
                                  ? "Select a service"
                                  : "No services available"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {services?.length ? (
                              services.map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem disabled value="none">
                                No services available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
              {/* <FormField
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
              /> */}

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
