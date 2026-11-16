import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    useContributeToCampaign,
    useInitiateCampaignContribution,
} from '@/service/campaign-cashback/hook';
import { CampaignCashback } from '@/service/campaign-cashback/types';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { StripeCheckoutForm } from '@/components/StripeCheckoutForm';
import { PayPalCheckoutButton } from '@/components/PayPalCheckoutButton';

const stripePromise = loadStripe(
    process.env.NEXT_PUBLIC_MCOM_SOLUTIONS_STRIPE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
        ''
);

interface Props {
    isOpen: boolean;
    onClose: () => void;
    campaign: CampaignCashback | null;
}

type PaymentFlowState = 'idle' | 'paymentPending' | 'paymentSucceeded' | 'paymentFailed';
type PaymentMethod = 'stripe' | 'paypal' | 'wallet';

export const CampaignUnlockModal: React.FC<Props> = ({ isOpen, onClose, campaign }) => {
    const [flowState, setFlowState] = useState<PaymentFlowState>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [method, setMethod] = useState<PaymentMethod>('stripe');
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);
    const initiateMutation = useInitiateCampaignContribution();
    const contributeMutation = useContributeToCampaign();

    if (!campaign) return null;

    const completeContribution = async (
        transactionId: string,
        paymentMethod: PaymentMethod
    ) => {
        setFlowState('paymentPending');
        setErrorMessage('');
        try {
            await contributeMutation.mutateAsync({
                campaignId: campaign.id,
                amount: campaign.levelValue,
                paymentMethod,
                transactionId,
            });
            setFlowState('paymentSucceeded');
        } catch (err: any) {
            setFlowState('paymentFailed');
            setErrorMessage(err?.message || 'Payment failed. Please try again.');
        }
    };

    const handleWalletPay = async () => {
        setFlowState('paymentPending');
        setErrorMessage('');
        try {
            const initiated = await initiateMutation.mutateAsync({
                campaignId: campaign.id,
                paymentMethod: 'wallet',
            });
            if (!initiated.transactionId) {
                throw new Error('MCOM Wallet did not return a payment reference.');
            }
            await completeContribution(initiated.transactionId, 'wallet');
        } catch (err: any) {
            setFlowState('paymentFailed');
            setErrorMessage(err?.message || 'Wallet payment failed. Please try again.');
        }
    };

    const handleInitiate = async (paymentMethod: 'stripe' | 'paypal') => {
        setMethod(paymentMethod);
        setFlowState('paymentPending');
        setErrorMessage('');
        try {
            const initiated = await initiateMutation.mutateAsync({
                campaignId: campaign.id,
                paymentMethod,
            });
            if (paymentMethod === 'stripe' && initiated.clientSecret) {
                setClientSecret(initiated.clientSecret);
                setFlowState('idle');
            } else if (paymentMethod === 'paypal' && initiated.orderId) {
                setOrderId(initiated.orderId);
                setFlowState('idle');
            } else {
                throw new Error('The payment provider did not return a payment reference.');
            }
        } catch (err: any) {
            setFlowState('paymentFailed');
            setErrorMessage(err?.message || 'Payment could not be started.');
        }
    };

    const handleClose = () => {
        setTimeout(() => setFlowState('idle'), 200);
        setClientSecret(null);
        setOrderId(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Unlock Campaign Value</DialogTitle>
                    <DialogDescription>
                        You must contribute £{campaign.levelValue.toFixed(2)} to activate the full £{campaign.totalValue.toFixed(2)} value of the <b>{campaign.name}</b> campaign.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col space-y-4 py-4">
                    {flowState === 'idle' && !clientSecret && !orderId && (
                        <>
                            <div className="bg-orange-50 text-orange-800 p-4 rounded-md border border-orange-200 text-sm">
                                Your contribution is processed securely by MCOM Pay. Card, PayPal and your MCOM Wallet are all supported.
                            </div>

                            <div className="grid grid-cols-1 gap-3 mt-4">
                                <Button variant="outline" onClick={handleWalletPay} className="h-12 border-gray-300">
                                    Pay with MCOM Wallet
                                </Button>
                                <Button variant="default" onClick={() => handleInitiate('stripe')} className="h-12 bg-[#635BFF] hover:bg-[#4A44CC] text-white">
                                    Pay by Card
                                </Button>
                                <Button variant="default" onClick={() => handleInitiate('paypal')} className="h-12 bg-[#003087] hover:bg-[#002266] text-white">
                                    Pay with PayPal
                                </Button>
                            </div>
                        </>
                    )}

                    {flowState === 'idle' && clientSecret && (
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <StripeCheckoutForm
                                clientSecret={clientSecret}
                                onPaymentSuccess={(transactionId) =>
                                    completeContribution(transactionId, 'stripe')
                                }
                            />
                        </Elements>
                    )}

                    {flowState === 'idle' && orderId && (
                        <PayPalCheckoutButton
                            orderID={orderId}
                            onPaymentSuccess={(transactionId) =>
                                completeContribution(transactionId, 'paypal')
                            }
                        />
                    )}

                    {flowState === 'paymentPending' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                            <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
                            <h3 className="text-lg font-semibold text-gray-900">Processing Payment...</h3>
                            <p className="text-sm text-gray-500">Please do not close this window.</p>
                        </div>
                    )}

                    {flowState === 'paymentSucceeded' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Payment Successful!</h3>
                            <p className="text-sm text-gray-500">
                                Your contribution of £{campaign.levelValue.toFixed(2)} has been received. Your balances are automatically refreshing.
                            </p>
                            <Button onClick={handleClose} className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold">
                                Return to Dashboard
                            </Button>
                        </div>
                    )}

                    {flowState === 'paymentFailed' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Payment Failed</h3>
                            <p className="text-sm text-red-600 font-medium">{errorMessage}</p>
                            <Button
                                onClick={() => {
                                    setFlowState('idle');
                                    setClientSecret(null);
                                    setOrderId(null);
                                }}
                                variant="outline"
                                className="mt-4 w-full border-gray-300"
                            >
                                Try a Different Method
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
