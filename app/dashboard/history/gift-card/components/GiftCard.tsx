"use client";

import { useRef } from "react";
import { MyPurchase } from "@/service/gift-card/types";
import QRCode from "react-qr-code";
import { Download } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { toast } from "sonner";

interface GiftCardProps {
  purchase: MyPurchase;
}

const GiftCard = ({ purchase }: GiftCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleExport = () => {
    if (!cardRef.current) {
      toast.error("Failed to find gift card element.");
      return;
    }
    const cardElement = cardRef.current;

    const balanceElement =
      cardElement.querySelector<HTMLElement>(".gift-card-balance");
    const exportButtonElement = cardElement.querySelector<HTMLElement>(
      ".gift-card-export-button"
    );

    if (balanceElement) balanceElement.style.visibility = "hidden";
    if (exportButtonElement) exportButtonElement.style.visibility = "hidden";

    htmlToImage
      .toPng(cardElement, {
        quality: 1,
        pixelRatio: 2,
      })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `gift-card-${purchase.code}.png`;
        link.click();
      })
      .catch((error) => {
        console.error("Oops, something went wrong!", error);
        toast.error("Failed to export gift card.");
      })
      .finally(() => {
        if (balanceElement) balanceElement.style.visibility = "visible";
        if (exportButtonElement)
          exportButtonElement.style.visibility = "visible";
      });
  };

  return (
    <div
      ref={cardRef}
      className="relative p-6 flex flex-col justify-between text-white"
      style={{
        backgroundColor: purchase.template?.backgroundColor || "#000",
        color: purchase.template?.textColor || "#fff",
        backgroundImage: `url(${purchase.template?.backgroundImageUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "200px",
      }}
    >
      <div className="absolute top-4 right-4 gift-card-export-button">
        <Download
          className="cursor-pointer hover:text-orange-400 transition-colors"
          size={24}
          onClick={handleExport}
        />
      </div>

      <div className="flex justify-between items-start">
        <h2 className="text-2xl font-bold">
          {purchase.purchaseBusiness.businessName}
        </h2>
        <div className="bg-white p-1 rounded-md">
          <QRCode
            value={purchase.code}
            size={64}
            fgColor={purchase.template?.textColor || "#000"}
            bgColor="#fff"
          />
        </div>
      </div>

      <div className="text-center">
        <p className="font-mono text-sm tracking-widest">{purchase.code}</p>
      </div>

      <div className="text-right gift-card-balance">
        <p className="text-3xl font-bold">
          £{Number(purchase.currentBalance).toFixed(2)}
        </p>
        <p className="text-sm">Current Balance</p>
      </div>
    </div>
  );
};

export default GiftCard;