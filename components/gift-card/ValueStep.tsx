"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GiftCardTemplate } from "@/service/gift-card/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CURRENCY } from "@/lib/utils";

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            What&apos;s your gift value? ({CURRENCY})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-semibold text-gray-700">Choose a fixed amount</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
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
                    {CURRENCY}{amount}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {template.allowCustomAmount && (
            <div>
              <Label htmlFor="customAmount" className="text-base font-semibold text-gray-700">
                Or enter a custom amount
              </Label>
              <div className="relative mt-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  {CURRENCY}
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
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ValueStep;