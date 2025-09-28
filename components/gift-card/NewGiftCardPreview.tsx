"use client";

import { motion } from "framer-motion";
import { svgMap } from "./NewGiftCardFlow";
import Image from "next/image";

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

const NewGiftCardPreview = ({
  formData,
}: NewGiftCardPreviewProps) => {
  const { design } = formData;
  const SelectedSvg = design.svg ? svgMap[design.svg] : null;

  return (
    <motion.div
      className="sticky top-8 p-8 rounded-lg shadow-2xl"
      style={{ backgroundColor: design.cardColor, color: design.titleColor }}
      animate={{ backgroundColor: design.cardColor, color: design.titleColor }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold">{design.title}</h2>
      </div>

      <div className="my-6 h-48 flex items-center justify-center">
        {design.customImage ? (
          <Image src={design.customImage} alt="Custom design" width={200} height={200} className="max-h-full w-auto object-contain rounded-md" />
        ) : SelectedSvg ? (
          <SelectedSvg className="w-3/4 h-3/4" />
        ) : null}
      </div>

      <div className="text-center text-5xl font-bold mb-6">
        ${formData.amount}
      </div>
      <div className="bg-white/20 p-4 rounded-lg mb-6 backdrop-blur-sm text-black">
        <p className="font-semibold text-lg">To: {formData.recipientName || "Recipient Name"}</p>
        <p className="text-sm opacity-80">{formData.recipientEmail || "recipient@example.com"}</p>
      </div>
      <div className="bg-white/20 p-4 rounded-lg min-h-[100px] backdrop-blur-sm text-black">
        <p className="italic">{formData.personalMessage || "Your personal message will appear here..."}</p>
      </div>
      <motion.button
        className="mt-8 w-full font-bold py-3 px-4 rounded-lg text-lg"
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
    </motion.div>
  );
};

export default NewGiftCardPreview;