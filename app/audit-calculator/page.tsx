'use client';

import React, { useState, useMemo, FC, ChangeEvent, ReactNode } from 'react';
import {
  Utensils,
  Armchair,
  Sunrise,
  CalendarDays,
  Calendar,
  Briefcase,
  Mail,
  Calculator as CalculatorIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormState {
  averageCoverValue: string;
  seats: string;
  sittings: string;
  daysOpen: string;
  weeksOpen: string;
  currentTurnover: string;
  email: string;
}

interface CalculationResult {
  yearlyMaximumCapacity: number;
  yearlySpareCapacity: number;
}

type FormField = {
  name: keyof FormState;
  label: string;
  icon: ReactNode;
} & (
  | {
      type: 'select';
      options: string[];
    }
  | {
      type?: 'text' | 'email';
    }
);

const AuditCalculator: FC = () => {
  const [formState, setFormState] = useState<FormState>({
    averageCoverValue: '35',
    seats: '50',
    sittings: '2',
    daysOpen: '6',
    weeksOpen: '50',
    currentTurnover: '500000',
    email: '',
  });

  const [result, setResult] = useState<CalculationResult | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name !== 'email' && !/^\d*\.?\d*$/.test(value)) return;
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
    setResult(null);
  };

  const handleSelectChange = (name: keyof FormState) => (value: string) => {
    setFormState(prevState => ({
      ...prevState,
      [name]: value,
    }));
    setResult(null);
  };

  const calculateCapacity = () => {
    const averageCoverValue = parseFloat(formState.averageCoverValue) || 0;
    const seats = parseInt(formState.seats, 10) || 0;
    const sittings = parseInt(formState.sittings, 10) || 0;
    const daysOpen = parseInt(formState.daysOpen, 10) || 0;
    const weeksOpen = parseInt(formState.weeksOpen, 10) || 0;
    const currentTurnover = parseFloat(formState.currentTurnover) || 0;

    if (weeksOpen > 52) {
      alert('Weeks open per year cannot exceed 52.');
      return;
    }

    const yearlyMaximumCapacity =
      averageCoverValue * seats * sittings * daysOpen * weeksOpen;
    const yearlySpareCapacity = yearlyMaximumCapacity - currentTurnover;

    setResult({
      yearlyMaximumCapacity,
      yearlySpareCapacity,
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

  const steps: {
    step: number;
    title: string;
    icon: ReactNode;
    fields: FormField[];
  }[] = useMemo(
    () => [
      {
        step: 2,
        title: 'Restaurant Details',
        icon: <Utensils className="w-6 h-6 text-orange-500" />,
        fields: [
          {
            name: 'averageCoverValue',
            label: 'Average Cover Value (£)',
            icon: <Utensils className="w-4 h-4 text-gray-400" />,
          },
          {
            name: 'seats',
            label: 'No. of Seats in Restaurant',
            icon: <Armchair className="w-4 h-4 text-gray-400" />,
          },
          {
            name: 'sittings',
            label: 'No. of Sittings a Day',
            type: 'select',
            options: Array.from({ length: 10 }, (_, i) => String(i + 1)),
            icon: <Sunrise className="w-4 h-4 text-gray-400" />,
          },
          {
            name: 'daysOpen',
            label: 'No. of Days a Week Open',
            type: 'select',
            options: Array.from({ length: 7 }, (_, i) => String(i + 1)),
            icon: <CalendarDays className="w-4 h-4 text-gray-400" />,
          },
          {
            name: 'weeksOpen',
            label: 'No. of Weeks Open a Year (Max 52)',
            icon: <Calendar className="w-4 h-4 text-gray-400" />,
          },
        ],
      },
      {
        step: 3,
        title: 'Financials',
        icon: <Briefcase className="w-6 h-6 text-orange-500" />,
        fields: [
          {
            name: 'currentTurnover',
            label: 'Current Yearly Turnover (£)',
            icon: <Briefcase className="w-4 h-4 text-gray-400" />,
          },
        ],
      },
      {
        step: 4,
        title: 'Get Your Results',
        icon: <Mail className="w-6 h-6 text-orange-500" />,
        fields: [
          {
            name: 'email',
            label: 'Email your results?',
            type: 'email',
            icon: <Mail className="w-4 h-4 text-gray-400" />,
          },
        ],
      },
    ],
    []
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

      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-orange-500 tracking-tight">
            Restaurant Audit Calculator
          </h1>
          <p className="text-lg text-gray-400 mt-2">
            {"Unlock your restaurant's hidden potential."}
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <p className="text-sm text-gray-400 mb-4">
                Please enter only numbers, no commas or currency symbols.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {steps.map(step => (
                <div key={step.step} className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-600/20 text-orange-400 rounded-lg p-2">
                      {step.icon}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-200">
                      {step.title}
                    </h2>
                  </div>
                  {step.fields.map(field => (
                    <div key={field.name} className="space-y-2">
                      <label
                        htmlFor={field.name}
                        className="text-sm font-medium text-gray-400"
                      >
                        {field.label}
                      </label>
                      <div className="relative">
                        {field.type === 'select' ? (
                          <Select
                            value={formState[field.name as keyof FormState]}
                            onValueChange={handleSelectChange(
                              field.name as keyof FormState
                            )}
                          >
                            <SelectTrigger className="w-full pl-10 bg-gray-900 border-gray-600 focus:ring-orange-500 focus:border-orange-500 text-lg">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                {field.icon}
                              </div>
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                              {field.options.map(option => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <>
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              {field.icon}
                            </div>
                            <Input
                              type={field.type || 'text'}
                              name={field.name}
                              id={field.name}
                              value={formState[field.name as keyof FormState]}
                              onChange={handleInputChange}
                              placeholder="0"
                              className="pl-10 bg-gray-900 border-gray-600 focus-visible:ring-orange-500 text-lg"
                            />
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button
                onClick={calculateCapacity}
                className="w-full text-lg bg-orange-600 text-white hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-600/20 h-11 px-8"
              >
                <CalculatorIcon className="mr-2 h-5 w-5" /> Calculate Spare
                Capacity
              </Button>
            </CardFooter>
          </Card>

          <div className="space-y-8">
            <Card
              className={`transition-all duration-500 ease-in-out ${
                result ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              } bg-green-500/10 border-green-500/30`}
            >
              <CardHeader>
                <h3 className="text-2xl font-bold text-green-400">
                  Your Yearly Maximum Capacity
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-black text-white tracking-tight">
                  {result
                    ? formatCurrency(result.yearlyMaximumCapacity)
                    : formatCurrency(0)}
                </p>
              </CardContent>
            </Card>

            <Card
              className={`transition-all duration-500 ease-in-out delay-200 ${
                result ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              } bg-red-500/10 border-red-500/30`}
            >
              <CardHeader>
                <h3 className="text-2xl font-bold text-red-400">
                  Your Yearly Spare Capacity
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-black text-white tracking-tight">
                  {result
                    ? formatCurrency(result.yearlySpareCapacity)
                    : formatCurrency(0)}
                </p>
                {result && result.yearlySpareCapacity < 0 && (
                  <p className="text-sm text-yellow-400 mt-2">
                    Your turnover exceeds the calculated maximum capacity.
                    Double-check your numbers!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuditCalculator;
