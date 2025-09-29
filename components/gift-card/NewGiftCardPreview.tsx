"use client";

import { motion } from "framer-motion";
import { svgMap } from "./NewGiftCardFlow";
import Image from "next/image";
import { CreditCard } from "lucide-react";
import { CURRENCY } from "@/lib/utils";

interface NewGiftCardPreviewProps {
  formData: {
    amount: number;
    recipientName: string;
    recipientEmail: string;
    personalMessage: string;
    design: {
      svg: string | null;
      customImage: string | null;
      title: string;
      titleColor: string;
      cardColor: string;
      redeemButtonText: string;
      redeemButtonColor: string;
      redeemButtonTextColor: string;
    };
  };
}

const NewGiftCardPreview = ({ formData }: NewGiftCardPreviewProps) => {
  const { design } = formData;
  const SelectedSvg = design.svg ? svgMap[design.svg] : null;

  return (
    <div className="w-full flex flex-col items-center space-y-6">
       <div className="w-full max-w-md h-40 flex items-center justify-center">
        {design.customImage ? (
          <Image src={design.customImage} alt="Custom design" width={160} height={160} className="max-h-full w-auto object-contain rounded-lg" />
        ) : SelectedSvg ? (
          <SelectedSvg className="w-3/4 h-3/4" />
        ) : null}
      </div>
      <motion.div
        className="w-full max-w-md aspect-[1.586] rounded-2xl shadow-lg p-6 flex flex-col justify-between border"
        style={{ backgroundColor: design.cardColor }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, backgroundColor: design.cardColor }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold" style={{ color: design.titleColor }}>{design.title}</h2>
          <CreditCard size={24} className="text-gray-400"/>
        </div>

        <div className="text-left">
          <p className="text-2xl md:text-3xl font-mono text-gray-700 tracking-wider">
            4000 1234 5678 9010
          </p>
        </div>

        <div className="flex justify-between items-end">
            <div>
                <p className="text-xs text-gray-500 uppercase">Card Holder</p>
                <p className="font-medium text-gray-800">{formData.recipientName || "Recipient Name"}</p>
            </div>
            <div>
                <p className="text-xs text-gray-500 uppercase">Expires</p>
                <p className="font-medium text-gray-800">12/28</p>
            </div>
            <div className="text-3xl font-bold text-gray-800">
                {CURRENCY}{formData.amount}
            </div>
        </div>
      </motion.div>

      <div className="w-full max-w-md space-y-4 pt-4">
        <div className="bg-gray-50 border rounded-lg p-4">
            <p className="font-semibold text-base text-gray-800">To: {formData.recipientName || "Recipient Name"}</p>
            <p className="text-sm text-gray-600">{formData.recipientEmail || "recipient@example.com"}</p>
        </div>
        <div className="bg-gray-50 border rounded-lg p-4 min-h-[100px]">
            <p className="italic text-gray-700">{formData.personalMessage || "Your personal message will appear here..."}</p>
        </div>
        <motion.button
            className="w-full font-bold py-3 px-4 rounded-lg text-lg"
            style={{
            backgroundColor: design.redeemButtonColor,
            color: design.redeemButtonTextColor,
            }}
            animate={{
                backgroundColor: design.redeemButtonColor,
                color: design.redeemButtonTextColor,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {design.redeemButtonText}
        </motion.button>
      </div>
    </div>
  );
};

export default NewGiftCardPreview;