'use client';

import React, { useState, useEffect } from 'react';
import { useEditListing } from '@/service/listings/hook';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ShieldAlert, ShieldCheck, Mail, Phone, Lock, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OwnershipVerificationFlowProps {
  listing: any;
}

export const OwnershipVerificationFlow: React.FC<OwnershipVerificationFlowProps> = ({
  listing,
}) => {
  const { mutateAsync: editListing } = useEditListing();

  const [step, setStep] = useState<'start' | 'choose' | 'pin'>('start');
  const [method, setMethod] = useState<'email' | 'sms'>('email');
  const [pin, setPin] = useState('');
  const [timer, setTimer] = useState(60);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const isVerified = listing?.isVerified ?? false;

  // Countdown timer for resending OTP code
  useEffect(() => {
    let interval: any;
    if (step === 'pin' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendCode = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setStep('pin');
      setTimer(60);
      toast.success(`Verification code sent to your business ${method === 'email' ? 'email' : 'phone'}!`);
    }, 1000);
  };

  const handleVerify = async () => {
    if (pin.length !== 6) {
      toast.error('PIN must be 6 digits.');
      return;
    }

    setIsVerifying(true);
    try {
      // Simulate verifying. Let's make any code work (or a specific mock code like 123456)
      if (pin !== '123456' && pin !== '000000') {
        toast.error('Invalid verification PIN. Try 123456.');
        setIsVerifying(false);
        return;
      }

      await editListing({
        listingId: listing.id,
        payload: {
          ...listing,
          isVerified: true,
        } as any,
      });

      toast.success('Ownership verified successfully! 🎉');
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch {
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {isVerified ? (
        /* VERIFIED STATE */
        <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="font-bold text-sm text-gray-950 flex items-center gap-1.5">
              Verified Business Listing <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-current" />
            </h4>
            <p className="text-xs text-gray-500">
              Your account has full merchant authorization. You can edit branding, pricing, and promotions.
            </p>
          </div>
        </div>
      ) : (
        /* UNVERIFIED STATE */
        <div className="space-y-6">
          {step === 'start' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-500" /> Start Ownership Verification
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Verify ownership to claim your business listing badge, increase visibility, and participate in mall promotion campaigns.
                </p>
              </div>

              <Button
                onClick={() => setStep('choose')}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold h-10 px-5 text-sm rounded-lg"
              >
                Verify My Business
              </Button>
            </div>
          )}

          {step === 'choose' && (
            <div className="space-y-5">
              <div>
                <h4 className="font-bold text-sm text-gray-900">Choose Verification Method</h4>
                <p className="text-xs text-gray-500">Select how you want to receive your one-time verification PIN.</p>
              </div>

              <div className="grid gap-3 max-w-md">
                {/* Email Option */}
                <label
                  onClick={() => setMethod('email')}
                  className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-all ${
                    method === 'email' ? 'border-orange-500 bg-orange-50/10' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Mail className={`w-5 h-5 mt-0.5 ${method === 'email' ? 'text-orange-500' : 'text-gray-400'}`} />
                    <div className="space-y-0.5">
                      <p className="font-semibold text-xs text-gray-900">Verification Email</p>
                      <p className="text-[10px] text-gray-500">
                        Send OTP code to <span className="font-medium">{listing.businessEmail || 'registered business email'}</span>
                      </p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    method === 'email' ? 'border-orange-500' : 'border-gray-300'
                  }`}>
                    {method === 'email' && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                  </div>
                </label>

                {/* SMS Option */}
                <label
                  onClick={() => setMethod('sms')}
                  className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-all ${
                    method === 'sms' ? 'border-orange-500 bg-orange-50/10' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Phone className={`w-5 h-5 mt-0.5 ${method === 'sms' ? 'text-orange-500' : 'text-gray-400'}`} />
                    <div className="space-y-0.5">
                      <p className="font-semibold text-xs text-gray-900">Verification SMS</p>
                      <p className="text-[10px] text-gray-500">
                        Send OTP text message to <span className="font-medium">{listing.businessPhone || 'registered phone number'}</span>
                      </p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    method === 'sms' ? 'border-orange-500' : 'border-gray-300'
                  }`}>
                    {method === 'sms' && <div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                  </div>
                </label>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('start')} className="h-10 text-xs font-semibold">
                  Back
                </Button>
                <Button
                  onClick={handleSendCode}
                  disabled={isSending}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold h-10 px-4 text-xs gap-1.5"
                  id="send-verification-otp-btn"
                >
                  {isSending ? 'Sending...' : 'Send Verification PIN'}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 'pin' && (
            <div className="space-y-5 max-w-sm">
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-gray-500" /> Enter Verification PIN
                </h4>
                <p className="text-xs text-gray-500">
                  Please type the 6-digit verification code sent to your business.
                </p>
              </div>

              <div className="space-y-2">
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 123456"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-lg font-bold tracking-widest h-11"
                  id="verification-otp-input"
                />
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Resend in {timer}s
                  </span>
                  <button
                    onClick={handleSendCode}
                    disabled={timer > 0 || isSending}
                    className={`font-semibold hover:underline ${
                      timer > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-orange-500'
                    }`}
                  >
                    Resend Code
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('choose')} className="h-10 text-xs font-semibold">
                  Change Method
                </Button>
                <Button
                  onClick={handleVerify}
                  disabled={isVerifying || pin.length !== 6}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold h-10 px-5 text-xs flex-grow"
                  id="verify-otp-submit-btn"
                >
                  {isVerifying ? 'Verifying...' : 'Verify & Claim Store'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
