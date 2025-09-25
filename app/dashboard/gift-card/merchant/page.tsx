'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Search, MoreVertical, Eye, Edit, Mail, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getMerchantGiftCards, adjustBalance, resendGiftCard, cancelGiftCard } from '@/service/gift-card';
import { toast } from 'sonner';

import type { GiftCard } from '@/types/gift-card';

const GiftCardRow: React.FC<{ giftCard: GiftCard; onAction: (action: string, giftCard: GiftCard) => void }> = ({ giftCard, onAction }) => {
  const statusVariant: { [key in GiftCard['status']]: "default" | "secondary" | "destructive" } = {
    Active: 'default',
    Used: 'secondary',
    Cancelled: 'destructive',
  };

  return (
    <TableRow>
      <TableCell>{giftCard.code}</TableCell>
      <TableCell>{giftCard.recipient}</TableCell>
      <TableCell>£{giftCard.balance.toFixed(2)}</TableCell>
      <TableCell>
        <Badge variant={statusVariant[giftCard.status] || 'default'}>
          {giftCard.status}
        </Badge>
      </TableCell>
      <TableCell>{new Date(giftCard.purchaseDate).toLocaleDateString()}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onAction('view', giftCard)}>
              <Eye className="mr-2 h-4 w-4" /> View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('adjust', giftCard)}>
              <Edit className="mr-2 h-4 w-4" /> Adjust Balance
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAction('resend', giftCard)}>
              <Mail className="mr-2 h-4 w-4" /> Resend Notification
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onAction('cancel', giftCard)}
            >
              <XCircle className="mr-2 h-4 w-4" /> Cancel Gift Card
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default function MerchantGiftCardPage() {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchGiftCards = async () => {
    setLoading(true);
    try {
      const response = await getMerchantGiftCards(pagination.page, pagination.limit, searchTerm);
      setGiftCards(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.total,
      });
    } catch (error) {
      toast.error('Failed to fetch gift cards.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGiftCards();
  }, [pagination.page, searchTerm]);

  const handleAction = async (action: string, giftCard: GiftCard) => {
    switch (action) {
      case 'view':
        // Implement view details modal
        toast.info(`Viewing details for ${giftCard.code}`);
        break;
      case 'adjust':
        // Implement adjust balance modal
        const amount = prompt('Enter adjustment amount:');
        if (amount) {
          try {
            await adjustBalance(giftCard.id, { amount: parseFloat(amount) });
            toast.success('Balance adjusted successfully.');
            fetchGiftCards();
          } catch (error) {
            toast.error('Failed to adjust balance.');
          }
        }
        break;
      case 'resend':
        try {
          await resendGiftCard(giftCard.id);
          toast.success('Gift card notification resent.');
        } catch (error) {
          toast.error('Failed to resend notification.');
        }
        break;
      case 'cancel':
        if (confirm('Are you sure you want to cancel this gift card?')) {
          try {
            await cancelGiftCard(giftCard.id);
            toast.success('Gift card cancelled successfully.');
            fetchGiftCards();
          } catch (error) {
            toast.error('Failed to cancel gift card.');
          }
        }
        break;
      default:
        break;
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    fetchGiftCards();
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Card className="shadow-lg border-orange-600">
        <CardHeader className="bg-orange-600 text-white">
          <CardTitle>Gift Card Management</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Search by code or recipient"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80 border-orange-300 focus:border-orange-500 focus:ring-orange-500"
              />
              <Button onClick={handleSearch} className="bg-orange-600 hover:bg-orange-700 text-white">
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-10">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="text-orange-600">Code</TableHead>
                  <TableHead className="text-orange-600">Recipient</TableHead>
                  <TableHead className="text-orange-600">Balance</TableHead>
                  <TableHead className="text-orange-600">Status</TableHead>
                  <TableHead className="text-orange-600">Purchase Date</TableHead>
                  <TableHead className="text-right text-orange-600">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {giftCards.map((card) => (
                  <GiftCardRow key={card.id} giftCard={card} onAction={handleAction} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}