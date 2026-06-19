'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetUserListings } from '@/service/listings/hook';
import { 
  useGetTeam, 
  useInviteMember, 
  useUpdateMember, 
  useRemoveMember, 
  useRevokeInvite,
  TeamMember,
  TeamInvite
} from '@/service/team/hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  X, 
  Plus, 
  ArrowLeft,
  UserCheck,
  UserMinus,
  Settings,
  Mail
} from 'lucide-react';

const PERMISSION_KEYS = [
  { key: 'storefront', label: 'Storefront Access' },
  { key: 'analytics', label: 'Analytics Reports' },
  { key: 'orders', label: 'Orders & Sales' },
  { key: 'customers', label: 'Customer Relations' },
  { key: 'marketing', label: 'Marketing Tools' },
  { key: 'inventory', label: 'Inventory Management' }
] as const;

export default function TeamManagementPage() {
  const router = useRouter();
  const { data: listingsData, isLoading: isListingsLoading } = useGetUserListings(1, 1);
  const businessId = listingsData?.data?.[0]?.id || '';

  const { data: teamData, isLoading: isTeamLoading } = useGetTeam(businessId);
  const { mutateAsync: inviteMember, isPending: isInviting } = useInviteMember(businessId);
  const { mutateAsync: updateMember } = useUpdateMember(businessId);
  const { mutateAsync: removeMember } = useRemoveMember(businessId);
  const { mutateAsync: revokeInvite } = useRevokeInvite(businessId);

  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'members'>('overview');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Invite Form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'manager' | 'staff' | 'agent'>('staff');
  const [invitePermissions, setInvitePermissions] = useState({
    storefront: true,
    analytics: false,
    orders: true,
    customers: false,
    marketing: false,
    inventory: true,
  });

  // Edit Form state
  const [editRole, setEditRole] = useState<'manager' | 'staff' | 'agent'>('staff');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended'>('active');
  const [editPermissions, setEditPermissions] = useState<any>({});

  const isLoading = isListingsLoading || isTeamLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[#ff6900] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!businessId) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4">
        <Users className="w-16 h-16 mx-auto text-gray-300" />
        <h2 className="text-xl font-bold">Storefront Profile Required</h2>
        <p className="text-sm text-gray-500">
          Please create and verify your Business storefront profile before managing your team members.
        </p>
        <Button className="bg-[#ff6900] hover:bg-[#a14000] text-white rounded-xl" onClick={() => router.push('/dashboard/add-listing')}>
          Create Storefront Profile
        </Button>
      </div>
    );
  }

  const members = teamData?.members || [];
  const invites = teamData?.invites || [];

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) {
      toast.error('Email address is required');
      return;
    }
    try {
      await inviteMember({
        email: inviteEmail,
        role: inviteRole,
        permissions: invitePermissions,
      });
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (err: any) {
      // toast is shown in query hook
    }
  };

  const handleEditMemberClick = (member: TeamMember) => {
    setEditingMember(member);
    setEditRole(member.role);
    setEditStatus(member.status);
    setEditPermissions({ ...member.permissions });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      await updateMember({
        memberId: editingMember.id,
        role: editRole,
        status: editStatus,
        permissions: editPermissions,
      });
      setEditingMember(null);
    } catch (err: any) {
      // handled by hooks
    }
  };

  const handleRemoveMemberClick = async (memberId: string) => {
    if (confirm('Are you sure you want to remove this member from the team?')) {
      try {
        await removeMember(memberId);
        if (editingMember?.id === memberId) {
          setEditingMember(null);
        }
      } catch (err) {
        // handled
      }
    }
  };

  const handleRevokeInviteClick = async (inviteId: string) => {
    if (confirm('Are you sure you want to revoke this invitation?')) {
      try {
        await revokeInvite(inviteId);
      } catch (err) {
        // handled
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 dark:border-gray-800 gap-4">
        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/dashboard/settings')}
            className="rounded-full hover:bg-orange-50 text-[#ff6900]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Team & Permissions</h1>
            <p className="text-xs text-gray-500">Add managers, modify operations permissions, and track active staff seats.</p>
          </div>
        </div>
        <Button
          onClick={() => setShowInviteModal(true)}
          className="bg-[#ff6900] hover:bg-[#a14000] text-white font-semibold flex items-center justify-center gap-2 rounded-xl"
        >
          <UserPlus size={16} />
          Invite Staff
        </Button>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-[#ff6900] text-[#ff6900]'
              : 'border-transparent text-gray-500 hover:text-orange-400'
          }`}
        >
          Team Access Overview
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'members'
              ? 'border-[#ff6900] text-[#ff6900]'
              : 'border-transparent text-gray-500 hover:text-orange-400'
          }`}
        >
          Active Members ({members.length})
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Members</span>
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1 block">
                {members.length}
              </span>
            </Card>
            <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Managers</span>
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1 block">
                {members.filter(m => m.role === 'manager').length}
              </span>
            </Card>
            <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pending Invites</span>
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1 block">
                {invites.length}
              </span>
            </Card>
            <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl p-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Suspended</span>
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1 block text-red-500">
                {members.filter(m => m.status === 'suspended').length}
              </span>
            </Card>
          </div>

          {/* Pending Invites Section */}
          <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Pending Invitations</CardTitle>
              <CardDescription>Members who haven't accepted their emails yet.</CardDescription>
            </CardHeader>
            <CardContent>
              {invites.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  <Mail className="h-8 w-8 mx-auto text-gray-300 mb-2" />
                  No pending invitations.
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {invites.map((invite) => (
                    <div key={invite.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 first:pt-0 last:pb-0 gap-3">
                      <div>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 block">
                          {invite.email}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] bg-orange-50 dark:bg-orange-950/20 text-[#ff6900] px-2 py-0.5 rounded-full font-bold uppercase">
                            {invite.role}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeInviteClick(invite.id)}
                        className="text-red-500 hover:bg-red-50 h-8 self-end sm:self-center"
                      >
                        Revoke Invite
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ACTIVE MEMBERS LIST TAB */}
      {activeTab === 'members' && (
        <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Operational Staff</CardTitle>
            <CardDescription>Click on any member card to configure custom permissions or toggle account states.</CardDescription>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">No active team members.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => handleEditMemberClick(member)}
                    className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-orange-500/20 transition-all cursor-pointer bg-white dark:bg-gray-950 flex items-start gap-3 shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-950/20 text-[#ff6900] flex items-center justify-center font-bold text-sm shrink-0 uppercase">
                      {member.name?.[0] || member.email?.[0] || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {member.name || 'Invited User'}
                        </h4>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                          member.role === 'manager'
                            ? 'bg-blue-50 text-blue-600'
                            : member.role === 'agent'
                            ? 'bg-purple-50 text-purple-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {member.email}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          member.status === 'active'
                            ? 'bg-green-50 text-[#22C55E]'
                            : 'bg-red-50 text-red-500'
                        }`}>
                          {member.status === 'active' ? 'Active' : 'Suspended'}
                        </span>
                        
                        <span className="text-[10px] text-gray-400 font-medium">
                          {Object.values(member.permissions || {}).filter(Boolean).length} / 6 Permissions
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* INVITE DIALOG MODAL */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-lg bg-white dark:bg-gray-900 border-none shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Invite Team Member</CardTitle>
                <CardDescription>Send email invitation to access checkout portals.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowInviteModal(false)} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <form onSubmit={handleInviteSubmit}>
              <CardContent className="pt-4 space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="inviteEmail">Email Address</Label>
                  <Input
                    id="inviteEmail"
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="staff@example.com"
                    className="rounded-xl border-gray-200/80 focus-visible:ring-[#ff6900]"
                  />
                </div>

                {/* Role selection */}
                <div className="space-y-2">
                  <Label>Organizational Role</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['manager', 'staff', 'agent'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setInviteRole(r)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                          inviteRole === r
                            ? 'border-[#ff6900] bg-orange-50/50 text-[#ff6900]'
                            : 'border-gray-200/85 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Permissions */}
                <div className="space-y-3 pt-2">
                  <Label className="block">Operations Permissions</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PERMISSION_KEYS.map(({ key, label }) => (
                      <label 
                        key={key} 
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50/50 cursor-pointer text-xs font-medium"
                      >
                        <input
                          type="checkbox"
                          checked={invitePermissions[key]}
                          onChange={(e) => setInvitePermissions({
                            ...invitePermissions,
                            [key]: e.target.checked
                          })}
                          className="rounded border-gray-300 text-[#ff6900] focus:ring-[#ff6900]"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowInviteModal(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isInviting}
                  className="bg-[#ff6900] hover:bg-[#a14000] text-white font-semibold rounded-xl"
                >
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* EDIT / CONFIGURE MEMBER MODAL */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-lg bg-white dark:bg-gray-900 border-none shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div>
                <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Configure Member Details</CardTitle>
                <CardDescription>Configure roles, active states, and custom checkout scope.</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditingMember(null)} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSaveEdit}>
              <CardContent className="pt-4 space-y-4">
                {/* Details snapshot */}
                <div className="bg-gray-50 dark:bg-gray-950 p-3 rounded-xl">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 block">{editingMember.name || 'Invited User'}</span>
                  <span className="text-[11px] text-gray-400 block mt-0.5">{editingMember.email}</span>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <div className="space-y-0.5">
                    <Label className="block">Active Status</Label>
                    <span className="text-[10px] text-gray-400">Suspended members cannot log in or check storefront logs.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditStatus(editStatus === 'active' ? 'suspended' : 'active')}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      editStatus === 'active' ? 'bg-[#ff6900]' : 'bg-red-500'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        editStatus === 'active' ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Role selection */}
                <div className="space-y-2">
                  <Label>Organizational Role</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['manager', 'staff', 'agent'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setEditRole(r)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all ${
                          editRole === r
                            ? 'border-[#ff6900] bg-orange-50/50 text-[#ff6900]'
                            : 'border-gray-200/85 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Permissions */}
                <div className="space-y-3 pt-2">
                  <Label className="block">Operations Permissions</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PERMISSION_KEYS.map(({ key, label }) => (
                      <label 
                        key={key} 
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50/50 cursor-pointer text-xs font-medium"
                      >
                        <input
                          type="checkbox"
                          checked={!!editPermissions[key]}
                          onChange={(e) => setEditPermissions({
                            ...editPermissions,
                            [key]: e.target.checked
                          })}
                          className="rounded border-gray-300 text-[#ff6900] focus:ring-[#ff6900]"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between gap-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => handleRemoveMemberClick(editingMember.id)}
                  className="text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Remove Staff
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditingMember(null)} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[#ff6900] hover:bg-[#a14000] text-white font-semibold rounded-xl"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
