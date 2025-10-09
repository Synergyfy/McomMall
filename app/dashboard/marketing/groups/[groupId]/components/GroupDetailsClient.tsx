"use client";

"use client";

import { useGetGroupById, useJoinGroup } from '@/service/grouping/hooks';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Users,
  Wallet,
  CheckCircle,
  AlertTriangle,
  MapPin,
  CalendarDays,
  ArrowLeft,
  Crown,
  UserPlus,
  HelpCircle,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { GroupMember, GroupMemberStatus } from '@/service/grouping/types';
import { RootState } from '@/service/store/store';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { ContributionPaymentDialog } from '@/components/ContributionPaymentDialog';
import { useQueryClient } from '@tanstack/react-query';

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const getStatusBadge = (status: GroupMemberStatus) => {
  const formattedStatus =
    status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');

  switch (status) {
    case 'active':
      return {
        variant: 'default' as const,
        icon: <CheckCircle className="h-4 w-4 mr-1.5" />,
        text: 'Active',
      };
    case 'pending_payment':
      return {
        variant: 'destructive' as const,
        icon: <AlertTriangle className="h-4 w-4 mr-1.5" />,
        text: 'Pending Payment',
      };
    default:
      return {
        variant: 'secondary' as const,
        icon: <HelpCircle className="h-4 w-4 mr-1.5" />,
        text: formattedStatus,
      };
  }
};

const MemberCard = ({
  member,
  isFounder,
}: {
  member: GroupMember;
  isFounder: boolean;
}) => {
  const statusInfo = getStatusBadge(member.status);
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-gray-800/50">
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-4">
          <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </div>
        <div>
          <span className="font-semibold text-gray-800 dark:text-gray-100">
            {member.user.name}
          </span>
          {isFounder && (
            <Badge
              variant="secondary"
              className="ml-2 border-amber-500/50 bg-amber-50 text-amber-700"
            >
              <Crown className="h-3 w-3 mr-1" />
              Founder
            </Badge>
          )}
        </div>
      </div>
      <Badge variant={statusInfo.variant}>
        {statusInfo.icon}
        {statusInfo.text}
      </Badge>
    </div>
  );
};

const GroupDetailsSkeleton = () => (
  <div className="space-y-8">
    <Skeleton className="h-10 w-1/3" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Skeleton className="h-40 rounded-lg" />
      <Skeleton className="h-40 rounded-lg" />
      <Skeleton className="h-40 rounded-lg" />
    </div>
    <Skeleton className="h-64 w-full rounded-lg" />
  </div>
);

const GroupDetailsClient = ({ groupId }: { groupId: string }) => {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const { data: group, isLoading, error } = useGetGroupById(groupId);
  const joinGroup = useJoinGroup();
  const queryClient = useQueryClient();

  const handleJoinGroup = () => {
    joinGroup.mutate(
      { groupId },
      {
        onSuccess: () => {
          toast.success(
            'Successfully joined the group! Please complete your contribution to activate your membership.',
          );
        },
        onError: (error: ApiError) => {
          const errorMessage =
            error.response?.data?.message ||
            error.message ||
            'An unexpected error occurred.';
          toast.error(`Failed to join group: ${errorMessage}`);
        },
      },
    );
  };

  if (isLoading)
    return (
      <div className="container mx-auto p-4 md:p-8">
        <GroupDetailsSkeleton />
      </div>
    );
  if (error)
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <Card className="max-w-md mx-auto bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertTriangle className="h-6 w-6 mr-2" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-800 dark:text-red-200">
              Could not load group details: {error.message}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  if (!group || !group.members || !group.wallet || !group.founderId)
    return <div>Group data is incomplete or not found.</div>;

  const currentUserMember = group.members.find((m) => m.user.id === userId);
  const isUserMember = !!currentUserMember;
  const fundingProgress = (group.members.length / group.size) * 100;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <Link
          href="/dashboard/marketing/groups"
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Groups
        </Link>

        <header className="mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50">
            {group.name}
          </h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            {group.localArea}
          </p>
          {group.pitchUrl && (
            <a
              href={group.pitchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline mt-2 inline-block"
            >
              View Pitch Document
            </a>
          )}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Wallet Balance
              </CardTitle>
              <Wallet className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 dark:text-gray-50">
                £{Number(group.wallet.balance).toFixed(2)}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                From all active members
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Members
              </CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-gray-900 dark:text-gray-50">
                {group.members.length} / {group.size}
              </div>
              <Progress value={fundingProgress} className="mt-2 h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Recruitment
              </CardTitle>
              <CalendarDays className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                {new Date(group.recruitmentDeadline).toLocaleDateString(
                  'en-US',
                  { month: 'long', day: 'numeric', year: 'numeric' },
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Recruitment Deadline
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Group Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.members.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    isFounder={member.user.id === group.founderId}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
          <div>
            {!isUserMember && (
              <Card className="bg-gradient-to-br from-green-500 to-teal-600 text-white shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">
                    Join this Group
                  </CardTitle>
                  <CardDescription className="text-green-100 mt-2">
                    Become a member and contribute to the group&apos;s success.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <Button
                    onClick={handleJoinGroup}
                    disabled={joinGroup.isPending}
                    size="lg"
                    className="w-full bg-white text-green-600 hover:bg-gray-100"
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    {joinGroup.isPending
                      ? 'Processing...'
                      : 'Join and Contribute £250'}
                  </Button>
                </CardContent>
              </Card>
            )}
            {currentUserMember?.status === 'pending_payment' && (
              <Card className="bg-gradient-to-br from-orange-500 to-yellow-600 text-white shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">
                    Action Required
                  </CardTitle>
                  <CardDescription className="text-orange-100 mt-2">
                    Your contribution is pending. Please complete the payment to
                    activate your membership.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <ContributionPaymentDialog
                    groupId={groupId}
                    onPaymentSuccess={() => {
                      toast.success(
                        'Payment successful! Your membership is now active.',
                      );
                      queryClient.invalidateQueries({
                        queryKey: ['group', groupId],
                      });
                    }}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailsClient;