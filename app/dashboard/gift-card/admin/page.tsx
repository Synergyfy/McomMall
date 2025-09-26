'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { Search, PlusCircle, Edit, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useGetGiftCards, useMutateGiftCard } from '@/service/gift-card/hook';
import { GiftCard as AdminGiftCard, ActivityLog } from '@/types/gift-card';

// --- MOCK DATA ---
const initialMockGiftCards: AdminGiftCard[] = [
  {
    id: '1',
    cardNumber: '8FQY-5QA6-PVPM-ZWN3',
    balance: 10.0,
    expirationDate: '2025-06-17',
    recipient: 'support@pimwick.com',
    activity: [
      {
        id: 'a1',
        date: '2025-06-16 03:25 PM',
        action: 'Create',
        user: 'torre@pimwick.com',
        note: '',
        amount: 10.0,
        balance: 10.0,
      },
    ],
  },
  {
    id: '2',
    cardNumber: '8PFG-H4CG-D4JT-ZCXQ',
    balance: 30.0,
    expirationDate: null,
    recipient: 'giftcard@example.com',
    activity: [
      {
        id: 'b1',
        date: '2025-06-10 11:00 AM',
        action: 'Create',
        user: 'admin@store.com',
        note: 'Promotional gift card',
        amount: 30.0,
        balance: 30.0,
      },
    ],
  },
  {
    id: '3',
    cardNumber: 'FXZ5-ATEY-PZGF-9EBD',
    balance: 0.0,
    expirationDate: null,
    recipient: 'us@gmail.com',
    activity: [
      {
        id: 'c3',
        date: '2025-06-17 12:54 PM',
        action: 'Transaction',
        user: 'torre@pimwick.com',
        note: 'order_id: 1757 processing, order_item_id: 1512',
        amount: -10.0,
        balance: 0.0,
      },
      {
        id: 'c2',
        date: '2025-06-16 03:25 PM',
        action: 'Transaction',
        user: 'torre@pimwick.com',
        note: '',
        amount: 10.0,
        balance: 10.0,
      },
      {
        id: 'c1',
        date: '2025-06-16 03:25 PM',
        action: 'Create',
        user: 'torre@pimwick.com',
        note: '',
        amount: 0.0,
        balance: 0.0,
      },
    ],
  },
];

// --- SUB-COMPONENTS ---

