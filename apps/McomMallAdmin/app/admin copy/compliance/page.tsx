'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RuleBuilder } from '@/app/admin/components/compliance/RuleBuilder';
import { FileText, Gavel, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CompliancePage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Compliance & Policy</h1>
                    <p className="text-slate-500">Manage platform rules, restrictions, and legal documentation</p>
                </div>
            </div>

            <Tabs defaultValue="rules" className="space-y-6">
                <TabsList className="bg-white border p-1">
                    <TabsTrigger value="rules" className="gap-2">
                        <Gavel className="h-4 w-4" />
                        Platform Rules
                    </TabsTrigger>
                    <TabsTrigger value="docs" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Legal Documents
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="gap-2">
                        <Scale className="h-4 w-4" />
                        Compliance Logs
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="rules">
                    <RuleBuilder />
                </TabsContent>

                <TabsContent value="docs">
                    <Card>
                        <CardHeader>
                            <CardTitle>Legal Documentation</CardTitle>
                            <CardDescription>Manage Terms of Service, Privacy Policy, etc.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {['Terms of Service', 'Privacy Policy', 'Seller Agreement', 'Return Policy'].map((doc) => (
                                <div key={doc} className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-slate-400" />
                                        <div>
                                            <p className="font-medium text-slate-900">{doc}</p>
                                            <p className="text-xs text-slate-500">Last updated: 2 days ago</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm">View</Button>
                                        <Button variant="outline" size="sm">Edit</Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="logs">
                    <Card>
                        <CardContent className="p-8 text-center text-slate-500">
                            No compliance violations logged recently.
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
