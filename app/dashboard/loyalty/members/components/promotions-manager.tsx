// components/promotions-manager.tsx

'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle,
  Edit,
  Copy,
  Trash2,
  Calendar,
  Coins,
  Info,
} from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CURRENCY } from '@/lib/utils';

// TypeScript Types
type PromotionStatus = 'Active' | 'Inactive';
type PromotionType = 'Multiplier' | 'Bonus points';

export type Promotion = {
  id: number;
  status: PromotionStatus;
  name: string;
  description: string;
  type: PromotionType;
  beginDate: string | null;
  endDate: string | null;
  multiplier?: number;
  bonusPoints?: number;
  // Add other form fields as needed for a complete model
};

// Mock Data
const initialPromotions: Promotion[] = [
  {
    id: 1,
    status: 'Active',
    name: 'Earn 2X points',
    description: 'On all Bookings',
    type: 'Multiplier',
    beginDate: '2024-08-01',
    endDate: '2024-08-31',
    multiplier: 2,
  },
  {
    id: 2,
    status: 'Active',
    name: '500 Bonus Points on Shoes',
    description: `Any shoe purchase over ${CURRENCY}100`,
    type: 'Bonus points',
    beginDate: '2024-09-01',
    endDate: '2024-09-15',
    bonusPoints: 500,
  },
  {
    id: 3,
    status: 'Inactive',
    name: 'Weekend Triple Points',
    description: 'For all weekend stays',
    type: 'Multiplier',
    beginDate: '2024-07-01',
    endDate: '2024-07-31',
    multiplier: 3,
  },
  {
    id: 4,
    status: 'Active',
    name: 'New Member Bonus',
    description: '1,000 points on sign-up',
    type: 'Bonus points',
    beginDate: null,
    endDate: null,
    bonusPoints: 1000,
  },
  {
    id: 5,
    status: 'Inactive',
    name: 'Summer Sale 1.5X',
    description: 'On selected summer items',
    type: 'Multiplier',
    beginDate: '2024-06-10',
    endDate: '2024-06-24',
    multiplier: 1.5,
  },
];

// Default state for the form
const defaultFormState = {
  isActive: true,
  name: '',
  description: '',
  terms: '',
  image: 'coins_dark',
  beginDate: '',
  endDate: '',
  promotionType: 'Multiplier' as PromotionType,
  multiplier: 2,
  bonusPoints: 0,
  products: '',
  categories: 'Bookings',
};

