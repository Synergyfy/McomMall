'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Trash2, Clock, Check } from 'lucide-react';

export function ServiceTemplateManager({ packagesName = 'packages' }: { packagesName?: string }) {
    const { register, control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: packagesName,
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Service Packages</h3>
                    <p className="text-sm text-slate-500">Define standard tiers for this service.</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => append({ name: 'New Package', price: 0, duration: 60, description: '', features: [''] })}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Package
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {fields.map((field, index) => (
                    <Card key={field.id} className="relative group">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <CardHeader className="pb-3">
                            <Input
                                {...register(`${packagesName}.${index}.name`)}
                                defaultValue={(field as any).name}
                                className="font-bold text-lg border-transparent hover:border-slate-200 px-0 h-auto focus-visible:ring-0"
                                placeholder="Package Name"
                            />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Label className="text-xs text-slate-500">Price (£)</Label>
                                    <Input
                                        type="number"
                                        {...register(`${packagesName}.${index}.price`)}
                                        defaultValue={(field as any).price}
                                        className="h-8"
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label className="text-xs text-slate-500">Duration (min)</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                                        <Input
                                            type="number"
                                            {...register(`${packagesName}.${index}.duration`)}
                                            defaultValue={(field as any).duration}
                                            className="h-8 pl-7"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label className="text-xs text-slate-500">Description</Label>
                                <Textarea
                                    {...register(`${packagesName}.${index}.description`)}
                                    defaultValue={(field as any).description}
                                    className="h-20 text-sm resize-none"
                                    placeholder="What does this package include?"
                                />
                            </div>

                            {/* Features List Logic would go here - simplified for now */}
                            {/* In a real app, this would be another nested useFieldArray */}
                            <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-500 italic text-center">
                                Feature list management (Nested)
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {fields.length === 0 && (
                    <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl text-slate-400">
                        No packages defined. Add one to get started.
                    </div>
                )}
            </div>
        </div>
    );
}
