'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cashbackApi } from '@/service/cashback/api';
import { CreateRulePayload, CashbackRule } from '@/service/cashback/types';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  eventType: z.string().min(1, 'Event type is required'),
  rewardType: z.enum(['PERCENTAGE', 'FIXED']),
  rewardValue: z.string().transform((val) => parseFloat(val)).refine((val) => !isNaN(val) && val >= 0, {
    message: 'Reward value must be a non-negative number',
  }),
  isActive: z.boolean().default(true),
});

interface CreateRuleDialogProps {
  initialData?: CashbackRule;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function CreateRuleDialog({ initialData, open, onOpenChange, trigger }: CreateRuleDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isEditMode = !!initialData;
  const queryClient = useQueryClient();

  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const { data: eventTypes, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['cashback-events'],
    queryFn: cashbackApi.getEventTypes,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventType: initialData?.eventType || '',
      rewardType: initialData?.rewardType || 'PERCENTAGE',
      rewardValue: initialData?.rewardValue !== undefined ? initialData.rewardValue : 0,
      isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateRulePayload) => cashbackApi.createRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashback-rules'] });
      setIsOpen(false);
      form.reset();
      toast.success('Cashback rule created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create rule');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: Partial<CreateRulePayload>) =>
      cashbackApi.updateRule(initialData!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cashback-rules'] });
      setIsOpen(false);
      toast.success('Cashback rule updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update rule');
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const payload: CreateRulePayload = {
      platform: 'MCOM_MALL',
      eventType: values.eventType,
      rewardType: values.rewardType,
      rewardValue: values.rewardValue,
      isActive: values.isActive,
    };

    if (isEditMode) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        !isEditMode && (
           <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Rule
            </Button>
          </DialogTrigger>
        )
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Cashback Rule' : 'Create Cashback Rule'}</DialogTitle>
          <DialogDescription>
            Configure how customers earn cashback for specific events.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="eventType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isEditMode || isLoadingEvents}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select event" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventTypes?.map((event) => (
                        <SelectItem key={event} value={event}>
                          {event.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the trigger event for this cashback.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rewardType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reward Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                        <SelectItem value="FIXED">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Type of reward.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rewardValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(e.target.value)} />
                    </FormControl>
                    <FormDescription>
                      Amount or %.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Active Status</FormLabel>
                    <FormDescription>
                      Enable or disable this rule immediately.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditMode ? 'Update Rule' : 'Create Rule'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
