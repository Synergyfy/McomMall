'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Calendar, ArrowLeft, Trash2, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Season, CreateSeasonInput } from '@/app/admin/types/season';
import { format, addMonths, addYears } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


// Mock data for initial demonstration
const MOCK_SEASONS: Season[] = [
    {
        id: '1',
        name: 'Summer Sale 2026',
        startDate: '2026-06-01',
        endDate: '2026-08-31',
        durationType: 'quarterly',
        isActive: true,
    },
    {
        id: '2',
        name: 'Winter Holidays 2026',
        startDate: '2026-12-01',
        endDate: '2027-01-15',
        durationType: 'monthly',
        isActive: false,
    }
];


export default function SeasonsPage() {
    const router = useRouter();
    const [seasons, setSeasons] = useState<Season[]>(MOCK_SEASONS);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newSeason, setNewSeason] = useState<CreateSeasonInput>({
        name: '',
        startDate: '',
        endDate: '',
        durationType: 'monthly',
        isActive: true,
    });

    const calculateEndDate = (start: string, duration: Season['durationType']) => {
        if (!start) return '';
        const startDate = new Date(start);
        let endDate;
        if (duration === 'monthly') endDate = addMonths(startDate, 1);
        else if (duration === 'quarterly') endDate = addMonths(startDate, 3);
        else if (duration === 'annual') endDate = addYears(startDate, 1);
        else return '';

        return format(endDate, 'yyyy-MM-dd');
    };

    const handleDurationChange = (duration: Season['durationType']) => {
        const endDate = calculateEndDate(newSeason.startDate, duration);
        setNewSeason({ ...newSeason, durationType: duration, endDate });
    };

    const handleStartDateChange = (start: string) => {
        const endDate = calculateEndDate(start, newSeason.durationType);
        setNewSeason({ ...newSeason, startDate: start, endDate });
    };


    const handleCreateSeason = () => {
        const season: Season = {
            ...newSeason,
            id: Math.random().toString(36).substr(2, 9),
        };
        setSeasons([...seasons, season]);
        setIsDialogOpen(false);
        setNewSeason({ name: '', startDate: '', endDate: '', durationType: 'monthly', isActive: true });
    };


    const handleSelectSeason = (season: Season) => {
        // Corrected URL from /admin/tiers/new to /admin/tiers
        router.push(`/admin/tiers?type=seasonal&seasonId=${season.id}&startDate=${season.startDate}&endDate=${season.endDate}`);
    };


    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push('/admin/tiers')} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Tiers
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Seasons Management</h1>
                    <p className="text-slate-500">Define time-bounded periods for seasonal subscription tiers.</p>
                </div>
            </div>

            <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                        <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-semibold text-blue-900">Create a New Season</p>
                        <p className="text-sm text-blue-700">Set up a name and date range to start creating seasonal tiers.</p>
                    </div>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" /> Create Season
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {seasons.map((season) => (
                    <Card key={season.id} className="hover:shadow-md transition-shadow cursor-default">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-xl">{season.name}</CardTitle>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="capitalize">
                                        {season.durationType === 'monthly' ? '1m' : season.durationType === 'quarterly' ? '3m' : '12m'}
                                    </Badge>
                                    <Badge variant={season.isActive ? "default" : "secondary"}>
                                        {season.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                            <CardDescription>
                                {format(new Date(season.startDate), 'PPP')} - {format(new Date(season.endDate), 'PPP')}
                            </CardDescription>

                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-slate-500 bg-slate-50 p-3 rounded-md border border-slate-100">
                                <p>Tiers created for this season will inherit this date range automatically.</p>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-4 flex justify-between">
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 hover:text-red-500 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button size="sm" onClick={() => handleSelectSeason(season)}>
                                Select & Create Tier
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Season</DialogTitle>
                        <DialogDescription>
                            Define the name and timeframe for your seasonal campaign.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Season Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., Summer Holiday 2026"
                                value={newSeason.name}
                                onChange={(e) => setNewSeason({ ...newSeason, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={newSeason.startDate}
                                    onChange={(e) => handleStartDateChange(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="durationType">Duration Type</Label>
                                <Select value={newSeason.durationType} onValueChange={(val: any) => handleDurationChange(val)}>
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
                                value={newSeason.endDate}
                                readOnly
                                className="bg-slate-50 text-slate-500 italic"
                            />
                        </div>

                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={handleCreateSeason}
                            disabled={!newSeason.name || !newSeason.startDate || !newSeason.endDate}
                        >
                            Save Season
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
