'use client';

import React from 'react';
import { useGetReceivedPartnershipRequests, useRespondToPartnershipRequest } from '@/service/partnerships/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast, Toaster } from 'sonner';
import { PartnershipRequest, PartnershipRequestStatus } from '@/service/partnerships/types';
import { CheckCircle, XCircle, Info, GitPullRequest, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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
        icon: <CheckCircle className="h-5 w-5" />,
        textColor: 'text-emerald-800',
        bgColor: 'bg-emerald-100',
        borderColor: 'border-emerald-200',
      };
    case 'declined':
      return {
        text: 'Declined',
        icon: <XCircle className="h-5 w-5" />,
        textColor: 'text-rose-800',
        bgColor: 'bg-rose-100',
        borderColor: 'border-rose-200',
      };
    case 'pending':
    default:
      return {
        text: 'Pending',
        icon: <Info className="h-5 w-5" />,
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
        className="text-center p-16 border-2 border-dashed rounded-3xl bg-slate-50/70 col-span-1 md:col-span-2 lg:col-span-3"
    >
        <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 mb-6">{icon}</div>
        <h3 className="text-2xl font-bold text-slate-800">{title}</h3>
        <p className="mt-3 text-lg text-slate-500 max-w-md mx-auto">{description}</p>
    </motion.div>
);

const RequestAsset = ({ label, name }: { label: string, name: string }) => (
    <div className="p-4 bg-slate-100 rounded-xl flex-1">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-900">{name}</p>
    </div>
);

const PartnershipRequestCard = ({ request }: { request: PartnershipRequest }) => {
  const { mutate: respond, isPending } = useRespondToPartnershipRequest();
  const statusUi = getStatusUi(request.status);

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
    <motion.div
        whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
        transition={{ type: 'spring', stiffness: 300 }}
        className="h-full"
    >
        <Card className="rounded-3xl overflow-hidden shadow-lg border-2 border-slate-200/80 h-full flex flex-col bg-white">
            <CardHeader className="flex flex-row items-start justify-between bg-slate-100/80 p-5 border-b-2">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                        <AvatarImage src={request.requestingUser.profilePictureUrl || ''} alt={request.requestingUser.name} />
                        <AvatarFallback className="text-xl font-bold">{request.requestingUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-lg font-extrabold text-slate-800">{request.requestingUser.name}</CardTitle>
                        <CardDescription className="text-sm font-medium text-slate-500">Wants to partner with you</CardDescription>
                    </div>
                </div>
                <Badge className={cn('capitalize flex items-center gap-2 text-sm py-2 px-4 rounded-full font-bold border-2', statusUi.textColor, statusUi.bgColor, statusUi.borderColor)}>
                    {statusUi.icon}{statusUi.text}
                </Badge>
            </CardHeader>
            <CardContent className="p-5 text-base text-slate-700 space-y-4 flex-grow">
                <p className="font-medium">They requested a partnership for your service with their product.</p>
                <div className="flex items-center justify-center gap-3">
                    <RequestAsset label="Their Product" name={request.product.title} />
                    <ArrowRight className="h-6 w-6 text-slate-400" />
                    <RequestAsset label="Your Service" name={request.service.name} />
                </div>
            </CardContent>
            {request.status === 'pending' && (
                <CardFooter className="flex justify-end gap-4 bg-slate-100/80 p-4 border-t-2">
                    <Button size="lg" variant="destructive" className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-shadow" onClick={() => handleResponse('declined')} disabled={isPending}>
                        <XCircle className="w-5 h-5 mr-2" />Decline
                    </Button>
                    <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-shadow" onClick={() => handleResponse('accepted')} disabled={isPending}>
                        <CheckCircle className="w-5 h-5 mr-2" />Accept
                    </Button>
                </CardFooter>
            )}
        </Card>
    </motion.div>
  );
};

export default function PartnershipRequestsPage() {
  const { data: requests, isLoading, isError, error } = useGetReceivedPartnershipRequests();

  const renderContent = () => {
    if (isLoading) {
      return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="rounded-3xl shadow-lg border-2 border-slate-200/80">
                      <CardHeader className="flex flex-row items-center gap-4 p-5">
                          <div className="h-16 w-16 rounded-full bg-slate-200 animate-pulse" />
                          <div className="space-y-3">
                              <div className="h-5 w-36 rounded bg-slate-200 animate-pulse" />
                              <div className="h-4 w-28 rounded bg-slate-200 animate-pulse" />
                          </div>
                      </CardHeader>
                      <CardContent className="p-5 space-y-4">
                          <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
                          <div className="h-24 rounded-xl bg-slate-100 animate-pulse" />
                      </CardContent>
                  </Card>
              ))}
          </div>
      );
    }

    if (isError) {
      return <div className="p-8 text-red-600 text-center bg-red-50 rounded-3xl border-2 border-dashed border-red-200 col-span-1 md:col-span-2 lg:col-span-3"><p className="font-bold text-lg">Error: {error?.message || 'An unknown error occurred.'}</p></div>;
    }

    if (requests && requests.length > 0) {
      return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="initial"
            animate="animate"
            transition={{ staggerChildren: 0.07 }}
        >
          {requests.map((request) => (
            <motion.div key={request.id} variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }} className="h-full">
                <PartnershipRequestCard request={request} />
            </motion.div>
          ))}
        </motion.div>
      );
    }

    return <EmptyState icon={<GitPullRequest size={64} />} title="No Pending Requests" description="You have no new partnership requests at the moment. Check back soon!" />;
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-indigo-100/30 min-h-screen">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black tracking-tighter text-slate-900">Received Partnership Requests</h1>
          <p className="text-xl text-slate-600 mt-3 max-w-2xl mx-auto">Manage incoming partnership requests for your services.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {renderContent()}
        </div>
      </div>
    </>
  );
}