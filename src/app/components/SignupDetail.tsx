'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { auth } from '@/lib/firebaseClient';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import Image from 'next/image';

interface Detailsprop {
  email: string;
}

const detailSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least two characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmpassword: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmpassword, {
    path: ['confirm password'],
    message: 'passwords do not match',
  });

type DetailsFormValues = z.infer<typeof detailSchema>;

const Details = ({ email }: Detailsprop) => {
  const form = useForm<DetailsFormValues>({
    resolver: zodResolver(detailSchema),
    defaultValues: {
      name: '',
      password: '',
      confirmpassword: '',
    },
  });

  const router = useRouter();

  const onSubmit = async (values: DetailsFormValues) => {
    try {
      // 1. Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        values.password
      );
      const user = userCredential.user;
      const idToken = await user.getIdToken();

      // 3. Send token + name to backend
      const res = await axios.post('/api/auth', {
        idToken,
        name: values.name,
      });
      router.push('/dashboard');
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error('Axios error: ', error.response?.data || error.message);
        alert('Signup failed. Please try again.');
      } else {
        console.error('sign-up error: ', error.message);
        alert(error.message);
      }
    }
  };

  return (
    <>
      <div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-4/5 mx-auto sm:w-3/5 md:w-2/5 mt-20">
            <Image
              src="/asva logo.jpg"
              alt="asva logo"
              height={60}
              width={70}
              className="mx-auto pt-4 pb-12"
            />
            <h2 className="font-bold text-xl text-center pb-4">
              Sign in with Google
            </h2>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="mx-auto mt-4 w-4/5">
                    <FormControl>
                      <Input
                        placeholder="Full Name"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-center mb-4" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="mx-auto mt-4 w-4/5">
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-center mb-4" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmpassword"
              render={({ field }) => (
                <FormItem>
                  <div className="mx-auto mt-4 w-4/5">
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm password"
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-center mb-4" />
                </FormItem>
              )}
            />
            <Button className="mx-auto block mt-4 w-4/5">Create Account</Button>
            <p className="text-center mt-4 mb-4">
              already have an account?{' '}
              <span>
                <Link
                  href="#"
                  className="underline">
                  Login
                </Link>
              </span>
            </p>
          </form>
        </Form>
      </div>
    </>
  );
};

export default Details;