const HeaderStats = ({ cards }: { cards: AdminGiftCard[] }) => {
  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);
  const activeCards = cards.filter(card => card.balance > 0).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Active Gift Cards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            {activeCards.toLocaleString()}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Outstanding Balances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">
            £
            {totalBalance.toLocaleString('en-GB', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// --- MAIN PAGE COMPONENT ---
export default function GiftCardDashboardPage() {
    const { data: giftCards, isLoading } = useGetGiftCards();
    const { mutate: mutateGiftCard } = useMutateGiftCard();

  const [searchQuery, setSearchQuery] = useState('');
  const [modalState, setModalState] = useState<{
    type: 'note' | 'adjust' | 'view' | null;
    card: AdminGiftCard | null;
  }>({ type: null, card: null });

  const filteredCards = useMemo(() => {
    const cardsToFilter = giftCards || initialMockGiftCards;
    if (!searchQuery) return cardsToFilter;
    const lowercasedQuery = searchQuery.toLowerCase();
    return cardsToFilter.filter(
      card =>
        card.cardNumber.toLowerCase().includes(lowercasedQuery) ||
        card.recipient.toLowerCase().includes(lowercasedQuery)
    );
  }, [searchQuery, giftCards]);

  const handleAddNote = (cardId: string, note: string) => {
    if(!giftCards) return;
    const cardToUpdate = giftCards.find(card => card.id === cardId);
    if (cardToUpdate) {
      const newActivity: ActivityLog = {
        id: `act-${Date.now()}`,
        date: new Date().toLocaleString(),
        action: 'Note',
        user: 'admin@store.com', // Mock user
        note,
        amount: 0,
        balance: cardToUpdate.balance,
      };
      const updatedCard = { ...cardToUpdate, activity: [newActivity, ...cardToUpdate.activity] };
      mutateGiftCard(updatedCard);
    }
  };

  const handleAdjustBalance = (
    cardId: string,
    amount: number,
    note: string
  ) => {
    if(!giftCards) return;
    const cardToUpdate = giftCards.find(card => card.id === cardId);
    if(cardToUpdate) {
        const newBalance = cardToUpdate.balance + amount;
        const newActivity: ActivityLog = {
          id: `act-${Date.now()}`,
          date: new Date().toLocaleString(),
          action: 'Adjust',
          user: 'admin@store.com', // Mock user
          note,
          amount,
          balance: newBalance,
        };
        const updatedCard = {
          ...cardToUpdate,
          balance: newBalance,
          activity: [newActivity, ...cardToUpdate.activity],
        };
        mutateGiftCard(updatedCard);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <HeaderStats cards={giftCards || initialMockGiftCards} />

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Input
                placeholder="Gift card number or recipient email"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-green-600">
                  <TableRow>
                    <TableHead className="w-[200px] text-white">
                      Card Number
                    </TableHead>
                    <TableHead className="text-white">Balance</TableHead>
                    <TableHead className="text-white">
                      Expiration Date
                    </TableHead>
                    <TableHead className="text-white">Recipient</TableHead>
                    <TableHead className="text-white text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCards.map(card => (
                      <TableRow key={card.id}>
                        <TableCell className="font-mono text-sm">
                          {card.cardNumber}
                        </TableCell>
                        <TableCell>£{card.balance.toFixed(2)}</TableCell>
                        <TableCell>
                          {card.expirationDate
                            ? new Date(card.expirationDate).toLocaleDateString()
                            : 'None'}
                        </TableCell>
                        <TableCell>
                          <a
                            href={`mailto:${card.recipient}`}
                            className="text-blue-600 hover:underline"
                          >
                            {card.recipient}
                          </a>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setModalState({ type: 'view', card })}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View activity
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setModalState({ type: 'note', card })
                              }
                            >
                              <PlusCircle className="h-3 w-3 mr-1" />
                              Add a note
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setModalState({ type: 'adjust', card })
                              }
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Adjust balance
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- MODALS --- */}
      <Dialog
        open={modalState.type !== null}
        onOpenChange={() => setModalState({ type: null, card: null })}
      >
        <DialogContent>
          {modalState.type === 'note' && modalState.card && (
            <AddNoteDialog
              card={modalState.card}
              onSubmit={handleAddNote}
              onClose={() => setModalState({ type: null, card: null })}
            />
          )}
          {modalState.type === 'adjust' && modalState.card && (
            <AdjustBalanceDialog
              card={modalState.card}
              onSubmit={handleAdjustBalance}
              onClose={() => setModalState({ type: null, card: null })}
            />
          )}
          {modalState.type === 'view' && modalState.card && (
            <ViewActivityDialog
              card={modalState.card}
              onClose={() => setModalState({ type: null, card: null })}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- MODAL COMPONENTS ---

const AddNoteDialog = ({
  card,
  onSubmit,
  onClose,
}: {
  card: AdminGiftCard;
  onSubmit: (cardId: string, note: string) => void;
  onClose: () => void;
}) => {
  const [note, setNote] = useState('');
  const handleSubmit = () => {
    if (note.trim()) {
      onSubmit(card.id, note);
      onClose();
    }
  };
  return (
    <>
      <DialogHeader>
        <DialogTitle>Add Note to {card.cardNumber}</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        <Label htmlFor="note">Note</Label>
        <Textarea
          id="note"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add an internal note..."
        />
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={handleSubmit}>Save Note</Button>
      </DialogFooter>
    </>
  );
};

const AdjustBalanceDialog = ({
  card,
  onSubmit,
  onClose,
}: {
  card: AdminGiftCard;
  onSubmit: (cardId: string, amount: number, note: string) => void;
  onClose: () => void;
}) => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount)) {
      onSubmit(card.id, numAmount, note);
      onClose();
    }
  };
  return (
    <>
      <DialogHeader>
        <DialogTitle>Adjust Balance for {card.cardNumber}</DialogTitle>
      </DialogHeader>
      <div className="py-4 space-y-4">
        <div>
          <Label htmlFor="amount">Adjustment Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="e.g., 10.00 or -5.50"
          />
        </div>
        <div>
          <Label htmlFor="note-adjust">Reason / Note (Optional)</Label>
          <Textarea
            id="note-adjust"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="e.g., Customer service credit"
          />
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button onClick={handleSubmit}>Save Adjustment</Button>
      </DialogFooter>
    </>
  );
};

const ViewActivityDialog = ({
    card,
    onClose,
  }: {
    card: AdminGiftCard;
    onClose: () => void;
  }) => {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Activity for {card.cardNumber}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Note</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {card.activity.map(log => (
            <TableRow key={log.id}>
              <TableCell>{log.date}</TableCell>
              <TableCell>{log.action}</TableCell>
              <TableCell>{log.user}</TableCell>
              <TableCell className="text-xs">{log.note}</TableCell>
              <TableCell
                className={cn(
                  'text-right',
                  log.amount < 0 ? 'text-red-600' : 'text-gray-800'
                )}
              >
                £{log.amount.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                £{log.balance.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </>
    );
  };