'use client';

import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Save, Trash2, AlertTriangle, Loader2, LayoutTemplate } from 'lucide-react';
import { ServiceTemplateManager } from '@/app/admin/components/services/ServiceTemplateManager';
import { ServiceTemplate } from '@/app/admin/types/service-template';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    useGetServiceTemplates,
    useCreateServiceTemplate,
    useUpdateServiceTemplate,
    useDeleteServiceTemplate,
} from '@/service/service-templates/hook';

const BLANK_TEMPLATE: ServiceTemplate = {
    name: '',
    category: '',
    description: '',
    packages: [],
    requirements: [],
};

export default function ServiceTemplatesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const { data, isLoading, isError, error, refetch } = useGetServiceTemplates(debouncedSearch || undefined);
    const create = useCreateServiceTemplate();
    const update = useUpdateServiceTemplate();
    const remove = useDeleteServiceTemplate();

    const methods = useForm<ServiceTemplate>({ defaultValues: BLANK_TEMPLATE });
    const { register, reset, handleSubmit, watch } = methods;

    const templates = data ?? [];
    const selected = templates.find((t) => t.id === selectedId) ?? null;

    useEffect(() => {
        if (selected) {
            reset({
                name: selected.name,
                category: selected.category ?? '',
                description: selected.description ?? '',
                packages: (selected.packages ?? []).map((p) => ({
                    name: p.name,
                    price: Number(p.price),
                    duration: Number(p.duration),
                    description: p.description ?? '',
                    features: p.features ?? [],
                })),
                requirements: selected.requirements ?? [],
            });
        }
    }, [selectedId, reset]); // eslint-disable-line react-hooks/exhaustive-deps

    const onSearch = (value: string) => {
        setSearchQuery(value);
        window.clearTimeout((window as unknown as { __st?: number }).__st);
        (window as unknown as { __st?: number }).__st = window.setTimeout(
            () => setDebouncedSearch(value.trim()),
            400,
        );
    };

    const newTemplate = () => {
        setSelectedId(null);
        reset(BLANK_TEMPLATE);
    };

    const onSave = (form: ServiceTemplate) => {
        const dto = {
            name: form.name.trim(),
            category: form.category || undefined,
            description: form.description || undefined,
            packages: (form.packages ?? []).map((p) => ({
                name: p.name,
                price: Number(p.price) || 0,
                duration: Number(p.duration) || 0,
                description: p.description ?? '',
                features: (p.features ?? []).filter((f) => f.trim() !== ''),
            })),
            requirements: (form.requirements ?? []).filter((r) => r.trim() !== ''),
        };
        if (selectedId) {
            update.mutate({ id: selectedId, dto });
        } else {
            create.mutate(dto, {
                onSuccess: (created) => {
                    setSelectedId(created.id);
                    reset(BLANK_TEMPLATE);
                },
            });
        }
    };

    const saving = create.isPending || update.isPending;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Service Templates</h1>
                    <p className="text-slate-500">Live templates from the API — create, edit and reuse them</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={newTemplate}>
                        <Plus className="h-4 w-4 mr-2" /> New Template
                    </Button>
                    <Button
                        className="bg-orange-500 hover:bg-orange-600"
                        disabled={saving || !watch('name')?.trim()}
                        onClick={handleSubmit(onSave)}
                    >
                        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        <Save className="h-4 w-4 mr-2" />
                        {selectedId ? 'Update Template' : 'Save Template'}
                    </Button>
                </div>
            </div>

            {isError && (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load templates: {(error as Error)?.message ?? 'Unknown error'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 h-fit">
                    <CardContent className="pt-6 space-y-4">
                        <Input placeholder="Search templates..." value={searchQuery} onChange={(e) => onSearch(e.target.value)} />
                        {isLoading ? (
                            <div className="space-y-2">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="h-12 rounded-lg bg-slate-100 animate-pulse" />
                                ))}
                            </div>
                        ) : templates.length === 0 ? (
                            <div className="text-center py-8">
                                <LayoutTemplate className="h-8 w-8 mx-auto text-slate-300" />
                                <p className="mt-2 text-sm text-slate-400">No templates yet. Create your first one.</p>
                            </div>
                        ) : (
                            <ul className="space-y-2 max-h-[480px] overflow-y-auto">
                                {templates.map((t) => (
                                    <li key={t.id}>
                                        <button
                                            onClick={() => setSelectedId(t.id)}
                                            className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${
                                                selectedId === t.id
                                                    ? 'border-orange-300 bg-orange-50'
                                                    : 'border-slate-100 hover:border-slate-200 bg-white'
                                            }`}
                                        >
                                            <span className="flex items-center justify-between gap-2">
                                                <span className="font-bold text-sm text-slate-900 truncate">{t.name}</span>
                                                <span
                                                    role="button"
                                                    tabIndex={0}
                                                    className="text-slate-300 hover:text-red-500"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (confirm(`Delete template "${t.name}"?`)) {
                                                            remove.mutate(t.id);
                                                            if (selectedId === t.id) {
                                                                setSelectedId(null);
                                                                reset(BLANK_TEMPLATE);
                                                            }
                                                        }
                                                    }}
                                                    onKeyDown={(e) => e.stopPropagation()}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </span>
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {(t.category || 'Uncategorized')} · {(t.packages ?? []).length} packages
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                <FormProvider {...methods}>
                    <div className="lg:col-span-2 grid gap-6 content-start">
                        <Card className="h-fit">
                            <CardContent className="space-y-4 pt-6">
                                <div className="space-y-2">
                                    <Label>Template Name *</Label>
                                    <Input {...methods.register('name', { required: true })} placeholder="e.g. Plumbing Repair" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Input {...methods.register('category')} placeholder="e.g. Home Services" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea {...methods.register('description')} className="min-h-[100px]" />
                                </div>
                                {selected && (
                                    <p className="text-xs text-slate-400">
                                        Editing “{selected.name}” — switch templates from the list or start a new one.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <ServiceTemplateManager />
                            </CardContent>
                        </Card>
                    </div>
                </FormProvider>
            </div>
        </div>
    );
}
