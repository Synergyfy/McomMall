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
import { Handshake, Info, ArrowUpRight, ArrowDownRight, CheckCircle, XCircle, Users, Send, GitPullRequestReceive } from 'lucide-react';
import { Product } from '@/service/listings/types';
import { IService } from '@/service/services/types';
import { User } from '@/service/user/types';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { useAppSelector } from '@/service/store/hooks';


const getStatusUi = (status: PartnershipRequestStatus) => {
  switch (status) {
    case 'accepted':
      return { variant: 'success', icon: <CheckCircle className="h-4 w-4" />, text: 'Accepted' };
    case 'declined':
      return { variant: 'destructive', icon: <XCircle className="h-4 w-4" />, text: 'Declined' };
    case 'pending':
    default:
      return { variant: 'secondary', icon: <Info className="h-4 w-4" />, text: 'Pending' };
  }
};

const EmptyState = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center p-12 border-2 border-dashed rounded-xl bg-gray-50"
    >
        <div className="mx-auto h-12 w-12 text-gray-400">{icon}</div>
        <h3 className="mt-4 text-lg font-semibold text-gray-800">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{description}</p>
    </motion.div>
);


const SentRequestCard = ({ request }: { request: PartnershipRequest }) => {
  const statusUi = getStatusUi(request.status);
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
        <Card className="rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50 p-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage src={request.serviceOwner.profilePictureUrl || ''} alt={request.serviceOwner.name} />
                        <AvatarFallback>{request.serviceOwner.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-base font-semibold">{request.serviceOwner.name}</CardTitle>
                        <CardDescription className="text-xs">Request Sent</CardDescription>
                    </div>
                </div>
                <Badge variant={statusUi.variant} className="capitalize flex items-center gap-1.5 text-xs py-1 px-2.5">
                    {statusUi.icon}{statusUi.text}
                </Badge>
            </CardHeader>
            <CardContent className="p-4 text-sm text-gray-600">
                <p>You requested a partnership for their service <span className="font-bold text-gray-800">{request.service.name}</span> with your product <span className="font-bold text-gray-800">{request.product.title}</span>.</p>
            </CardContent>
        </Card>
    </motion.div>
  );
};

const ReceivedRequestCard = ({ request }: { request: PartnershipRequest }) => {
  const { mutate: respond, isPending } = useRespondToPartnershipRequest();
  const statusUi = getStatusUi(request.status);

  const handleRespond = (status: 'accepted' | 'declined') => {
    respond({ id: request.id, dto: { status } }, {
        onSuccess: () => toast.success(`Request ${status}!`),
        onError: () => toast.error('Something went wrong.'),
    });
  };

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
        <Card className="rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50 p-4">
                <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage src={request.requestingUser.profilePictureUrl || ''} alt={request.requestingUser.name} />
                        <AvatarFallback>{request.requestingUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-base font-semibold">{request.requestingUser.name}</CardTitle>
                        <CardDescription className="text-xs">Request Received</CardDescription>
                    </div>
                </div>
                 <Badge variant={statusUi.variant} className="capitalize flex items-center gap-1.5 text-xs py-1 px-2.5">
                    {statusUi.icon}{statusUi.text}
                </Badge>
            </CardHeader>
            <CardContent className="p-4 text-sm text-gray-600">
                <p>They requested a partnership for your service <span className="font-bold text-gray-800">{request.service.name}</span> with their product <span className="font-bold text-gray-800">{request.product.title}</span>.</p>
            </CardContent>
            {request.status === 'pending' && (
                <CardFooter className="flex justify-end gap-2 bg-gray-50/50 p-3">
                    <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-100" onClick={() => handleRespond('declined')} disabled={isPending}>Decline</Button>
                    <Button size="sm" onClick={() => handleRespond('accepted')} disabled={isPending}>Accept</Button>
                </CardFooter>
            )}
        </Card>
    </motion.div>
  );
};

