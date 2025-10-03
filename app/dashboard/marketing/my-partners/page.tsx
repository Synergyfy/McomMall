'use client';

import React from 'react';
import { useGetSentPartnershipRequests } from '@/service/partnerships/hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PartnershipRequest, PartnershipRequestStatus } from '@/service/partnerships/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info } from 'lucide-react';

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

const SentRequestCard = ({ request }: { request: PartnershipRequest }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">Request Sent</CardTitle>
            <CardDescription>To: {request.serviceOwner.name}</CardDescription>
          </div>
          <Badge variant={getStatusBadgeVariant(request.status)} className="capitalize">{request.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border">
                <AvatarImage src={request.service.business.logoUrl || ''} alt={request.service.name} />
                <AvatarFallback>{request.service.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <p className="text-sm text-gray-500">For their service:</p>
                <p className="font-semibold text-gray-800">{request.service.name}</p>
            </div>
        </div>
        <div>
            <p className="text-sm text-gray-500">From your product:</p>
            <p className="font-semibold text-gray-800">{request.product.title}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default function SentPartnershipRequestsPage() {
  const { data: requests, isLoading, isError, error } = useGetSentPartnershipRequests();

  if (isLoading) {
    return <div className="p-8"><p>Loading sent requests...</p></div>;
  }

  if (isError) {
    return <div className="p-8 text-red-500"><p>Error loading requests: {error.message}</p></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Sent Partnership Requests</h1>
        <p className="text-gray-500">Track the status of partnership requests you have sent.</p>
      </div>

      {requests && requests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <SentRequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>No Sent Requests</AlertTitle>
            <AlertDescription>
                You have not sent any partnership requests yet.
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}