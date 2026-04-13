// 'use client';
// import { Button } from '@/components/ui/button';
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from '@/components/ui/form';
// import { Input } from '@/components/ui/input';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { ArrowRight } from 'lucide-react';
// import { useForm } from 'react-hook-form';
// import z from 'zod';
// import Link from 'next/link';
// import axios from 'axios';
// import { auth, provider } from '@/lib/firebaseClient';
// import { signInWithPopup } from 'firebase/auth';
// import { useRouter } from 'next/navigation';
// import Image from 'next/image';

// interface Emailprops {
//   email: string;
//   setEmail: (email: string) => void;
//   nextStep: () => void;
// }

// const emailSchema = z.object({
//   email: z.string().email('Invalid email address'),
// });

// const Emailstep = ({ email, setEmail, nextStep }: Emailprops) => {
//   const form = useForm<z.infer<typeof emailSchema>>({
//     resolver: zodResolver(emailSchema),
//     defaultValues: {
//       email: email || '',
//     },
//   });

//   const router = useRouter();

//   const onSubmit = async (values: z.infer<typeof emailSchema>) => {
//     try {
//       // Save email in state
//       setEmail(values.email);

//       // Request OTP from backend
//       await axios.post('/api/auth/send-otp', {
//         email: values.email,
//       });

//       console.log(`OPT sent to ${email} successfully`);
//       // Move to OTP step
//       nextStep();
//     } catch (error) {
//       console.error(error);
//       alert('Failed to send OTP. Please try again.');
//     }
//   };

//   const handleGoogleSignIn = async () => {
//     try {
//       const result = await signInWithPopup(auth, provider);
//       const token = await result.user.getIdToken();

//       // Send token to backend
//       await axios.post('/api/auth', { idToken: token });
//       //   alert("Google sign-in successful!");
//       router.push('/dashboard');
//     } catch (error: any) {
//       console.error(
//         'Google Sign-in Error: ',
//         error.response?.data || error.message || error
//       );
//       alert('Google sign-in failed. Please try again');
//     }
//   };

//   return (
//     <>
//       <div className="mt-24">
//         <Image
//           src="/asva logo.jpg"
//           alt="asva logo"
//           height={60}
//           width={70}
//           className="mx-auto pt-4 pb-12"
//         />
//         <Button
//           onClick={handleGoogleSignIn}
//           className="mb-4 text-black bg-white grid grid-cols-[auto_auto] items-center w-62 h-12 border hover:bg-transparent rounded-full mx-auto">
//           <span className="text-center">Sign in with Google</span>
//           <Image
//             src="/google.png"
//             alt="google"
//             height={25}
//             width={25}
//           />
//         </Button>
//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(onSubmit)}
//             className="w-4/5 mx-auto sm:w-3/5 md:w-2/5 mt-4">
//             <FormField
//               control={form.control}
//               name="email"
//               render={({ field }) => (
//                 <FormItem>
//                   <div className="flex mx-auto mt-16 mb-4 items-center relative w-4/5">
//                     <FormControl className="flex-1">
//                       <Input
//                         placeholder="Email"
//                         {...field}
//                         className="h-12 pr-10"
//                       />
//                     </FormControl>
//                     <Button
//                       type="submit"
//                       size="icon"
//                       variant="ghost"
//                       className="absolute right-1 top-1/2 -translate-y-5">
//                       <ArrowRight className="w-5 h-5" />
//                     </Button>
//                   </div>
//                   <FormMessage className="text-center mb-4" />
//                 </FormItem>
//               )}
//             />
//             <p className="text-center mt-4 mb-4">
//               already have an account?{' '}
//               <span>
//                 <Link
//                   href="/login"
//                   className="underline">
//                   Login
//                 </Link>
//               </span>
//             </p>
//           </form>
//         </Form>
//       </div>
//     </>
//   );
// };

// export default Emailstep;
"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";
import Link from "next/link";
import axios from "axios";
import { auth, provider } from "@/lib/firebaseClient";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const Emailstep = ({ email, setEmail, nextStep }: any) => {
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: email || "" },
  });

  const router = useRouter();

  const onSubmit = async (values: z.infer<typeof emailSchema>) => {
    try {
      setEmail(values.email);
      await axios.post("/api/auth/send-otp", { email: values.email });
      nextStep();
    } catch (error) {
      alert("Failed to send OTP. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      await axios.post("/api/auth", { idToken: token });
      router.push("/dashboard");
    } catch (error: any) {
      alert("Google sign-in failed.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white dark:bg-gray-900 p-2 rounded-xl mb-6">
        <Image
          src="/asva logo.jpg"
          alt="logo"
          height={60}
          width={70}
        />
      </div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
        Create an account
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 text-center">
        Join ASVA and start resolving campus issues.
      </p>

      <Button
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center gap-3 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all font-medium">
        <Image
          src="/google.png"
          alt="google"
          height={20}
          width={20}
        />
        Continue with Google
      </Button>

      <div className="flex items-center w-full my-8">
        <div className="flex-1 border-t border-gray-100 dark:border-gray-800"></div>
        <span className="px-4 text-xs text-gray-400 uppercase tracking-widest">
          or email
        </span>
        <div className="flex-1 border-t border-gray-100 dark:border-gray-800"></div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="relative">
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Email address"
                      {...field}
                      className="h-12 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 focus:ring-2 focus:ring-black dark:focus:ring-white pr-12"
                    />
                    <Button
                      type="submit"
                      size="icon"
                      variant="ghost"
                      className="absolute right-2 top-1/2 -translate-y-1/2 hover:bg-transparent">
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-black dark:text-white hover:underline">
              Login
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
};

export default Emailstep;
