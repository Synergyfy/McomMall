'use client';

import React, { useState, useMemo } from 'react';
import {
  useGetSentUserRequests,
  useGetReceivedUserRequests,
  useGetSentItemRequests,
  useGetReceivedItemRequests,
  useGetMyPartners,
  useRespondToUserPartnershipRequest,
  useRespondToItemPartnershipRequest,
  useGetPartnershipAnalytics,
  useGetPartnerItems,
  useCreateItemPartnershipRequest,
  useCreateUserPartnershipRequest,
  useGetProductsByUserId,
  useGetServicesByUserId,
  useSearchOwners,
} from '@/service/partnerships/hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
    UserPartnershipRequest, 
    UserPartner, 
    PartnershipStatus,
    ItemPartnershipRequest
} from '@/service/partnerships/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Handshake, 
  Info, 
  CheckCircle, 
  XCircle, 
  Users, 
  Send, 
  GitPullRequest, 
  ArrowRight, 
  LayoutGrid, 
  List, 
  Calendar,
  Search,
  Filter,
  ExternalLink,
  MoreVertical,
  Check,
  X,
  MapPin,
  MessageSquare,
  PlusCircle,
  TrendingUp,
  Clock,
  Package,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { RootState } from '@/service/store/store';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

type ViewMode = 'grid' | 'list';

const formatDate = (dateString: any) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    return date.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
};

const getStatusUi = (status: PartnershipStatus) => {
  switch (status) {
    case 'accepted':
      return {
        text: 'Accepted',
        icon: <CheckCircle className="h-4 w-4" />,
        textColor: 'text-emerald-700',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        dotColor: 'bg-emerald-500',
      };
    case 'declined':
      return {
        text: 'Declined',
        icon: <XCircle className="h-4 w-4" />,
        textColor: 'text-rose-700',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
        dotColor: 'bg-rose-500',
      };
    case 'pending':
    default:
      return {
        text: 'Pending',
        icon: <Info className="h-4 w-4" />,
        textColor: 'text-amber-700',
        bgColor: 'bg-amber-100',
        borderColor: 'border-amber-200',
        dotColor: 'bg-amber-500',
      };
  }
};

const EmptyState = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-8 md:p-16 text-center bg-white border border-dashed border-slate-300 rounded-3xl shadow-sm"
    >
        <div className="p-5 bg-orange-50 rounded-2xl text-orange-400 mb-6 shadow-inner">
            {icon}
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 max-w-sm leading-relaxed text-sm md:text-base">{description}</p>
        <Button className="mt-8 bg-orange-600 hover:bg-orange-700 text-white px-8 rounded-full transition-all hover:shadow-lg active:scale-95">
            Discover Partners
        </Button>
    </motion.div>
);

const StatCard = ({ label, value, color, icon: Icon, subtitle }: { label: string, value: number, color: string, icon: any, subtitle?: string }) => (
    <div className={cn("flex flex-col p-4 rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all relative overflow-hidden group")}>
        <div className={cn("absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-5 group-hover:scale-110 transition-transform", color.replace('text-', 'bg-'))} />
        <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
            <div className={cn("p-2 rounded-xl", color.replace('text-', 'bg-').replace('border-', 'bg-').concat('/10'), color)}>
                <Icon className="h-4 w-4" />
            </div>
        </div>
        <div className="relative z-10">
            <span className="text-3xl font-black text-slate-800 tracking-tight">{value}</span>
            {subtitle && <p className="text-[10px] text-slate-400 mt-1 font-medium">{subtitle}</p>}
        </div>
    </div>
);

