'use client';

import React, { useState, FC } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calculator as CalculatorIcon,
  HelpCircle,
  Info,
  Mail,
} from 'lucide-react';

import { industries, Industry, InputField } from './calculator-data';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CalculationResult {
  yearlyMaximumCapacity: number;
  yearlySpareCapacity: number;
  sparePercentage: number;
}

const AuditCalculatorPage: FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry>(
    industries[0]
  );
  const [formState, setFormState] = useState<Record<string, string>>(() => {
    const initialState: Record<string, string> = {};
    industries[0].fields.forEach(field => {
      initialState[field.id] = field.defaultValue;
    });
    return initialState;
  });

  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleIndustryChange = (industryName: string) => {
    const industry = industries.find(ind => ind.name === industryName);
    if (industry) {
      setSelectedIndustry(industry);
      const newFormState: Record<string, string> = {};
      industry.fields.forEach(field => {
        newFormState[field.id] = field.defaultValue;
      });
      setFormState(newFormState);
      setResult(null);
    }
  };

  const [email, setEmail] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Allow only numbers and a single dot for floats
    if (!/^\d*\.?\d*$/.test(value)) return;

    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
    setResult(null);
  };

  const calculateCapacity = () => {
    const numericInputs: Record<string, number> = {};
    for (const key in formState) {
      numericInputs[key] = parseFloat(formState[key]) || 0;
    }

    const yearlyMaximumCapacity = selectedIndustry.calculation(numericInputs);
    const currentTurnover = numericInputs.turnover || 0;
    const yearlySpareCapacity = yearlyMaximumCapacity - currentTurnover;
    const sparePercentage =
      yearlyMaximumCapacity > 0
        ? (yearlySpareCapacity / yearlyMaximumCapacity) * 100
        : 0;

    setResult({
      yearlyMaximumCapacity,
      yearlySpareCapacity,
      sparePercentage,
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderInputField = (field: InputField) => (
    <div key={field.id} className="space-y-2">
      <label
        htmlFor={field.id}
        className="text-sm font-medium text-gray-400 flex items-center"
      >
        {field.label}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-4 h-4 ml-2 text-gray-500 cursor-pointer" />
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 text-white border-gray-700">
              <p>{field.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-500 text-sm">
            {field.isCurrency ? '£' : '#'}
          </span>
        </div>
        <Input
          type="text"
          name={field.id}
          id={field.id}
          value={formState[field.id]}
          onChange={handleInputChange}
          placeholder={field.defaultValue}
          className="pl-8 bg-gray-900 border-gray-600 focus-visible:ring-orange-500 text-lg"
        />
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
       <style jsx global>{`
        :root {
          --background: 240 10% 3.9%;
          --foreground: 0 0% 98%;
          --card: 240 10% 3.9%;
          --card-foreground: 0 0% 98%;
          --popover: 240 10% 3.9%;
          --popover-foreground: 0 0% 98%;
          --primary: 34.9 91.6% 52.5%;
          --primary-foreground: 60 9.1% 97.8%;
          --secondary: 240 3.7% 15.9%;
          --secondary-foreground: 0 0% 98%;
          --muted: 240 3.7% 15.9%;
          --muted-foreground: 240 5% 64.9%;
          --accent: 240 3.7% 15.9%;
          --accent-foreground: 0 0% 98%;
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 0 0% 98%;
          --border: 240 3.7% 15.9%;
          --input: 240 3.7% 15.9%;
          --ring: 34.9 91.6% 52.5%;
          --radius: 0.5rem;
        }
      `}</style>
      <div className="w-full max-w-5xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-orange-500 tracking-tight">
            Spare Capacity Calculator
          </h1>
          <p className="text-lg text-gray-400 mt-2 max-w-2xl mx-auto">
            Discover your business&apos;s hidden revenue potential. Select your
            industry to get started.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <Card className="lg:col-span-3 bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-gray-200">
                1. Select Your Industry
              </CardTitle>
              <Select
                value={selectedIndustry.name}
                onValueChange={handleIndustryChange}
              >
                <SelectTrigger className="w-full bg-gray-900 border-gray-600 focus:ring-orange-500 focus:border-orange-500 text-lg h-12">
                  <div className="flex items-center">
                    <selectedIndustry.icon className="w-5 h-5 mr-3 text-orange-400" />
                    <SelectValue placeholder="Select industry..." />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {industries.map(ind => (
                    <SelectItem key={ind.name} value={ind.name}>
                      <div className="flex items-center">
                        <ind.icon className="w-5 h-5 mr-3" />
                        {ind.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-200 mb-4">
                  2. Enter Your Business Details
                </h3>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedIndustry.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"
                  >
                    {selectedIndustry.fields.map(renderInputField)}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-gray-200 mb-4">
                  3. Enter Your Email
                </h3>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10 bg-gray-900 border-gray-600 focus-visible:ring-orange-500 text-lg"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={calculateCapacity}
                className="w-full text-lg bg-orange-600 text-white hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-600/20 h-12 px-8"
              >
                <CalculatorIcon className="mr-2 h-5 w-5" /> Calculate Spare
                Capacity
              </Button>
            </CardFooter>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  <Card className="bg-green-500/10 border-green-500/30 text-center">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-green-400">
                        Yearly Maximum Capacity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-5xl font-black text-white tracking-tight">
                        {formatCurrency(result.yearlyMaximumCapacity)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-500/10 border-blue-500/30 text-center">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-blue-400">
                        Yearly Spare Capacity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-5xl font-black text-white tracking-tight">
                        {formatCurrency(result.yearlySpareCapacity)}
                      </p>
                       {result.yearlySpareCapacity < 0 && (
                        <p className="text-xs text-yellow-400 mt-2">
                          Turnover exceeds calculated max capacity.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-500/10 border-purple-500/30 text-center">
                    <CardHeader>
                       <CardTitle className="text-xl font-bold text-purple-400">
                        Spare Capacity Percentage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-5xl font-black text-white tracking-tight">
                        {result.sparePercentage.toFixed(2)}%
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
             {!result && (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 p-8 bg-gray-800/30 rounded-lg">
                    <Info className="w-12 h-12 mb-4"/>
                    <h3 className="text-lg font-semibold text-gray-400">Your results will appear here.</h3>
                    <p className="text-sm">Fill in your details and click the calculate button to see your business&apos;s potential.</p>
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuditCalculatorPage;
