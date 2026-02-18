'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    ActivityTimerType,
    ActivityTaskType,
    PublishTaskDto
} from '@/app/admin/types/activity-timer';
import { usePublishActivityTask } from '@/service/activity-timer';
import { useGetTiers } from '@/service/tiers/hook';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Send, Info, ArrowLeft } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ActivityTimerAddPage() {
    const router = useRouter();
    const publishMutation = usePublishActivityTask();
    const { data: tiers } = useGetTiers();

    const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<PublishTaskDto>({
        defaultValues: {
            title: '',
            description: '',
            key: ActivityTaskType.CREATE_BUSINESS,
            type: ActivityTimerType.GENERAL,
            actionUrl: '/dashboard',
            durationDays: 7,
            includedTierIds: [],
            excludedTierIds: [],
        }
    });

    const watchedType = watch('type');
    const includedTierIds = watch('includedTierIds') || [];
    const excludedTierIds = watch('excludedTierIds') || [];

    const onSubmit = async (data: PublishTaskDto) => {
        try {
            // Clean payload
            const payload = { ...data };

            if (payload.type === ActivityTimerType.TRIAL) {
                delete payload.expiresAt;
                delete payload.durationDays;
            } else {
                // General Task
                if (!payload.expiresAt) {
                    delete payload.expiresAt;
                }
            }

            await publishMutation.mutateAsync(payload);
            toast.success('Task published successfully');
            router.push('/admin/activity-timer');
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/admin/activity-timer">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Publish New Task</h1>
                    <p className="text-slate-500">Create regular or trial tasks for users.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Task Details</CardTitle>
                        <CardDescription>Define the task to be sent to users.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Title & Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Task Title <span className="text-red-500">*</span></Label>
                                <Input {...register('title', { required: 'Title is required' })} placeholder="e.g. Complete Profile" />
                                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label>Task Type</Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Info className="h-4 w-4 text-slate-400" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                                <p className="font-semibold mb-1">Trial vs General:</p>
                                                <ul className="list-disc pl-4 text-xs space-y-1">
                                                    <li><strong>Trial:</strong> Linked to the user's global trial timer. If they pause their trial, this task is effectively paused too. Expiry is dynamic.</li>
                                                    <li><strong>General:</strong> Has a fixed deadline. Independent of trial pauses. Good for challenges or flash tasks.</li>
                                                </ul>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <Select
                                    onValueChange={(val) => setValue('type', val as ActivityTimerType)}
                                    value={watch('type')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ActivityTimerType.TRIAL}>Trial Task</SelectItem>
                                        <SelectItem value={ActivityTimerType.GENERAL}>General Task</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea {...register('description')} placeholder="Instructions for the user..." />
                        </div>

                        {/* Functional Config */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>System Key <span className="text-red-500">*</span></Label>
                                <Select
                                    onValueChange={(val) => setValue('key', val as ActivityTaskType)}
                                    value={watch('key')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.values(ActivityTaskType).map(t => (
                                            <SelectItem key={t} value={t}>
                                                {t.replace(/_/g, ' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-[10px] text-slate-400">Used for automated tracking/completion.</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Action URL</Label>
                                <Input {...register('actionUrl')} placeholder="/dashboard/..." />
                            </div>
                        </div>

                        {/* Timing Logic */}
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                <Info className="h-4 w-4 text-blue-500" />
                                {watchedType === ActivityTimerType.TRIAL ? 'Trial Timing' : 'General Timing'}
                            </h3>

                            {watchedType === ActivityTimerType.TRIAL ? (
                                <p className="text-sm text-slate-600">
                                    This task will expire when the user's <strong>Trial Period</strong> ends.
                                    The exact date depends on when they joined and any pauses they used.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Duration (Days)</Label>
                                        <Input
                                            type="number"
                                            {...register('durationDays', { valueAsNumber: true, min: 1 })}
                                            placeholder="7"
                                        />
                                        <p className="text-xs text-slate-500">Task will expire this many days after publishing.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-400">OR Fixed Expiry Date</Label>
                                        <Input type="datetime-local" {...register('expiresAt')} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Tier Visibility (Replaces Target Audience) */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tier Visibility</CardTitle>
                        <CardDescription>Control which membership tiers can see this task.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Included Tiers */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Included Tiers</Label>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="all-tiers-included"
                                        checked={includedTierIds.length === 0}
                                        onCheckedChange={(checked) => {
                                            if (checked) setValue('includedTierIds', []);
                                        }}
                                    />
                                    <Label htmlFor="all-tiers-included" className="text-sm text-slate-600">Include All (Default)</Label>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-4 border-l-2 border-green-200">
                                {tiers?.map((tier: any) => (
                                    <div key={`inc-${tier.id}`} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`inc-tier-${tier.id}`}
                                            checked={includedTierIds.includes(tier.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setValue('includedTierIds', [...includedTierIds, tier.id]);
                                                } else {
                                                    setValue('includedTierIds', includedTierIds.filter(id => id !== tier.id));
                                                }
                                            }}
                                        />
                                        <Label htmlFor={`inc-tier-${tier.id}`}>{tier.name}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Excluded Tiers */}
                        <div className="space-y-3 pt-4 border-t">
                            <Label className="text-base font-semibold">Excluded Tiers</Label>
                            <p className="text-xs text-slate-500">Users in these tiers will NOT see this task, even if included above.</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-4 border-l-2 border-red-200">
                                {tiers?.map((tier: any) => (
                                    <div key={`exc-${tier.id}`} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`exc-tier-${tier.id}`}
                                            checked={excludedTierIds.includes(tier.id)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setValue('excludedTierIds', [...excludedTierIds, tier.id]);
                                                } else {
                                                    setValue('excludedTierIds', excludedTierIds.filter(id => id !== tier.id));
                                                }
                                            }}
                                        />
                                        <Label htmlFor={`exc-tier-${tier.id}`}>{tier.name}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button
                        type="submit"
                        size="lg"
                        className="bg-slate-900 hover:bg-slate-800"
                        disabled={publishMutation.isPending}
                    >
                        {publishMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Send className="h-4 w-4 mr-2" />
                        )}
                        Publish Task
                    </Button>
                </div>
            </form>
        </div>
    );
}
