"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RecipientStepProps {
  onSelect: (recipient: "myself" | "someoneElse") => void;
}

const RecipientStep = ({ onSelect }: RecipientStepProps) => {
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
                <CardTitle className="text-center text-2xl">Who are you sending this to?</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                        onClick={() => onSelect("myself")}
                        className="w-full h-28 text-xl font-semibold flex flex-col"
                        variant="outline"
                        >
                        For Myself
                        <span className="text-sm font-normal mt-1">The gift card will be sent to your email.</span>
                        </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                        onClick={() => onSelect("someoneElse")}
                        className="w-full h-28 text-xl font-semibold flex flex-col"
                        variant="outline"
                        >
                        For Someone Else
                        <span className="text-sm font-normal mt-1">You&apos;ll enter their details next.</span>
                        </Button>
                    </motion.div>
                </div>
            </CardContent>
        </Card>
    </motion.div>
  );
};

export default RecipientStep;