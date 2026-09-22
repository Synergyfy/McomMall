'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ShieldCheck, Users, Plus, AlertTriangle, Loader2, Trash2, UserMinus } from 'lucide-react';
import {
    useGetAdminRoles,
    useGetRoleMembers,
    useCreateAdminRole,
    useUpdateAdminRole,
    useAssignRoleMember,
    useUnassignRoleMember,
    useDeleteAdminRole,
} from '@/service/roles/hook';
import { AVAILABLE_PERMISSIONS, AdminRole } from '@/service/roles/types';
import { useGetAdminUsers } from '@/service/admin/hook';

export default function RolesPage() {
    const { data, isLoading, isError, error, refetch } = useGetAdminRoles();
    const create = useCreateAdminRole();
    const update = useUpdateAdminRole();
    const remove = useDeleteAdminRole();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState<AdminRole | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [permissions, setPermissions] = useState<string[]>([]);
    const [membersRoleId, setMembersRoleId] = useState<string | null>(null);

    const roles = data ?? [];

    const openCreate = () => {
        setEditing(null);
        setName('');
        setDescription('');
        setPermissions([]);
        setDialogOpen(true);
    };

    const openEdit = (role: AdminRole) => {
        setEditing(role);
        setName(role.name);
        setDescription(role.description ?? '');
        setPermissions(role.permissions ?? []);
        setDialogOpen(true);
    };

    const togglePermission = (perm: string) => {
        setPermissions((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));
    };

    const handleSave = () => {
        if (!name.trim()) return;
        const dto = {
            name: name.trim(),
            description: description.trim() || undefined,
            permissions,
        };
        if (editing) {
            update.mutate(
                { id: editing.id, dto },
                { onSuccess: () => setDialogOpen(false) },
            );
        } else {
            create.mutate(dto, { onSuccess: () => setDialogOpen(false) });
        }
    };

    const saving = create.isPending || update.isPending;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Admin Roles &amp; Permissions</h1>
                    <p className="text-slate-500">Live roles with member counts from the API</p>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={openCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Role
                </Button>
            </div>

            {isError && (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load roles: {(error as Error)?.message ?? 'Unknown error'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-14 rounded bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : roles.length === 0 ? (
                        <div className="p-12 text-center">
                            <ShieldCheck className="h-8 w-8 mx-auto text-slate-300" />
                            <p className="mt-3 font-bold text-slate-700">No roles yet</p>
                            <p className="text-sm text-slate-400">Create your first admin role.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead>Role Name</TableHead>
                                    <TableHead>Permissions</TableHead>
                                    <TableHead className="text-center">Members</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900">{role.name}</span>
                                                <span className="text-xs text-slate-400 font-normal">
                                                    {role.description || '—'}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1 max-w-md">
                                                {(role.permissions ?? []).length === 0 && (
                                                    <span className="text-xs text-slate-400">No permissions</span>
                                                )}
                                                {(role.permissions ?? []).map((p) => (
                                                    <Badge
                                                        key={p}
                                                        variant="secondary"
                                                        className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-100 uppercase font-bold px-1.5 py-0"
                                                    >
                                                        {p}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Users className="h-3.5 w-3.5 text-slate-400" />
                                                <span className="text-sm font-medium">{role.memberCount ?? 0}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={role.isActive ? 'default' : 'secondary'}>
                                                {role.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => openEdit(role)}>
                                                    Edit
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => setMembersRoleId(role.id)}>
                                                    Members
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500"
                                                    disabled={remove.isPending}
                                                    onClick={() => {
                                                        if (confirm(`Delete role "${role.name}"? Members keep their accounts but lose the role.`)) {
                                                            remove.mutate(role.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Role' : 'Create Role'}</DialogTitle>
                        <DialogDescription>
                            {editing ? 'Updates the live role record.' : 'Creates a live role via POST /admin/roles.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Name *</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Moderator" />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What can this role do?"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Permissions</Label>
                            <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-100 p-3">
                                {AVAILABLE_PERMISSIONS.map((perm) => (
                                    <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer">
                                        <Checkbox
                                            checked={permissions.includes(perm)}
                                            onCheckedChange={() => togglePermission(perm)}
                                        />
                                        <span className="font-mono text-xs">{perm}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button disabled={!name.trim() || saving} onClick={handleSave}>
                            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {editing ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {membersRoleId && (
                <MembersDialog
                    roleId={membersRoleId}
                    roleName={roles.find((r) => r.id === membersRoleId)?.name ?? ''}
                    onClose={() => setMembersRoleId(null)}
                />
            )}
        </div>
    );
}

function MembersDialog({ roleId, roleName, onClose }: { roleId: string; roleName: string; onClose: () => void }) {
    const { data: members, isLoading } = useGetRoleMembers(roleId);
    const assign = useAssignRoleMember();
    const unassign = useUnassignRoleMember(roleId);
    const { data: usersData } = useGetAdminUsers({ type: 'admin', limit: 50 });
    const [selectedUser, setSelectedUser] = useState('');

    const memberIds = new Set((members ?? []).map((m) => m.id));
    const candidates = (usersData?.data ?? []).filter((u) => !memberIds.has(u.id));

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Members — {roleName}</DialogTitle>
                    <DialogDescription>Assign admin users to this role.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="flex gap-2">
                        <Select value={selectedUser} onValueChange={setSelectedUser}>
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select admin user" />
                            </SelectTrigger>
                            <SelectContent>
                                {candidates.map((u) => (
                                    <SelectItem key={u.id} value={u.id}>
                                        {u.name} · {u.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            disabled={!selectedUser || assign.isPending}
                            onClick={() =>
                                assign.mutate(
                                    { roleId, userId: selectedUser },
                                    { onSuccess: () => setSelectedUser('') },
                                )
                            }
                        >
                            Assign
                        </Button>
                    </div>
                    {isLoading ? (
                        <div className="h-20 rounded bg-slate-100 animate-pulse" />
                    ) : (members ?? []).length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-6">No members assigned.</p>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {(members ?? []).map((m) => (
                                <li key={m.id} className="py-2 flex items-center justify-between text-sm">
                                    <span className="font-medium">
                                        {m.fullName || `${m.firstName ?? ''} ${m.lastName ?? ''}`.trim() || m.email}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600"
                                        disabled={unassign.isPending}
                                        onClick={() => unassign.mutate(m.id)}
                                    >
                                        <UserMinus className="h-4 w-4 mr-1" /> Remove
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
