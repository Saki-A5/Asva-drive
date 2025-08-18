import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight } from "lucide-react"
import { useForm } from "react-hook-form"
import z from "zod"

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
    const onSubmit = (values: z.infer<typeof emailSchema>) => {
        setEmail(values.email)
        nextStep()
    }
   
    return(
        <>
        <div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                className="w-4/5 mx-auto"
                >
                    <img src="/asva logo.jpg" alt="asva logo" height={60} width={70} className="mx-auto pt-4 pb-12"/>
                    <h2 className="font-bold text-xl text-center pb-4">Sign in with Google</h2>
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
                {/* <Button type="submit" size="icon" variant="ghost" 
                className="absolute right-1 top-1/2 -translate-y-12">Next</Button> */}
                </form>
            </Form>
        </div>
        </>
    )
}

export default Emailstep