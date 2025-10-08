"use client";

import { useGetGroupById, usePayContribution } from '@/service/grouping/hooks';
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
import { Users, Wallet, CheckCircle, Hourglass, AlertTriangle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { GroupMember } from '@/service/grouping/types';
import { RootState } from '@/service/store/store';

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const MemberCard = ({ member }: { member: GroupMember }) => (
  <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
    <div className="flex items-center">
      <Users className="h-5 w-5 mr-3 text-muted-foreground" />
      <span className="font-medium">{member.user.name}</span>
    </div>
    <Badge variant={member.status === 'ACTIVE' ? 'default' : 'outline'}>
      {member.status === 'ACTIVE' ? (
        <CheckCircle className="h-4 w-4 mr-1" />
      ) : (
        <Hourglass className="h-4 w-4 mr-1" />
      )}
      {member.status.replace('_', ' ')}
    </Badge>
  </div>
);

const GroupDetailsClient = ({ groupId }: { groupId: string }) => {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const { data: group, isLoading, error } = useGetGroupById(groupId);
  const payContribution = usePayContribution();

  const handlePayContribution = () => {
    payContribution.mutate(
      { groupId },
      {
        onSuccess: () => {
          toast.success('Contribution paid successfully! Your membership is now active.');
        },
        onError: (error: ApiError) => {
          const errorMessage =
            error.response?.data?.message || error.message || 'An unexpected error occurred.';
          toast.error(`Failed to pay contribution: ${errorMessage}`);
        },
      }
    );
  };

  if (isLoading) return <div>Loading group details...</div>;
  if (error) return (
    <div className="container mx-auto p-4 md:p-8 text-center">
        <Card className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center justify-center text-red-500">
                    <AlertTriangle className="h-6 w-6 mr-2" />
                    Error
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>Could not load group details: {error.message}</p>
            </CardContent>
        </Card>
    </div>
  );
  if (!group || !group.members || !group.wallet) return <div>Group data is incomplete or not found.</div>;

  const currentUserMemberInfo = group.members.find(
    (m) => m.user.id === userId
  );

  const canPay = currentUserMemberInfo?.status === 'PENDING_PAYMENT';
  const fundingProgress = (group.members.length / group.size) * 100;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-bold">{group.name}</CardTitle>
            <Badge variant={group.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {group.status}
            </Badge>
          </div>
          <CardDescription>{group.localArea}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Group Wallet</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="flex items-center justify-center text-4xl font-bold text-primary">
                  <Wallet className="h-10 w-10 mr-4" />
                  <span>£{group.wallet.balance.toFixed(2)}</span>
                </div>
                <p className="text-muted-foreground mt-2">
                  Total contributions from members.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recruitment Status</CardTitle>
                <CardDescription>
                  Deadline: {new Date(group.recruitmentDeadline).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Members</span>
                  <span className="text-sm font-semibold">
                    {group.members.length} / {group.size}
                  </span>
                </div>
                <Progress value={fundingProgress} />
              </CardContent>
            </Card>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Members</h2>
            <div className="space-y-3">
              {group.members.map((member) => (
                <MemberCard key={member.id} member={member} />
              ))}
            </div>
          </div>

          {canPay && (
            <div className="pt-6 border-t">
              <Card className="bg-amber-50 border-amber-200">
                <CardHeader className="text-center">
                  <CardTitle>Complete Your Contribution</CardTitle>
                  <CardDescription>
                    Pay your £250 contribution to become an active member of this group.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Button
                    onClick={handlePayContribution}
                    disabled={payContribution.isPending}
                    size="lg"
                  >
                    {payContribution.isPending
                      ? 'Processing...'
                      : 'Pay £250 Contribution'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GroupDetailsClient;