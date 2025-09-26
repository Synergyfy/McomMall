'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { Search, Eye } from 'lucide-react';

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
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useGetMerchantGiftCards } from '@/service/merchant/gift-card';
import { MerchantGiftCard } from '@/types/merchant-gift-card';

// --- MOCK ACTIVITY DATA ---
const mockActivity = [
  { id: '1', date: '2023-10-01', action: 'Issued', amount: 100, balance: 100, user: 'system', note: 'Initial issue' },
  { id: '2', date: '2023-10-05', action: 'Purchase', amount: -25, balance: 75, user: 'john.doe@example.com', note: 'Order #123' },
  { id: '3', date: '2023-10-15', action: 'Purchase', amount: -30, balance: 45, user: 'john.doe@example.com', note: 'Order #124' },
  { id: '4', date: '2023-11-01', action: 'Top-up', amount: 50, balance: 95, user: 'jane.doe@example.com', note: 'Customer service credit' },
];


// --- SUB-COMPONENTS ---

const HeaderStats = ({ cards }: { cards: MerchantGiftCard[] }) => {
  const totalBalance = cards.reduce((sum, card) => sum + parseFloat(card.currentBalance), 0);
  const activeCards = cards.filter(card => card.isActive && parseFloat(card.currentBalance) > 0).length;

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

const ViewActivityDialog = ({
  card,
  onClose,
}: {
  card: MerchantGiftCard;
  onClose: () => void;
}) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Activity for {card.code}</DialogTitle>
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
        {mockActivity.map(log => (
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


// --- MAIN PAGE COMPONENT ---
export default function GiftCardDashboardPage() {
  const { data: giftCardResponse, isLoading, isError } = useGetMerchantGiftCards();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCard, setSelectedCard] = useState<MerchantGiftCard | null>(null);

  const giftCards = giftCardResponse?.data || [];

  const filteredCards = useMemo(() => {
    if (!searchQuery) return giftCards;
    const lowercasedQuery = searchQuery.toLowerCase();
    return giftCards.filter(
      card =>
        card.code.toLowerCase().includes(lowercasedQuery) ||
        card.recipientEmail.toLowerCase().includes(lowercasedQuery)
    );
  }, [searchQuery, giftCards]);

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <p>Loading gift cards...</p>
        </div>
    );
  }

  if (isError) {
    return (
        <div className="flex justify-center items-center h-screen">
            <p className="text-red-500">Failed to load gift cards.</p>
        </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <HeaderStats cards={giftCards} />

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
                  {filteredCards.length > 0 ? (
                    filteredCards.map(card => (
                      <TableRow key={card.id}>
                        <TableCell className="font-mono text-sm">
                          {card.code}
                        </TableCell>
                        <TableCell>£{parseFloat(card.currentBalance).toFixed(2)}</TableCell>
                        <TableCell>
                          {card.expiryDate
                            ? new Date(card.expiryDate).toLocaleDateString()
                            : 'None'}
                        </TableCell>
                        <TableCell>
                          <a
                            href={`mailto:${card.recipientEmail}`}
                            className="text-blue-600 hover:underline"
                          >
                            {card.recipientEmail}
                          </a>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCard(card)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View activity
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-10">
                            No gift cards found.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- MODALS --- */}
      <Dialog
        open={selectedCard !== null}
        onOpenChange={() => setSelectedCard(null)}
      >
        <DialogContent>
          {selectedCard && (
            <ViewActivityDialog
              card={selectedCard}
              onClose={() => setSelectedCard(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}