'use client';
import Emailstep from '../components/Email';
import OtpStep from '../components/OtpStep';
import { useState } from 'react';
import Link from 'next/link';
import Details from '../components/SignupDetail';
import { Button } from '@/components/ui/button';

const Signup = () => {
  const [step, setStep] = useState<'email' | 'otp' | 'details'>('email');
  const [email, setEmail] = useState('');

  const nextStep = () => {
    if (step === 'email') setStep('otp');
    else if (step === 'otp') setStep('details');
  };

  return (
    <>
      <div className=" flex h-20 pt-2">
        <Link href="/">
          <h2 className="font-bold ml-4">ASVA</h2>
        </Link>
        <Link
          className="ml-auto mr-4"
          href="/login">
          <Button className="bg-blue-600 hover:bg-blue-800">Log in</Button>
        </Link>
      </div>

      <div>
        {step === 'email' && (
          <Emailstep
            email={email}
            setEmail={setEmail}
            nextStep={nextStep}
          />
        )}

        {step === 'otp' && (
          <OtpStep
            email={email}
            nextStep={nextStep}
          />
        )}

        {step === 'details' && <Details email={email} />}
      </div>
    </>
  );
};

export default Signup;
