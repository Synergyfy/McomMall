import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useContributeToCampaign } from '@/service/campaign-cashback/hook';
import { CampaignCashback } from '@/service/campaign-cashback/types';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    campaign: CampaignCashback | null;
}

type PaymentFlowState = 'idle' | 'paymentPending' | 'paymentSucceeded' | 'paymentFailed';

export const CampaignUnlockModal: React.FC<Props> = ({ isOpen, onClose, campaign }) => {
    const [flowState, setFlowState] = useState<PaymentFlowState>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const contributeMutation = useContributeToCampaign();

    if (!campaign) return null;

    const handlePay = async (method: string) => {
        setFlowState('paymentPending');
        setErrorMessage('');

        try {
            await contributeMutation.mutateAsync({
                campaignId: campaign.id,
                amount: campaign.levelValue,
                paymentMethod: method,
            });
            // The hook handles invalidating the getQueries, explicitly preventing optimistic UI.
            setFlowState('paymentSucceeded');
        } catch (err: any) {
            setFlowState('paymentFailed');
            setErrorMessage(err?.message || 'Payment failed. Please try again.');
        }
    };

    const handleClose = () => {
        // Reset state on close
        setTimeout(() => setFlowState('idle'), 200);
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
                    {flowState === 'idle' && (
                        <>
                            <div className="bg-orange-50 text-orange-800 p-4 rounded-md border border-orange-200 text-sm">
                                By paying £{campaign.levelValue.toFixed(2)}, you will instantly unlock all 3 values, giving you access to the full combined balance across all eligible channels.
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <Button variant="outline" onClick={() => handlePay('mcom_wallet')} className="h-12 border-gray-300">
                                    Pay with MCOM Wallet
                                </Button>
                                <Button variant="outline" onClick={() => handlePay('gift_card')} className="h-12 border-gray-300">
                                    Load via Gift Card
                                </Button>
                                <Button variant="default" onClick={() => handlePay('stripe')} className="h-12 bg-[#635BFF] hover:bg-[#4A44CC] text-white col-span-2">
                                    Pay via Stripe
                                </Button>
                                <Button variant="default" onClick={() => handlePay('paypal')} className="h-12 bg-[#003087] hover:bg-[#002266] text-white col-span-2">
                                    Pay via PayPal
                                </Button>
                            </div>
                        </>
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
                            <Button onClick={() => setFlowState('idle')} variant="outline" className="mt-4 w-full border-gray-300">
                                Try a Different Method
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
