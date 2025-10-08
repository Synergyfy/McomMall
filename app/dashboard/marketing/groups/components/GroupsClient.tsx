"use client";

import { useGetMyGroups } from '@/service/grouping/hooks';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Group } from '@/service/grouping/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Wallet, AlertTriangle, MapPin, CalendarDays, PlusCircle } from 'lucide-react';
import { useGetMyMembership } from '@/service/membership/hooks';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const GroupCard = ({ group }: { group: Group }) => {
  const memberCount = group.members?.length ?? 0;
  const fundingProgress = (memberCount / group.size) * 100;

  const statusColors = {
    RECRUITING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    EXPIRED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <Link href={`/dashboard/marketing/groups/${group.id}`} className="block group">
      <Card className="h-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
        <CardHeader className="p-0">
          <div className="p-6 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/70 dark:to-gray-800/70">
            <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
                {group.name}
                </CardTitle>
                <Badge className={`${statusColors[group.status] || 'bg-gray-100'} px-2 py-1 text-xs font-semibold`}>
                    {group.status}
                </Badge>
            </div>
            <CardDescription className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="mr-2 h-4 w-4" />
              {group.localArea}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-medium text-gray-500 dark:text-gray-400">MEMBERS</span>
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {memberCount} / {group.size}
              </span>
            </div>
            <Progress value={fundingProgress} className="w-full h-2" />
          </div>
          {group.wallet && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Wallet className="mr-2 h-4 w-4 text-green-500" />
              <span className="font-medium">Wallet Balance:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-100 ml-1">
                £{Number(group.wallet.balance).toFixed(2)}
              </span>
            </div>
          )}
           <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
            <CalendarDays className="mr-2 h-4 w-4" />
            <span>
              Recruitment ends on {new Date(group.recruitmentDeadline).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

const GroupsClient = () => {
  const {
    data: membership,
    isLoading: isMembershipLoading,
    error: membershipError,
  } = useGetMyMembership();
  const {
    data: groups,
    isLoading: areGroupsLoading,
    error: groupsError,
  } = useGetMyGroups();

  if (isMembershipLoading || areGroupsLoading)
    return <div>Loading groups...</div>;
  if (membershipError)
    return <div>Error loading membership: {membershipError.message}</div>;
  if (groupsError)
    return <div>Error loading groups: {groupsError.message}</div>;

  const canAccessGroups =
    membership &&
    membership.isActive &&
    (membership.tier.toUpperCase() === 'EXTENDED' ||
      membership.tier.toUpperCase() === 'PROFESSIONAL');

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">My Groups</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            View your group memberships and manage your collaborations.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/marketing/groups/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Group
          </Link>
        </Button>
      </div>

      {!canAccessGroups ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Upgrade Required</AlertTitle>
          <AlertDescription>
            You need an EXTENDED or PROFESSIONAL membership to access groups.
            Please{' '}
            <Link href="/dashboard/marketing/membership" className="underline font-semibold">
              upgrade your plan
            </Link>
            .
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {groups && groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-6 border-2 border-dashed rounded-lg bg-gray-50 dark:bg-gray-800/20">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">No Groups Joined Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2 mb-4">
                    It looks like you haven&apos;t joined or created any groups.
                </p>
                <Button asChild>
                    <Link href="/dashboard/marketing/groups/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Your First Group
                    </Link>
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GroupsClient;