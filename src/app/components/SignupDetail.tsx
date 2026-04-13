// "use client";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import z from "zod";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from "@/components/ui/form";
// import { CollegeSelect } from "./CollegeSelect";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { auth } from "@/lib/firebaseClient";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import Image from "next/image";
// import { Check, X } from "lucide-react";

// interface Detailsprop {
//   email: string;
// }

// const detailSchema = z
//   .object({
//     name: z.string().min(2, "Name must be at least two characters"),
//     collegeId: z.string().min(1, "Please select your college"),
//     password: z.string().min(8, "Password must be at least 8 characters"),
//     confirmpassword: z
//       .string()
//       .min(8, "Password must be at least 8 characters"),
//   })
//   .refine((data) => data.password === data.confirmpassword, {
//     path: ["confirmpassword"],
//     message: "Passwords do not match",
//   });

// type DetailsFormValues = z.infer<typeof detailSchema>;

// const Details = ({ email }: Detailsprop) => {
//   const form = useForm<DetailsFormValues>({
//     resolver: zodResolver(detailSchema),
//     defaultValues: {
//       name: "",
//       collegeId: "",
//       password: "",
//       confirmpassword: "",
//     },
//   });

//   const router = useRouter();

// const onSubmit = async (values: DetailsFormValues) => {
//   console.log("FORM VALUES:", values);
//   try {
//     // 1. Create Firebase user only if OTP was verified
//     const userCredential = await createUserWithEmailAndPassword(
//       auth,
//       email,
//       values.password,
//     );
//     const user = userCredential.user;
//     const idToken = await user.getIdToken();

//     // 2. Send token + name to backend
//     // Backend will verify OTP before creating MongoDB user
//     const res = await axios.post("/api/auth", {
//       idToken,
//       name: values.name,
//       collgeId: values.collegeId,
//       // NOTE: Sending email and uid directly as fallback while server-side
//       // Firebase token verification is temporarily disabled.
//       // Remove these once adminAuth.verifyIdToken is re-enabled.
//       email: user.email,
//       uid: user.uid,
//     });

//     router.push("/dashboard");
//   } catch (error: any) {
//     // If backend rejects due to missing OTP verification, delete Firebase user
//     if (error.response?.status === 403 && error.response?.data?.error?.includes("verification")) {
//       try {
//         const user = auth.currentUser;
//         if (user) await user.delete();
//       } catch (deleteErr) {
//         console.error("Failed to delete Firebase user:", deleteErr);
//       }
//     }

//     if (axios.isAxiosError(error)) {
//       console.error("Axios error: ", error.response?.data || error.message);
//       alert(error.response?.data?.error || "Signup failed. Please try again.");
//     } else {
//       console.error("sign-up error: ", error.message);
//       alert(error.message);
//     }
//   }
// };

//   const password = form.watch("password");
//   const confirmPassword = form.watch("confirmpassword");

//   const passwordChecks = {
//     length: password?.length >= 8,
//     lowercase: /[a-z]/.test(password || ""),
//     uppercase: /[A-Z]/.test(password || ""),
//     number: /\d/.test(password || ""),
//     special: /[^A-Za-z0-9]/.test(password || ""),
//   };

//   const passwordsMatch =
//     password && confirmPassword && password === confirmPassword;

//   const {
//     formState: { touchedFields },
//   } = form;

//   const isPasswordTouched = touchedFields.password;

//   return (
//     <>
//       <div>
//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(onSubmit)}
//             className="w-4/5 mx-auto sm:w-3/5 md:w-2/5 mt-20">
//             <Image
//               src="/asva logo.jpg"
//               alt="asva logo"
//               height={60}
//               width={70}
//               className="mx-auto pt-4 pb-12"
//             />
//             <h2 className="font-bold text-xl text-center pb-4">
//               Sign in with Google
//             </h2>
//             <FormField
//               control={form.control}
//               name="name"
//               render={({ field }) => (
//                 <FormItem>
//                   <div className="mx-auto mt-4 w-4/5">
//                     <FormControl>
//                       <Input
//                         placeholder="Full Name"
//                         {...field}
//                         className="h-11"
//                       />
//                     </FormControl>
//                   </div>
//                   <FormMessage className="text-center mb-4" />
//                 </FormItem>
//               )}
//             />
//             <FormField
//               control={form.control}
//               name="password"
//               render={({ field }) => (
//                 <FormItem>
//                   <div className="mx-auto mt-4 w-4/5">
//                     <FormControl>
//                       <Input
//                         type="password"
//                         placeholder="Password"
//                         {...field}
//                         className="h-11"
//                       />
//                     </FormControl>
//                   </div>
//                   <FormMessage className="text-center mb-4" />
//                 </FormItem>
//               )}
//             />
//             {isPasswordTouched && password && (
//               <div className="mx-auto w-4/5 mt-2 text-sm space-y-1">
//                 <p
//                   className={
//                     passwordChecks.length
//                       ? "text-green-600 flex items-center gap-1"
//                       : "text-red-500 flex items-center gap-1"
//                   }>
//                   {passwordChecks.length ? <Check /> : <X />}
//                   At least 8 characters
//                 </p>
//                 <p
//                   className={
//                     passwordChecks.lowercase
//                       ? "text-green-600 flex items-center gap-1"
//                       : "text-red-500 flex items-center gap-1"
//                   }>
//                   {passwordChecks.lowercase ? <Check /> : <X />}
//                   One lowercase letter
//                 </p>
//                 <p
//                   className={
//                     passwordChecks.uppercase
//                       ? "text-green-600 flex items-center gap-1"
//                       : "text-red-500 flex items-center gap-1"
//                   }>
//                   {passwordChecks.uppercase ? <Check /> : <X />}
//                   One uppercase letter
//                 </p>
//                 <p
//                   className={
//                     passwordChecks.number
//                       ? "text-green-600 flex items-center gap-1"
//                       : "text-red-500 flex items-center gap-1"
//                   }>
//                   {passwordChecks.number ? <Check /> : <X />}
//                   One number
//                 </p>
//                 <p
//                   className={
//                     passwordChecks.special
//                       ? "text-green-600 flex items-center gap-1"
//                       : "text-red-500 flex items-center gap-1"
//                   }>
//                   {passwordChecks.special ? <Check /> : <X />}
//                   One special character
//                 </p>
//               </div>
//             )}

