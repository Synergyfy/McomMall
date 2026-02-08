'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ShieldCheck,
    Users,
    Key,
    Lock,
    Search,
    Plus,
    MoreHorizontal,
    CheckCircle2,
    ShieldAlert,
    Trash2,
} from 'lucide-react';
import { adminRoles } from '../data/mock-data';

export default function RolesPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Roles & Permissions</h1>
                    <p className="text-slate-500">Manage administrative access levels and security permissions</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button className="bg-orange-500 hover:bg-orange-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Role
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Roles List */}
                <div className="md:col-span-2 space-y-4">
                    <Card className="border-0 shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50/50">
                                        <TableHead>Role Name</TableHead>
                                        <TableHead>Permissions</TableHead>
                                        <TableHead>Admins</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {adminRoles.map((role) => (
                                        <TableRow key={role.id}>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-900">{role.name}</span>
                                                    <span className="text-xs text-slate-400 font-normal">{role.description}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {role.permissions.map((p, i) => (
                                                        <Badge key={i} variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-100 uppercase font-bold px-1.5 py-0">
                                                            {p}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="h-3.5 w-3.5 text-slate-400" />
                                                    <span className="text-sm font-medium">{role.userCount}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Security Setup Card */}
                <div className="space-y-6">
                    <Card className="border-0 shadow-sm bg-slate-900 text-white">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5 text-orange-400" />
                                Security Best Practices
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                    <span>2FA Mandatory for Multi-Admin</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-400 grayscale">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>IP Whitelisting Enabled</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                    <span>Session Timeout: 2 Hours</span>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full text-white border-slate-700 hover:bg-slate-800">
                                Security Settings
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Key className="h-4 w-4" />
                                Audit Active API Keys
                            </Button>
                            <Button variant="outline" className="w-full justify-start gap-2 text-red-600 hover:text-red-700">
                                <Lock className="h-4 w-4" />
                                Global Lock (Panic Mode)
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
