'use client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import Link from 'next/link';
import axios from 'axios';
import { auth, provider } from '@/lib/firebaseClient';
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Emailprops {
  email: string;
  setEmail: (email: string) => void;
  nextStep: () => void;
}

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const Emailstep = ({ email, setEmail, nextStep }: Emailprops) => {
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: email || '',
    },
  });

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof emailSchema>) => {
    try {
      // Save email in state
      setEmail(values.email);

      // Request OTP from backend
      await axios.post('/api/auth/send-otp', {
        email: values.email,
      });

      console.log(`OPT sent to ${email} successfully`);
      // Move to OTP step
      nextStep();
    } catch (error) {
      console.error(error);
      alert('Failed to send OTP. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      // Send token to backend
      await axios.post('/api/auth', { idToken: token });
      //   alert("Google sign-in successful!");
      router.push('/dashboard');
    } catch (error: any) {
      console.error(
        'Google Sign-in Error: ',
        error.response?.data || error.message || error
      );
      alert('Google sign-in failed. Please try again');
    }
  };

  return (
    <>
      <div className="flex items-center justify-center min-h-screen pt-10 px-4 bg-white dark:bg-[#0a0c12]">
      {/* Main Card */}
      <div className="w-full max-w-[500px] p-8 rounded-3xl border transition-all duration-300
        bg-white border-slate-200 shadow-xl
        dark:bg-[#11141d] dark:border-white/5 dark:shadow-2xl">
        
        {/* The Logo Box */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden
            bg-slate-100 dark:bg-black border dark:border-white/10">
            <Image
              src="/asva logo.jpg"
              alt="asva logo"
              height={50}
              width={50}
              className="object-contain p-2"
            />
          </div>
        </div>

        {/* Text Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Create an account
          </h1>
          <p className="text-sm mt-2 text-slate-500 dark:text-slate-400">
            Join ASVA and start resolving campus issues.
          </p>
        </div>

        {/* Google Sign In */}
        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full h-12 rounded-xl flex items-center justify-center gap-3 transition-all
            bg-white border-slate-200 text-slate-900 hover:bg-slate-50
            dark:bg-[#11141d] dark:border-white/10 dark:text-white dark:hover:bg-white/5"
        >
          <Image src="/google.png" alt="google" height={20} width={20} />
          <span className="font-medium">Continue with Google</span>
        </Button>

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-grow h-[1px] bg-slate-200 dark:bg-white/5"></div>
          <span className="px-4 text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">
            OR EMAIL
          </span>
          <div className="flex-grow h-[1px] bg-slate-200 dark:bg-white/5"></div>
        </div>

        {/* Email Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="relative group">
                    <FormControl>
                      <Input
                        placeholder="Email address"
                        {...field}
                        className="h-14 w-full px-4 rounded-xl border transition-all
                          bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-slate-300
                          dark:bg-[#0a0c12] dark:border-white/10 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-white/20"
                      />
                    </FormControl>
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all
                        hover:bg-slate-200 text-slate-600
                        dark:hover:bg-white/5 dark:text-slate-400"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                  <FormMessage className="text-center text-xs mt-2" />
                </FormItem>
              )}
            />

            {/* Footer */}
            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-semibold text-slate-900 dark:text-white hover:underline decoration-slate-400"
              >
                Login
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
    </>
  );
};

export default Emailstep;
