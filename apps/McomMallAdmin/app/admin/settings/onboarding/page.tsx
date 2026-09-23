'use client';

import { useState } from 'react';
import { Settings, Plus, Trash2, ArrowUp, ArrowDown, AlertTriangle, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
    useGetOnboardingQuestions,
    useCreateOnboardingQuestion,
    useUpdateOnboardingQuestion,
    useReorderOnboardingQuestions,
    useDeleteOnboardingQuestion,
} from '@/service/onboarding/hook';
import type { OnboardingInputType, OnboardingQuestion } from '@/service/onboarding/types';

const INPUT_LABELS: Record<OnboardingInputType, string> = {
    text: 'Short Text',
    textarea: 'Long Text',
    yesno: 'Yes / No',
    image: 'Image Upload',
};

function QuestionCard({
    question,
    index,
    total,
    onMove,
    moveDisabled,
}: {
    question: OnboardingQuestion;
    index: number;
    total: number;
    onMove: (questionId: string, direction: -1 | 1) => void;
    moveDisabled: boolean;
}) {
    const update = useUpdateOnboardingQuestion();
    const remove = useDeleteOnboardingQuestion();
    const [title, setTitle] = useState(question.title);
    const [prompt, setPrompt] = useState(question.prompt);

    return (
        <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3 flex-1">
                    <span className="font-bold text-gray-500 w-6">{index + 1}.</span>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => {
                            if (title.trim() && title !== question.title) {
                                update.mutate({ id: question.id, dto: { title: title.trim() } });
                            }
                        }}
                        className="font-bold text-lg border-transparent hover:border-gray-200 w-64"
                    />
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        title={question.isActive ? 'Unpublish step' : 'Publish step'}
                        disabled={update.isPending}
                        onClick={() => update.mutate({ id: question.id, dto: { isActive: !question.isActive } })}
                    >
                        {question.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                    </Button>
                    <Button
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        disabled={remove.isPending}
                        onClick={() => {
                            if (confirm('Remove this step?')) remove.mutate(question.id);
                        }}
                    >
                        <Trash2 className="w-5 h-5" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pl-12 pr-8 pb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">User Prompt / Question</label>
                        <Input
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onBlur={() => {
                                if (prompt.trim() && prompt !== question.prompt) {
                                    update.mutate({ id: question.id, dto: { prompt: prompt.trim() } });
                                }
                            }}
                            className="w-full"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Input Type</label>
                        <Select
                            value={question.inputType}
                            onValueChange={(val) =>
                                update.mutate({ id: question.id, dto: { inputType: val as OnboardingInputType } })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {(Object.keys(INPUT_LABELS) as OnboardingInputType[]).map((t) => (
                                    <SelectItem key={t} value={t}>
                                        {INPUT_LABELS[t]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <Badge variant={question.isActive ? 'default' : 'secondary'}>
                        {question.isActive ? 'Published' : 'Hidden'}
                    </Badge>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" disabled={moveDisabled || index === 0} onClick={() => onMove(question.id, -1)} title="Move up">
                            <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" disabled={moveDisabled || index === total - 1} onClick={() => onMove(question.id, 1)} title="Move down">
                            <ArrowDown className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function OnboardingSettingsPage() {
    const { data, isLoading, isError, error, refetch } = useGetOnboardingQuestions();
    const create = useCreateOnboardingQuestion();
    const reorder = useReorderOnboardingQuestions();
    const questions = data ?? [];

    const handleMove = (questionId: string, direction: -1 | 1) => {
        const ids = questions.map((q) => q.id);
        const from = ids.indexOf(questionId);
        const to = from + direction;
        if (from < 0 || to < 0 || to >= ids.length) return;
        const next = [...ids];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        reorder.mutate(next);
    };

    const addQuestion = () => {
        create.mutate({
            title: 'New Question',
            prompt: 'Enter prompt here...',
            inputType: 'text',
        });
    };

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                        <Settings className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Business Onboarding Flow</h1>
                        <p className="text-gray-500">
                            Live questionnaire steps from the API — edits save immediately.
                        </p>
                    </div>
                </div>
                <Badge variant="secondary" className={cn(questions.length > 0 && 'bg-emerald-100 text-emerald-700')}>
                    {isLoading ? '…' : `${questions.length} steps`}
                </Badge>
            </div>

            {isError && (
                <Card className="border-rose-200 bg-rose-50">
                    <CardContent className="p-4 flex items-center gap-3 text-sm text-rose-700">
                        <AlertTriangle className="h-4 w-4" />
                        Failed to load flow: {(error as Error)?.message ?? 'Unknown error'}
                        <Button variant="outline" size="sm" className="ml-auto" onClick={() => refetch()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <div className="space-y-4">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
                    ))}
                </div>
            ) : questions.length === 0 && !isError ? (
                <Card>
                    <CardContent className="p-12 text-center text-sm text-slate-400">
                        No steps yet. Add the first onboarding question below.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {questions.map((q, index) => (
                        <QuestionCard
                            key={q.id}
                            question={q}
                            index={index}
                            total={questions.length}
                            onMove={handleMove}
                            moveDisabled={reorder.isPending}
                        />
                    ))}
                </div>
            )}

            <div className="pt-4 pb-12">
                <Button
                    variant="outline"
                    onClick={addQuestion}
                    disabled={create.isPending}
                    className="w-full py-8 border-2 border-dashed border-gray-300 text-gray-500 hover:text-orange-600 hover:border-orange-600 hover:bg-orange-50 rounded-2xl font-bold transition-all"
                >
                    {create.isPending ? <Loader2 className="w-6 h-6 mr-2 animate-spin" /> : <Plus className="w-6 h-6 mr-2" />}
                    Add New Step
                </Button>
            </div>
        </div>
    );
}
