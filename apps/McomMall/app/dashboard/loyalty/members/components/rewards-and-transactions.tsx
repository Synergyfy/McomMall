'use client';

import * as React from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, Trash2, Calendar, X } from 'lucide-react';

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

type RewardStatus = 'Claimed' | 'Pending';
type TransactionStatus = 'Active' | 'Expired';

export type Reward = {
  id: number;
  dateClaimed: string;
  offer: string;
  points: number | null;
  status: RewardStatus;
  expirationDate: string;
};

export type Transaction = {
  id: number;
  date: string;
  note: string;
  expiration: string;
  debit: number | null;
  credit: number | null;
  status: TransactionStatus;
  balance: number;
};

// Mock Data
const initialRewards: Reward[] = [
  {
    id: 1,
    dateClaimed: '09/16/2024 4:46 pm',
    offer: '500 Bonus Points',
    points: null,
    status: 'Claimed',
    expirationDate: '09/16/2025',
  },
  {
    id: 2,
    dateClaimed: '09/16/2024 4:05 pm',
    offer: `Save ${CURRENCY}5`,
    points: 5000,
    status: 'Pending',
    expirationDate: '09/16/2025',
  },
  {
    id: 3,
    dateClaimed: '09/16/2024 4:05 pm',
    offer: `Save ${CURRENCY}1`,
    points: 1000,
    status: 'Pending',
    expirationDate: '09/16/2025',
  },
  {
    id: 4,
    dateClaimed: '09/16/2024 4:02 pm',
    offer: `Save ${CURRENCY}1`,
    points: 1000,
    status: 'Pending',
    expirationDate: '09/16/2025',
  },
  {
    id: 5,
    dateClaimed: '09/15/2024 1:12 pm',
    offer: '250 Bonus Points',
    points: null,
    status: 'Claimed',
    expirationDate: '09/15/2025',
  },
];

const initialTransactions: Transaction[] = [
  {
    id: 1,
    date: '09/16/2024 4:46 pm',
    note: 'Claimed offer: 500 Bonus Points',
    expiration: '09/16/2025',
    debit: null,
    credit: 500,
    status: 'Active',
    balance: 5000,
  },
  {
    id: 2,
    date: '09/16/2024 4:46 pm',
    note: 'Free points',
    expiration: '09/16/2025',
    debit: null,
    credit: 3000,
    status: 'Active',
    balance: 4500,
  },
  {
    id: 3,
    date: '09/16/2024 4:42 pm',
    note: 'Claimed offer: 500 Bonus Points',
    expiration: '09/16/2025',
    debit: null,
    credit: 500,
    status: 'Active',
    balance: 1500,
  },
  {
    id: 4,
    date: '09/16/2024 4:05 pm',
    note: `Claimed offer: Save ${CURRENCY}5`,
    expiration: '09/16/2025',
    debit: 5000,
    credit: null,
    status: 'Active',
    balance: 1000,
  },
  {
    id: 5,
    date: '09/16/2024 3:57 pm',
    note: 'Happy birthday!',
    expiration: '09/16/2025',
    debit: null,
    credit: 3000,
    status: 'Active',
    balance: 8000,
  },
  {
    id: 6,
    date: '09/16/2024 3:57 pm',
    note: 'Sign up bonus',
    expiration: '09/16/2025',
    debit: null,
    credit: 5000,
    status: 'Active',
    balance: 5000,
  },
];

