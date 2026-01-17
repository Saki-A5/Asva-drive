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
import { getRedirectResult, signInWithEmailAndPassword, signInWithRedirect } from "firebase/auth"
import { useEffect } from "react"

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
            await signInWithRedirect(auth, provider)
        } catch (error:any) {
            console.error("Google login Error: ", error.response?.data || error.message || error);
            alert("Google login failed." );
        }
    };

    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth)

                if (!result) return;

                const user = result.user
                const idToken = await user.getIdToken();
                await axios.post("/api/loginauth", {idToken})
                window.location.href = "/dashboard"
                // router.push("/dashboard")
            } catch (error: any) {
                console.error("Redirect login error:", error)
                alert("Google login failed")
            }
        }

        handleRedirectResult();
    }, [router])
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
            <div className="flex w-full justify-center items-center gap-1 mt-6">
                <hr className="md:w-[15%] [@media(min-width:640px)_and_(max-width:768px)]:w-[22%] [@media(min-width:300px)_and_(max-width:640px)]:w-[30%]"/>
                <p>or</p>
                <hr className="md:w-[15%] [@media(min-width:640px)_and_(max-width:768px)]:w-[22%] [@media(min-width:300px)_and_(max-width:640px)]:w-[30%]"/>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                className="w-4/5 mx-auto sm:w-3/5 md:w-2/5 mt-6"
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