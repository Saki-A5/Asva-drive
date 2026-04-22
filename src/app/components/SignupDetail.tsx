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
// import { PasswordInput } from "@/components/ui/PasswordInput";
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

//   const onSubmit = async (values: DetailsFormValues) => {
//     console.log("FORM VALUES:", values);
//     try {
//       // 1. Create Firebase user only if OTP was verified
//       const userCredential = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         values.password,
//       );
//       const user = userCredential.user;
//       const idToken = await user.getIdToken();

//       // 2. Send token + name to backend
//       // Backend will verify OTP before creating MongoDB user
//       const res = await axios.post("/api/auth", {
//         idToken,
//         name: values.name,
//         collgeId: values.collegeId,
//         // NOTE: Sending email and uid directly as fallback while server-side
//         // Firebase token verification is temporarily disabled.
//         // Remove these once adminAuth.verifyIdToken is re-enabled.
//         email: user.email,
//         uid: user.uid,
//       });

//       router.push("/dashboard");
//     } catch (error: any) {
//       // If backend rejects due to missing OTP verification, delete Firebase user
//       if (
//         error.response?.status === 403 &&
//         error.response?.data?.error?.includes("verification")
//       ) {
//         try {
//           const user = auth.currentUser;
//           if (user) await user.delete();
//         } catch (deleteErr) {
//           console.error("Failed to delete Firebase user:", deleteErr);
//         }
//       }

//       if (axios.isAxiosError(error)) {
//         console.error("Axios error: ", error.response?.data || error.message);
//         alert(
//           error.response?.data?.error || "Signup failed. Please try again.",
//         );
//       } else {
//         console.error("sign-up error: ", error.message);
//         alert(error.message);
//       }
//     }
//   };

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
//       {/* <div>
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
//                       <PasswordInput
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
//                       <PasswordInput
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
//       </div> */}
//       <div className="flex flex-col items-center justify-center py-10 px-4">
//         <div
//           className="w-full max-w-[480px] p-8 rounded-3xl border transition-all duration-300
//         bg-white border-slate-200 shadow-xl
//         dark:bg-[#11141d] dark:border-white/5 dark:shadow-2xl"
//         >
//           {/* Logo Section */}
//           <div className="flex flex-col items-center mb-8">
//             <div
//               className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden mb-4
//             bg-slate-100 dark:bg-black border dark:border-white/10"
//             >
//               <Image
//                 src="/asva logo.jpg"
//                 alt="logo"
//                 height={40}
//                 width={40}
//                 className="object-contain"
//               />
//             </div>
//             <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
//               Complete your profile
//             </h2>
//           </div>

//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
//               {/* Full Name Field */}
//               <FormField
//                 control={form.control}
//                 name="name"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormControl>
//                       <Input
//                         placeholder="Full Name"
//                         {...field}
//                         className="h-12 rounded-xl bg-slate-50 dark:bg-[#0a0c12] border-slate-200 dark:border-white/10 dark:text-white"
//                       />
//                     </FormControl>
//                     <FormMessage className="text-xs ml-1" />
//                   </FormItem>
//                 )}
//               />

//               {/* Password Field */}
//               <FormField
//                 control={form.control}
//                 name="password"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormControl>
//                       <PasswordInput
//                         placeholder="Create Password"
//                         {...field}
//                         className="h-12 rounded-xl bg-slate-50 dark:bg-[#0a0c12] border-slate-200 dark:border-white/10 dark:text-white"
//                       />
//                     </FormControl>
//                     <FormMessage className="text-xs ml-1" />
//                   </FormItem>
//                 )}
//               />

//               {/* Password Validation Grid - Much cleaner than a vertical list */}
//               {isPasswordTouched && password && (
//                 <div className="grid grid-cols-2 gap-2 p-4 rounded-xl bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5">
//                   {[
//                     { key: "length", label: "8+ characters" },
//                     { key: "lowercase", label: "Lowercase" },
//                     { key: "uppercase", label: "Uppercase" },
//                     { key: "number", label: "Number" },
//                     { key: "special", label: "Special char" },
//                   ].map((check) => (
//                     <div
//                       key={check.key}
//                       className={`flex items-center gap-2 text-xs transition-colors ${
//                         passwordChecks[check.key]
//                           ? "text-emerald-500"
//                           : "text-slate-400 dark:text-slate-500"
//                       }`}
//                     >
//                       {passwordChecks[check.key] ? (
//                         <Check className="w-3 h-3" />
//                       ) : (
//                         <X className="w-3 h-3" />
//                       )}
//                       {check.label}
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* Confirm Password */}
//               <FormField
//                 control={form.control}
//                 name="confirmpassword"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormControl>
//                       <PasswordInput
//                         placeholder="Confirm Password"
//                         {...field}
//                         className="h-12 rounded-xl bg-slate-50 dark:bg-[#0a0c12] border-slate-200 dark:border-white/10 dark:text-white"
//                       />
//                     </FormControl>
//                     {touchedFields.confirmpassword && confirmPassword && (
//                       <p
//                         className={`text-[11px] mt-1 ml-1 font-medium ${passwordsMatch ? "text-emerald-500" : "text-red-500"}`}
//                       >
//                         {passwordsMatch
//                           ? "✓ Passwords match"
//                           : "✕ Passwords do not match"}
//                       </p>
//                     )}
//                     <FormMessage className="text-xs ml-1" />
//                   </FormItem>
//                 )}
//               />

