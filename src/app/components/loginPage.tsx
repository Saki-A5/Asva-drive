'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {auth, provider} from "@/lib/firebaseClient"
import axios from "axios"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

type loginForm = z.infer<typeof loginSchema>

const Loginpage = () => {
    const form = useForm<loginForm>({
        resolver: zodResolver(loginSchema)
    })

    const router = useRouter()

    const handleGoogleLogIn = async () => {
        try {
            const result = await signInWithPopup(auth, provider);
            const token = await result.user.getIdToken();
        
            console.log("Google ID Token:", token);
            // Send token to backend
            await axios.post("/api/loginauth", { idToken: token });
            router.push("/dashboard"); 
        } catch (error:any) {
            console.error("Google login Error: ", error.response?.data || error.message || error);
            alert("Google login failed." );
        }
    };
    const onSubmit = async(values: loginForm) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password) ;
            const user = userCredential.user;
            const idToken = await user.getIdToken();

      // 3. Send token + name to backend
            await axios.post("/api/loginauth", {
                idToken
            })
            router.push("/dashboard");
        } catch (error:any) {
            let message = "Login failed. Please try again.";
            if (error.code === 'auth/user-not-found') {
                message = "No user found with this email. Please sign up first.";
            } else if (error.code === 'auth/wrong-password') {
                message = "Incorrect password. Please try again.";
            } else if (error.code === 'auth/invalid-credential') {
                message = "Invalid credentials. Please check your email and password.";
            }

            console.error("Email login error: ", error);
            alert(error.code || message);       
        }
    };

    return(
        <>
        <div className="mt-22">
            <img src="/asva logo.jpg" alt="asva logo" height={60} width={70} className="mx-auto pt-4 pb-10"/>
            <Button onClick={handleGoogleLogIn}
                className="mb-4 text-black bg-white grid grid-cols-[auto_auto] items-center w-62 h-12 border hover:bg-transparent rounded-full mx-auto">
                <span className="text-center">Sign in with Google</span>
                <img src="/google.png" alt="google"/>
            </Button>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                className="w-4/5 mx-auto sm:w-3/5 md:w-2/5 mt-14"
                >
                <FormField 
                control={form.control}
                name = 'email'
                render={({field}) => (
                    <FormItem>
                        <div className="flex mx-auto mb-2 items-center relative w-4/5">
                        <FormControl className="flex-1">
                            <Input placeholder="Email" {...field}  className="h-12 pr-10"/>
                        </FormControl>
                        </div>
                        <FormMessage className="text-center mb-4"/>
                    </FormItem>
                )}
                />
                <FormField 
                control={form.control}
                name = 'password'
                render={({field}) => (
                    <FormItem>
                        <div className="mx-auto mt-2 w-4/5">
                        <FormControl>
                            <Input type="password" placeholder="Password" {...field}  className="h-12 pr-10"/>
                        </FormControl>
                        </div>
                        <FormMessage className="text-center mb-4"/>
                    </FormItem>
                )}
                />
                <Button className="mx-auto block mt-4 w-4/5">Login</Button>
                <p className="text-center mt-2 mb-2">
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Forgot Password?
                  </Link>
                </p>
                <p className="text-center mt-4 mb-4">Don't have an account? <span><Link href="/signup" className="underline">Signup</Link></span></p>
                </form>
            </Form>
        </div>
        </>
    )
}

export default Loginpage