const UserRequestCard = ({ 
    request, 
    type, 
    viewMode, 
    onRespond 
}: { 
    request: UserPartnershipRequest, 
    type: 'sent' | 'received',
    viewMode: ViewMode,
    onRespond?: (id: string, status: PartnershipStatus, message?: string) => void
}) => {
    const statusUi = getStatusUi(request.status);
    const isSent = type === 'sent';
    const partner = isSent ? request.receiver : request.sender;

    if (viewMode === 'list') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="group flex flex-col sm:flex-row items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/5 transition-all mb-3"
            >
                <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                    <Avatar className="h-12 w-12 border border-slate-100 group-hover:border-orange-200 transition-colors">
                        <AvatarImage src={partner.profilePictureUrl || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white font-bold">
                            {partner.firstName?.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <h4 className="font-bold text-slate-800 text-base">{partner.firstName} {partner.lastName}</h4>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                            <Clock className="h-2.5 w-2.5" /> {isSent ? 'Sent' : 'Received'} {formatDate(request.sentAt)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <Badge className={cn('capitalize px-3 py-1 rounded-full font-bold border-0 text-[10px]', statusUi.textColor, statusUi.bgColor)}>
                        <div className="flex items-center gap-1">
                            <span className={cn('h-1 w-1 rounded-full', statusUi.dotColor)} />
                            {statusUi.text}
                        </div>
                    </Badge>

                    {!isSent && request.status === 'pending' && (
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-8 rounded-lg border-rose-100 text-rose-500 hover:bg-rose-50 font-bold text-xs" onClick={() => onRespond?.(request.id, 'declined')}>
                                Decline
                            </Button>
                            <Button size="sm" className="h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs" onClick={() => onRespond?.(request.id, 'accepted')}>
                                Accept
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div layout whileHover={{ y: -5 }} className="h-full">
            <Card className="h-full rounded-[2rem] overflow-hidden border-slate-200 shadow-md hover:shadow-xl transition-all group">
                <CardHeader className="text-center p-6 pb-2">
                    <div className="relative inline-block mb-3">
                        <Avatar className="h-20 w-20 border-2 border-white shadow-lg mx-auto">
                            <AvatarImage src={partner.profilePictureUrl || ''} />
                            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-amber-600 text-white text-2xl font-bold">
                                {partner.firstName?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute top-0 right-0">
                             <Badge className={cn('capitalize px-2 py-0.5 rounded-full font-bold border-0 text-[9px] shadow-sm', statusUi.textColor, statusUi.bgColor)}>
                                {statusUi.text}
                            </Badge>
                        </div>
                    </div>
                    <CardTitle className="text-xl font-black text-slate-900 leading-tight">{partner.firstName} {partner.lastName}</CardTitle>
                    <CardDescription className="font-bold text-orange-500 uppercase tracking-widest text-[9px] mt-1">
                        {isSent ? 'Sent Request' : 'Incoming Request'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-4 text-center">
                    <div className="flex items-center justify-center gap-4 text-slate-400 text-xs font-medium">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(request.sentAt)}</span>
                    </div>
                    {request.rejectionMessage && (
                        <div className="mt-3 p-3 bg-rose-50 rounded-xl border border-rose-100 text-[10px] text-rose-600 font-medium italic">
                            "{request.rejectionMessage}"
                        </div>
                    )}
                </CardContent>
                {!isSent && request.status === 'pending' && (
                    <CardFooter className="p-6 pt-0 flex gap-2">
                        <Button variant="outline" className="flex-1 rounded-xl border-rose-100 text-rose-500 hover:bg-rose-50 font-bold h-10 text-xs" onClick={() => onRespond?.(request.id, 'declined')}>
                            Decline
                        </Button>
                        <Button className="flex-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold h-10 text-xs shadow-md shadow-orange-500/10" onClick={() => onRespond?.(request.id, 'accepted')}>
                            Accept
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </motion.div>
    );
};

const ItemRequestCard = ({ 
    request, 
    type, 
    viewMode, 
    onRespond 
}: { 
    request: ItemPartnershipRequest, 
    type: 'sent' | 'received',
    viewMode: ViewMode,
    onRespond?: (id: string, status: PartnershipStatus, message?: string) => void
}) => {
    const statusUi = getStatusUi(request.status);
    const isSent = type === 'sent';
    const partner = isSent ? request.receiver : request.proposer;
    
    const baseItem = request.baseProduct || request.baseService;
    const plusItem = request.plusProduct || request.plusService;
    const baseType = request.baseProduct ? 'product' : 'service';
    const plusType = request.plusProduct ? 'product' : 'service';

    const ItemIcon = ({ type }: { type: 'product' | 'service' }) => (
        <div className={cn("p-1.5 rounded-md", type === 'product' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600")}>
            {type === 'product' ? <Package size={12} /> : <Handshake size={12} />}
        </div>
    );

    if (viewMode === 'list') {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="group flex flex-col sm:flex-row items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/5 transition-all mb-3"
            >
                <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                    <div className="flex -space-x-3 items-center">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm z-10">
                            <AvatarImage src={partner?.profilePictureUrl || ''} />
                            <AvatarFallback className="bg-slate-200 text-slate-500 text-[10px] font-bold">
                                {partner?.firstName?.charAt(0) || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center border-2 border-white shadow-sm z-0">
                            <PlusCircle className="h-4 w-4 text-orange-600" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                             <h4 className="font-bold text-slate-800 text-sm truncate">{(baseItem as any)?.title || (baseItem as any)?.name}</h4>
                             <ArrowRight className="h-3 w-3 text-slate-300" />
                             <h4 className="font-bold text-orange-600 text-sm truncate">{(plusItem as any)?.title || (plusItem as any)?.name}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                            <Users size={10} /> {isSent ? 'To' : 'From'} {partner?.firstName} {partner?.lastName} • {formatDate(request.sentAt)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    {!request.partnershipId && <Badge className="bg-amber-50 text-amber-600 border-amber-100 text-[8px] uppercase font-black">Pending Owner Sync</Badge>}
                    <Badge className={cn('capitalize px-3 py-1 rounded-full font-bold border-0 text-[10px]', statusUi.textColor, statusUi.bgColor)}>
                        {statusUi.text}
                    </Badge>

                    {!isSent && request.status === 'pending' && (
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="h-8 rounded-lg border-rose-100 text-rose-500 hover:bg-rose-50 font-bold text-xs" onClick={() => onRespond?.(request.id, 'declined')}>
                                Decline
                            </Button>
                            <Button 
                                size="sm" 
                                className="h-8 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs" 
                                onClick={() => onRespond?.(request.id, 'accepted')}
                                disabled={!request.partnershipId}
                            >
                                Accept
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div layout whileHover={{ y: -5 }} className="h-full">
            <Card className="h-full rounded-[2rem] overflow-hidden border-slate-200 shadow-md hover:shadow-xl transition-all flex flex-col">
                <CardHeader className="p-6 pb-2">
                    <div className="flex justify-between items-start mb-4">
                        <Badge className={cn('capitalize px-2 py-0.5 rounded-full font-bold border-0 text-[8px] shadow-sm', statusUi.textColor, statusUi.bgColor)}>
                            {statusUi.text}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-slate-400">
                             <Clock className="h-3 w-3" />
                             <span className="text-[9px] font-bold">{formatDate(request.sentAt)}</span>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <ItemIcon type={baseType} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Base Item</p>
                                <p className="font-bold text-slate-800 text-xs truncate">{(baseItem as any)?.title || (baseItem as any)?.name}</p>
                            </div>
                        </div>
                        <div className="flex justify-center -my-2 relative z-10">
                             <div className="bg-white p-1.5 rounded-full border border-slate-100 shadow-sm">
                                <ArrowRight className="h-3 w-3 text-orange-500 rotate-90 sm:rotate-0" />
                             </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-orange-50/50 rounded-2xl border border-orange-100 ring-2 ring-orange-50/20">
                            <ItemIcon type={plusType} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[8px] font-black uppercase text-orange-400 tracking-widest">Plus Item</p>
                                <p className="font-bold text-slate-900 text-xs truncate">{(plusItem as any)?.title || (plusItem as any)?.name}</p>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-6 py-4 flex-1">
                    <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={partner?.profilePictureUrl} />
                            <AvatarFallback className="text-[8px]">{partner?.firstName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="text-[10px] text-slate-500 font-medium">
                            {isSent ? 'Proposal to' : 'Proposed by'} <span className="font-bold text-slate-700">{partner?.firstName} {partner?.lastName}</span>
                        </p>
                    </div>
                    {!request.partnershipId && (
                        <div className="mt-4 p-2 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-2">
                            <Info className="h-3 w-3 text-amber-500" />
                            <p className="text-[8px] font-bold text-amber-700 leading-tight">Waiting for Owner-to-Owner partnership acceptance first.</p>
                        </div>
                    )}
                </CardContent>
                {!isSent && request.status === 'pending' && (
                    <CardFooter className="p-6 pt-0 flex gap-2">
                        <Button variant="outline" className="flex-1 rounded-xl border-rose-100 text-rose-500 hover:bg-rose-50 font-bold h-10 text-xs" onClick={() => onRespond?.(request.id, 'declined')}>
                            Decline
                        </Button>
                        <Button 
                            className="flex-1 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold h-10 text-xs shadow-md shadow-orange-500/10" 
                            onClick={() => onRespond?.(request.id, 'accepted')}
                            disabled={!request.partnershipId}
                        >
                            Accept
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </motion.div>
    );
};

const PartnerCard = ({ partner, onDetails }: { partner: UserPartner, onDetails: (p: UserPartner) => void }) => (
    <motion.div whileHover={{ y: -8 }} className="h-full">
        <Card className="h-full rounded-[2rem] overflow-hidden border-slate-200 shadow-md hover:shadow-xl hover:border-orange-200 transition-all duration-300 group">
            <div className="h-20 bg-gradient-to-r from-orange-500 to-amber-600 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                    </svg>
                </div>
                <div className="absolute top-3 right-4">
                    <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md rounded-full px-2 py-0.5 font-bold text-[8px] uppercase tracking-wider">
                        Active Partner
                    </Badge>
                </div>
            </div>
            <CardHeader className="text-center pt-0 -mt-10 relative z-10">
                <Avatar className="h-20 w-20 border-2 border-white shadow-xl mx-auto mb-3 group-hover:scale-105 transition-transform duration-500">
                    <AvatarImage src={partner.partnerProfilePicture || ''} />
                    <AvatarFallback className="bg-slate-200 text-slate-500 text-xl font-bold">
                        {partner.partnerName.charAt(0)}
                    </AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg font-black text-slate-800 leading-tight">{partner.partnerName}</CardTitle>
                <div className="flex flex-col items-center gap-1 mt-1">
                    <p className="text-[10px] text-slate-400 font-bold truncate px-4">{partner.partnerEmail}</p>
                    {partner.acceptedAt && (
                        <p className="text-[9px] text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-md">
                            Partner since {new Date(partner.acceptedAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                    {partner.postcodes.map((pc, idx) => (
                        <Badge key={`${partner.partnershipId}-${pc}-${idx}`} variant="outline" className="rounded-full px-2 py-0.5 bg-slate-50 border-slate-200 text-slate-600 font-bold text-[8px] flex items-center gap-1">
                            <MapPin className="h-2 w-2" /> {pc}
                        </Badge>
                    ))}
                    {partner.postcodes.length === 0 && <span className="text-[10px] text-slate-400 font-medium italic">No postcodes listed</span>}
                </div>
                <Button className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold h-10 text-xs shadow-md transition-all" onClick={() => onDetails(partner)}>
                    Collaborations
                </Button>
            </CardContent>
        </Card>
    </motion.div>
);

export default function MyPartnersPage() {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectionMessage, setRejectionMessage] = useState('');
    const [currentRequestId, setCurrentRequestId] = useState('');
    const [detailsPartner, setDetailsPartner] = useState<UserPartner | null>(null);
    const [searchDialogOpen, setSearchDialogOpen] = useState(false);
    const [integrationDialogOpen, setIntegrationDialogOpen] = useState(false);

    const { data: analytics } = useGetPartnershipAnalytics();
    const { data: sentRequests, isLoading: isLoadingSent } = useGetSentUserRequests();
    const { data: receivedRequests, isLoading: isLoadingReceived } = useGetReceivedUserRequests();
    const { data: sentItemRequests, isLoading: isLoadingSentItems } = useGetSentItemRequests();
    const { data: receivedItemRequests, isLoading: isLoadingReceivedItems } = useGetReceivedItemRequests();
    const { data: partners, isLoading: isLoadingPartners } = useGetMyPartners();
    const { mutate: respond } = useRespondToUserPartnershipRequest();
    const { mutate: respondItem } = useRespondToItemPartnershipRequest();
    const { mutate: createRequest } = useCreateUserPartnershipRequest();

    const [respondType, setRespondType] = useState<'user' | 'item'>('user');

    const handleRespond = (id: string, status: PartnershipStatus, message?: string) => {
        if (status === 'declined' && !message && !rejectDialogOpen) {
            setCurrentRequestId(id);
            setRespondType('user');
            setRejectDialogOpen(true);
            return;
        }

        respond({ id, dto: { status, rejectionMessage: message } }, {
            onSuccess: () => {
                toast.success(`User partnership ${status}!`);
                setRejectDialogOpen(false);
                setRejectionMessage('');
            },
            onError: (err) => toast.error(err.message),
        });
    };

    const handleItemRespond = (id: string, status: PartnershipStatus, message?: string) => {
        if (status === 'declined' && !message && !rejectDialogOpen) {
            setCurrentRequestId(id);
            setRespondType('item');
            setRejectDialogOpen(true);
            return;
        }

        respondItem({ id, dto: { status, rejectionMessage: message } }, {
            onSuccess: () => {
                toast.success(`Item integration ${status}!`);
                setRejectDialogOpen(false);
                setRejectionMessage('');
            },
            onError: (err) => toast.error(err.message),
        });
    };

    const handleFinalDecline = () => {
        if (respondType === 'user') {
            handleRespond(currentRequestId, 'declined', rejectionMessage);
        } else {
            handleItemRespond(currentRequestId, 'declined', rejectionMessage);
        }
    };

    const filterRequests = (list: any[] | undefined | null) => {
        const data = list || [];
        if (!searchQuery) return data;
        const q = searchQuery.toLowerCase();
        return data.filter(item => 
            (item.partnerName?.toLowerCase() || `${item.sender?.firstName} ${item.sender?.lastName}`.toLowerCase() || `${item.receiver?.firstName} ${item.receiver?.lastName}`.toLowerCase())
            .includes(q)
        );
    };

    const stats = [
        { id: 'total', label: 'Active Partners', value: analytics?.totalPartners || 0, color: 'text-orange-600', icon: Handshake, subtitle: 'Grow your ecosystem' },
        { id: 'incoming', label: 'Total Pending', value: (analytics?.pendingUserRequests || 0) + (analytics?.pendingItemRequests || 0), color: 'text-amber-600', icon: TrendingUp, subtitle: 'Needs your attention' },
        { id: 'sent', label: 'Awaiting Action', value: (sentRequests || []).filter(r => r.status === 'pending').length + (sentItemRequests || []).filter(r => r.status === 'pending').length, color: 'text-orange-500', icon: Send, subtitle: 'Outgoing proposals' },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Toaster richColors position="top-right" />
            
            <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-orange-600 text-white rounded-2xl shadow-xl shadow-orange-200">
                                <Users size={24} />
                            </div>
                            <Badge className="bg-orange-50 text-orange-700 border-orange-100 px-3 py-1 rounded-full font-black uppercase tracking-widest text-[9px]">
                                Strategic Partnerships
                            </Badge>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                            Partner <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">Dashboard</span>
                        </h1>
                        <p className="text-base md:text-lg text-slate-500 max-w-xl font-medium leading-relaxed">
                            Connect with other business owners, share resources, and expand your reach through collaborative growth.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                         <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex items-center">
                            <Button 
                                variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                                size="sm" 
                                onClick={() => setViewMode('grid')}
                                className={cn("rounded-xl h-10 px-4 font-bold transition-all", viewMode === 'grid' ? "bg-orange-600 text-white shadow-md" : "text-slate-500")}
                            >
                                <LayoutGrid className="h-4 w-4 mr-2" /> Grid
                            </Button>
                            <Button 
                                variant={viewMode === 'list' ? 'default' : 'ghost'} 
                                size="sm" 
                                onClick={() => setViewMode('list')}
                                className={cn("rounded-xl h-10 px-4 font-bold transition-all", viewMode === 'list' ? "bg-orange-600 text-white shadow-md" : "text-slate-500")}
                            >
                                <List className="h-4 w-4 mr-2" /> List
                            </Button>
                        </div>
                        <Button 
                            className="h-12 px-8 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black shadow-lg transition-all hover:-translate-y-1 active:scale-95"
                            onClick={() => setSearchDialogOpen(true)}
                        >
                            New Partnership
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-20">
                    {stats.map((stat, i) => (
                        <motion.div key={stat.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                            <StatCard {...stat} />
                        </motion.div>
                    ))}
                </div>

                <Tabs defaultValue="partners" className="w-full space-y-8">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 bg-white/50 p-3 rounded-3xl border border-slate-100 backdrop-blur-sm shadow-sm">
                        <TabsList className="bg-slate-100/50 rounded-2xl p-1 h-14 w-full lg:w-auto overflow-x-auto">
                            <TabsTrigger value="partners" className="text-[10px] font-black uppercase tracking-widest px-6 rounded-xl h-full data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-md transition-all duration-300">
                                Partners <span className="ml-2 opacity-40">{(partners || []).length}</span>
                            </TabsTrigger>
                            <TabsTrigger value="received" className="text-[10px] font-black uppercase tracking-widest px-6 rounded-xl h-full data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-md transition-all duration-300">
                                Incoming <span className="ml-2 opacity-40">{(receivedRequests || []).length}</span>
                            </TabsTrigger>
                            <TabsTrigger value="sent" className="text-[10px] font-black uppercase tracking-widest px-6 rounded-xl h-full data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-md transition-all duration-300">
                                Sent <span className="ml-2 opacity-40">{(sentRequests || []).length}</span>
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-3 w-full lg:w-auto px-1">
                            <div className="relative flex-1 lg:w-80">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                    placeholder="Search by name..." 
                                    className="pl-12 h-12 rounded-2xl border-slate-200 bg-white focus:ring-4 focus:ring-orange-500/10 transition-all text-sm font-medium shadow-inner"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" className="h-12 w-12 p-0 rounded-2xl border-slate-200 bg-white shadow-sm hover:bg-slate-50">
                                <Filter className="h-4 w-4 text-slate-600" />
                            </Button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <TabsContent key="partners-tab" value="partners" className="mt-8 outline-none focus:ring-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filterRequests(partners).map((p: UserPartner) => (
                                    <PartnerCard key={p.partnershipId} partner={p} onDetails={setDetailsPartner} />
                                ))}
                                {(!partners || partners.length === 0) && !isLoadingPartners && (
                                    <div key="no-partners" className="col-span-full">
                                        <EmptyState icon={<Users size={64} />} title="Connect with Owners" description="You haven't established any partnerships yet. Start by discovering owners in your area." />
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent key="received-tab" value="received" className="mt-8 outline-none">
                            <Tabs defaultValue="owners" className="space-y-6">
                                <div className="flex justify-center">
                                    <TabsList className="bg-white/50 p-1 rounded-xl border border-slate-200 h-10">
                                        <TabsTrigger value="owners" className="text-[9px] font-black uppercase px-4 rounded-lg data-[state=active]:bg-orange-600 data-[state=active]:text-white">Owners</TabsTrigger>
                                        <TabsTrigger value="items" className="text-[9px] font-black uppercase px-4 rounded-lg data-[state=active]:bg-orange-600 data-[state=active]:text-white">Items</TabsTrigger>
                                    </TabsList>
                                </div>
                                
                                <TabsContent value="owners">
                                    <div className={cn(viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4")}>
                                        {filterRequests(receivedRequests).map((r: UserPartnershipRequest) => (
                                            <UserRequestCard key={`received-u-${r.id}`} request={r} type="received" viewMode={viewMode} onRespond={handleRespond} />
                                        ))}
                                        {(!receivedRequests || receivedRequests.length === 0) && !isLoadingReceived && (
                                            <div className="col-span-full">
                                                <EmptyState icon={<GitPullRequest size={64} />} title="No Incoming Requests" description="Your inbox is clear. New owner-to-owner partnership requests will appear here." />
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="items">
                                    <div className={cn(viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4")}>
                                        {filterRequests(receivedItemRequests).map((r: ItemPartnershipRequest) => (
                                            <ItemRequestCard key={`received-i-${r.id}`} request={r} type="received" viewMode={viewMode} onRespond={handleItemRespond} />
                                        ))}
                                        {(!receivedItemRequests || receivedItemRequests.length === 0) && !isLoadingReceivedItems && (
                                            <div className="col-span-full">
                                                <EmptyState icon={<Layers size={64} />} title="No Item Proposals" description="Partner items proposed for cross-selling with your products or services will show up here." />
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </TabsContent>

                        <TabsContent key="sent-tab" value="sent" className="mt-8 outline-none">
                            <Tabs defaultValue="owners" className="space-y-6">
                                <div className="flex justify-center">
                                    <TabsList className="bg-white/50 p-1 rounded-xl border border-slate-200 h-10">
                                        <TabsTrigger value="owners" className="text-[9px] font-black uppercase px-4 rounded-lg data-[state=active]:bg-orange-600 data-[state=active]:text-white">Owners</TabsTrigger>
                                        <TabsTrigger value="items" className="text-[9px] font-black uppercase px-4 rounded-lg data-[state=active]:bg-orange-600 data-[state=active]:text-white">Items</TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="owners">
                                    <div className={cn(viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4")}>
                                        {filterRequests(sentRequests).map((r: UserPartnershipRequest) => (
                                            <UserRequestCard key={`sent-u-${r.id}`} request={r} type="sent" viewMode={viewMode} />
                                        ))}
                                        {(!sentRequests || sentRequests.length === 0) && !isLoadingSent && (
                                            <div className="col-span-full">
                                                <EmptyState icon={<Send size={64} />} title="Start the Conversation" description="Reach out to businesses that complement yours to establish owner partnerships." />
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="items">
                                    <div className={cn(viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-4")}>
                                        {filterRequests(sentItemRequests).map((r: ItemPartnershipRequest) => (
                                            <ItemRequestCard key={`sent-i-${r.id}`} request={r} type="sent" viewMode={viewMode} />
                                        ))}
                                        {(!sentItemRequests || sentItemRequests.length === 0) && !isLoadingSentItems && (
                                            <div className="col-span-full">
                                                <EmptyState icon={<PlusCircle size={64} />} title="Expand Your reach" description="Propose cross-selling links between your items and your active partners' items." />
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </TabsContent>
                    </AnimatePresence>
                </Tabs>
            </div>

            {/* Rejection Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="rounded-3xl p-6 md:p-8 max-w-md border-0 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-900 mb-1">Decline Request</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500 leading-relaxed">
                            Professional networking is key. Please provide a brief reason for declining.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6">
                        <Textarea 
                            placeholder="e.g., Not the right fit at this time..." 
                            className="min-h-[120px] rounded-2xl border-slate-200 focus:ring-orange-500/20 text-slate-700 p-4 text-sm"
                            value={rejectionMessage}
                            onChange={(e) => setRejectionMessage(e.target.value)}
                        />
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" className="rounded-xl font-bold h-11 px-6 text-slate-500 text-sm" onClick={() => setRejectDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold h-11 px-8 shadow-md" onClick={handleFinalDecline}>
                            Decline
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Partner Details / Items Dialog */}
            {detailsPartner && (
                <PartnerDetailsDialog 
                    partner={detailsPartner} 
                    onClose={() => setDetailsPartner(null)} 
                    onNewLink={() => setIntegrationDialogOpen(true)}
                />
            )}

            {/* Integration Dialog */}
            {detailsPartner && (
                <NewIntegrationDialog 
                    open={integrationDialogOpen}
                    onOpenChange={setIntegrationDialogOpen}
                    partner={detailsPartner}
                    onRequested={() => {
                        setIntegrationDialogOpen(false);
                        toast.success('Plus link proposal sent to partner!');
                    }}
                />
            )}

            {/* Search Partners Dialog */}
            <SearchPartnersDialog 
                open={searchDialogOpen} 
                onOpenChange={setSearchDialogOpen}
                onRequestSent={() => {
                    setSearchDialogOpen(false);
                    toast.success('Partnership request sent successfully!');
                }}
            />
        </div>
    );
}

function SearchPartnersDialog({ open, onOpenChange, onRequestSent }: { open: boolean, onOpenChange: (open: boolean) => void, onRequestSent: () => void }) {
    const [query, setQuery] = useState('');
    const { data: owners, isLoading } = useSearchOwners(query);
    const { mutate: createRequest, isPending } = useCreateUserPartnershipRequest();

    const handleSendRequest = (targetUserId: string) => {
        createRequest({ targetUserId }, {
            onSuccess: () => onRequestSent(),
            onError: (err: any) => toast.error(err.message || 'Failed to send request'),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden border-0 shadow-3xl bg-white">
                <div className="p-6 md:p-8 space-y-6">
                    <div>
                        <DialogTitle className="text-2xl font-black text-slate-900 mb-1">Find Partners</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500">
                            Search for business owners by name or email to start a partnership.
                        </DialogDescription>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input 
                            placeholder="Enter name or email..." 
                            className="pl-12 h-12 rounded-xl border-slate-200 focus:ring-orange-500/10 transition-all text-sm font-medium shadow-inner"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <div className="min-h-[300px] max-h-[400px] overflow-y-auto space-y-3 no-scrollbar py-2">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full space-y-4 py-12">
                                <div className="h-8 w-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
                                <p className="text-sm font-bold text-slate-400">Searching owners...</p>
                            </div>
                        ) : query.length < 2 ? (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                                <Users className="h-12 w-12 text-slate-200 mb-4" />
                                <p className="text-sm font-bold text-slate-400">Type at least 2 characters to search</p>
                            </div>
                        ) : owners?.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                                <Search className="h-12 w-12 text-slate-200 mb-4" />
                                <p className="text-sm font-bold text-slate-400">No owners found matching "{query}"</p>
                            </div>
                        ) : (
                            owners?.map((owner) => (
                                <div key={owner.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-200 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border border-white shadow-sm">
                                            <AvatarImage src={owner.profilePictureUrl} />
                                            <AvatarFallback className="font-bold text-xs bg-orange-100 text-orange-700">
                                                {owner.firstName?.charAt(0)}{owner.lastName?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{owner.firstName} {owner.lastName}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{owner.email}</p>
                                        </div>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        className="rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-[10px] h-8 px-4"
                                        disabled={isPending}
                                        onClick={() => handleSendRequest(owner.id)}
                                    >
                                        Connect
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className="p-4 bg-slate-50 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="rounded-xl font-bold h-10 px-6 text-slate-500" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function PartnerDetailsDialog({ partner, onClose, onNewLink }: { partner: UserPartner, onClose: () => void, onNewLink: () => void }) {
    const { data } = useGetPartnerItems(partner.partnershipId);
    
    return (
        <Dialog open={!!partner} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl rounded-3xl p-0 overflow-hidden border-0 shadow-3xl bg-slate-50">
                <div className="flex flex-col h-[80vh] md:h-auto">
                    <div className="p-6 md:p-8 bg-white border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14 border border-slate-50 shadow-md">
                                <AvatarImage src={partner.partnerProfilePicture || ''} />
                                <AvatarFallback className="font-bold text-lg">{partner.partnerName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-black text-slate-900">{partner.partnerName}</h2>
                                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                                    <MapPin className="h-3 w-3 text-orange-500" /> {partner.postcodes.join(', ') || 'Global Partner'}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl border-slate-200 font-bold hover:bg-slate-50" onClick={onClose}>Close</Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <PlusCircle className="h-5 w-5 text-orange-600" /> Integrations
                                </h3>
                                <Button size="sm" className="rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md" onClick={onNewLink}>
                                    New Link
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {data?.activeLinks?.length > 0 ? data.activeLinks.map((link: any) => (
                                    <Card key={`link-${link.id}`} className="rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-all">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                                    {link.baseProduct ? <LayoutGrid size={16} /> : <Handshake size={16} />}
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Your Base</p>
                                                    <p className="font-bold text-slate-800 text-xs">{link.baseProduct?.title || link.baseService?.name}</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="text-slate-300 h-4 w-4" />
                                            <div className="flex items-center gap-3 text-right">
                                                <div>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Partner Plus</p>
                                                    <p className="font-bold text-slate-800 text-xs">{link.plusProduct?.title || link.plusService?.name}</p>
                                                </div>
                                                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                                    {link.plusProduct ? <LayoutGrid size={16} /> : <Handshake size={16} />}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )) : (
                                    <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-slate-200">
                                        <p className="text-slate-400 font-medium text-sm mb-4">No active links yet.</p>
                                        <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                                            Cross-sell products with this partner to boost revenue.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="pt-8 border-t border-slate-100">
                             <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-emerald-500" /> Collaboration Stats
                             </h3>
                             <div className="grid grid-cols-2 gap-4">
                                 <Card className="rounded-2xl bg-white border-slate-100 p-4 shadow-sm">
                                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Shared Revenue</p>
                                     <p className="text-2xl font-black text-slate-800">£0.00</p>
                                 </Card>
                                 <Card className="rounded-2xl bg-white border-slate-100 p-4 shadow-sm">
                                     <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Cross-Sales</p>
                                     <p className="text-2xl font-black text-slate-800">0</p>
                                 </Card>
                             </div>
                        </section>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function NewIntegrationDialog({ open, onOpenChange, partner, onRequested }: { open: boolean, onOpenChange: (open: boolean) => void, partner: UserPartner, onRequested: () => void }) {
    const { userId: currentUserId } = useAppSelector((state) => state.auth);
    const { data: myProducts } = useGetProductsByUserId(currentUserId || '');
    const { data: myServices } = useGetServicesByUserId(currentUserId || '');
    const { data: partnerProducts } = useGetProductsByUserId(partner.partnerId);
    const { data: partnerServices } = useGetServicesByUserId(partner.partnerId);

    const [selectedBase, setSelectedBase] = useState<{ id: string, type: 'product' | 'service' } | null>(null);
    const [selectedPlus, setSelectedPlus] = useState<{ id: string, type: 'product' | 'service' } | null>(null);

    const { mutate: createRequest, isPending } = useCreateItemPartnershipRequest();

    const handlePropose = () => {
        if (!selectedBase || !selectedPlus) return;

        createRequest({
            userPartnershipId: partner.partnershipId,
            baseProductId: selectedBase.type === 'product' ? selectedBase.id : undefined,
            baseServiceId: selectedBase.type === 'service' ? selectedBase.id : undefined,
            plusProductId: selectedPlus.type === 'product' ? selectedPlus.id : undefined,
            plusServiceId: selectedPlus.type === 'service' ? selectedPlus.id : undefined,
        }, {
            onSuccess: () => onRequested(),
            onError: (err: any) => toast.error(err.message || 'Failed to propose link'),
        });
    };

    const myItems = [
        ...(myProducts?.map(p => ({ ...p, type: 'product' })) || []),
        ...(myServices?.map(s => ({ ...s, type: 'service' })) || [])
    ];

    const partnerItems = [
        ...(partnerProducts?.map(p => ({ ...p, type: 'product' })) || []),
        ...(partnerServices?.map(s => ({ ...s, type: 'service' })) || [])
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl rounded-3xl p-0 overflow-hidden border-0 shadow-3xl bg-white">
                <div className="p-8 space-y-8">
                    <div>
                        <DialogTitle className="text-3xl font-black text-slate-900 mb-2">Propose "Plus" Link</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-slate-500">
                            Select one of your items and one of {partner.partnerName}'s items to link them together.
                        </DialogDescription>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* My Items */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-black uppercase tracking-widest text-orange-600">Your Items</h4>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                                {myItems.map(item => (
                                    <div 
                                        key={item.id}
                                        onClick={() => setSelectedBase({ id: item.id, type: item.type as any })}
                                        className={cn(
                                            "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
                                            selectedBase?.id === item.id ? "bg-orange-50 border-orange-600 ring-2 ring-orange-100" : "bg-white border-slate-100 hover:border-orange-200"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2 rounded-lg", item.type === 'product' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600")}>
                                                {item.type === 'product' ? <LayoutGrid size={16} /> : <Handshake size={16} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{item.title || item.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.type}</p>
                                            </div>
                                        </div>
                                        {selectedBase?.id === item.id && <CheckCircle className="h-5 w-5 text-orange-600" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Partner Items */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-black uppercase tracking-widest text-amber-600">{partner.partnerName}'s Items</h4>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                                {partnerItems.map(item => (
                                    <div 
                                        key={item.id}
                                        onClick={() => setSelectedPlus({ id: item.id, type: item.type as any })}
                                        className={cn(
                                            "p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between",
                                            selectedPlus?.id === item.id ? "bg-amber-50 border-amber-600 ring-2 ring-amber-100" : "bg-white border-slate-100 hover:border-orange-200"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2 rounded-lg", item.type === 'product' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600")}>
                                                {item.type === 'product' ? <LayoutGrid size={16} /> : <Handshake size={16} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{item.title || item.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.type}</p>
                                            </div>
                                        </div>
                                        {selectedPlus?.id === item.id && <CheckCircle className="h-5 w-5 text-amber-600" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                         {selectedBase && selectedPlus ? (
                             <div className="flex items-center gap-6">
                                 <div className="text-center">
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Base</p>
                                     <p className="font-black text-slate-800">{myItems.find(i => i.id === selectedBase.id)?.title || myItems.find(i => i.id === selectedBase.id)?.name}</p>
                                 </div>
                                 <PlusCircle className="h-8 w-8 text-orange-600" />
                                 <div className="text-center">
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Partner Plus</p>
                                     <p className="font-black text-slate-800">{partnerItems.find(i => i.id === selectedPlus.id)?.title || partnerItems.find(i => i.id === selectedPlus.id)?.name}</p>
                                 </div>
                             </div>
                         ) : (
                             <p className="text-sm font-bold text-slate-400 italic">Select one item from each side to propose a link</p>
                         )}
                    </div>
                </div>
                <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
                    <Button variant="ghost" className="rounded-xl font-bold h-12 px-8 text-slate-500" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button 
                        className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-black h-12 px-10 shadow-xl shadow-orange-500/20"
                        disabled={!selectedBase || !selectedPlus || isPending}
                        onClick={handlePropose}
                    >
                        {isPending ? 'Sending Proposal...' : 'Propose Integration'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
