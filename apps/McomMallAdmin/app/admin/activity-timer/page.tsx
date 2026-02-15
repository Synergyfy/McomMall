'use client';

import Link from 'next/link';
import { useGetActivityTimerDefinitions } from '@/service/activity-timer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Loader2, Calendar, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ActivityTimerType } from '@/app/admin/types/activity-timer';
import { useGetTiers } from '@/service/tiers/hook';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ActivityTimerListPage() {
    const { data: definitions, isLoading } = useGetActivityTimerDefinitions();
    const { data: tiers } = useGetTiers();

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Activity Timer Tasks</h1>
                    <p className="text-slate-500">Manage tasks published to user activity feeds.</p>
                </div>
                <Link href="/admin/activity-timer/add">
                    <Button className="bg-slate-900 hover:bg-slate-800">
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Task
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Published Tasks</CardTitle>
                    <CardDescription>A log of all tasks sent to users.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    ) : !definitions || definitions.length === 0 ? (
                        <div className="text-center p-8 text-slate-500">
                            No tasks found. Click "Create New Task" to get started.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Key</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead>Created At</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {definitions.map((def) => (
                                    <TableRow key={def.id}>
                                        <TableCell className="font-medium">
                                            <div>{def.title}</div>
                                            <div className="text-xs text-slate-500 truncate max-w-[200px]">{def.description}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                def.type === ActivityTimerType.TRIAL
                                                    ? "bg-orange-50 text-orange-700 border-orange-200"
                                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                            }>
                                                {def.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs text-slate-600">
                                            {def.key.replace(/_/g, ' ')}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 text-xs text-slate-600">
                                                <div className="flex items-center gap-1">
                                                    <Target className="h-3 w-3 text-green-600" />
                                                    {def.type === ActivityTimerType.TRIAL
                                                        ? 'Trial Tier'
                                                        : (!def.includedTierIds || def.includedTierIds.length === 0
                                                            ? 'All Tiers'
                                                            : (
                                                                <TooltipProvider>
                                                                    <Tooltip>
                                                                        <TooltipTrigger className="cursor-help underline decoration-dotted underline-offset-2">
                                                                            {def.includedTierIds.length} Tier(s)
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <div className="text-xs">
                                                                                <p className="font-semibold mb-1">Included Tiers:</p>
                                                                                <ul className="list-disc pl-3">
                                                                                    {def.includedTierIds.map(id => {
                                                                                        const tier = tiers?.find((t: any) => t.id === id);
                                                                                        return <li key={id}>{tier?.name || 'Unknown Tier'}</li>
                                                                                    })}
                                                                                </ul>
                                                                            </div>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </TooltipProvider>
                                                            )
                                                        )
                                                    }
                                                </div>
                                                {def.excludedTierIds && def.excludedTierIds.length > 0 && (
                                                    <div className="flex items-center gap-1 text-red-500">
                                                        <span className="font-semibold">Excl:</span>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger className="cursor-help underline decoration-dotted underline-offset-2">
                                                                    {def.excludedTierIds.length} Tier(s)
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <div className="text-xs">
                                                                        <p className="font-semibold mb-1">Excluded Tiers:</p>
                                                                        <ul className="list-disc pl-3">
                                                                            {def.excludedTierIds.map(id => {
                                                                                const tier = tiers?.find((t: any) => t.id === id);
                                                                                return <li key={id}>{tier?.name || 'Unknown Tier'}</li>
                                                                            })}
                                                                        </ul>
                                                                    </div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-xs">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(def.createdAt).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
