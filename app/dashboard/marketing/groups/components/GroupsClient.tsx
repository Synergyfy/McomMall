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
import { toast } from 'sonner';
import { Group } from '@/service/grouping/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Wallet, AlertTriangle } from 'lucide-react';
import { useGetMyMembership } from '@/service/membership/hooks';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const GroupCard = ({ group }: { group: Group }) => {
  const memberCount = group.members?.length ?? 0;
  const fundingProgress = (memberCount / group.size) * 100;

  return (
    <Link href={`/dashboard/marketing/groups/${group.id}`} className="block">
      <Card className="h-full hover:shadow-lg transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="flex justify-between items-start">
            {group.name}
            <Badge variant={group.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {group.status}
            </Badge>
          </CardTitle>
          <CardDescription>{group.localArea}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-muted-foreground">
                Members
              </span>
              <span className="text-sm font-semibold">
                {memberCount} / {group.size}
              </span>
            </div>
            <Progress value={fundingProgress} className="w-full" />
          </div>
          {group.wallet && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Wallet className="mr-2 h-4 w-4" />
              Group Wallet Balance:{' '}
              <span className="font-semibold text-primary ml-1">
                £{Number(group.wallet.balance).toFixed(2)}
              </span>
            </div>
          )}
          <p className="text-xs text-muted-foreground pt-4">
            Recruitment deadline:{' '}
            {new Date(group.recruitmentDeadline).toLocaleDateString()}
          </p>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Groups</h1>
          <p className="text-muted-foreground">
            View your group memberships and manage your collaborations.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/marketing/groups/new">Create New Group</Link>
        </Button>
      </div>

      {!canAccessGroups ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Upgrade Required</AlertTitle>
          <AlertDescription>
            You need an EXTENDED or PROFESSIONAL membership to access groups.
            Please{' '}
            <Link href="/dashboard/marketing/membership" className="underline">
              upgrade your plan
            </Link>
            .
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {groups && groups.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {groups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">
                You are not a member of any groups yet.
              </p>
              <Button variant="link" asChild className="mt-2">
                <Link href="/dashboard/marketing/groups/new">
                  Why not create one?
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