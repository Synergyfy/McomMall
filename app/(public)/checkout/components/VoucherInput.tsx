"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader, QrCode, X } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { motion } from "framer-motion";

interface VoucherInputProps {
  onCheckBalance: (code: string) => Promise<number | void>;
  onApply: (code: string, amount: number) => void;
  isLoading: boolean;
}

export default function VoucherInput({
  onCheckBalance,
  onApply,
  isLoading,
}: VoucherInputProps) {
  const [code, setCode] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [redemptionAmount, setRedemptionAmount] = useState<number | string>("");
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const handleCheckBalance = async () => {
    if (code) {
      const newBalance = await onCheckBalance(code);
      if (typeof newBalance === "number") {
        setBalance(newBalance);
      }
    }
  };

  const handleApply = () => {
    if (code && redemptionAmount) {
      onApply(code, Number(redemptionAmount));
    }
  };

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
        onCheckBalance(decodedText).then((newBalance) => {
          if (typeof newBalance === "number") {
            setBalance(newBalance);
          }
        });
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
  }, [showScanner, onCheckBalance]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row w-full items-stretch sm:items-center gap-2 mt-4">
        <Input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setBalance(null);
            setRedemptionAmount("");
          }}
          placeholder="Enter voucher code"
          className="flex-grow h-12 text-lg"
          disabled={isLoading}
        />
        <div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => setShowScanner(true)}
              aria-label="Scan Voucher QR Code"
              className="h-12 w-12 p-0"
            >
              <QrCode className="h-6 w-6" />
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex-grow sm:flex-grow-0"
          >
            <Button
              onClick={handleCheckBalance}
              disabled={isLoading || !code}
              className="h-12 text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 w-full"
            >
              {isLoading ? (
                <Loader className="animate-spin h-5 w-5" />
              ) : (
                "Check Balance"
              )}
            </Button>
          </motion.div>
        </div>
      </div>
      {balance !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-100 rounded-lg"
        >
          <p className="text-lg font-semibold">
            Balance: <span className="text-green-600">£{balance.toFixed(2)}</span>
          </p>
          <div className="flex-grow flex items-center gap-2">
            <Input
              type="number"
              placeholder="Amount to redeem"
              value={redemptionAmount}
              onChange={(e) => setRedemptionAmount(e.target.value)}
              disabled={isLoading}
              className="h-12 text-lg flex-grow"
              max={balance}
            />
            <Button
              onClick={handleApply}
              disabled={isLoading || !redemptionAmount || Number(redemptionAmount) > balance || Number(redemptionAmount) <= 0}
              className="h-12 text-lg font-semibold bg-green-600 text-white hover:bg-green-700"
            >
              {isLoading ? <Loader className="animate-spin" /> : "Apply"}
            </Button>
          </div>
        </motion.div>
      )}
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
    </div>
  );
}