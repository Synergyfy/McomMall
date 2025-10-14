'use client';

import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { Search, Eye, PlusCircle, Upload } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import {
  useGetMerchantGiftCards,
  useGetGiftCardHistory,
} from '@/service/merchant/gift-card';
import { useGetGiftCardTemplates } from '@/service/gift-card/hook';
import { MerchantGiftCard } from '@/types/merchant-gift-card';

import { BulkCreateGiftCardForm } from './components/BulkCreateGiftCardForm';
import { ImportGiftCardForm } from './components/ImportGiftCardForm';

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
  const {
    data: history,
    isLoading,
    isError,
  } = useGetGiftCardHistory(card.code);

  const processedHistory = useMemo(() => {
    if (!history) return [];

    let runningBalance = parseFloat(card.initialBalance);
    const sortedHistory = [...history].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    return sortedHistory.map(item => {
      const currentBalance = runningBalance;
      runningBalance += parseFloat(item.amount);
      return { ...item, amount: parseFloat(item.amount), currentBalance };
    });
  }, [history, card.initialBalance]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Activity for {card.code}</DialogTitle>
      </DialogHeader>
      <div className="py-4">
        {isLoading && <p>Loading activity...</p>}
        {isError && (
          <p className="text-red-500">Failed to load activity.</p>
        )}
        {processedHistory && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedHistory.map(log => (
                <TableRow key={log.id}>
                  <TableCell>
                    {new Date(log.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{log.type}</TableCell>
                  <TableCell className="text-xs">{log.notes}</TableCell>
                  <TableCell
                    className={cn(
                      'text-right',
                      log.amount < 0 ? 'text-red-600' : 'text-gray-800'
                    )}
                  >
                    £{log.amount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    £{log.currentBalance.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <DialogFooter>
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </>
  );
};


// --- MAIN PAGE COMPONENT ---
export default function GiftCardDashboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCard, setSelectedCard] = useState<MerchantGiftCard | null>(
    null
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const {
    data: giftCardResponse,
    isLoading: isLoadingGiftCards,
    isError: isErrorGiftCards,
    refetch,
  } = useGetMerchantGiftCards({ page, limit: 10, search: debouncedSearch });
  const {
    data: templatesResponse,
    isLoading: isLoadingTemplates,
    isError: isErrorTemplates,
  } = useGetGiftCardTemplates();
  const [isBulkCreateOpen, setBulkCreateOpen] = useState(false);
  const [isImportOpen, setImportOpen] = useState(false);

  const giftCards = useMemo(
    () => giftCardResponse?.data ?? [],
    [giftCardResponse]
  );
  const templates = useMemo(
    () => templatesResponse || [],
    [templatesResponse]
  );

  const filteredCards = giftCards;

  if (isLoadingGiftCards || isLoadingTemplates) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading gift card data...</p>
      </div>
    );
  }

  if (isErrorGiftCards || isErrorTemplates) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">Failed to load gift card data.</p>
      </div>
    );
  }

  const handleSuccess = () => {
    setBulkCreateOpen(false);
    setImportOpen(false);
    refetch();
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <HeaderStats cards={giftCards} />

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Gift card number or recipient email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-xs"
                />
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Bulk Actions</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Admin Tools</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setBulkCreateOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Bulk Create
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setImportOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Import from CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setPage((p) =>
                        p < (giftCardResponse?.meta.totalPages || 1)
                          ? p + 1
                          : p
                      )
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
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

      <AnimatePresence>
        {isBulkCreateOpen && (
          <Dialog open={isBulkCreateOpen} onOpenChange={setBulkCreateOpen}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Create Gift Cards</DialogTitle>
                  <DialogDescription>
                    Create a large number of gift cards from a single template with the same initial value.
                  </DialogDescription>
                </DialogHeader>
                <BulkCreateGiftCardForm
                  templates={templates}
                  onSuccess={handleSuccess}
                />
              </DialogContent>
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isImportOpen && (
          <Dialog open={isImportOpen} onOpenChange={setImportOpen}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import Gift Cards from CSV</DialogTitle>
                  <DialogDescription>
                    Upload a CSV file to import gift cards. The file should contain columns for amount, recipientEmail, recipientName, senderName, and personalMessage.
                  </DialogDescription>
                </DialogHeader>
                <ImportGiftCardForm
                  templates={templates}
                  onSuccess={handleSuccess}
                />
              </DialogContent>
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}