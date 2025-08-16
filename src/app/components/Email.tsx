import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
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
                className="w-4/5 mx-auto border-8"
                >
                    <img src="/asva logo.jpg" alt="asva logo" height={30} width={30}/>
                <FormField 
                control={form.control}
                name = 'email'
                render={({field}) => (
                    <FormItem>
                        <FormControl>
                            <Input placeholder="Email" {...field}  className="w-4/5"/>
                        </FormControl>
                        <FormMessage/>
                    </FormItem>
                )}
                />
                <Button>Next</Button>
                </form>
            </Form>
        </div>
        </>
    )
}

export default Emailstep