//               {/* College Selection */}
//               <FormField
//                 control={form.control}
//                 name="collegeId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormControl>
//                       <CollegeSelect
//                         value={field.value}
//                         onChange={field.onChange}
//                       />
//                     </FormControl>
//                     <FormMessage className="text-xs ml-1" />
//                   </FormItem>
//                 )}
//               />

//               {/* Submit Button */}
//               <Button
//                 className="w-full h-12 rounded-xl font-semibold transition-all
//                 bg-slate-900 text-white hover:bg-slate-800
//                 dark:bg-white dark:text-black dark:hover:bg-slate-200
//                 disabled:opacity-50 disabled:grayscale"
//                 disabled={
//                   !Object.values(passwordChecks).every(Boolean) ||
//                   !passwordsMatch
//                 }
//               >
//                 Create Account
//               </Button>

//               <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
//                 Already have an account?{" "}
//                 <Link
//                   href="/login"
//                   className="font-semibold text-slate-900 dark:text-white hover:underline"
//                 >
//                   Login
//                 </Link>
//               </p>
//             </form>
//           </Form>
//         </div>
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
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@/lib/firebaseClient";
import axios from "axios";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import Image from "next/image";
import { Check, X } from "lucide-react";

interface Detailsprop {
  email: string;
}

const detailSchema = z
  .object({
    name: z.string().min(2, "Name must be at least two characters"),
    collegeId: z.string().min(1, "Please select your college"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmpassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmpassword, {
    path: ["confirmpassword"],
    message: "Passwords do not match",
  });

type DetailsFormValues = z.infer<typeof detailSchema>;

const Details = ({ email }: Detailsprop) => {
  const router = useRouter();

  const form = useForm<DetailsFormValues>({
    resolver: zodResolver(detailSchema),
    mode: "onChange", // CRITICAL: Makes validation happen as you type
    defaultValues: {
      name: "",
      collegeId: "",
      password: "",
      confirmpassword: "",
    },
  });

  // Watch values for real-time UI updates
  const password = form.watch("password") || "";
  const confirmPassword = form.watch("confirmpassword") || "";

  const passwordChecks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const onSubmit = async (values: DetailsFormValues) => {
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
        collegeId: values.collegeId, // Fixed the typo from 'collgeId'
        email: user.email,
        uid: user.uid,
      });

      router.push("/dashboard");
    } catch (error: any) {
      if (error.response?.status === 403) {
        const user = auth.currentUser;
        if (user) await user.delete();
      }
      alert(error.response?.data?.error || error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-15 lg:pt-50 px-4 animate-in fade-in duration-500">
      <div
        className="w-full max-w-[500px] p-8 rounded-3xl border transition-all duration-300
        bg-white border-slate-200 shadow-xl
        dark:bg-[#11141d] dark:border-white/5 dark:shadow-2xl"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden mb-4
            bg-slate-100 dark:bg-black border dark:border-white/10"
          >
            <Image
              src="/asva logo.jpg"
              alt="logo"
              height={40}
              width={40}
              className="object-contain"
            />
          </div>
          <h2 className="text-xl md:text-2xl text-center font-semibold tracking-tight text-slate-900 dark:text-white">
            Complete your profile
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {email}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Full Name"
                      {...field}
                      className="h-12 rounded-xl bg-slate-50 dark:bg-[#0a0c12] border-slate-200 dark:border-white/10 dark:text-white"
                    />
                  </FormControl>
                  <FormMessage className="text-[11px] ml-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <PasswordInput
                      placeholder="Create Password"
                      {...field}
                      className="h-12 rounded-xl bg-slate-50 dark:bg-[#0a0c12] border-slate-200 dark:border-white/10 dark:text-white"
                    />
                  </FormControl>
                  <FormMessage className="text-[11px] ml-1" />
                </FormItem>
              )}
            />

            {/* Validation Grid */}
            {password.length > 0 && (
              <div className="grid grid-cols-2 gap-2 p-4 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-100 dark:border-white/5">
                {Object.entries(passwordChecks).map(([key, isMet]) => (
                  <div
                    key={key}
                    className={`flex items-center gap-2 text-[11px] transition-colors ${
                      isMet
                        ? "text-emerald-500"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {isMet ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                    <span className="capitalize">
                      {key === "special" ? "Special character" : key}
                    </span>
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
                    <PasswordInput
                      placeholder="Confirm Password"
                      {...field}
                      className="h-12 rounded-xl bg-slate-50 dark:bg-[#0a0c12] border-slate-200 dark:border-white/10 dark:text-white"
                    />
                  </FormControl>
                  {confirmPassword.length > 0 && (
                    <p
                      className={`text-[11px] mt-1 ml-1 font-medium ${passwordsMatch ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {passwordsMatch
                        ? "✓ Passwords match"
                        : "✕ Passwords do not match"}
                    </p>
                  )}
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
                  <FormMessage className="text-[11px] ml-1" />
                </FormItem>
              )}
            />

            <Button
              className="w-full h-12 rounded-xl font-semibold transition-all
                bg-slate-900 text-white hover:bg-slate-800
                dark:bg-white dark:text-black dark:hover:bg-slate-200 
                disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!form.formState.isValid || !passwordsMatch}
            >
              Create Account
            </Button>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-slate-900 dark:text-white hover:underline"
              >
                Login
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Details;
