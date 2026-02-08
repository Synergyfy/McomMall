'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Variants, Transition } from 'framer-motion';
import BusinessTypeSelector from './components/BusinessTypeSelector';
import MultiStepListingForm from './components/MultiStepListingForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const AddListingPage = () => {
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const handleNext = (types: string[]) => {
    setSelectedTypes(types);
  };

  const handleBack = () => {
    setSelectedTypes([]);
  };

  const pageVariants: Variants = {
    initial: { opacity: 0, x: -50 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: 50 },
  };

  // ✅ explicitly typed as Transition
  const pageTransition: Transition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5,
  };

  return (
    <section className="w-full max-w-4xl mx-auto py-12">
      <AnimatePresence mode="wait">
        {selectedTypes.length === 0 ? (
          <motion.div
            key="type-selector"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold">
                  Create a New Listing
                </CardTitle>
                <CardDescription className="text-lg">
                  First, tell us what kind of business you operate.
                  <div className="text-center mb-8">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className="text-sm md:text-lg text-black font-medium">
                            Select one or both depending on your business. You
                            can always update later.
                          </p>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            This choice determines the next steps in the form.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BusinessTypeSelector onNext={handleNext} />
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            <MultiStepListingForm
              businessTypes={selectedTypes}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default AddListingPage;
