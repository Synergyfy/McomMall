"use client";

import { useGetMyGroups, useJoinGroup } from '@/service/grouping/hooks';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Group } from '@/service/grouping/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Wallet, AlertTriangle } from 'lucide-react';
import { useGetMyMembership } from '@/service/membership/hooks';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const joinGroupSchema = z.object({
  groupId: z.string().min(1, 'Group ID is required.'),
});

const GroupCard = ({ group }: { group: Group }) => {
  const fundingProgress = (group.members.length / group.size) * 100;

  return (
    <Card>
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
              {group.members.length} / {group.size}
            </span>
          </div>
          <Progress value={fundingProgress} className="w-full" />
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Wallet className="mr-2 h-4 w-4" />
          Group Wallet Balance:{' '}
          <span className="font-semibold text-primary ml-1">
            £{group.wallet.balance.toFixed(2)}
          </span>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Members</h4>
          <div className="flex flex-wrap gap-2">
            {group.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center space-x-2 bg-secondary p-2 rounded-md"
              >
                <Users className="h-4 w-4" />
                <span className="text-sm">{member.user.name}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground pt-4">
          Recruitment deadline:{' '}
          {new Date(group.recruitmentDeadline).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
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
  const joinGroup = useJoinGroup();

  const form = useForm<z.infer<typeof joinGroupSchema>>({
    resolver: zodResolver(joinGroupSchema),
    defaultValues: {
      groupId: '',
    },
  });

  const onJoinSubmit = (values: z.infer<typeof joinGroupSchema>) => {
    joinGroup.mutate(
      { groupId: values.groupId },
      {
        onSuccess: () => {
          toast.success('Successfully joined the group!');
          form.reset();
        },
        onError: (error) => {
          toast.error(`Failed to join group: ${error.message}`);
        },
      }
    );
  };

  if (isMembershipLoading || areGroupsLoading)
    return <div>Loading groups...</div>;
  if (membershipError)
    return <div>Error loading membership: {membershipError.message}</div>;
  if (groupsError)
    return <div>Error loading groups: {groupsError.message}</div>;

  const canAccessGroups =
    membership &&
    membership.isActive &&
    (membership.tier === 'EXTENDED' || membership.tier === 'PROFESSIONAL');

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Groups</h1>
        <p className="text-muted-foreground">
          View your group memberships and manage your collaborations.
        </p>
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
          <Card>
            <CardHeader>
              <CardTitle>Join a Group</CardTitle>
              <CardDescription>
                Enter the ID of a group to join it.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onJoinSubmit)}
                  className="flex items-start gap-4"
                >
                  <FormField
                    control={form.control}
                    name="groupId"
                    render={({ field }) => (
                      <FormItem className="flex-grow">
                        <FormLabel>Group ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter group ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={joinGroup.isPending}
                    className="mt-auto"
                  >
                    {joinGroup.isPending ? 'Joining...' : 'Join Group'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

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
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GroupsClient;