'use client';
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Globe, Smartphone, ArrowUpRight } from "lucide-react";
import { GeneralCashback } from './components/GeneralCashback';
import { TerminalCashback } from './components/TerminalCashback';

const CashbackPage = () => {
  return (
    <div className="flex flex-col gap-8 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">Cashback Hub</h2>
          <p className="text-lg text-muted-foreground">
            Manage and track your rewards from online and in-store activities.
          </p>
        </div>
      </div>

      {/* Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden group border-none shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Globe className="h-24 w-24 text-blue-600" />
          </div>
          <CardHeader className="pb-2 relative">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl font-bold text-blue-900">General Cashback</CardTitle>
            <CardDescription className="text-blue-700 font-medium">Online & Platform Rewards</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-sm text-blue-800/80 leading-relaxed max-w-[85%]">
              Automatically earn rewards from your online purchases and platform activities. No manual steps required — rewards are calculated and credited based on your spending.
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group border-none shadow-md bg-gradient-to-br from-orange-50 to-amber-50 hover:shadow-lg transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Smartphone className="h-24 w-24 text-orange-600" />
          </div>
          <CardHeader className="pb-2 relative">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center mb-2">
              <Smartphone className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle className="text-xl font-bold text-orange-900">Terminal Cashback</CardTitle>
            <CardDescription className="text-orange-700 font-medium">In-Store & Local Rewards</CardDescription>
          </CardHeader>
          <CardContent className="relative">
            <p className="text-sm text-orange-800/80 leading-relaxed max-w-[85%]">
              Claim rewards for your physical visits to participating stores. Simply scan the terminal QR code and upload your proof of purchase to start earning back.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="general" className="w-full">
        <div className="flex items-center justify-center sm:justify-start border-b mb-6">
          <TabsList className="bg-transparent h-auto p-0 gap-8">
            <TabsTrigger 
              value="general" 
              className="px-4 py-3 text-base font-semibold border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 rounded-none shadow-none transition-all"
            >
              General Hub
            </TabsTrigger>
            <TabsTrigger 
              value="terminal"
              className="px-4 py-3 text-base font-semibold border-b-2 border-transparent data-[state=active]:border-orange-600 data-[state=active]:bg-transparent data-[state=active]:text-orange-600 rounded-none shadow-none transition-all"
            >
              Terminal Claims
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="general" className="mt-0 focus-visible:outline-none ring-offset-background">
          <GeneralCashback />
        </TabsContent>
        
        <TabsContent value="terminal" className="mt-0 focus-visible:outline-none ring-offset-background">
          <div className="bg-white rounded-xl border p-2 sm:p-6 shadow-sm">
            <TerminalCashback />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CashbackPage;
