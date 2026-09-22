'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Shield,
    Plus,
    Search,
    MoreHorizontal,
    Ban,
    UserCheck,
    Trash2,
    Store,
    AlertTriangle,
    Loader2,
    Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useGetAdminBusinesses } from '@/service/admin/hook';
import {
    useGetBusinessTeam,
    useUpdateTeamMember,
    useRemoveTeamMember,
    useInviteTeamMember,
    useRevokeTeamInvite,
} from '@/service/team/hook';
import { DEFAULT_PERMISSIONS, TeamRole } from '@/service/team/types';

export default function TeamPage() {
    const [businessId, setBusinessId] = useState<string | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');
    const [inviteOpen, setInviteOpen] = useState(false);

    const { data: businessesData, isLoading: businessesLoading } = useGetAdminBusinesses({
        page: 1,
        limit: 50,
    });
    const businesses = useMemo(() => businessesData?.data ?? [], [businessesData]);

    const { data, isLoading, isError, error, refetch } = useGetBusinessTeam(businessId);
    const update = useUpdateTeamMember(businessId);
    const remove = useRemoveTeamMember(businessId);
    const revoke = useRevokeTeamInvite(businessId);

    const members = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        const list = data?.members ?? [];
        if (!q) return list;
        return list.filter(
            (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q),
        );
    }, [data, searchQuery]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Team &amp; Staff Management</h1>
                    <p className="text-slate-500">Live storefront teams per business from the API</p>
                </div>
                <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-slate-400" />
                    <Select value={businessId ?? ''} onValueChange={(v) => setBusinessId(v || undefined)}>
                        <SelectTrigger className="w-64 bg-white">
                            <SelectValue placeholder={businessesLoading ? 'Loading businesses…' : 'Select a business'} />
                        </SelectTrigger>
                        <SelectContent>
                            {businesses.map((b) => (
                                <SelectItem key={b.id} value={b.id}>
                                    {b.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button className="bg-slate-900 hover:bg-slate-800" disabled={!businessId} onClick={() => setInviteOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Invite Staff
                    </Button>
                </div>
            </div>

            {!businessId && (
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-8 text-center text-sm text-slate-500">
                        Select a business above to load its live team members and pending invites.
                    </CardContent>
                </Card>
            )}

            {businessId && (
                <>
                    {isError && (
                        <Card className="border-rose-200 bg-rose-50">
                            <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                                <AlertTriangle className="h-4 w-4" />
                                Failed to load team: {(error as Error)?.message ?? 'Unknown error'}
                                <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                                    Retry
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="border-0 shadow-sm overflow-hidden">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Storefront Team</CardTitle>
                                    <CardDescription>
                                        {isLoading ? 'Loading…' : `${members.length} members · ${(data?.invites.length ?? 0)} pending invites`}
                                    </CardDescription>
                                </div>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search members..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="p-6 space-y-3">
                                    {[0, 1, 2].map((i) => (
                                        <div key={i} className="h-14 rounded bg-slate-100 animate-pulse" />
                                    ))}
                                </div>
                            ) : members.length === 0 ? (
                                <p className="p-12 text-center text-sm text-slate-400">No team members yet. Send an invite to get started.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead>Name</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Permissions</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {members.map((m) => (
                                            <TableRow key={m.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="text-xs bg-slate-800 text-white">
                                                                {m.name.slice(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-medium text-slate-900">{m.name}</p>
                                                            <p className="text-xs text-slate-500">{m.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="capitalize">
                                                        <Shield className="h-3 w-3 mr-1" /> {m.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs text-slate-500">
                                                        {Object.entries(m.permissions ?? {})
                                                            .filter(([, v]) => v)
                                                            .map(([k]) => k)
                                                            .join(', ') || 'None'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            m.status === 'active'
                                                                ? 'text-emerald-600 border-emerald-200 bg-emerald-50'
                                                                : 'text-red-600 border-red-200 bg-red-50',
                                                        )}
                                                    >
                                                        {m.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem
                                                                className="cursor-pointer"
                                                                disabled={update.isPending}
                                                                onClick={() =>
                                                                    update.mutate({
                                                                        memberId: m.id,
                                                                        dto: { status: m.status === 'active' ? 'suspended' : 'active' },
                                                                    })
                                                                }
                                                            >
                                                                {m.status === 'active' ? (
                                                                    <><Ban className="mr-2 h-4 w-4 text-red-500" /> Suspend</>
                                                                ) : (
                                                                    <><UserCheck className="mr-2 h-4 w-4 text-emerald-500" /> Unsuspend</>
                                                                )}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="cursor-pointer text-red-600"
                                                                disabled={remove.isPending}
                                                                onClick={() => {
                                                                    if (confirm(`Remove ${m.name} from the team?`)) remove.mutate(m.id);
                                                                }}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" /> Remove
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>

                    {(data?.invites.length ?? 0) > 0 && (
                        <Card className="border-0 shadow-sm overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-base">Pending Invites</CardTitle>
                                <CardDescription>Revoke invites that are no longer needed.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead className="pl-6">Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right pr-6">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {(data?.invites ?? []).map((inv) => (
                                            <TableRow key={inv.id}>
                                                <TableCell className="pl-6">
                                                    <span className="inline-flex items-center gap-2 text-sm font-medium">
                                                        <Mail className="h-4 w-4 text-slate-400" /> {inv.email}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="capitalize">{inv.role}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{inv.status}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600"
                                                        disabled={revoke.isPending}
                                                        onClick={() => {
                                                            if (confirm(`Revoke invite to ${inv.email}?`)) revoke.mutate(inv.id);
                                                        }}
                                                    >
                                                        Revoke
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {businessId && (
                <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} businessId={businessId} />
            )}
        </div>
    );
}

function InviteDialog({ open, onOpenChange, businessId }: { open: boolean; onOpenChange: (v: boolean) => void; businessId: string }) {
    const invite = useInviteTeamMember(businessId);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<TeamRole>('staff');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite Staff</DialogTitle>
                    <DialogDescription>Sends a live invite via POST /team/:businessId/invite.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input placeholder="staff@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={role} onValueChange={(v) => setRole(v as TeamRole)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="staff">Staff</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="agent">Agent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        disabled={!email.trim() || invite.isPending}
                        onClick={() =>
                            invite.mutate(
                                { email: email.trim(), role, permissions: DEFAULT_PERMISSIONS },
                                {
                                    onSuccess: () => {
                                        setEmail('');
                                        onOpenChange(false);
                                    },
                                },
                            )
                        }
                    >
                        {invite.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Send Invite
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
