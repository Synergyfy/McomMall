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
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Handshake, Info, CheckCircle, XCircle, Users, Send, GitPullRequest, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { cn } from '@/lib/utils';

const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

type StatusUI = {
  text: string;
  icon: React.ReactNode;
  textColor: string;
  bgColor: string;
  borderColor: string;
};

const getStatusUi = (status: PartnershipRequestStatus): StatusUI => {
  switch (status) {
    case 'accepted':
      return {
        text: 'Accepted',
        icon: <CheckCircle className="h-4 w-4" />,
        textColor: 'text-emerald-800',
        bgColor: 'bg-emerald-100',
        borderColor: 'border-emerald-200',
      };
    case 'declined':
      return {
        text: 'Declined',
        icon: <XCircle className="h-4 w-4" />,
        textColor: 'text-rose-800',
        bgColor: 'bg-rose-100',
        borderColor: 'border-rose-200',
      };
    case 'pending':
    default:
      return {
        text: 'Pending',
        icon: <Info className="h-4 w-4" />,
        textColor: 'text-amber-800',
        bgColor: 'bg-amber-100',
        borderColor: 'border-amber-200',
      };
  }
};

const EmptyState = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center p-12 border-2 border-dashed rounded-2xl bg-slate-50/70 col-span-1 md:col-span-2 lg:col-span-3"
    >
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 mb-5">{icon}</div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        <p className="mt-2 text-base text-slate-500 max-w-md mx-auto">{description}</p>
    </motion.div>
);

const RequestAsset = ({ label, name }: { label: string, name: string }) => (
    <div className="p-3 bg-slate-100 rounded-lg flex-1">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <p className="text-base font-bold text-slate-800">{name}</p>
    </div>
);