// Main Component
export function RewardsAndTransactions() {
  // State Management
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [statusFilter, setStatusFilter] = useState<'all' | RewardStatus>('all');
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'reward' | 'transaction';
    id: number;
  } | null>(null);

  // Form state for new transaction
  const [newTransaction, setNewTransaction] = useState({
    note: '',
    type: 'credit',
    amount: '',
  });

  // Filtering logic for rewards
  const filteredRewards = rewards.filter(reward => {
    if (statusFilter === 'all') return true;
    return reward.status === statusFilter;
  });

  // Delete handler
  const handleDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'reward') {
      setRewards(prev => prev.filter(r => r.id !== itemToDelete.id));
    } else {
      setTransactions(prev => prev.filter(t => t.id !== itemToDelete.id));
    }

    setDeleteAlertOpen(false);
    setItemToDelete(null);
  };

  const openDeleteConfirmation = (
    type: 'reward' | 'transaction',
    id: number
  ) => {
    setItemToDelete({ type, id });
    setDeleteAlertOpen(true);
  };

  // Add transaction handler
  const handleAddTransaction = () => {
    const amount = parseFloat(newTransaction.amount);
    if (!newTransaction.note || isNaN(amount) || amount <= 0) {
      alert('Please fill in all fields correctly.');
      return;
    }

    const newEntry: Transaction = {
      id: Math.max(...transactions.map(t => t.id)) + 1,
      date: new Date()
        .toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' })
        .replace(',', ''),
      note: newTransaction.note,
      expiration: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      ).toLocaleDateString('en-US'),
      debit: newTransaction.type === 'debit' ? amount : null,
      credit: newTransaction.type === 'credit' ? amount : null,
      status: 'Active',
      balance:
        transactions[0]?.balance +
          (newTransaction.type === 'credit' ? amount : -amount) || amount,
    };

    setTransactions(prev => [newEntry, ...prev]);
    setAddModalOpen(false);
    setNewTransaction({ note: '', type: 'credit', amount: '' }); // Reset form
  };

  return (
    <div className="space-y-12">
      {/* Rewards Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Rewards</h2>
        <div className="flex items-center mb-4">
          <Label htmlFor="status-filter" className="mr-2">
            Filter by status
          </Label>
          <Select
            onValueChange={(value: 'all' | RewardStatus) =>
              setStatusFilter(value)
            }
            defaultValue="all"
          >
            <SelectTrigger id="status-filter" className="w-[180px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Claimed">Claimed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-blue-950">
                <TableRow className="">
                  <TableHead className="text-white font-bold">
                    Date claimed
                  </TableHead>
                  <TableHead className="text-white font-bold">Offer</TableHead>
                  <TableHead className="text-white font-bold">Points</TableHead>
                  <TableHead className="text-white font-bold">Status</TableHead>
                  <TableHead className="text-white font-bold">
                    Expiration date
                  </TableHead>
                  <TableHead className="text-white font-bold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filteredRewards.map(reward => (
                    <motion.tr
                      key={reward.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="odd:bg-white even:bg-yellow-50/50 hover:bg-gray-100"
                    >
                      <TableCell>{reward.dateClaimed}</TableCell>
                      <TableCell>
                        <a href="#" className="text-blue-600 hover:underline">
                          {reward.offer}
                        </a>
                      </TableCell>
                      <TableCell>
                        {reward.points?.toLocaleString() || '–'}
                      </TableCell>
                      <TableCell>{reward.status}</TableCell>
                      <TableCell>{reward.expirationDate}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-1" /> Set expiration
                          date
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openDeleteConfirmation('reward', reward.id)
                          }
                        >
                          <X className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* Transactions Section */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Transactions</h2>
          <Button onClick={() => setAddModalOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add a transaction
          </Button>
        </div>
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-blue-950">
                <TableRow className="">
                  <TableHead className="text-white font-bold">Date</TableHead>
                  <TableHead className="text-white font-bold">Note</TableHead>
                  <TableHead className="text-white font-bold">
                    Expiration
                  </TableHead>
                  <TableHead className="text-white font-bold">
                    Debit (-)
                  </TableHead>
                  <TableHead className="text-white font-bold">
                    Credit (+)
                  </TableHead>
                  <TableHead className="text-white font-bold">Status</TableHead>
                  <TableHead className="text-white font-bold">
                    Balance
                  </TableHead>
                  <TableHead className="text-white font-bold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {transactions.map(t => (
                    <motion.tr
                      key={t.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="odd:bg-white even:bg-yellow-50/50 hover:bg-gray-100"
                    >
                      <TableCell>{t.date}</TableCell>
                      <TableCell>
                        <a href="#" className="text-blue-600 hover:underline">
                          {t.note}
                        </a>
                      </TableCell>
                      <TableCell>{t.expiration}</TableCell>
                      <TableCell>{t.debit?.toLocaleString() || '–'}</TableCell>
                      <TableCell>{t.credit?.toLocaleString() || '–'}</TableCell>
                      <TableCell>{t.status}</TableCell>
                      <TableCell>{t.balance.toLocaleString()}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-1" /> Set expiration
                          date
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            openDeleteConfirmation('transaction', t.id)
                          }
                        >
                          <X className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* Add Transaction Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogDescription>
              {
                "Enter the details for the new transaction. Click save when you're done."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="note" className="text-right">
                Note
              </Label>
              <Input
                id="note"
                value={newTransaction.note}
                onChange={e =>
                  setNewTransaction({ ...newTransaction, note: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={newTransaction.type}
                onValueChange={(value: 'credit' | 'debit') =>
                  setNewTransaction({ ...newTransaction, type: value })
                }
              >
                <SelectTrigger id="type" className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit">Credit (+)</SelectItem>
                  <SelectItem value="debit">Debit (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={newTransaction.amount}
                onChange={e =>
                  setNewTransaction({
                    ...newTransaction,
                    amount: e.target.value,
                  })
                }
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" onClick={handleAddTransaction}>
              Save Transaction
            </Button>
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
              {itemToDelete?.type} from the records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
