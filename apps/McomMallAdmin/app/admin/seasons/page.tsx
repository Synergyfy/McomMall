'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar, ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format, addMonths, addYears } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetSeasons, useCreateSeason } from '@/service/seasons/hook';
import type { Season } from '@/service/seasons/api';

type DurationType = 'monthly' | 'quarterly' | 'annual';

function isCurrentlyActive(season: Season): boolean {
    const now = Date.now();
    const start = new Date(season.startDate).getTime();
    const end = new Date(season.endDate).getTime();
    return !isNaN(start) && !isNaN(end) && start <= now && now <= end;
}

export default function SeasonsPage() {
    const router = useRouter();
    const { data, isLoading, isError, error, refetch } = useGetSeasons();
    const createSeason = useCreateSeason();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [durationType, setDurationType] = useState<DurationType>('monthly');
    const [endDate, setEndDate] = useState('');

    const calculateEndDate = (start: string, duration: DurationType): string => {
        if (!start) return '';
        const startD = new Date(start);
        let end: Date;
        if (duration === 'monthly') end = addMonths(startD, 1);
        else if (duration === 'quarterly') end = addMonths(startD, 3);
        else end = addYears(startD, 1);
        return format(end, 'yyyy-MM-dd');
    };

    const handleDurationChange = (duration: DurationType) => {
        setDurationType(duration);
        setEndDate(calculateEndDate(startDate, duration));
    };

    const handleStartDateChange = (start: string) => {
        setStartDate(start);
        setEndDate(calculateEndDate(start, durationType));
    };

    const handleCreateSeason = () => {
        createSeason.mutate(
            {
                name: name.trim(),
                description: description.trim() || undefined,
                startDate,
                endDate,
            },
            {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    setName('');
                    setDescription('');
                    setStartDate('');
                    setEndDate('');
                    setDurationType('monthly');
                },
            },
        );
    };

    const seasons = data ?? [];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push('/admin/plans')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Plans
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Seasons Management</h1>
                    <p className="text-slate-500">Live operational seasons and calendar windows.</p>
                </div>
            </div>

            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-semibold text-blue-900">Create a New Season</p>
                        <p className="text-sm text-blue-700">Set up a seasonal date window and operational calendar schedule.</p>
                    </div>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" /> Create Season
                </Button>
            </div>

            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-48 rounded-xl bg-slate-100 animate-pulse" />
                    ))}
                </div>
            )}

            {isError && (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load seasons: {(error as Error)?.message ?? 'Unknown error'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            {!isLoading && !isError && seasons.length === 0 && (
                <Card>
                    <CardContent className="p-12 text-center text-sm text-slate-400">
                        No seasons yet. Create one to schedule seasonal periods.
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {seasons.map((season) => {
                    const active = isCurrentlyActive(season);
                    return (
                        <Card key={season.id} className="hover:shadow-md transition-shadow cursor-default">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-xl">{season.name}</CardTitle>
                                    <Badge variant={active ? 'default' : 'secondary'}>
                                        {active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <CardDescription>
                                    {format(new Date(season.startDate), 'PPP')} - {format(new Date(season.endDate), 'PPP')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-md border border-slate-100">
                                    <p>{season.description || 'Seasonal calendar window active in system.'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Season</DialogTitle>
                        <DialogDescription>
                            Creates a live season via POST /seasons.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Season Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Summer Holiday 2026"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Optional description..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => handleStartDateChange(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="durationType">Duration Type</Label>
                                <Select value={durationType} onValueChange={(val: DurationType) => handleDurationChange(val)}>
                                    <SelectTrigger id="durationType">
                                        <SelectValue placeholder="Select duration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="monthly">Monthly (1 Month)</SelectItem>
                                        <SelectItem value="quarterly">Quarterly (3 Months)</SelectItem>
                                        <SelectItem value="annual">Annual (1 Year)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endDate" className="text-slate-500">End Date (Calculated)</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                readOnly
                                className="bg-slate-50 text-slate-500 italic"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleCreateSeason}
                            disabled={!name.trim() || !startDate || !endDate || createSeason.isPending}
                        >
                            {createSeason.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Save Season
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
