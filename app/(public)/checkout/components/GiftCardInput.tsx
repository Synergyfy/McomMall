"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Loader, QrCode, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Html5QrcodeScanner } from "html5-qrcode";

interface GiftCardInputProps {
  onApply: (giftCardCode: string) => void;
  isLoading: boolean;
}

export default function GiftCardInput({
  onApply,
  isLoading,
}: GiftCardInputProps) {
  const [giftCardCode, setGiftCardCode] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const handleApply = () => {
    if (giftCardCode) {
      onApply(giftCardCode);
    }
  };

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        "qr-code-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        false
      );
      scannerRef.current = scanner;

      const onScanSuccess = (decodedText: string) => {
        setGiftCardCode(decodedText);
        setShowScanner(false);
        onApply(decodedText);
      };

      const onScanFailure = (error: any) => {
        console.warn(`Code scan error = ${error}`);
      };

      scanner.render(onScanSuccess, onScanFailure);
    } else {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Failed to clear scanner.", error);
        });
        scannerRef.current = null;
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Failed to clear scanner on unmount.", error);
        });
      }
    };
  }, [showScanner, onApply]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex w-full items-center space-x-3 mt-4"
      >
        <Input
          type="text"
          placeholder="Enter your gift card code"
          value={giftCardCode}
          onChange={(e) => setGiftCardCode(e.target.value)}
          disabled={isLoading}
          className="h-12 text-lg"
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setShowScanner(true)}
            aria-label="Scan QR Code"
            className="h-12 w-12 p-0"
          >
            <QrCode className="h-6 w-6" />
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleApply}
            disabled={isLoading || !giftCardCode}
            className="h-12 text-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-all duration-300"
          >
            {isLoading ? (
              <Loader className="animate-spin" />
            ) : (
              "Apply Gift Card"
            )}
          </Button>
        </motion.div>
      </motion.div>

      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 relative w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Scan Gift Card QR Code</h2>
            <div id="qr-code-reader" />
            <Button
              onClick={() => setShowScanner(false)}
              className="absolute top-2 right-2 p-1 h-auto bg-transparent hover:bg-gray-200"
              aria-label="Close scanner"
            >
              <X className="h-6 w-6 text-gray-700" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
