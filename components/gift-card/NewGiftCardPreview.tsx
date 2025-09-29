"use client";

import { motion } from "framer-motion";
import { svgMap } from "./NewGiftCardFlow";
import Image from "next/image";
import { Wifi } from "lucide-react";

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
    <div className="w-full flex flex-col items-center space-y-8">
      <motion.div
        className="w-full max-w-md aspect-[1.586] rounded-xl shadow-2xl p-6 flex flex-col justify-between"
        style={{ backgroundColor: design.cardColor, color: design.titleColor }}
        animate={{ backgroundColor: design.cardColor, color: design.titleColor }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold">{design.title}</h2>
          <div className="w-12 h-8 bg-yellow-400 rounded-md" />
        </div>

        <div className="flex items-center justify-between">
            <Wifi size={32} />
            <div className="w-1/4 h-16 flex items-center justify-center">
                {design.customImage ? (
                <Image src={design.customImage} alt="Custom design" width={64} height={64} className="max-h-full w-auto object-contain rounded-md" />
                ) : SelectedSvg ? (
                <SelectedSvg className="w-full h-full" />
                ) : null}
            </div>
        </div>

        <div className="text-left">
          <p className="text-2xl font-mono tracking-widest">
            4000 1234 5678 9010
          </p>
        </div>

        <div className="flex justify-between items-end">
            <div>
                <p className="text-sm opacity-80">Card Holder</p>
                <p className="font-semibold">{formData.recipientName || "Recipient Name"}</p>
            </div>
            <div>
                <p className="text-sm opacity-80">Expires</p>
                <p className="font-semibold">12/28</p>
            </div>
            <div className="text-4xl font-bold">
                ${formData.amount}
            </div>
        </div>
      </motion.div>

      <div className="w-full max-w-md space-y-4">
        <div className="bg-gray-100 p-4 rounded-lg">
            <p className="font-semibold text-lg text-gray-800">To: {formData.recipientName || "Recipient Name"}</p>
            <p className="text-sm text-gray-600">{formData.recipientEmail || "recipient@example.com"}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg min-h-[100px]">
            <p className="italic text-gray-800">{formData.personalMessage || "Your personal message will appear here..."}</p>
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            {design.redeemButtonText}
        </motion.button>
      </div>
    </div>
  );
};

export default NewGiftCardPreview;