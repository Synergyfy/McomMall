'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    GraduationCap,
    Upload,
    Video,
    FileText,
    PlayCircle,
    Trash2,
    Eye,
    EyeOff,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    useGetTrainingModules,
    useCreateTrainingModule,
    useToggleTrainingPublish,
    useDeleteTrainingModule,
} from '@/service/training/hook';
import type { TrainingKind, TrainingModuleRecord } from '@/service/training/types';

function ModuleCard({
    module,
    onToggle,
    onDelete,
    toggling,
}: {
    module: TrainingModuleRecord;
    onToggle: () => void;
    onDelete: () => void;
    toggling: boolean;
}) {
    return (
        <Card className="overflow-hidden">
            <div className="aspect-video bg-slate-100 flex items-center justify-center relative">
                {module.kind === 'course' ? (
                    <PlayCircle className="h-12 w-12 text-slate-300" />
                ) : module.kind === 'webinar' ? (
                    <Video className="h-12 w-12 text-slate-300" />
                ) : (
                    <FileText className="h-12 w-12 text-slate-300" />
                )}
                <Badge
                    variant={module.isPublished ? 'default' : 'secondary'}
                    className="absolute top-2 right-2"
                >
                    {module.isPublished ? 'Published' : 'Hidden'}
                </Badge>
            </div>
            <CardContent className="p-4">
                <h3 className="font-semibold text-slate-900 mb-1">{module.title}</h3>
                {module.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-2">{module.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span>
                        {module.durationMinutes != null ? `${module.durationMinutes}m` : '—'}
                        {module.contentUrl ? ' · Linked' : ''}
                    </span>
                    <span>{module.created_at ? new Date(module.created_at).toLocaleDateString() : ''}</span>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" disabled={toggling} onClick={onToggle}>
                        {module.isPublished ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                        {module.isPublished ? 'Hide' : 'Publish'}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={onDelete}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function KindTab({ kind, emptyLabel }: { kind: TrainingKind; emptyLabel: string }) {
    const { data, isLoading, isError, error, refetch } = useGetTrainingModules(kind);
    const toggle = useToggleTrainingPublish();
    const remove = useDeleteTrainingModule();
    const modules = data ?? [];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="h-56 rounded-xl bg-slate-100 animate-pulse" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <Card className="border-rose-200 bg-rose-50">
                <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                    <AlertTriangle className="h-4 w-4" />
                    Failed to load: {(error as Error)?.message ?? 'Unknown error'}
                    <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (modules.length === 0) {
        return (
            <Card>
                <CardContent className="p-8 text-center text-slate-500">{emptyLabel}</CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modules.map((m) => (
                <ModuleCard
                    key={m.id}
                    module={m}
                    toggling={toggle.isPending}
                    onToggle={() => toggle.mutate({ id: m.id, isPublished: !m.isPublished })}
                    onDelete={() => {
                        if (confirm(`Delete "${m.title}"?`)) remove.mutate(m.id);
                    }}
                />
            ))}
        </div>
    );
}

export default function TrainingPage() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [kind, setKind] = useState<TrainingKind>('course');
    const [description, setDescription] = useState('');
    const [contentUrl, setContentUrl] = useState('');
    const [duration, setDuration] = useState('');
    const create = useCreateTrainingModule();

    const handleCreate = () => {
        if (!title.trim()) return;
        create.mutate(
            {
                title: title.trim(),
                kind,
                description: description.trim() || undefined,
                contentUrl: contentUrl.trim() || undefined,
                durationMinutes: duration ? Number(duration) : undefined,
                isPublished: true,
            },
            {
                onSuccess: () => {
                    setDialogOpen(false);
                    setTitle('');
                    setDescription('');
                    setContentUrl('');
                    setDuration('');
                    setKind('course');
                },
            },
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Training Hub</h1>
                    <p className="text-slate-500">Live educational resources from the API</p>
                </div>
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Resource
                </Button>
            </div>

            <Tabs defaultValue="course" className="space-y-6">
                <TabsList className="bg-white border p-1">
                    <TabsTrigger value="course" className="gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Courses
                    </TabsTrigger>
                    <TabsTrigger value="webinar" className="gap-2">
                        <Video className="h-4 w-4" />
                        Webinars
                    </TabsTrigger>
                    <TabsTrigger value="doc" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Documentation
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="course">
                    <KindTab kind="course" emptyLabel="No courses published yet." />
                </TabsContent>
                <TabsContent value="webinar">
                    <KindTab kind="webinar" emptyLabel="No upcoming webinars scheduled." />
                </TabsContent>
                <TabsContent value="doc">
                    <KindTab kind="doc" emptyLabel="No documents uploaded yet." />
                </TabsContent>
            </Tabs>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Resource</DialogTitle>
                        <DialogDescription>Publishes a live training resource via POST /training.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label>Title *</Label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Seller Onboarding 101" />
                        </div>
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={kind} onValueChange={(v) => setKind(v as TrainingKind)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="course">Course</SelectItem>
                                    <SelectItem value="webinar">Webinar</SelectItem>
                                    <SelectItem value="doc">Documentation</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What will learners get?" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Content URL</Label>
                                <Input value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} placeholder="https://…" />
                            </div>
                            <div className="space-y-2">
                                <Label>Duration (minutes)</Label>
                                <Input type="number" min="0" value={duration} onChange={(e) => setDuration(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className={cn('bg-orange-500 hover:bg-orange-600')}
                            disabled={!title.trim() || create.isPending}
                            onClick={handleCreate}
                        >
                            {create.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Publish
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
