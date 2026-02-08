import React, { useRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

export default function OTPInput({ length = 6, value, onChange }: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Sync internal state with external value if it changes externally (e.g. paste)
    if (value && value.length === length) {
        setOtp(value.split(''));
    }
  }, [value, length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (isNaN(Number(val))) return;

    const newOtp = [...otp];
    // Take the last character entered
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);
    onChange(newOtp.join(''));

    // Move to next input
    if (val && index < length - 1 && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputsRef.current[index - 1]) {
      // Move to previous input on backspace if current is empty
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text').slice(0, length);
      if(!/^\d+$/.test(pastedData)) return; // Only allow numbers

      const newOtp = pastedData.split('');
      // Fill remaining with empty strings if paste is shorter than length
      while (newOtp.length < length) newOtp.push('');

      setOtp(newOtp);
      onChange(newOtp.join(''));

      // Focus the last filled input or the first empty one
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputsRef.current[focusIndex]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, index) => (
        <Input
          key={index}
          type="text"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          ref={(el) => { inputsRef.current[index] = el }}
          className="w-12 h-14 text-center text-2xl border-gray-300 rounded-md focus:border-blue-600 focus:ring-blue-600"
        />
      ))}
    </div>
  );
}
