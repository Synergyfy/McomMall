"use client";

import { motion } from "framer-motion";
import { CheckCircle, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface SuccessAnimationProps {
  onDone: () => void;
}

const SuccessAnimation = ({ onDone }: SuccessAnimationProps) => {
  const router = useRouter();

  const handleNavigate = () => {
    router.push("/dashboard/history/gift-card");
    onDone();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-sm w-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          className="mx-auto mb-6 w-24 h-24 flex items-center justify-center bg-green-100 rounded-full"
        >
          <CheckCircle className="w-16 h-16 text-green-500" />
        </motion.div>
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-2xl font-bold text-gray-800 mb-2"
        >
          Payment Successful!
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-gray-600 mb-8"
        >
          Your gift card has been purchased and is on its way.
        </motion.p>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <Button
            onClick={handleNavigate}
            className="w-full bg-orange-600 text-white font-bold py-3 px-4 rounded-md hover:bg-orange-700 transition-colors text-lg"
          >
            <PartyPopper className="mr-2 h-5 w-5" />
            View My Gift Cards
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SuccessAnimation;