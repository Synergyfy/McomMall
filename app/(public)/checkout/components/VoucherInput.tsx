"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, QrCode, X } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { motion } from "framer-motion";

interface VoucherInputProps {
  onApply: (code: string) => void;
  isLoading: boolean;
}

export default function VoucherInput({
  onApply,
  isLoading,
}: VoucherInputProps) {
  const [code, setCode] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (showScanner) {
      const scanner = new Html5QrcodeScanner(
        "qr-code-reader-voucher",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        false
      );
      scannerRef.current = scanner;

      const onScanSuccess = (decodedText: string) => {
        setCode(decodedText);
        setShowScanner(false);
        onApply(decodedText);
      };

      const onScanFailure = (error: unknown) => {
        console.warn(`Voucher scan error = ${error}`);
      };

      scanner.render(onScanSuccess, onScanFailure);
    } else {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Failed to clear voucher scanner.", error);
        });
        scannerRef.current = null;
      }
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error("Failed to clear voucher scanner on unmount.", error);
        });
      }
    };
  }, [showScanner, onApply]);

  return (
    <>
      <div className="flex items-center gap-2 mt-4">
        <Input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter voucher code"
          className="flex-grow h-12 text-lg"
          disabled={isLoading}
        />
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => setShowScanner(true)}
            aria-label="Scan Voucher QR Code"
            className="h-12 w-12 p-0"
          >
            <QrCode className="h-6 w-6" />
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={() => onApply(code)}
            disabled={isLoading || !code}
            className="h-12 text-lg font-semibold"
          >
            {isLoading ? (
              <Loader className="animate-spin h-5 w-5" />
            ) : (
              "Apply Voucher"
            )}
          </Button>
        </motion.div>
      </div>

      {showScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 relative w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Scan Voucher QR Code</h2>
            <div id="qr-code-reader-voucher" />
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