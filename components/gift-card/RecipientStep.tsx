"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface RecipientStepProps {
  onSelect: (recipient: "myself" | "someoneElse") => void;
}

const RecipientStep = ({ onSelect }: RecipientStepProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <h3 className="text-lg font-semibold">Who are you sending to?</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={() => onSelect("myself")}
          className="w-full h-24 text-lg"
          variant="outline"
        >
          Myself
        </Button>
        <Button
          onClick={() => onSelect("someoneElse")}
          className="w-full h-24 text-lg"
          variant="outline"
        >
          Someone Else
        </Button>
      </div>
    </motion.div>
  );
};

export default RecipientStep;