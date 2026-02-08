'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CashbackRulesTable } from './components/CashbackRulesTable';
import { CashbackHistoryTable } from './components/CashbackHistoryTable';
import { CashbackStats } from './components/CashbackStats';
import { CreateRuleDialog } from './components/CreateRuleDialog';
import { Settings, History, Wallet } from 'lucide-react';

export default function CashbackPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cashback Configuration</h1>
          <p className="text-slate-500">Manage cashback rules and view transaction history</p>
        </div>
        <div className="flex items-center gap-2">
          <CreateRuleDialog />
        </div>
      </div>

      <CashbackStats />

      <Tabs defaultValue="rules" className="w-full">
        <TabsList className="bg-slate-100 p-1 gap-1">
          <TabsTrigger value="rules" className="gap-2">
            <Settings className="h-4 w-4" />
            Configuration Rules
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Transaction History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rules" className="mt-6">
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle>Cashback Rules</CardTitle>
                    <CardDescription>
                        Define how much cashback users earn for specific actions on the MCOM_MALL platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CashbackRulesTable />
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
            <Card className="border-0 shadow-sm">
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>
                        View global cashback transactions across the ecosystem.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="platform" className="w-full">
                         <div className="flex items-center justify-between mb-4">
                             <TabsList className="grid w-[400px] grid-cols-2">
                                <TabsTrigger value="platform">Platform History (Mall)</TabsTrigger>
                                <TabsTrigger value="global">Global History (All)</TabsTrigger>
                             </TabsList>
                         </div>
                        <TabsContent value="platform">
                            <CashbackHistoryTable scope="platform" />
                        </TabsContent>
                        <TabsContent value="global">
                            <CashbackHistoryTable scope="global" />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
