"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import { toast } from "sonner";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useCreateItem } from "@/service/bertarExchange/hook";
import { useGetMyProducts } from "@/service/store/products/hook";
import { useGetMyServices } from "@/service/services/hook"; // 👈 You'll need to create this if not yet done

// ✅ Schema validation
const exchangeItemSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  itemType: z.enum(["product", "service"]),
  productId: z.string().optional(),
  serviceId: z.string().optional(),
});

type ExchangeItemFormValues = z.infer<typeof exchangeItemSchema>;

export default function AddExchangeItemPage() {
  const form = useForm<ExchangeItemFormValues>({
    resolver: zodResolver(exchangeItemSchema),
    defaultValues: {
      description: "",
      itemType: "product",
    },
  });

  const { data: products, isPending: isProductsLoading } = useGetMyProducts();
  const { data: services, isPending: isServicesLoading } = useGetMyServices();
  const { mutate: createItem, isPending, error } = useCreateItem();

  const selectedItemType = form.watch("itemType");

  const onSubmit = (values: ExchangeItemFormValues) => {
    const selectedProduct = products?.find(
      (p) => p.id === values.productId
    );
    const selectedService = services?.find(
      (s) => s.id === values.serviceId
    );

    const payload = {
      title:
        selectedItemType === "product"
          ? selectedProduct?.title || ""
          : selectedService?.name || "",
      description: values.description,
      itemType: selectedItemType,
      productId:
        selectedItemType === "product"
          ? values.productId ?? ""
          : "",
      serviceId:
        selectedItemType === "service"
          ? values.serviceId ?? ""
          : "",
    };

    console.log("🧾 Payload:", payload);
    createItem(payload, {
    onSuccess: () => {
        console.log("✅ Item created!");
        toast.success("Exchange item added successfully!");
        form.reset(); // clears the form
        
    },
  });
  };

  return (
    <section className="max-w-3xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            Add New Exchange Item
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Item Type */}
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

              {/* Product Dropdown */}
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

              

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your item..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit */}
              <Button
                disabled={isPending}
                type="submit"
                className="w-full bg-primary"
              >
                {isPending ? "Submitting..." : "Submit"}
              </Button>
              {error && (
                <p className="text-red-500 text-center">
                  Error: {(error as Error).message}
                </p>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
}
