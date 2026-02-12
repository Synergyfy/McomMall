'use client';

import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, UserPlus, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        id: string;
        name: string;
        avatarUrl?: string;
        role?: string;
        createdAt?: string;
        isVerified?: boolean;
        trustScore?: number;
    };
    onChatStart: () => void;
}

export function UserProfileModal({
    isOpen,
    onClose,
    user,
    onChatStart,
}: UserProfileModalProps) {
    const [trustScore, setTrustScore] = useState(0);

    // Animate trust score
    useEffect(() => {
        if (isOpen) {
            const targetScore = user.trustScore || (user.isVerified ? 92 : 65);
            const timer = setTimeout(() => setTrustScore(targetScore), 100);
            return () => clearTimeout(timer);
        } else {
            setTrustScore(0);
        }
    }, [isOpen, user.isVerified, user.trustScore]);

    const verifiedDate = user.createdAt
        ? format(new Date(user.createdAt), 'MMM yyyy')
        : 'N/A';

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md overflow-hidden p-0 gap-0 border-0 rounded-2xl">
                <div className="p-6 bg-white">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                    <AvatarFallback className="bg-green-100 text-green-700 text-xl font-bold">
                                        {user.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                {user.isVerified && (
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                        <CheckCircle className="h-5 w-5 text-green-500 fill-green-50" />
                                    </div>
                                )}
                            </div>

                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                                <Badge
                                    variant="secondary"
                                    className="mt-1 bg-green-50 text-green-700 hover:bg-green-100 font-medium border border-green-100/50"
                                >
                                    {user.role || 'Member'}
                                </Badge>
                            </div>
                        </div>

                        <Link
                            href={`/profile/${user.id}`}
                            className="text-sm font-semibold text-gray-400 hover:text-green-600 transition-colors"
                        >
                            Profile
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                Trust Score
                            </p>
                            <div className="flex items-center gap-3">
                                <Progress
                                    value={trustScore}
                                    className="h-2 flex-1 bg-gray-200"
                                // Note: The indicator color is handled by the Progress component or CSS usually, 
                                // but standard Progress uses primary color. We might need custom styling if not green.
                                />
                                <span className="font-bold text-gray-900">{trustScore}%</span>
                            </div>
                        </div>

                        <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                Verified Since
                            </p>
                            <p className="font-bold text-gray-900 text-lg">{verifiedDate}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full py-6 text-green-700 border-green-200 hover:bg-green-50 hover:text-green-800 hover:border-green-300 transition-all rounded-xl font-semibold"
                        >
                            <UserPlus className="mr-2 h-5 w-5" />
                            Connect with Lister
                        </Button>

                        <Button
                            className="w-full py-6 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 rounded-xl font-semibold transition-all"
                            onClick={() => {
                                onChatStart();
                                onClose();
                            }}
                        >
                            <MessageSquare className="mr-2 h-5 w-5" />
                            Secure Chat
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
