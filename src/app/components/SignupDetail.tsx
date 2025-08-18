'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import z from "zod"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Detailsprop {
    email: string
}

const detailSchema = z.object({
    name: z.string().min(2, "Name must be at least two characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmpassword: z.string().min(6, "Password must be at least 6 characters")
}).refine((data) => data.password === data.confirmpassword, {
    path: ["confirm password"],
    message: "passwords do not match"
})

type DetailsFormValues = z.infer<typeof detailSchema>

const Details = ({email} : Detailsprop) => {
    const form = useForm<DetailsFormValues>({
        resolver: zodResolver(detailSchema),
        defaultValues: {
            name: '',
            password: '',
            confirmpassword: ''
        }
    })

    const onSubmit = (e:any) => {
        e.preventDefault()        
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
                name = 'name'
                render={({field}) => (
                    <FormItem>
                        <div className="mx-auto mt-4 w-4/5">
                        <FormControl>
                            <Input placeholder="Full Name" {...field} />
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
                        <div className="mx-auto mt-4 w-4/5">
                        <FormControl>
                            <Input type="password" placeholder="Password" {...field}  />
                        </FormControl>
                        </div>
                        <FormMessage className="text-center mb-4"/>
                    </FormItem>
                )}
                />
                <FormField 
                control={form.control}
                name = 'confirmpassword'
                render={({field}) => (
                    <FormItem>
                        <div className="mx-auto mt-4 w-4/5">
                        <FormControl>
                            <Input type="password" placeholder="Confirm password" {...field} />
                        </FormControl>
                        </div>
                        <FormMessage className="text-center mb-4"/>
                    </FormItem>
                )}
                />
                <Button>Submit</Button>
                </form>
            </Form>
        </div>
        </>
    )
}

export default Details