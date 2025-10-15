'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAdjustBalance } from '@/service/gift-card/hook';
import { toast } from 'sonner';
import { MerchantGiftCard } from '@/types/merchant-gift-card';

const formSchema = z.object({
  amount: z.coerce.number().min(-1000).max(1000),
  note: z.string().optional(),
});

interface AdjustBalanceDialogProps {
  card: MerchantGiftCard;
  isOpen: boolean;
  onClose: () => void;
}

export const AdjustBalanceDialog = ({ card, isOpen, onClose }: AdjustBalanceDialogProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      note: '',
    },
  });

  const { mutate: adjustBalance, isPending } = useAdjustBalance();

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    adjustBalance(
      { code: card.code, dto: values },
      {
        onSuccess: () => {
          toast.success('Balance adjusted successfully');
          onClose();
        },
        onError: () => {
          toast.error('Failed to adjust balance');
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust Balance for {card.code}</DialogTitle>
          <DialogDescription>
            Enter a positive value to add to the balance or a negative value to subtract.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Adjusting...' : 'Adjust Balance'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
