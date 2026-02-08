'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface Rule {
    id: string;
    name: string;
    type: 'prohibited_item' | 'price_limit' | 'required_field';
    condition: string;
    action: 'reject' | 'flag' | 'warning';
    active: boolean;
}

export function RuleBuilder() {
    const [rules, setRules] = useState<Rule[]>([
        { id: '1', name: 'No Weapons', type: 'prohibited_item', condition: 'Category == "Weapons"', action: 'reject', active: true },
        { id: '2', name: 'Max Price Electronics', type: 'price_limit', condition: 'Price > 5000 AND Category == "Electronics"', action: 'flag', active: true }
    ]);

    const addRule = () => {
        const newRule: Rule = {
            id: Date.now().toString(),
            name: 'New Rule',
            type: 'prohibited_item',
            condition: '',
            action: 'flag',
            active: true
        };
        setRules([...rules, newRule]);
    };

    const removeRule = (id: string) => {
        setRules(rules.filter(r => r.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Platform Rules</h3>
                    <p className="text-sm text-slate-500">Define automated compliance checks for listings.</p>
                </div>
                <Button onClick={addRule} className="bg-slate-900 text-white hover:bg-slate-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                </Button>
            </div>

            <div className="space-y-4">
                {rules.map((rule) => (
                    <Card key={rule.id} className="group transition-all hover:border-slate-300">
                        <CardContent className="p-4 flex items-center gap-4">
                            <div className="p-3 bg-slate-50 rounded-lg">
                                {rule.type === 'prohibited_item' ? <AlertTriangle className="h-5 w-5 text-red-500" /> : <ShieldCheck className="h-5 w-5 text-blue-500" />}
                            </div>

                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-500">Rule Name</Label>
                                    <Input defaultValue={rule.name} className="h-8" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-slate-500">Type</Label>
                                    <Select defaultValue={rule.type}>
                                        <SelectTrigger className="h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="prohibited_item">Prohibited Item</SelectItem>
                                            <SelectItem value="price_limit">Price Limit</SelectItem>
                                            <SelectItem value="required_field">Required Field</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1 md:col-span-2">
                                    <Label className="text-xs text-slate-500">Condition (Logic)</Label>
                                    <Input defaultValue={rule.condition} className="h-8 font-mono text-xs" placeholder='e.g. Price > 100' />
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Select defaultValue={rule.action}>
                                    <SelectTrigger className="w-24 h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="reject">Reject</SelectItem>
                                        <SelectItem value="flag">Flag</SelectItem>
                                        <SelectItem value="warning">Warn</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-slate-400 hover:text-red-500"
                                    onClick={() => removeRule(rule.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