const SentRequestCard = ({ request }: { request: PartnershipRequest }) => {
  const statusUi = getStatusUi(request.status);
  return (
    <motion.div
        whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="h-full"
    >
        <Card className="rounded-2xl overflow-hidden shadow-md border border-slate-200/80 h-full flex flex-col bg-white">
            <CardHeader className="flex flex-row items-start justify-between bg-slate-50/90 p-4 border-b">
                <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-4 border-white shadow-md">
                        <AvatarImage src={request.serviceOwner.profilePictureUrl || ''} alt={request.serviceOwner.name} />
                        <AvatarFallback className="font-bold">{request.serviceOwner.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-base font-bold text-slate-800">{request.serviceOwner.name}</CardTitle>
                        <CardDescription className="text-xs font-medium text-slate-500">Request Sent</CardDescription>
                    </div>
                </div>
                <Badge className={cn('capitalize flex items-center gap-1.5 text-xs py-1 px-3 rounded-full font-semibold border', statusUi.textColor, statusUi.bgColor, statusUi.borderColor)}>
                    {statusUi.icon}{statusUi.text}
                </Badge>
            </CardHeader>
            <CardContent className="p-4 text-sm text-slate-700 space-y-3 flex-grow">
                <p className="font-medium">You requested a partnership for their service with your product.</p>
                <div className="flex items-center justify-center gap-2">
                    <RequestAsset label="Your Product" name={request.product.title} />
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                    <RequestAsset label="Their Service" name={request.service.name} />
                </div>
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
    <motion.div
        whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="h-full"
    >
        <Card className="rounded-2xl overflow-hidden shadow-md border border-slate-200/80 h-full flex flex-col bg-white">
            <CardHeader className="flex flex-row items-start justify-between bg-slate-50/90 p-4 border-b">
                <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-4 border-white shadow-md">
                        <AvatarImage src={request.requestingUser.profilePictureUrl || ''} alt={request.requestingUser.name} />
                        <AvatarFallback className="font-bold">{request.requestingUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-base font-bold text-slate-800">{request.requestingUser.name}</CardTitle>
                        <CardDescription className="text-xs font-medium text-slate-500">Request Received</CardDescription>
                    </div>
                </div>
                 <Badge className={cn('capitalize flex items-center gap-1.5 text-xs py-1 px-3 rounded-full font-semibold border', statusUi.textColor, statusUi.bgColor, statusUi.borderColor)}>
                    {statusUi.icon}{statusUi.text}
                </Badge>
            </CardHeader>
            <CardContent className="p-4 text-sm text-slate-700 space-y-3 flex-grow">
                <p className="font-medium">They requested a partnership for your service with their product.</p>
                 <div className="flex items-center justify-center gap-2">
                    <RequestAsset label="Their Product" name={request.product.title} />
                    <ArrowRight className="h-5 w-5 text-slate-400" />
                    <RequestAsset label="Your Service" name={request.service.name} />
                </div>
            </CardContent>
            {request.status === 'pending' && (
                <CardFooter className="flex justify-end gap-3 bg-slate-50/90 p-3 border-t">
                    <Button size="sm" variant="destructive" className="bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-semibold shadow-sm hover:shadow-md transition-shadow" onClick={() => handleRespond('declined')} disabled={isPending}>
                        <XCircle className="w-4 h-4 mr-2" />Decline
                    </Button>
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold shadow-sm hover:shadow-md transition-shadow" onClick={() => handleRespond('accepted')} disabled={isPending}>
                        <CheckCircle className="w-4 h-4 mr-2" />Accept
                    </Button>
                </CardFooter>
            )}
        </Card>
    </motion.div>
  );
};

const AcceptedPartnerCard = ({ partnership, currentUserId }: { partnership: PartnershipRequest, currentUserId?: string | null }) => {
    if (!currentUserId) return null;
    const partner = partnership.requestingUser.id === currentUserId ? partnership.serviceOwner : partnership.requestingUser;
    const myAsset = partnership.requestingUser.id === currentUserId ? partnership.product : partnership.service;
    const partnerAsset = partnership.requestingUser.id === currentUserId ? partnership.service : partnership.product;

  return (
    <motion.div
        whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="h-full"
    >
        <Card className="rounded-2xl overflow-hidden shadow-md border border-cyan-200/80 h-full flex flex-col bg-white">
            <CardHeader className="flex flex-row items-start justify-between bg-cyan-50/80 p-4 border-b border-cyan-200/80">
                 <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-4 border-white shadow-md">
                        <AvatarImage src={partner.profilePictureUrl || ''} alt={partner.name} />
                        <AvatarFallback className="font-bold">{partner.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-base font-bold text-slate-800">{partner.name}</CardTitle>
                        <CardDescription className="text-xs font-bold text-cyan-700">Active Partner</CardDescription>
                    </div>
                </div>
                <Badge className="capitalize flex items-center gap-1.5 text-xs py-1 px-3 rounded-full font-semibold border bg-cyan-500 text-white border-cyan-600">
                    <Handshake className="h-4 w-4" />Partnership
                </Badge>
            </CardHeader>
            <CardContent className="p-4 text-sm text-slate-700 space-y-3 flex-grow">
                <RequestAsset label="Your Asset" name={'title' in myAsset ? myAsset.title : myAsset.name} />
                <RequestAsset label="Partner's Asset" name={'title' in partnerAsset ? partnerAsset.title : partnerAsset.name} />
            </CardContent>
        </Card>
    </motion.div>
  );
};

interface PartnershipTabContentProps {
  requests: PartnershipRequest[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  CardComponent: React.ComponentType<{ request: PartnershipRequest; partnership: PartnershipRequest; currentUserId?: string | null }>;
  emptyState: React.ReactNode;
  currentUserId?: string | null;
}

const PartnershipTabContent = ({ requests, isLoading, isError, error, CardComponent, emptyState, currentUserId }: PartnershipTabContentProps) => {
  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="rounded-2xl shadow-md border border-slate-200/80">
                    <CardHeader className="flex flex-row items-center gap-4 p-4">
                        <div className="h-14 w-14 rounded-full bg-slate-200 animate-pulse" />
                        <div className="space-y-2">
                            <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
                            <div className="h-3 w-24 rounded bg-slate-200 animate-pulse" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                        <div className="h-20 rounded-lg bg-slate-100 animate-pulse" />
                        <div className="h-20 rounded-lg bg-slate-100 animate-pulse" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
  }

  if (isError) {
    return <div className="p-8 text-red-600 text-center bg-red-50 rounded-2xl border-2 border-dashed border-red-200"><p className="font-bold text-base">Error: {error?.message || 'An unknown error occurred.'}</p></div>;
  }

  return (
    <div className="p-1">
      {requests && requests.length > 0 ? (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="initial"
            animate="animate"
            transition={{ staggerChildren: 0.07 }}
        >
          {requests.map((request: PartnershipRequest) => (
            <motion.div key={request.id} variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }} className="h-full">
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
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-indigo-100/20 min-h-screen">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My Partnerships</h1>
        <p className="text-lg text-slate-600 mt-2 max-w-2xl mx-auto">Oversee your partnership requests and active collaborations with ease.</p>
      </header>

      <Tabs defaultValue="sent" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-200/80 rounded-xl p-1.5 h-14 shadow-inner">
          <TabsTrigger value="sent" className="text-base font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg rounded-lg transition-all duration-300">Sent</TabsTrigger>
          <TabsTrigger value="received" className="text-base font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg rounded-lg transition-all duration-300">Received</TabsTrigger>
          <TabsTrigger value="accepted" className="text-base font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg rounded-lg transition-all duration-300">Partners</TabsTrigger>
        </TabsList>

        <div className="mt-8">
            <TabsContent value="sent">
            <PartnershipTabContent
                requests={sentRequests}
                isLoading={isLoadingSent}
                isError={isErrorSent}
                error={errorSent}
                CardComponent={SentRequestCard}
                emptyState={<EmptyState icon={<Send size={48} />} title="No Sent Requests" description="You haven't sent any partnership requests yet. Start a new collaboration!" />}
            />
            </TabsContent>
            <TabsContent value="received">
            <PartnershipTabContent
                requests={receivedRequests}
                isLoading={isLoadingReceived}
                isError={isErrorReceived}
                error={errorReceived}
                CardComponent={ReceivedRequestCard}
                emptyState={<EmptyState icon={<GitPullRequest size={48} />} title="No Received Requests" description="You haven't received any new partnership requests yet. Check back soon!" />}
            />
            </TabsContent>
            <TabsContent value="accepted">
            <PartnershipTabContent
                requests={acceptedPartners}
                isLoading={isLoadingAccepted}
                isError={isErrorAccepted}
                error={errorAccepted}
                CardComponent={AcceptedPartnerCard}
                emptyState={<EmptyState icon={<Users size={48} />} title="No Active Partners" description="You don't have any partners yet. Accepted requests will appear here." />}
                currentUserId={currentUserId}
            />
            </TabsContent>
        </div>
      </Tabs>
    </div>
    </>
  );
}