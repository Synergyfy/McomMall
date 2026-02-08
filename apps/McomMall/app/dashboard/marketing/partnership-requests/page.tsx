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
                        <CardDescription className="text-xs font-medium text-slate-500">Wants to partner with you</CardDescription>
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
                    <Button size="sm" variant="destructive" className="bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-semibold shadow-sm hover:shadow-md transition-shadow" onClick={() => handleResponse('declined')} disabled={isPending}>
                        <XCircle className="w-4 h-4 mr-2" />Decline
                    </Button>
                    <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold shadow-sm hover:shadow-md transition-shadow" onClick={() => handleResponse('accepted')} disabled={isPending}>
                        <CheckCircle className="w-4 h-4 mr-2" />Accept
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      return <div className="p-8 text-red-600 text-center bg-red-50 rounded-2xl border-2 border-dashed border-red-200 col-span-1 md:col-span-2 lg:col-span-3"><p className="font-bold text-base">Error: {error?.message || 'An unknown error occurred.'}</p></div>;
    }

    if (requests && requests.length > 0) {
      return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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

    return <EmptyState icon={<GitPullRequest size={48} />} title="No Pending Requests" description="You have no new partnership requests at the moment. Check back soon!" />;
  };

  return (
    <>
      <Toaster richColors position="top-right" />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-indigo-100/20 min-h-screen">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Received Partnership Requests</h1>
          <p className="text-lg text-slate-600 mt-2 max-w-2xl mx-auto">Manage incoming partnership requests for your services.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {renderContent()}
        </div>
      </div>
    </>
  );
}