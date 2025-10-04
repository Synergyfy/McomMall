'use client';

import React from 'react';
import { useGetReceivedPartnershipRequests, useRespondToPartnershipRequest } from '@/service/partnerships/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { PartnershipRequest, PartnershipRequestStatus } from '@/service/partnerships/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, X, Info } from 'lucide-react';

const getStatusBadgeVariant = (status: PartnershipRequestStatus) => {
  switch (status) {
    case 'accepted':
      return 'default';
    case 'declined':
      return 'destructive';
    case 'pending':
    default:
      return 'secondary';
  }
};

const PartnershipRequestCard = ({ request }: { request: PartnershipRequest }) => {
  const { mutate: respond, isPending } = useRespondToPartnershipRequest();

  const handleResponse = (status: 'accepted' | 'declined') => {
    respond(
      { id: request.id, dto: { status } },
      {
        onSuccess: () => {
          toast.success(`Partnership request has been ${status}.`);
        },
        onError: (error) => {
          toast.error(`Failed to respond to request: ${error.message}`);
        },
      }
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
            <div>
                <CardTitle className="text-xl">Partnership Request</CardTitle>
                <CardDescription>From: {request.requestingUser.name}</CardDescription>
            </div>
            <Badge variant={getStatusBadgeVariant(request.status)} className="capitalize">{request.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border">
                <AvatarImage src={request.product.imageUrl || ''} alt={request.product.title} />
                <AvatarFallback>{request.product.title.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="text-sm text-gray-500">For Your Service:</p>
                <p className="font-semibold text-gray-800">{request.service.name}</p>
            </div>
        </div>
        <div>
            <p className="text-sm text-gray-500">To be featured with their product:</p>
            <p className="font-semibold text-gray-800">{request.product.title}</p>
        </div>
      </CardContent>
      {request.status === 'pending' && (
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => handleResponse('declined')} disabled={isPending}>
            <X className="mr-2 h-4 w-4"/> Decline
          </Button>
          <Button size="sm" onClick={() => handleResponse('accepted')} disabled={isPending}>
            <Check className="mr-2 h-4 w-4"/> Accept
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default function PartnershipRequestsPage() {
  const { data: requests, isLoading, isError, error } = useGetReceivedPartnershipRequests();

  if (isLoading) {
    return <div className="p-8"><p>Loading partnership requests...</p></div>;
  }

  if (isError) {
    return <div className="p-8 text-red-500"><p>Error loading requests: {error.message}</p></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Received Partnership Requests</h1>
        <p className="text-gray-500">Manage incoming partnership requests for your services.</p>
      </div>

      {requests && requests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <PartnershipRequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Pending Requests</AlertTitle>
            <AlertDescription>
                You have no new partnership requests at the moment.
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}