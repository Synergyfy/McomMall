'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Wallet } from 'lucide-react';
import { toast } from 'sonner';

import { Deal } from '@/service/deals/types';
import {
    useContributeToVoucher,
    useInitiateVoucherContribution,
} from '@/service/money-engine/hook';
import { StripeCheckoutForm } from '@/components/StripeCheckoutForm';
import { PayPalCheckoutButton } from '@/components/PayPalCheckoutButton';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PaymentMethod = 'STRIPE' | 'PAYPAL' | 'MCOM_WALLET';

interface ContributeModalProps {
    deal: Deal | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function errorMessage(error: unknown): string {
    const response = (error as any)?.response?.data;
    return (
        response?.message ||
        (error instanceof Error ? error.message : 'Contribution failed')
    );
}

export function ContributeModal({ deal, open, onOpenChange }: ContributeModalProps) {
    const [step, setStep] = useState<'select' | 'payment'>('select');
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<PaymentMethod>('STRIPE');
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
    const [paypalApprovalUrl, setPaypalApprovalUrl] = useState<string | null>(
      null,
    );

    const initiateMutation = useInitiateVoucherContribution();
    const contributeMutation = useContributeToVoucher();

    useEffect(() => {
        if (!open) return;
        setStep('select');
        setClientSecret(null);
        setPaypalOrderId(null);
        setMethod('STRIPE');
        const targetRemaining =
            deal?.contributionRemaining !== null &&
            deal?.contributionRemaining !== undefined
                ? Math.max(0, Number(deal.contributionRemaining))
                : deal?.faceValue !== null &&
                    deal?.faceValue !== undefined &&
                    deal?.remainingValue !== null &&
                    deal?.remainingValue !== undefined
                  ? Math.max(
                        0,
                        Number(deal.faceValue) - Number(deal.remainingValue),
                    )
                  : null;
        setAmount(
            targetRemaining && targetRemaining > 0
                ? targetRemaining.toFixed(2)
                : deal?.remainingValue && deal.remainingValue > 0
                  ? deal.remainingValue.toFixed(2)
                  : '',
        );
    }, [open, deal?.id, deal?.faceValue, deal?.remainingValue]);

    if (!deal?.code) return null;

    const finalize = async (transactionId: string) => {
        await contributeMutation.mutateAsync({
            code: deal.code as string,
            amount: Number(amount),
            paymentGateway: method,
            transactionId,
        });
        toast.success('Contribution added');
        onOpenChange(false);
    };

    const handleInitiate = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            const initiated = await initiateMutation.mutateAsync({
                code: deal.code as string,
                amount: Number(amount),
                paymentGateway: method,
            });

            if (method === 'MCOM_WALLET') {
                if (!initiated.transactionId) {
                    throw new Error('MCOM Wallet did not return a payment reference.');
                }
                await finalize(initiated.transactionId);
                return;
            }

            if (method === 'STRIPE') {
                if (!initiated.clientSecret) {
                    throw new Error('Card payment could not be started.');
                }
                setClientSecret(initiated.clientSecret);
            } else {
                if (!initiated.orderId) {
                    throw new Error('PayPal order could not be created.');
                }
                setPaypalOrderId(initiated.orderId);
                setPaypalApprovalUrl((initiated as any).approvalUrl ?? null);
            }
            setStep('payment');
        } catch (error) {
            toast.error(errorMessage(error));
        }
    };

    const handlePaymentSuccess = async (transactionId: string) => {
        try {
            await finalize(transactionId);
        } catch (error) {
            toast.error(errorMessage(error));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {step === 'select' ? 'Top up this voucher' : 'Complete payment'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'select'
                            ? `Add spending power to ${deal.title}. The voucher shows its full value; the split stays internal.`
                            : 'Finish the payment to credit the voucher.'}
                    </DialogDescription>
                </DialogHeader>

                {step === 'select' ? (
                    <form onSubmit={handleInitiate} className="space-y-4 py-2">
                        <div className="rounded-xl bg-slate-50 px-4 py-3 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    Available now
                                </p>
                                <p className="text-xl font-black text-slate-900">
                                    £{Number(deal.remainingValue ?? 0).toFixed(2)}
                                </p>
                            </div>
                            <Wallet className="w-6 h-6 text-orange-500" />
                        </div>

                        <div className="space-y-2">
                            <Label>Contribution amount (£)</Label>
                            <Input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={amount}
                                onChange={(event) => setAmount(event.target.value)}
                                className="rounded-xl"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Method</Label>
                            <div className="flex gap-2">
                                {(
                                    [
                                        ['STRIPE', 'Card'],
                                        ['PAYPAL', 'PayPal'],
                                        ['MCOM_WALLET', 'MCOM Wallet'],
                                    ] as Array<[PaymentMethod, string]>
                                ).map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setMethod(value)}
                                        className={`flex-1 p-3 rounded-xl border text-center text-xs font-bold transition-colors ${
                                            method === value
                                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                : 'border-slate-100 text-slate-500'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={initiateMutation.isPending || contributeMutation.isPending}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl"
                        >
                            {initiateMutation.isPending || contributeMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processing…
                                </>
                            ) : (
                                `Pay £${Number(amount || 0).toFixed(2)}`
                            )}
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-4 py-2">
                        <div className="p-4 bg-gray-50 rounded-xl flex justify-between">
                            <span>Due</span>
                            <span className="font-bold">£{Number(amount).toFixed(2)}</span>
                        </div>
                        {method === 'STRIPE' && clientSecret && (
                            <StripeCheckoutForm
                                clientSecret={clientSecret}
                                onPaymentSuccess={handlePaymentSuccess}
                            />
                        )}
                        {method === 'PAYPAL' && paypalOrderId && (
                            <PayPalCheckoutButton
                                orderID={paypalOrderId}
                                approvalUrl={paypalApprovalUrl}
                                onPaymentSuccess={handlePaymentSuccess}
                            />
                        )}
                        {contributeMutation.isPending && (
                            <p className="text-sm text-slate-500 flex items-center">
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Crediting the voucher…
                            </p>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
