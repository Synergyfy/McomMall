'use client';

import React from 'react';
import {
  useGetSentPartnershipRequests,
  useGetReceivedPartnershipRequests,
  useGetAcceptedPartners,
  useRespondToPartnershipRequest,
} from '@/service/partnerships/hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PartnershipRequest, PartnershipRequestStatus } from '@/service/partnerships/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Handshake, Info, ArrowUpRight, ArrowDownRight, CheckCircle, XCircle } from 'lucide-react';
import { Product } from '@/service/listings/types';
import { IService } from '@/service/services/types';
import { User } from '@/service/user/types';

const getStatusUi = (status: PartnershipRequestStatus) => {
  switch (status) {
    case 'accepted':
      return { variant: 'default', icon: <CheckCircle className="h-4 w-4 mr-2" />, text: 'Accepted' };
    case 'declined':
      return { variant: 'destructive', icon: <XCircle className="h-4 w-4 mr-2" />, text: 'Declined' };
    case 'pending':
    default:
      return { variant: 'secondary', icon: <Info className="h-4 w-4 mr-2" />, text: 'Pending' };
  }
};

const PartnerInfo = ({ user, service, product }: { user: User, service?: IService, product?: Product }) => (
  <div className="flex items-center gap-4 py-4">
    <Avatar className="h-16 w-16 border">
      <AvatarImage src={user.profilePictureUrl || ''} alt={user.name} />
      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
    </Avatar>
    <div>
      <p className="font-semibold text-lg">{user.name}</p>
      {service && <p className="text-sm text-gray-500">{service.name}</p>}
      {product && <p className="text-sm text-gray-500">{product.title}</p>}
    </div>
  </div>
);

const SentRequestCard = ({ request }: { request: PartnershipRequest }) => {
  const statusUi = getStatusUi(request.status);
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden">
      <CardHeader className="bg-gray-50">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center"><ArrowUpRight className="mr-2 h-5 w-5 text-blue-500" />Request Sent</CardTitle>
            <CardDescription>To: {request.serviceOwner.name}</CardDescription>
          </div>
          <Badge variant={statusUi.variant} className="capitalize flex items-center">{statusUi.icon}{statusUi.text}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <p className="text-sm text-gray-600">You requested a partnership for their service <span className="font-semibold">{request.service.name}</span> with your product <span className="font-semibold">{request.product.title}</span>.</p>
      </CardContent>
    </Card>
  );
};

const ReceivedRequestCard = ({ request }: { request: PartnershipRequest }) => {
  const { mutate: respond, isPending } = useRespondToPartnershipRequest();
  const statusUi = getStatusUi(request.status);

  const handleRespond = (status: 'accepted' | 'declined') => {
    respond({ id: request.id, dto: { status } });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden">
      <CardHeader className="bg-gray-50">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center"><ArrowDownRight className="mr-2 h-5 w-5 text-green-500" />Request Received</CardTitle>
            <CardDescription>From: {request.requestingUser.name}</CardDescription>
          </div>
          <Badge variant={statusUi.variant} className="capitalize flex items-center">{statusUi.icon}{statusUi.text}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <p className="text-sm text-gray-600">They requested a partnership for your service <span className="font-semibold">{request.service.name}</span> with their product <span className="font-semibold">{request.product.title}</span>.</p>
      </CardContent>
      {request.status === 'pending' && (
        <CardFooter className="flex justify-end gap-2 bg-gray-50 py-3">
          <Button variant="outline" onClick={() => handleRespond('declined')} disabled={isPending}>Decline</Button>
          <Button onClick={() => handleRespond('accepted')} disabled={isPending}>Accept</Button>
        </CardFooter>
      )}
    </Card>
  );
};

