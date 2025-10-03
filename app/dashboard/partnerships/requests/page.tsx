'use client';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMyPartnerships, useAcceptPartnership } from '@/service/partnerships/hooks';
import { IPartnership } from '@/service/partnerships/types';
import { useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { Check, X, Clock, User, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const PartnershipRequestSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
            </div>
        ))}
    </div>
);

const PartnershipList = ({
    partnerships,
    type,
    onAccept,
    isAccepting,
}: {
    partnerships: IPartnership[],
    type: 'incoming' | 'sent',
    onAccept: (id: string) => void,
    isAccepting: boolean,
}) => {

    const getStatusBadge = (status: IPartnership['status']) => {
        switch (status) {
            case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
            case 'accepted': return <Badge variant="default" className="bg-green-100 text-green-800">Accepted</Badge>;
            case 'declined': return <Badge variant="destructive">Declined</Badge>;
            default: return <Badge variant="outline">Unknown</Badge>;
        }
    };

    if (partnerships.length === 0) {
        return <div className="text-center text-gray-500 py-12">No {type === 'incoming' ? 'incoming' : 'sent'} requests found.</div>;
    }

    return (
        <div className="space-y-4">
            {partnerships.map(p => {
                const partner = type === 'incoming' ? p.requester : p.provider;
                return (
                    <Card key={p.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                {partner.role === 'owner' ? <Building className="w-6 h-6 text-gray-500" /> : <User className="w-6 h-6 text-gray-500" />}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{partner.name}</p>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> Requested on {format(new Date(p.created_at), 'MMM d, yyyy')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            {type === 'incoming' && p.status === 'pending' ? (
                                <Button size="sm" onClick={() => onAccept(p.id)} disabled={isAccepting}>
                                    <Check className="mr-2 h-4 w-4" /> Accept
                                </Button>
                            ) : (
                                getStatusBadge(p.status)
                            )}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};


export default function PartnershipRequestsPage() {
    const { userId } = useSelector((state: RootState) => state.auth);
    const { partnerships, isLoading, isError, mutate } = useMyPartnerships();
    const { acceptPartnership, isAccepting } = useAcceptPartnership();

    const handleAccept = async (id: string) => {
        await acceptPartnership(id);
        mutate(); // Re-fetch the list
    };

    const incomingRequests = React.useMemo(() =>
        partnerships?.filter(p => p.provider.id === userId && p.status === 'pending') || [],
        [partnerships, userId]
    );

    const sentRequests = React.useMemo(() =>
        partnerships?.filter(p => p.requester.id === userId) || [],
        [partnerships, userId]
    );

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-3xl font-bold text-gray-800">Partnership Requests</CardTitle>
                        <CardDescription>Manage your incoming and outgoing partnership invitations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="incoming" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="incoming">Incoming Requests</TabsTrigger>
                                <TabsTrigger value="sent">Sent Requests</TabsTrigger>
                            </TabsList>
                            <TabsContent value="incoming" className="pt-6">
                                {isLoading && <PartnershipRequestSkeleton />}
                                {!isLoading && !isError && (
                                    <PartnershipList
                                        partnerships={incomingRequests}
                                        type="incoming"
                                        onAccept={handleAccept}
                                        isAccepting={isAccepting}
                                    />
                                )}
                            </TabsContent>
                            <TabsContent value="sent" className="pt-6">
                                {isLoading && <PartnershipRequestSkeleton />}
                                {!isLoading && !isError && (
                                    <PartnershipList
                                        partnerships={sentRequests}
                                        type="sent"
                                        onAccept={handleAccept}
                                        isAccepting={isAccepting}
                                    />
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}