'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Settings,
    Shield,
    Map,
    Gamepad2,
    CreditCard,
    Bell,
    Code,
    Zap,
    Users,
    Save
} from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
                    <p className="text-slate-500">Configure global parameters and ecosystem rules</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="bg-slate-900 hover:bg-slate-800">
                        <Save className="h-4 w-4 mr-2" /> Save All Changes
                    </Button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Settings Sidebar */}
                <Card className="border-0 shadow-sm w-full lg:w-64 h-fit shrink-0 bg-slate-50/50">
                    <CardContent className="p-2 space-y-1">
                        <div className="p-2 flex items-center gap-3 text-sm font-medium bg-white rounded-lg text-orange-600 shadow-sm border border-slate-100 cursor-pointer">
                            <Users className="h-4 w-4" /> Membership Settings
                        </div>
                        <div className="p-2 flex items-center gap-3 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg cursor-pointer">
                            <Map className="h-4 w-4" /> Borough Settings
                        </div>
                        <div className="p-2 flex items-center gap-3 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg cursor-pointer">
                            <Gamepad2 className="h-4 w-4" /> Gamification Rules
                        </div>
                        <div className="p-2 flex items-center gap-3 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg cursor-pointer">
                            <CreditCard className="h-4 w-4" /> Billing Settings
                        </div>
                        <div className="p-2 flex items-center gap-3 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg cursor-pointer">
                            <Bell className="h-4 w-4" /> Notification Systems
                        </div>
                        <div className="p-2 flex items-center gap-3 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg cursor-pointer">
                            <Code className="h-4 w-4" /> API Integrations
                        </div>
                        <div className="p-2 flex items-center gap-3 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg cursor-pointer">
                            <Shield className="h-4 w-4" /> Security Settings
                        </div>
                        <div className="p-2 flex items-center gap-3 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg cursor-pointer">
                            <Zap className="h-4 w-4" /> Automation Rules
                        </div>
                    </CardContent>
                </Card>

                {/* Settings Content Area */}
                <div className="flex-1 space-y-6">
                    <Card className="border-0 shadow-sm">
                        <CardHeader className="pb-4 border-b border-slate-100">
                            <CardTitle className="text-lg">Membership Settings</CardTitle>
                            <CardDescription>Configure global parameters for business subscription tiers</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-slate-900">Tier Pricing (Monthly)</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Bronze Tier (£)</label>
                                        <Input type="number" defaultValue="29" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Silver Tier (£)</label>
                                        <Input type="number" defaultValue="49" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Gold Tier (£)</label>
                                        <Input type="number" defaultValue="99" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Platinum Tier (£)</label>
                                        <Input type="number" defaultValue="199" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 space-y-4">
                                <h3 className="text-sm font-semibold text-slate-900">Trial Periods & Limits</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Default Trial Days</label>
                                        <Input type="number" defaultValue="14" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700">Max Active Products (Bronze)</label>
                                        <Input type="number" defaultValue="50" />
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    {/* Placeholder for other setting sections just to show layout structure */}
                    <Card className="border-0 shadow-sm opacity-50 pointer-events-none">
                        <CardHeader className="pb-4 border-b border-slate-100">
                            <CardTitle className="text-lg">Borough Settings</CardTitle>
                            <CardDescription>Regional controls and parameters</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 h-32 flex items-center justify-center">
                            <p className="text-slate-400">Settings available via sidebar navigation...</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
