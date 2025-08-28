"use client"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight } from "lucide-react"
import { useForm } from "react-hook-form"
import z from "zod"
import Link from "next/link"
import axios from "axios"
import { auth, provider } from "@/lib/firebaseClient"
import { signInWithPopup } from "firebase/auth"
import { useRouter } from "next/navigation"

interface Emailprops {
    email: string
    setEmail: (email: string) => void
    nextStep: () => void
}

const emailSchema = z.object({
    email: z.string().email("Invalid email address"),
})

const Emailstep = ({email, setEmail, nextStep}: Emailprops) => {
    const form = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: {
            email: email || '',
        }
    })

    const router = useRouter()

    const onSubmit = (values: z.infer<typeof emailSchema>) => {
        setEmail(values.email)
        nextStep()
    }
    const handleGoogleSignIn = async () => {
        try {
          const result = await signInWithPopup(auth, provider);
          const token = await result.user.getIdToken();
    
          // Send token to backend
          await axios.post("/api/auth", { idToken: token });
        //   alert("Google sign-in successful!");
          router.push("/"); 
        } catch (error:any) {
          console.error("Google Sign-in Error: ", error.response?.data || error.message || error);
          alert("Google sign-in failed. Please try again" );
        }
      };

    return(
        <>
        <div className="mt-24">
            <img src="/asva logo.jpg" alt="asva logo" height={60} width={70} className="mx-auto pt-4 pb-12"/>
            <Button onClick={handleGoogleSignIn}
                className="mb-4 text-black bg-white grid grid-cols-[auto_auto] items-center w-62 h-12 border hover:bg-transparent rounded-full mx-auto">
                <span className="text-center">Sign in with Google</span>
                <img src="/google.png" alt="google"/>
            </Button>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                className="w-4/5 mx-auto sm:w-3/5 md:w-2/5 mt-4"
                >
                <FormField 
                control={form.control}
                name = 'email'
                render={({field}) => (
                    <FormItem>
                        <div className="flex mx-auto mt-16 mb-4 items-center relative w-4/5">
                        <FormControl className="flex-1">
                            <Input placeholder="Email" {...field}  className="h-12 pr-10"/>
                        </FormControl>
                        <Button type="submit" size="icon" variant="ghost" 
                className="absolute right-1 top-1/2 -translate-y-5"><ArrowRight className="w-5 h-5"/></Button>
                        </div>
                        <FormMessage className="text-center mb-4"/>
                    </FormItem>
                )}
                />
                <p className="text-center mt-4 mb-4">already have an account? <span><Link href="#" className="underline">Login</Link></span></p>
                </form>
            </Form>
        </div>
        </>
    )
}

export default Emailstep