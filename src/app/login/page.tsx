'use client'
import Loginpage from "../components/loginPage"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const Login = () => { 

    return(
        <>
            <div className=" flex h-20 pt-2">
            <Link href="/">
            <h2 className="font-bold ml-4">ASVA</h2>
            </Link>
            <Link className="ml-auto mr-4" href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-800">Sign up</Button>
            </Link>
            </div>

            <Loginpage />
        </>
    )
}

export default Login