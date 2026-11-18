'use client';

import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Clock, HelpCircle, PlusCircle, Trash2 } from 'lucide-react';

export function Step4AdditionalInfo() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'faqs',
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        This section is optional. Add extra detail only if it helps customers
        make an informed decision.
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Clock className="w-5 h-5 text-primary" />
            Service Duration
          </CardTitle>
          <CardDescription>
            Let customers know how long the service usually takes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">
                  Duration (minutes){' '}
                  <span className="font-normal text-muted-foreground">
                    (Optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="e.g. 60"
                    {...field}
                    value={field.value ?? ''}
                    className="max-w-xs"
                  />
                </FormControl>
                <FormDescription>
                  Used to suggest appointment slots when customers book.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <HelpCircle className="w-5 h-5 text-primary" />
            Service Conditions
          </CardTitle>
          <CardDescription>
            Explain any conditions, exclusions or requirements customers should
            know about.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="serviceConditions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">
                  Conditions{' '}
                  <span className="font-normal text-muted-foreground">
                    (Optional)
                  </span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="e.g. Parts are charged separately. A call-out fee applies outside the service area."
                    {...field}
                    value={field.value ?? ''}
                    className="min-h-[110px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <HelpCircle className="w-5 h-5 text-primary" />
            Frequently Asked Questions
          </CardTitle>
          <CardDescription>
            Answer common questions to reduce back-and-forth before a booking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No questions added yet.
            </p>
          )}
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="space-y-3 rounded-xl border bg-muted/20 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  FAQ {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove FAQ"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <FormField
                control={control}
                name={`faqs.${index}.question`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      Question
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Do you supply parts?"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`faqs.${index}.answer`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      Answer
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Yes, we supply standard parts and confirm any costs before starting."
                        {...field}
                        value={field.value ?? ''}
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ question: '', answer: '' })}
            className="w-full border-dashed py-6"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> Add FAQ
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
