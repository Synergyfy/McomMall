'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Send, Users, Megaphone } from 'lucide-react';
import { useBusinessId } from '@/hooks/useBusinessId';
import { useCustomerSegments } from '@/service/customers/hook';
import {
  useBroadcastToSegment,
  useRecipientCount,
} from '@/service/notifications/hook';

export default function SendOfferPage() {
  const { businessId } = useBusinessId();
  const segments = useCustomerSegments(businessId);
  const broadcast = useBroadcastToSegment();

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [segmentId, setSegmentId] = useState<string>('');
  const [channel, setChannel] = useState('in_app');

  const recipients = useRecipientCount(
    businessId,
    segmentId || undefined
  );

  const handleSend = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!businessId) {
      toast.error('No business profile found.');
      return;
    }
    if (!title.trim() || !message.trim()) {
      toast.error('Add a title and message.');
      return;
    }

    try {
      const result = await broadcast.mutateAsync({
        businessId,
        segmentId: segmentId || undefined,
        title: title.trim(),
        message: message.trim(),
        channel,
        type: 'broadcast_alert',
      });
      if (result.count === 0) {
        toast.warning('No matching customers were found for this audience.');
      } else {
        toast.success(`Offer sent to ${result.count} customer(s).`);
        setTitle('');
        setMessage('');
      }
    } catch {
      toast.error('Could not send the offer.');
    }
  };

  return (
    <div className="min-h-full bg-[#fff8f5] p-4 sm:p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center gap-3">
          <Link
            href="/dashboard/promotions"
            className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Send Offer</h1>
            <p className="text-sm text-gray-500">
              Broadcast an offer to your real customer audience.
            </p>
          </div>
        </header>

        <form
          onSubmit={handleSend}
          className="space-y-5 rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
        >
          <div className="rounded-lg bg-orange-50 p-4 text-sm text-orange-800">
            <p className="flex items-center gap-2 font-semibold">
              <Users className="h-4 w-4" />
              {recipients.isLoading
                ? 'Calculating audience…'
                : `${recipients.data?.count ?? 0} customer(s) will receive this offer`}
            </p>
            <p className="mt-1 text-xs text-orange-700">
              Audience is resolved from active customers who have engaged with
              your business.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500">Audience</label>
            <select
              value={segmentId}
              onChange={(event) => setSegmentId(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">All engaged customers</option>
              {(segments.data ?? []).map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500">Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. 20% off this weekend"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500">Message</label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              placeholder="Tell your customers what they get…"
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500">Channel</label>
            <select
              value={channel}
              onChange={(event) => setChannel(event.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="in_app">In-app notification</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={broadcast.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {broadcast.isPending ? 'Sending…' : 'Send offer'}
          </button>
        </form>

        <div className="rounded-xl border border-gray-100 bg-white p-5 text-sm text-gray-600 shadow-sm">
          <p className="flex items-center gap-2 font-semibold text-gray-900">
            <Megaphone className="h-4 w-4 text-orange-500" /> Want a points campaign too?
          </p>
          <p className="mt-1 text-xs">
            Create a promotion to award points automatically when customers
            purchase.
          </p>
          <Link
            href="/dashboard/promotions/new"
            className="mt-3 inline-block text-sm font-semibold text-orange-600 hover:underline"
          >
            Create promotion
          </Link>
        </div>
      </div>
    </div>
  );
}