// Main Component
export function PromotionsManager() {
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<number | null>(
    null
  );
  const [formState, setFormState] = useState(defaultFormState);

  const handleFormChange = <K extends keyof typeof defaultFormState>(
    field: K,
    value: (typeof defaultFormState)[K]
  ) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  // Simulate saving a new promotion
  const handleSavePromotion = () => {
    const newPromotion: Promotion = {
      id: Math.max(...promotions.map(p => p.id), 0) + 1,
      status: formState.isActive ? 'Active' : 'Inactive',
      name: formState.name,
      description: formState.description,
      type: formState.promotionType,
      beginDate: formState.beginDate || null,
      endDate: formState.endDate || null,
      multiplier:
        formState.promotionType === 'Multiplier'
          ? formState.multiplier
          : undefined,
      bonusPoints:
        formState.promotionType === 'Bonus points'
          ? formState.bonusPoints
          : undefined,
    };

    setPromotions(prev => [newPromotion, ...prev]);
    setCreateModalOpen(false);
    setFormState(defaultFormState); // Reset form
  };

  // Handle deleting a promotion
  const handleDeletePromotion = () => {
    if (promotionToDelete === null) return;
    setPromotions(prev => prev.filter(p => p.id !== promotionToDelete));
    setDeleteAlertOpen(false);
    setPromotionToDelete(null);
  };

  const openDeleteConfirmation = (id: number) => {
    setPromotionToDelete(id);
    setDeleteAlertOpen(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      <p className="text-gray-600 mb-4">
        Promotions are automatically applied to qualifying orders. Use
        promotions to drive sales for specific products or categories.
      </p>
      <Button
        onClick={() => setCreateModalOpen(true)}
        className="mb-6 bg-blue-600 hover:bg-blue-700"
      >
        <PlusCircle className="h-4 w-4 mr-2" /> Create Promotion
      </Button>

      {/* Promotions Table */}
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-green-600">
              <TableRow className="hover:bg-green-600">
                <TableHead className="text-white font-bold w-[100px]">
                  Status
                </TableHead>
                <TableHead className="text-white font-bold">Name</TableHead>
                <TableHead className="text-white font-bold">
                  Description
                </TableHead>
                <TableHead className="text-white font-bold">Type</TableHead>
                <TableHead className="text-white font-bold">
                  Begin / end dates
                </TableHead>
                <TableHead className="text-white font-bold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {promotions.map(promo => (
                  <motion.tr
                    key={promo.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-3 w-3 rounded-full ${
                            promo.status === 'Active'
                              ? 'bg-green-500'
                              : 'bg-gray-400'
                          }`}
                        ></span>
                        {promo.status}
                      </div>
                    </TableCell>
                    <TableCell>
                      <a
                        href="#"
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {promo.name}
                      </a>
                    </TableCell>
                    <TableCell>{promo.description}</TableCell>
                    <TableCell>{promo.type}</TableCell>
                    <TableCell>
                      {promo.beginDate || 'N/A'} - {promo.endDate || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button variant="outline" size="sm">
                          <Copy className="h-4 w-4 mr-1" /> Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDeleteConfirmation(promo.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create Promotion Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              Create a New Promotion
            </DialogTitle>
            <DialogDescription>
              Fill out the details below to create a new promotion for your
              customers.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6 -mr-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-4">
              {/* Left Column: Form Fields */}
              <div className="md:col-span-2 space-y-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isActive"
                    checked={!!formState.isActive}
                    onCheckedChange={checked =>
                      handleFormChange('isActive', Boolean(checked))
                    }
                  />
                  <Label
                    htmlFor="isActive"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Promotion is active
                  </Label>
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formState.name}
                    onChange={e => handleFormChange('name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formState.description}
                    onChange={e =>
                      handleFormChange('description', e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="terms">Terms and conditions</Label>
                  <Textarea
                    id="terms"
                    value={formState.terms}
                    onChange={e => handleFormChange('terms', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="image">Image</Label>
                  <Select
                    value={formState.image}
                    onValueChange={value => handleFormChange('image', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coins_dark">Coins (Dark)</SelectItem>
                      <SelectItem value="coins_light">Coins (Light)</SelectItem>
                      <SelectItem value="gift_box">Gift Box</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="beginDate">Begin date (YYYY-MM-DD)</Label>
                    <Input
                      id="beginDate"
                      type="date"
                      value={formState.beginDate}
                      onChange={e =>
                        handleFormChange('beginDate', e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End date (YYYY-MM-DD)</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formState.endDate}
                      onChange={e =>
                        handleFormChange('endDate', e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Promotion Type Section */}
                <div>
                  <Label className="text-lg font-semibold">
                    Promotion type
                  </Label>
                  <RadioGroup
                    value={formState.promotionType}
                    onValueChange={(value: PromotionType) =>
                      handleFormChange('promotionType', value)
                    }
                    className="mt-2 grid grid-cols-2 gap-4"
                  >
                    <div>
                      <RadioGroupItem
                        value="Multiplier"
                        id="multiplier"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="multiplier"
                        className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        Multiplier
                        <span className="text-sm text-muted-foreground mt-2">
                          Points are calculated normally and then multiplied X
                          times.
                        </span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem
                        value="Bonus points"
                        id="bonus"
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor="bonus"
                        className="flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        Bonus points
                        <span className="text-sm text-muted-foreground mt-2">
                          Applied once per order, customer earns extra points.
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {formState.promotionType === 'Multiplier' && (
                  <div>
                    <Label htmlFor="multiplierValue">Multiplier</Label>
                    <Input
                      id="multiplierValue"
                      type="number"
                      value={formState.multiplier}
                      onChange={e =>
                        handleFormChange(
                          'multiplier',
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </div>
                )}
                {formState.promotionType === 'Bonus points' && (
                  <div>
                    <Label htmlFor="bonusPointsValue">Bonus Points</Label>
                    <Input
                      id="bonusPointsValue"
                      type="number"
                      value={formState.bonusPoints}
                      onChange={e =>
                        handleFormChange(
                          'bonusPoints',
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="categories">Categories</Label>
                  <Input
                    id="categories"
                    value={formState.categories}
                    onChange={e =>
                      handleFormChange('categories', e.target.value)
                    }
                    placeholder="e.g., Bookings"
                  />
                </div>
              </div>

              {/* Right Column: Preview */}
              <div className="md:col-span-1">
                <div className="sticky top-0 rounded-lg border bg-gray-50 p-6">
                  <div className="flex items-center gap-4">
                    <Coins className="h-12 w-12 text-gray-600" />
                    <div>
                      <h3 className="text-xl font-bold">
                        {formState.name || 'Earn 2X points'}
                      </h3>
                      <p className="text-gray-500">
                        {formState.description || 'On all Bookings'}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-gray-400 italic">
                    This is only a preview. The site Theme might override the
                    styles on the front end website.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePromotion}>Save promotion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              promotion.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPromotionToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePromotion}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
