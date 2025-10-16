
"use client";

import React from "react";
import { VoucherProductForm } from "@/app/dashboard/vouchers/(components)/VouchersProForm"; // <-- adjust import path
// import { createVoucherProduct } from "@/service/vouchers/api"; // <-- your API call (example)
import { useRouter } from "next/navigation";

export default function NewVoucherPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      // await createVoucherProduct(data);
      router.push("/dashboard/vouchers");
    } catch (err) {
      console.error("Error creating voucher:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Create New Voucher Product</h1>
      <VoucherProductForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  );
}
