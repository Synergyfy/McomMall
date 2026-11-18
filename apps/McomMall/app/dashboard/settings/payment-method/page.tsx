import Link from 'next/link';
import { CreditCard, ExternalLink, ShieldCheck } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Payment credentials belong to MCOM Central. This page used to collect a raw
 * PAN/CVV and store it in localStorage, which must never happen in a PCI scope.
 * It now only explains where payment methods are managed.
 */
export default function PaymentMethodPage() {
  const centralUrl =
    process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_URL || 'https://centralhubsolution.com';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-orange-50 p-2 text-orange-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Payment methods</CardTitle>
              <CardDescription>
                Managed securely by MCOM Central.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                We never store card numbers, expiry dates or CVV.
              </p>
              <p className="mt-1 text-xs text-emerald-800">
                Card details are entered only in Stripe&apos;s PCI-compliant
                iframe through MCOM Pay. PayPal payments redirect to PayPal&apos;s
                official checkout. MCOM Wallet balance lives in Central.
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            To add or remove a payment method, top up your wallet or review your
            billing profile, use the MCOM Central wallet dashboard.
          </p>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="bg-[#ff6900] hover:bg-[#a14000]">
              <a
                href={`${centralUrl.replace(/\/$/, '')}/dashboard/wallet`}
                target="_blank"
                rel="noreferrer"
              >
                Open MCOM Central wallet
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/settings/billing">Back to billing</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