const AcceptedPartnerCard = ({ partnership, currentUserId }: { partnership: PartnershipRequest, currentUserId: string | null }) => {
    const partner = partnership.requestingUser.id === currentUserId ? partnership.serviceOwner : partnership.requestingUser;
    const myAsset = partnership.requestingUser.id === currentUserId ? partnership.product : partnership.service;
    const partnerAsset = partnership.requestingUser.id === currentUserId ? partnership.service : partnership.product;


  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 rounded-xl overflow-hidden">
      <CardHeader className="bg-green-50">
        <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center"><Handshake className="mr-2 h-5 w-5 text-green-600" />Partnership</CardTitle>
            <Badge variant="default" className="capitalize flex items-center"><CheckCircle className="h-4 w-4 mr-2" />Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-md font-semibold text-gray-800">You are partnered with {partner.name}.</p>
        <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p>Your Asset: <span className="font-semibold">{'title' in myAsset ? myAsset.title : myAsset.name}</span></p>
            <p>Partner's Asset: <span className="font-semibold">{'title' in partnerAsset ? partnerAsset.title : partnerAsset.name}</span></p>
        </div>
      </CardContent>
    </Card>
  );
};

const PartnershipTabContent = ({ requests, isLoading, isError, error, CardComponent, noRequestsMessage, currentUserId }: any) => {
  if (isLoading) {
    return <div className="p-8 text-center"><p>Loading...</p></div>;
  }

  if (isError) {
    return <div className="p-8 text-red-500 text-center"><p>Error: {error.message}</p></div>;
  }

  return (
    <div className="p-4 sm:p-6">
      {requests && requests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request: PartnershipRequest) => (
            <CardComponent key={request.id} request={request} partnership={request} currentUserId={currentUserId} />
          ))}
        </div>
      ) : (
        <Alert className="max-w-md mx-auto">
            <Info className="h-4 w-4" />
            <AlertTitle>No Requests Found</AlertTitle>
            <AlertDescription>{noRequestsMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};


export default function MyPartnersPage() {
  const { data: sentRequests, isLoading: isLoadingSent, isError: isErrorSent, error: errorSent } = useGetSentPartnershipRequests();
  const { data: receivedRequests, isLoading: isLoadingReceived, isError: isErrorReceived, error: errorReceived } = useGetReceivedPartnershipRequests();
  const { data: acceptedPartners, isLoading: isLoadingAccepted, isError: isErrorAccepted, error: errorAccepted } = useGetAcceptedPartners();

  // A simple way to get the current user's ID, replace with your actual auth state
  const currentUserId = acceptedPartners?.[0]?.requestingUser.id;


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-800">My Partnerships</h1>
        <p className="text-lg text-gray-500 mt-2">Manage your partnership requests and collaborations.</p>
      </div>

      <Tabs defaultValue="sent" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-lg p-1">
          <TabsTrigger value="sent" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-md">Sent Requests</TabsTrigger>
          <TabsTrigger value="received" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-md">Received Requests</TabsTrigger>
          <TabsTrigger value="accepted" className="data-[state=active]:bg-white data-[state=active]:shadow-md rounded-md">Accepted Partners</TabsTrigger>
        </TabsList>
        <TabsContent value="sent">
          <PartnershipTabContent
            requests={sentRequests}
            isLoading={isLoadingSent}
            isError={isErrorSent}
            error={errorSent}
            CardComponent={SentRequestCard}
            noRequestsMessage="You haven't sent any partnership requests yet."
          />
        </TabsContent>
        <TabsContent value="received">
          <PartnershipTabContent
            requests={receivedRequests}
            isLoading={isLoadingReceived}
            isError={isErrorReceived}
            error={errorReceived}
            CardComponent={ReceivedRequestCard}
            noRequestsMessage="You haven't received any partnership requests yet."
          />
        </TabsContent>
        <TabsContent value="accepted">
          <PartnershipTabContent
            requests={acceptedPartners}
            isLoading={isLoadingAccepted}
            isError={isErrorAccepted}
            error={errorAccepted}
            CardComponent={AcceptedPartnerCard}
            noRequestsMessage="You don't have any accepted partners yet."
            currentUserId={currentUserId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}