"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GiftCardTemplate } from "@/service/gift-card/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ValueStepProps {
  template: GiftCardTemplate;
  onSave: (amount: number) => void;
}

const ValueStep = ({ template, onSave }: ValueStepProps) => {
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");

  const handleSelectAmount = (amount: number) => {
    setSelectedValue(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    setSelectedValue(null);
  };

  const handleSave = () => {
    if (selectedValue) {
      onSave(selectedValue);
    } else if (customAmount) {
      const amount = parseFloat(customAmount);
      if (!isNaN(amount)) {
        onSave(amount);
      }
    }
  };

  const isSaveDisabled = !selectedValue && !customAmount;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h3 className="text-lg font-semibold mb-4">
          What&apos;s your gift value? (GBP)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {template.fixedAmounts.map((amount) => (
            <motion.div
              key={amount}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => handleSelectAmount(amount)}
                variant={selectedValue === amount ? "default" : "outline"}
                className="w-full h-20 text-xl font-bold"
              >
                £{amount}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {template.allowCustomAmount && (
        <div>
          <Label htmlFor="customAmount" className="text-lg font-semibold">
            Or enter a custom amount
          </Label>
          <div className="relative mt-2">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              £
            </span>
            <Input
              id="customAmount"
              type="number"
              value={customAmount}
              onChange={handleCustomAmountChange}
              placeholder={`e.g. ${template.minCustomAmount || 20} - ${
                template.maxCustomAmount || 500
              }`}
              min={template.minCustomAmount}
              max={template.maxCustomAmount}
              className="pl-8 h-12 text-lg"
            />
          </div>
        </div>
      )}

      <Button
        onClick={handleSave}
        disabled={isSaveDisabled}
        className="w-full text-lg py-6"
      >
        Save and continue
      </Button>
    </motion.div>
  );
};

export default ValueStep;