'use client';

import React from 'react';
import { useGetMyPartnerships, useAcceptPartnership, useRejectPartnership } from '@/service/partnerships/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { toast } from 'sonner';

export default function PartnershipRequestsPage() {
  const { data: partnerships, isLoading, isError, refetch } = useGetMyPartnerships();
  const { mutate: acceptPartnership, isPending: isAccepting } = useAcceptPartnership();
  const { mutate: rejectPartnership, isPending: isRejecting } = useRejectPartnership();
  const { userId } = useSelector((state: RootState) => state.auth);

  const handleAccept = async (id: string) => {
    acceptPartnership(id, {
      onSuccess: () => {
        toast.success('Partnership accepted!');
        refetch();
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to accept partnership.');
      }
    });
  };

  const handleReject = async (id: string) => {
    rejectPartnership(id, {
        onSuccess: () => {
            toast.success('Partnership rejected!');
            refetch();
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to reject partnership.');
        }
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading partnership requests.</div>;
  }

  const incomingRequests = partnerships?.filter(p => p.provider.id === userId && p.status === 'pending');
  const outgoingRequests = partnerships?.filter(p => p.requester.id === userId && p.status === 'pending');

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Partnership Requests</h1>
      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Incoming Requests</CardTitle>
            <CardDescription>Respond to partnership requests from other businesses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {incomingRequests?.length ? incomingRequests.map(request => (
              <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={request.requester.profilePictureUrl} />
                    <AvatarFallback>{request.requester.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{request.requester.name}</p>
                    <p className="text-sm text-muted-foreground">{request.requester.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => handleAccept(request.id)} disabled={isAccepting}>Accept</Button>
                    <Button variant="destructive" onClick={() => handleReject(request.id)} disabled={isRejecting}>Decline</Button>
                </div>
              </div>
            )) : <p>No incoming requests.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outgoing Requests</CardTitle>
             <CardDescription>Partnership requests you have sent to other businesses.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {outgoingRequests?.length ? outgoingRequests.map(request => (
              <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={request.provider.profilePictureUrl} />
                    <AvatarFallback>{request.provider.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{request.provider.name}</p>
                    <p className="text-sm text-muted-foreground">{request.provider.email}</p>
                  </div>
                </div>
                <Badge>Pending</Badge>
              </div>
            )) : <p>No outgoing requests.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}