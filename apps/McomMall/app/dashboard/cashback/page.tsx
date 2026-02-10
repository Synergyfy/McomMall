'use client';
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info } from "lucide-react";
import { GeneralCashback } from './components/GeneralCashback';
import { TerminalCashback } from './components/TerminalCashback';

const CashbackPage = () => {
  return (
    <div className="flex flex-col gap-6 overflow-auto pb-10">
      <div className="flex flex-col gap-2">
         <h2 className="text-3xl font-bold tracking-tight text-gray-900">Cashback Hub</h2>
         <p className="text-gray-500">Manage all your cashback rewards in one place.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-50/50 border-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-700">
              <Info className="h-4 w-4" /> General Cashback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600 leading-relaxed">
              Earn rewards from your online purchases and platform activities. These are automatically credited to your account based on your spending.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-orange-50/50 border-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-orange-700">
              <Info className="h-4 w-4" /> Terminal Cashback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-orange-600 leading-relaxed">
              Rewards for your physical in-store visits. Scan QR codes at participating locations and upload your receipts to claim your rewards.
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="general">General Cashback</TabsTrigger>
          <TabsTrigger value="terminal">Terminal Cashback</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-6">
          <GeneralCashback />
        </TabsContent>
        <TabsContent value="terminal" className="mt-6">
          <TerminalCashback />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashbackPage;