const AcceptedPartnerCard = ({ partnership, currentUserId }: { partnership: PartnershipRequest, currentUserId: string | null }) => {
    const partner = partnership.requestingUser.id === currentUserId ? partnership.serviceOwner : partnership.requestingUser;
    const myAsset = partnership.requestingUser.id === currentUserId ? partnership.product : partnership.service;
    const partnerAsset = partnership.requestingUser.id === currentUserId ? partnership.service : partnership.product;

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
        <Card className="rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between bg-green-50/50 p-4">
                 <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                        <AvatarImage src={partner.profilePictureUrl || ''} alt={partner.name} />
                        <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-base font-semibold">{partner.name}</CardTitle>
                        <CardDescription className="text-xs">Active Partner</CardDescription>
                    </div>
                </div>
                <Badge variant="success" className="capitalize flex items-center gap-1.5 text-xs py-1 px-2.5">
                    <Handshake className="h-4 w-4" />Partnership
                </Badge>
            </CardHeader>
            <CardContent className="p-4 text-sm text-gray-600 space-y-2">
                <div>
                    <p className="font-semibold text-gray-800">Your Asset:</p>
                    <p>{'title' in myAsset ? myAsset.title : myAsset.name}</p>
                </div>
                <div>
                    <p className="font-semibold text-gray-800">Partner's Asset:</p>
                    <p>{'title' in partnerAsset ? partnerAsset.title : partnerAsset.name}</p>
                </div>
            </CardContent>
        </Card>
    </motion.div>
  );
};

const PartnershipTabContent = ({ requests, isLoading, isError, error, CardComponent, emptyState, currentUserId }: any) => {
  if (isLoading) {
    return <div className="p-8 text-center"><p>Loading...</p></div>;
  }

  if (isError) {
    return <div className="p-8 text-red-500 text-center"><p>Error: {error.message}</p></div>;
  }

  return (
    <div className="p-1">
      {requests && requests.length > 0 ? (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
        >
          {requests.map((request: PartnershipRequest) => (
            <motion.div key={request.id} variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}>
                <CardComponent request={request} partnership={request} currentUserId={currentUserId} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        emptyState
      )}
    </div>
  );
};


export default function MyPartnersPage() {
  const { data: sentRequests, isLoading: isLoadingSent, isError: isErrorSent, error: errorSent } = useGetSentPartnershipRequests();
  const { data: receivedRequests, isLoading: isLoadingReceived, isError: isErrorReceived, error: errorReceived } = useGetReceivedPartnershipRequests();
  const { data: acceptedPartners, isLoading: isLoadingAccepted, isError: isErrorAccepted, error: errorAccepted } = useGetAcceptedPartners();
  const { userId: currentUserId } = useAppSelector((state) => state.auth);


  return (
    <>
    <Toaster richColors position="top-right" />
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Partnerships</h1>
        <p className="text-md text-gray-600 mt-1">Manage your partnership requests and collaborations.</p>
      </div>

      <Tabs defaultValue="sent" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-xl p-1 h-12">
          <TabsTrigger value="sent" className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg">Sent</TabsTrigger>
          <TabsTrigger value="received" className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg">Received</TabsTrigger>
          <TabsTrigger value="accepted" className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg">Partners</TabsTrigger>
        </TabsList>

        <div className="mt-6">
            <TabsContent value="sent">
            <PartnershipTabContent
                requests={sentRequests}
                isLoading={isLoadingSent}
                isError={isErrorSent}
                error={errorSent}
                CardComponent={SentRequestCard}
                emptyState={<EmptyState icon={<Send size={48} />} title="No Sent Requests" description="You haven't sent any partnership requests yet." />}
            />
            </TabsContent>
            <TabsContent value="received">
            <PartnershipTabContent
                requests={receivedRequests}
                isLoading={isLoadingReceived}
                isError={isErrorReceived}
                error={errorReceived}
                CardComponent={ReceivedRequestCard}
                emptyState={<EmptyState icon={<GitPullRequestReceive size={48} />} title="No Received Requests" description="You haven't received any partnership requests yet." />}
            />
            </TabsContent>
            <TabsContent value="accepted">
            <PartnershipTabContent
                requests={acceptedPartners}
                isLoading={isLoadingAccepted}
                isError={isErrorAccepted}
                error={errorAccepted}
                CardComponent={AcceptedPartnerCard}
                emptyState={<EmptyState icon={<Users size={48} />} title="No Accepted Partners" description="You don't have any accepted partners yet." />}
                currentUserId={currentUserId}
            />
            </TabsContent>
        </div>
      </Tabs>
    </div>
    </>
  );
}