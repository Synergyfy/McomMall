"use client";

import React from "react";
import Image from "next/image";
import { Gift } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CURRENCY } from "@/lib/utils";

type SvgComponent = React.ComponentType<{ className?: string }>;

interface CardPreviewProps {
  selectedSvg: SvgComponent | null;
  customImage: string | null;
  amount: number;
  recipientName: string;
  personalMessage: string;
  title: string;
  titleColor: string;
  cardColor: string;
  additionalContent: string;
  redeemButtonText: string;
  redeemButtonColor: string;
  redeemButtonTextColor: string;
}

const CardPreview = ({
  selectedSvg: SelectedSvg,
  customImage,
  amount,
  recipientName,
  personalMessage,
  title,
  titleColor,
  cardColor,
  additionalContent,
  redeemButtonText,
  redeemButtonColor,
  redeemButtonTextColor,
}: CardPreviewProps) => {
  return (
    <Card className="bg-gray-50">
      <CardContent className="space-y-4 pt-6">
        <div className="text-center">
          {customImage ? (
            <Image
              src={customImage}
              alt="Custom design"
              width={400}
              height={200}
              className="mx-auto w-full h-auto rounded-lg"
            />
          ) : SelectedSvg ? (
            <SelectedSvg className="mx-auto w-full h-auto rounded-lg" />
          ) : (
            <Gift className="mx-auto h-12 w-12 text-gray-400" />
          )}
        </div>
        {additionalContent && (
          <div className="text-sm text-gray-600 text-center">
            <p>{additionalContent}</p>
          </div>
        )}
        <div
          className="rounded-lg p-6 text-center shadow-md transition-colors duration-300"
          style={{ backgroundColor: cardColor, color: titleColor }}
        >
          <h3 className="text-2xl font-bold" style={{ color: titleColor }}>
            {title || "You've received a gift card!"}
          </h3>
          <p className="text-sm mt-2">For: {recipientName || "Recipient"}</p>
          <p className="text-4xl font-light my-4">
            {CURRENCY}
            {amount.toFixed(2)}
          </p>
          <p className="font-mono text-sm opacity-80">1234-WXYZ-5678-ABCD</p>
          <p className="mt-4 italic">
            &quot;{personalMessage || "Enjoy your gift!"}&quot;
          </p>
          <button
            className="mt-6 px-8 py-3 rounded-md font-semibold transition-colors duration-300"
            style={{
              backgroundColor: redeemButtonColor,
              color: redeemButtonTextColor,
            }}
          >
            {redeemButtonText || "Redeem"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardPreview;