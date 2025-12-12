'use client';

import { useState, useRef } from 'react';
import axios from 'axios';

interface OtpStepProps {
  email: string;
  nextStep: () => void;
}

export default function OtpStep({ email, nextStep }: OtpStepProps) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const firstEmptyIndex = digits.findIndex((d) => d === '');
    if (index !== firstEmptyIndex) {
      inputsRef.current[firstEmptyIndex]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d !== '')) {
      verifyOtp(newDigits.join(''));
    }
  };

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async (otp: string) => {
    try {
      await axios.post('/api/auth/verify-otp', { email, otp });
      nextStep();
    } catch (error) {
      alert('Invalid OTP');
      setDigits(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-80px)] w-full">
      <div className="flex flex-col items-center">
        <h2 className="text-center text-xl font-bold mb-6">
          Enter the 6-digit code sent to{' '}
          <span className="text-[#155dfc]">{email}</span>
        </h2>

        <div className="flex gap-3">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="w-16 h-16 text-center text-xl border rounded-md focus:ring-2 focus:ring-green-500"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
