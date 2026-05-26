'use client';

import React, { useState } from 'react';
import { Settings, Plus, GripVertical, Save, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock initial data
const INITIAL_QUESTIONS = [
  { id: 'q1', type: 'text', title: 'Welcome', prompt: "We're thrilled to have you. What's the name of your amazing business?" },
  { id: 'q2', type: 'yesno', title: 'Location Type', prompt: 'Is your business located on a physical High Street?' },
  { id: 'q3', type: 'textarea', title: 'Business Address', prompt: 'Providing your address helps local customers find you.' },
  { id: 'q4', type: 'text', title: 'Postcode', prompt: 'Just a few more details to set up your storefront.' },
  { id: 'q5', type: 'image', title: 'Brand Logo', prompt: 'Upload a logo to make your business recognizable.' }
];

export default function OnboardingSettingsPage() {
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Mock API call
    setTimeout(() => {
      setIsSaving(false);
      alert('Onboarding flow updated successfully! (Mocked)');
    }, 1000);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: `q${Date.now()}`, type: 'text', title: 'New Question', prompt: 'Enter prompt here...' }
    ]);
  };

  const updateQuestion = (index: number, field: string, value: string) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    const updated = [...questions];
    updated.splice(index, 1);
    setQuestions(updated);
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
            <p className="text-gray-500">Configure the gamified questionnaire steps for new businesses.</p>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-6 py-5 font-bold shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
        >
          {isSaving ? 'Saving...' : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Publish Flow
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {questions.map((q, index) => (
          <Card key={q.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-3">
                <GripVertical className="text-gray-400 cursor-grab active:cursor-grabbing w-5 h-5" />
                <span className="font-bold text-gray-500 w-6">
                  {index + 1}.
                </span>
                <Input 
                  value={q.title}
                  onChange={(e) => updateQuestion(index, 'title', e.target.value)}
                  className="font-bold text-lg border-transparent hover:border-gray-200 focus-visible:ring-orange-500 w-64"
                />
              </div>
              <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeQuestion(index)}>
                <Trash2 className="w-5 h-5" />
              </Button>
            </CardHeader>
            <CardContent className="pl-16 pr-8 pb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">User Prompt / Question</label>
                  <Input 
                    value={q.prompt}
                    onChange={(e) => updateQuestion(index, 'prompt', e.target.value)}
                    className="w-full focus-visible:ring-orange-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Input Type</label>
                  <Select value={q.type} onValueChange={(val) => updateQuestion(index, 'type', val)}>
                    <SelectTrigger className="focus-visible:ring-orange-500">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Short Text</SelectItem>
                      <SelectItem value="textarea">Long Text</SelectItem>
                      <SelectItem value="yesno">Yes / No</SelectItem>
                      <SelectItem value="image">Image Upload</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-4 pb-12">
        <Button 
          variant="outline" 
          onClick={addQuestion}
          className="w-full py-8 border-2 border-dashed border-gray-300 text-gray-500 hover:text-orange-600 hover:border-orange-600 hover:bg-orange-50 rounded-2xl font-bold transition-all"
        >
          <Plus className="w-6 h-6 mr-2" />
          Add New Step
        </Button>
      </div>

    </div>
  );
}
