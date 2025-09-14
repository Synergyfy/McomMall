'use client';

import { AnimatePresence, motion } from 'framer-motion';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Check, X, Info, ChevronDown } from 'lucide-react';
import { FeatureGroup } from '../types/index';
import { useState } from 'react';

interface ComparisonTableProps {
  plans: string[];
  featureGroups: FeatureGroup[];
  accentHeaders: string[];
}

export default function ComparisonTable({
  plans,
  featureGroups,
  accentHeaders,
}: ComparisonTableProps) {
  const [openGroups, setOpenGroups] = useState<string[]>(
    featureGroups.map(g => g.name)
  );

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev =>
      prev.includes(groupName)
        ? prev.filter(g => g !== groupName)
        : [...prev, groupName]
    );
  };

  return (
<div className="overflow-x-auto scroll-smooth md:overflow-x-visible">
      <Table>
        <TableHeader className="sticky top-0 bg-blue-50 z-10">
          <TableRow>
            <TableHead className="text-2xl md:text-3xl min-w-[150px] md:min-w-[300px] font-bold text-blue-900">
              Features
            </TableHead>
            {plans.map((plan, index) => (
              <TableHead
                key={plan}
                className={`text-center text-base md:text-lg min-w-[100px] md:min-w-[150px] font-bold text-${
                  accentHeaders[index].split('-')[0]
                }-700 bg-${accentHeaders[index].split('-')[0]}-50`}
              >
                {plan}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {featureGroups.map(group => (
            <>
              <TableRow
                key={group.name}
                className="cursor-pointer bg-blue-50 h-12"
                onClick={() => toggleGroup(group.name)}
              >
                <TableCell
                  colSpan={plans.length + 1}
                  className="font-bold text-base md:text-lg"
                >
                  <div className="flex items-center">
                    {group.name}
                    <ChevronDown
                      className={`ml-auto h-5 w-5 transition-transform ${
                        openGroups.includes(group.name) ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </TableCell>
              </TableRow>
              {openGroups.includes(group.name) && (
                <AnimatePresence>
                  {group.features.map((feature, index) => (
                    <motion.tr
                      key={feature.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={`h-12 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <TableCell className="font-medium text-sm md:text-base p-2 md:p-4 min-w-[150px] md:min-w-[300px]">
                        <div className="flex items-center">
                          {feature.name}
                          {feature.tooltip && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="ml-2 h-4 w-4 text-blue-500 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="bg-blue-900 text-white">
                                  <p>{feature.tooltip}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                      {feature.availability.map((has, idx) => (
                        <TableCell
                          key={idx}
                          className="text-center p-2 md:p-4 min-w-[100px] md:min-w-[150px]"
                        >
                          {has ? (
                            <Check
                              className={`mx-auto h-5 w-5 md:h-6 md:w-6 text-${
                                accentHeaders[idx].split('-')[0]
                              }-500`}
                            />
                          ) : (
                            <X className="mx-auto h-6 w-6 text-red-500" />
                          )}
                        </TableCell>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
