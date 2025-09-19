'use client';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { useGetUserPromotions, useGetUserTransactions, useGetRedeemedOffers } from '@/service/history/hook';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Button } from '@/components/ui/button';

const PromotionHistoryPage = () => {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const [promotionsFilter, setPromotionsFilter] = useState('');
  const [transactionsFilter, setTransactionsFilter] = useState('');
  const [redeemedOffersFilter, setRedeemedOffersFilter] = useState('');
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [redeemedOffersPage, setRedeemedOffersPage] = useState(1);

  const { data: promotionsData, isLoading: promotionsLoading } = useGetUserPromotions(userId);
  const { data: transactionsData, isLoading: transactionsLoading } = useGetUserTransactions(userId, transactionsPage, 20);
  const { data: redeemedOffersData, isLoading: redeemedOffersLoading } = useGetRedeemedOffers(userId, redeemedOffersPage, 20);

  const filteredPromotions = promotionsData?.data.promotions?.filter(p => p.promotionName.toLowerCase().includes(promotionsFilter.toLowerCase()));
  const filteredTransactions = transactionsData?.data.transactions?.filter(t => t.description.toLowerCase().includes(transactionsFilter.toLowerCase()));
  const filteredRedeemedOffers = redeemedOffersData?.data.redeemedOffers?.filter(o => o.offerName.toLowerCase().includes(redeemedOffersFilter.toLowerCase()));

  if (!userId) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Promotion History</h1>
        <p>Please log in to view your promotion history.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Promotion History</h1>
      <Tabs defaultValue="promotions" className="w-full">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
          <TabsTrigger value="promotions" className="text-orange-600">Promotions</TabsTrigger>
          <TabsTrigger value="transactions" className="text-orange-600">Transactions</TabsTrigger>
          <TabsTrigger value="redeemed-offers" className="text-orange-600">Redeemed Offers</TabsTrigger>
        </TabsList>

        <TabsContent value="promotions">
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-orange-600">Enrolled Promotions</CardTitle>
              <Input
                placeholder="Filter by promotion name..."
                value={promotionsFilter}
                onChange={e => setPromotionsFilter(e.target.value)}
                className="mt-2"
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Promotion Name</TableHead>
                    <TableHead>Points Balance</TableHead>
                    <TableHead>Enrollment Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotionsLoading ? (
                    <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
                  ) : (
                    filteredPromotions?.map(p => (
                      <TableRow key={p.promotionId}>
                        <TableCell>{p.promotionName}</TableCell>
                        <TableCell>{p.pointsBalance}</TableCell>
                        <TableCell>{new Date(p.enrollmentDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-orange-600">Point History</CardTitle>
              <Input
                placeholder="Filter by description..."
                value={transactionsFilter}
                onChange={e => setTransactionsFilter(e.target.value)}
                className="mt-2"
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsLoading ? (
                    <TableRow><TableCell colSpan={4}>Loading...</TableCell></TableRow>
                  ) : (
                    filteredTransactions?.map(t => (
                      <TableRow key={t.transactionId}>
                        <TableCell>{t.type}</TableCell>
                        <TableCell>{t.points}</TableCell>
                        <TableCell>{t.description}</TableCell>
                        <TableCell>{new Date(t.timestamp).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  onClick={() => setTransactionsPage(p => Math.max(p - 1, 1))}
                  disabled={transactionsPage === 1}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setTransactionsPage(p => p + 1)}
                  disabled={!transactionsData || transactionsPage >= transactionsData.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redeemed-offers">
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-orange-600">Redeemed Offers</CardTitle>
              <Input
                placeholder="Filter by offer name..."
                value={redeemedOffersFilter}
                onChange={e => setRedeemedOffersFilter(e.target.value)}
                className="mt-2"
              />
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Offer Name</TableHead>
                    <TableHead>Points Spent</TableHead>
                    <TableHead>Redemption Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redeemedOffersLoading ? (
                    <TableRow><TableCell colSpan={3}>Loading...</TableCell></TableRow>
                  ) : (
                    filteredRedeemedOffers?.map(o => (
                      <TableRow key={o.offerId}>
                        <TableCell>{o.offerName}</TableCell>
                        <TableCell>{o.pointsSpent}</TableCell>
                        <TableCell>{new Date(o.redemptionDate).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  onClick={() => setRedeemedOffersPage(p => Math.max(p - 1, 1))}
                  disabled={redeemedOffersPage === 1}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setRedeemedOffersPage(p => p + 1)}
                  disabled={!redeemedOffersData || redeemedOffersPage >= redeemedOffersData.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PromotionHistoryPage;
