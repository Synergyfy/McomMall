'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface SuccessCampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SuccessCampaignDialog = ({ open, onOpenChange }: SuccessCampaignDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center text-center p-8"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Campaign Created Successfully!</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 mt-2 mb-6">Your new ad campaign has been created.</p>
          <Link href="/dashboard/ad-campaign" passHref>
            <Button size="lg" onClick={() => onOpenChange(false)}>
              View Campaigns
            </Button>
          </Link>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