//             <FormField
//               control={form.control}
//               name="confirmpassword"
//               render={({ field }) => (
//                 <FormItem>
//                   <div className="mx-auto mt-4 w-4/5">
//                     <FormControl>
//                       <Input
//                         type="password"
//                         placeholder="Confirm password"
//                         {...field}
//                         className="h-11"
//                       />
//                     </FormControl>
//                   </div>
//                   <FormMessage className="text-center mb-4" />
//                 </FormItem>
//               )}
//             />
//             {touchedFields.confirmpassword && confirmPassword && (
//               <p
//                 className={`text-center text-sm mt-1 ${
//                   passwordsMatch ? "text-green-600" : "text-red-500"
//                 }`}>
//                 {passwordsMatch ? "Passwords match" : "Passwords do not match"}
//               </p>
//             )}

//             <FormField
//               control={form.control}
//               name="collegeId"
//               render={({ field }) => (
//                 <FormItem>
//                   <div className="mx-auto mt-4 w-4/5">
//                     <FormControl>
//                       <CollegeSelect
//                         value={field.value}
//                         onChange={field.onChange}
//                       />
//                     </FormControl>
//                   </div>
//                   <FormMessage className="text-center mb-4" />
//                 </FormItem>
//               )}
//             />
//             <Button
//               className="mx-auto block mt-4 w-4/5"
//               disabled={
//                 !Object.values(passwordChecks).every(Boolean) || !passwordsMatch
//               }>
//               Create Account
//             </Button>

//             <p className="text-center mt-4 mb-4">
//               already have an account?{" "}
//               <span>
//                 <Link
//                   href="#"
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

// export default Details;
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { CollegeSelect } from "./CollegeSelect";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/lib/firebaseClient";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Image from "next/image";
import { Check, X } from "lucide-react";

const detailSchema = z
  .object({
    name: z.string().min(2, "Name must be at least two characters"),
    collegeId: z.string().min(1, "Please select your college"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmpassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmpassword, {
    path: ["confirmpassword"],
    message: "Passwords do not match",
  });

const Details = ({ email }: { email: string }) => {
  const form = useForm<z.infer<typeof detailSchema>>({
    resolver: zodResolver(detailSchema),
    defaultValues: {
      name: "",
      collegeId: "",
      password: "",
      confirmpassword: "",
    },
  });

  const router = useRouter();
  const password = form.watch("password");
  const confirmPassword = form.watch("confirmpassword");

  const passwordChecks = {
    length: password?.length >= 8,
    lowercase: /[a-z]/.test(password || ""),
    uppercase: /[A-Z]/.test(password || ""),
    number: /\d/.test(password || ""),
    special: /[^A-Za-z0-9]/.test(password || ""),
  };

  const onSubmit = async (values: any) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        values.password,
      );
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      await axios.post("/api/auth", {
        idToken,
        name: values.name,
        collgeId: values.collegeId,
        email: user.email,
        uid: user.uid,
      });
      router.push("/dashboard");
    } catch (error: any) {
      alert("Signup failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Almost there
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Complete your profile to finish.
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Full Name"
                    {...field}
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 dark:text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Password"
                    {...field}
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 dark:text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dynamic Validation Feedback */}
          {password && (
            <div className="grid grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800">
              {Object.entries(passwordChecks).map(([key, valid]) => (
                <div
                  key={key}
                  className={`flex items-center gap-2 text-[11px] font-medium ${valid ? "text-green-600 dark:text-green-400" : "text-gray-400"}`}>
                  {valid ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-current" />
                  )}
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </div>
              ))}
            </div>
          )}

          <FormField
            control={form.control}
            name="confirmpassword"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    {...field}
                    className="h-12 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 dark:text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="collegeId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <CollegeSelect
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className="w-full h-12 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 rounded-xl font-medium transition-all shadow-md mt-4"
            disabled={
              !Object.values(passwordChecks).every(Boolean) ||
              password !== confirmPassword
            }>
            Create Account
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Details;
