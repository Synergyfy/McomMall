'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Settings,
    DollarSign,
    Mail,
    Shield,
    Bell,
    Globe,
    CreditCard,
    Percent,
    Clock,
    Save,
    AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Setting Row Component
function SettingRow({
    label,
    description,
    children,
}: {
    label: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b last:border-0">
            <div className="space-y-0.5">
                <Label className="text-base">{label}</Label>
                {description && (
                    <p className="text-sm text-slate-500">{description}</p>
                )}
            </div>
            <div className="sm:w-64">{children}</div>
        </div>
    );
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-slate-500">Configure platform-wide settings</p>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                </Button>
            </div>

            {/* Settings Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
                    <TabsTrigger value="general" className="gap-2">
                        <Settings className="h-4 w-4" />
                        <span className="hidden sm:inline">General</span>
                    </TabsTrigger>
                    <TabsTrigger value="fees" className="gap-2">
                        <DollarSign className="h-4 w-4" />
                        <span className="hidden sm:inline">Fees</span>
                    </TabsTrigger>
                    <TabsTrigger value="email" className="gap-2">
                        <Mail className="h-4 w-4" />
                        <span className="hidden sm:inline">Email</span>
                    </TabsTrigger>
                    <TabsTrigger value="moderation" className="gap-2">
                        <Shield className="h-4 w-4" />
                        <span className="hidden sm:inline">Moderation</span>
                    </TabsTrigger>
                    <TabsTrigger value="payouts" className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        <span className="hidden sm:inline">Payouts</span>
                    </TabsTrigger>
                </TabsList>

                {/* General Settings */}
                <TabsContent value="general">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>Basic platform configuration</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <SettingRow label="Platform Name" description="Display name for your platform">
                                <Input defaultValue="McomMall" />
                            </SettingRow>

                            <SettingRow label="Default Currency" description="Primary currency for transactions">
                                <Select defaultValue="usd">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="usd">USD ($)</SelectItem>
                                        <SelectItem value="eur">EUR (€)</SelectItem>
                                        <SelectItem value="gbp">GBP (£)</SelectItem>
                                        <SelectItem value="cad">CAD ($)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </SettingRow>

                            <SettingRow label="Default Timezone" description="Platform timezone for reports">
                                <Select defaultValue="est">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="est">Eastern Time (ET)</SelectItem>
                                        <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                                        <SelectItem value="utc">UTC</SelectItem>
                                        <SelectItem value="gmt">GMT</SelectItem>
                                    </SelectContent>
                                </Select>
                            </SettingRow>

                            <SettingRow label="Maintenance Mode" description="Temporarily disable platform access">
                                <Switch />
                            </SettingRow>

                            <SettingRow label="New User Registration" description="Allow new users to sign up">
                                <Switch defaultChecked />
                            </SettingRow>

                            <SettingRow label="Business Registration" description="Allow new business signups">
                                <Switch defaultChecked />
                            </SettingRow>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Fees Settings */}
                <TabsContent value="fees">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle>Fee Configuration</CardTitle>
                            <CardDescription>Platform commission and fee structure</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <SettingRow label="Platform Commission" description="Percentage taken from each transaction">
                                <div className="flex items-center gap-2">
                                    <Input type="number" defaultValue="3" className="w-20" />
                                    <span className="text-slate-500">%</span>
                                </div>
                            </SettingRow>

                            <SettingRow label="Payment Processing Fee" description="Fee for payment processing">
                                <div className="flex items-center gap-2">
                                    <Input type="number" defaultValue="2.9" className="w-20" />
                                    <span className="text-slate-500">% + $0.30</span>
                                </div>
                            </SettingRow>

                            <SettingRow label="Minimum Transaction" description="Minimum transaction amount">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">$</span>
                                    <Input type="number" defaultValue="1" className="w-20" />
                                </div>
                            </SettingRow>

                            <SettingRow label="Featured Listing Fee" description="Cost to feature a listing on homepage">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">$</span>
                                    <Input type="number" defaultValue="49" className="w-20" />
                                    <span className="text-slate-500">/week</span>
                                </div>
                            </SettingRow>

                            <SettingRow label="Tax Rate" description="Default tax rate for transactions">
                                <div className="flex items-center gap-2">
                                    <Input type="number" defaultValue="8.25" className="w-20" />
                                    <span className="text-slate-500">%</span>
                                </div>
                            </SettingRow>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Email Settings */}
                <TabsContent value="email">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle>Email Templates</CardTitle>
                            <CardDescription>Customize automated email notifications</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {[
                                { name: 'Welcome Email', description: 'Sent when a new user signs up' },
                                { name: 'Order Confirmation', description: 'Sent after successful purchase' },
                                { name: 'Listing Approved', description: 'Sent when a listing is approved' },
                                { name: 'Listing Rejected', description: 'Sent when a listing is rejected' },
                                { name: 'Password Reset', description: 'Sent for password recovery' },
                                { name: 'Refund Notification', description: 'Sent when a refund is processed' },
                            ].map((template) => (
                                <div key={template.name} className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                                    <div>
                                        <p className="font-medium text-slate-900">{template.name}</p>
                                        <p className="text-sm text-slate-500">{template.description}</p>
                                    </div>
                                    <Button variant="outline" size="sm">Edit Template</Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Moderation Settings */}
                <TabsContent value="moderation">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle>Moderation Rules</CardTitle>
                            <CardDescription>Content moderation and policy settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <SettingRow label="Auto-approve Listings" description="Automatically approve new listings">
                                <Switch />
                            </SettingRow>

                            <SettingRow label="Require Verification" description="Require ID verification for sellers">
                                <Switch defaultChecked />
                            </SettingRow>

                            <SettingRow label="Review Threshold" description="Minimum reviews before displaying rating">
                                <Input type="number" defaultValue="3" className="w-20" />
                            </SettingRow>

                            <SettingRow label="Blocked Words" description="Content filter for prohibited words">
                                <Button variant="outline" size="sm">Edit List</Button>
                            </SettingRow>

                            <SettingRow label="High-value Refund Threshold" description="Refunds above this require 2 approvals">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">$</span>
                                    <Input type="number" defaultValue="500" className="w-24" />
                                </div>
                            </SettingRow>

                            <SettingRow label="Fraud Detection" description="Enable automatic fraud detection">
                                <Switch defaultChecked />
                            </SettingRow>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm mt-6 border-amber-200 bg-amber-50">
                        <CardContent className="py-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                                <div>
                                    <p className="font-medium text-amber-900">Moderation Queue</p>
                                    <p className="text-sm text-amber-700">You have 23 pending items requiring moderation.</p>
                                    <Button size="sm" variant="outline" className="mt-2">View Queue</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Payout Settings */}
                <TabsContent value="payouts">
                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle>Payout Configuration</CardTitle>
                            <CardDescription>Business payout schedule and settings</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <SettingRow label="Default Payout Schedule" description="When businesses receive payouts">
                                <Select defaultValue="weekly">
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </SettingRow>

                            <SettingRow label="Minimum Payout" description="Minimum balance for payout">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">$</span>
                                    <Input type="number" defaultValue="50" className="w-24" />
                                </div>
                            </SettingRow>

                            <SettingRow label="Payout Hold Period" description="Days to hold funds before payout">
                                <div className="flex items-center gap-2">
                                    <Input type="number" defaultValue="7" className="w-20" />
                                    <span className="text-slate-500">days</span>
                                </div>
                            </SettingRow>

                            <SettingRow label="Automatic Payouts" description="Process payouts automatically">
                                <Switch defaultChecked />
                            </SettingRow>

                            <SettingRow label="Payout Methods" description="Available payout options for businesses">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Switch defaultChecked id="bank" />
                                        <Label htmlFor="bank">Bank Transfer</Label>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch defaultChecked id="paypal" />
                                        <Label htmlFor="paypal">PayPal</Label>
                                    </div>
                                </div>
                            </SettingRow>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
