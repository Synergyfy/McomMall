'use client';

import { useEffect, useState } from 'react';
import { Handshake, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useCreateUserPartnershipRequest } from '@/service/partnerships/hooks';

interface PartnershipRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Owner (user) id of the business being partnered with. */
  targetUserId: string;
  /** Public name of the business, used in the dialog copy. */
  businessName: string;
  /** Called after the request has been accepted by the API. */
  onSent?: () => void;
}

const MIN_REASON_LENGTH = 10;

/**
 * Collects the merchant's reason for wanting to partner with a business and
 * sends it as the `message` on a user partnership request.
 */
export function PartnershipRequestDialog({
  open,
  onOpenChange,
  targetUserId,
  businessName,
  onSent,
}: PartnershipRequestDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { mutate: createRequest, isPending } = useCreateUserPartnershipRequest();

  useEffect(() => {
    if (!open) {
      setReason('');
      setError(null);
    }
  }, [open]);

  const handleSubmit = () => {
    const message = reason.trim();

    if (message.length < MIN_REASON_LENGTH) {
      setError(
        `Please explain why you want to partner (at least ${MIN_REASON_LENGTH} characters).`,
      );
      return;
    }

    setError(null);
    createRequest(
      { targetUserId, message },
      {
        onSuccess: () => {
          toast.success(`Partnership request sent to ${businessName}.`);
          setReason('');
          onOpenChange(false);
          onSent?.();
        },
        onError: (err: any) => {
          const messageText =
            err?.response?.data?.message ||
            err?.message ||
            'Could not send the partnership request. Please try again.';
          setError(messageText);
          toast.error(messageText);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl p-0 overflow-hidden border-0 shadow-2xl bg-white">
        <div className="p-6 md:p-8 space-y-6">
          <DialogHeader className="space-y-2 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <Handshake className="h-5 w-5" />
              </div>
              <DialogTitle className="text-xl font-black text-slate-900">
                Partner with {businessName}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm font-medium text-slate-500 leading-relaxed">
              Tell {businessName} why you want to partner. They will see this
              message in their partnership requests.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label
              htmlFor="partnership-reason"
              className="text-[10px] font-black uppercase tracking-widest text-slate-400"
            >
              Why do you want to partner?
            </label>
            <Textarea
              id="partnership-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="e.g. Our customers live in the same neighbourhood and we could run a joint rewards offer..."
              className="min-h-[130px] rounded-2xl border-slate-200 p-4 text-sm text-slate-700 focus:ring-orange-500/20"
              maxLength={1000}
              autoFocus
            />
            <p className="text-[10px] font-medium text-slate-400 text-right">
              {reason.trim().length}/1000
            </p>
            {error && (
              <p className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600">
                {error}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="ghost"
              className="rounded-xl font-bold h-11 px-6 text-slate-500"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold h-11 px-6 shadow-md"
              onClick={handleSubmit}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send Request
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
