'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
    ActivityTimerType,
    ActivityTaskType,
    CreateTemplateDto,
    ActivityTaskDto
} from '@/app/admin/types/activity-timer';
import {
    useCreateActivityTemplate,
    useGetActivityTemplates,
    useGetActivityTemplate,
    useUpdateActivityTemplate,
    useDeleteActivityTemplate,
    useAssignActivityTemplate
} from '@/service/activity-timer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Plus,
    Clock,
    Calendar,
    CheckCircle2,
    AlertCircle,
    MoreVertical,
    Pencil,
    Trash2,
    Loader2,
    ListTodo,
    Timer,
    ArrowLeft,
    Play
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function ActivityTimerPage() {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // API Hooks
    const { data: templatesData, isLoading } = useGetActivityTemplates();
    const deleteMutation = useDeleteActivityTemplate();

    const handleCreate = () => {
        setSelectedId(null);
        setView('form');
    };

    const handleEdit = (id: string) => {
        setSelectedId(id);
        setView('form');
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this template?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const assignMutation = useAssignActivityTemplate();
    const handleTestAssign = async (id: string) => {
        if (confirm('Assign this template to your admin account for testing?')) {
            await assignMutation.mutateAsync(id);
        }
    };

    return (
        <div className="space-y-6">
            {view === 'list' ? (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Activity Timers</h1>
                            <p className="text-slate-500">Manage trial periods and time-bound challenges</p>
                        </div>
                        <Button onClick={handleCreate} className="bg-orange-500 hover:bg-orange-600">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Template
                        </Button>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="p-8 text-center text-slate-500">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                    Loading templates...
                                </div>
                            ) : templatesData?.length ? (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Template Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Duration</TableHead>
                                            <TableHead>Tasks</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {templatesData.map((template) => (
                                            <TableRow key={template.id}>
                                                <TableCell className="font-medium">
                                                    <div>{template.name}</div>
                                                    {template.description && (
                                                        <div className="text-xs text-slate-400 truncate max-w-[200px]">
                                                            {template.description}
                                                        </div>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={cn(
                                                        template.type === ActivityTimerType.TRIAL
                                                            ? "bg-blue-50 text-blue-700 border-blue-200"
                                                            : "bg-purple-50 text-purple-700 border-purple-200"
                                                    )}>
                                                        {template.type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1 text-slate-600">
                                                        <Clock className="h-3 w-3" />
                                                        {template.durationDays} Days
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-mono">
                                                        {template.tasks.length}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={template.isPublished ? 'default' : 'secondary'} className={cn(
                                                        template.isPublished ? "bg-emerald-500 hover:bg-emerald-600" : ""
                                                    )}>
                                                        {template.isPublished ? 'Active' : 'Draft'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(template.id)}>
                                                        <Pencil className="h-4 w-4 text-blue-600" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(template.id)}>
                                                        <Trash2 className="h-4 w-4 text-red-600" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <div className="p-12 text-center text-slate-500">
                                    <Timer className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                                    <h3 className="text-lg font-medium text-slate-900">No Activity Timers</h3>
                                    <p>Create your first trial or challenge template.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <TemplateForm
                    id={selectedId}
                    onCancel={() => setView('list')}
                    onSuccess={() => setView('list')}
                />
            )
            }
        </div >
    );
}

function TemplateForm({ id, onCancel, onSuccess }: { id: string | null, onCancel: () => void, onSuccess: () => void }) {
    const { data: template, isLoading } = useGetActivityTemplate(id);
    const createMutation = useCreateActivityTemplate();
    const updateMutation = useUpdateActivityTemplate();

    const methods = useForm<CreateTemplateDto>({
        defaultValues: {
            name: '',
            description: '',
            type: ActivityTimerType.TRIAL,
            durationDays: 14,
            isPublished: false,
            isForAllTiers: true,
            tasks: []
        }
    });

    const { control, register, watch, reset, setValue, handleSubmit } = methods;
    const { fields, append, remove } = useFieldArray({
        control,
        name: "tasks"
    });

    const watchedType = watch('type');

    useEffect(() => {
        if (template && id) {
            reset({
                name: template.name,
                description: template.description,
                type: template.type,
                durationDays: template.durationDays,
                isPublished: template.isPublished,
                isForAllTiers: template.isForAllTiers,
                tasks: template.tasks
            });
        }
    }, [template, id, reset]);

    const onSubmit = async (data: CreateTemplateDto) => {
        try {
            if (id) {
                await updateMutation.mutateAsync({ id, data });
            } else {
                await createMutation.mutateAsync(data);
            }
            onSuccess();
        } catch (error) {
            console.error(error);
        }
    };

    if (id && isLoading) {
        return <div className="p-8 flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={onCancel}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">
                        {id ? 'Edit Template' : 'Create New Template'}
                    </h2>
                    <p className="text-sm text-slate-500">
                        {id ? 'Update existing activity settings' : 'Define a new activity timer'}
                    </p>
                </div>
            </div>

            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Basic Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-medium">Template Name</label>
                                <Input {...register('name', { required: true })} placeholder="e.g. 14-Day Free Trial" />
                            </div>

                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea {...register('description')} placeholder="Internal description..." />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <Select
                                    onValueChange={(val) => setValue('type', val as ActivityTimerType)}
                                    defaultValue={watch('type')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ActivityTimerType.TRIAL}>Trial (Onboarding)</SelectItem>
                                        <SelectItem value={ActivityTimerType.GENERAL}>General (Challenge)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Duration (Days)</label>
                                <Input
                                    type="number"
                                    {...register('durationDays', { valueAsNumber: true, min: 1 })}
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-8">
                                <Switch
                                    checked={watch('isPublished')}
                                    onCheckedChange={(checked) => setValue('isPublished', checked)}
                                />
                                <label className="text-sm font-medium">Publish Immediately</label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Task Builder */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Task List</CardTitle>
                                <CardDescription>Define the steps users need to complete</CardDescription>
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={() => append({
                                key: ActivityTaskType.CREATE_BUSINESS,
                                title: '',
                                description: '',
                                url: ''
                            })}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Task
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="p-4 border rounded-lg bg-slate-50 relative group">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-slate-500">Task Type</label>
                                            <Select
                                                onValueChange={(val) => setValue(`tasks.${index}.key`, val as ActivityTaskType)}
                                                defaultValue={watch(`tasks.${index}.key`)}
                                            >
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.values(ActivityTaskType).map(t => (
                                                        <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-slate-500">Title</label>
                                            <Input {...register(`tasks.${index}.title` as const, { required: true })} className="bg-white" placeholder="e.g. Create Profile" />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-xs font-bold uppercase text-slate-500">Description</label>
                                            <Input {...register(`tasks.${index}.description` as const)} className="bg-white" placeholder="User instruction..." />
                                        </div>
                                        <div className="space-y-2 col-span-2">
                                            <label className="text-xs font-bold uppercase text-slate-500">Action URL <span className="text-red-500">*</span></label>
                                            <Input {...register(`tasks.${index}.url` as const, { required: true })} className="bg-white" placeholder="/dashboard/..." />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {fields.length === 0 && (
                                <div className="text-center py-8 text-slate-400 border-2 border-dashed rounded-lg">
                                    <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>No tasks added yet.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                        <Button
                            type="submit"
                            className="bg-slate-900 hover:bg-slate-800"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {(createMutation.isPending || updateMutation.isPending) && (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            )}
                            Save Template
                        </Button>
                    </div>
                </form>
            </FormProvider>
        </div>
    );
}
