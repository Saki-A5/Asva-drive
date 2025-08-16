'use client'
import { email } from "zod"
import Emailstep from "../components/Email"
import Email from "../components/Email"
import { useState } from "react"
import Link from "next/link"


const Signup = () => {

    const [step, setStep] = useState(1)
    const [email, setEmail] = useState('')

    return(
        <>
        <div className=" flex h-20 pt-2">
            <Link href="/">
            <Link href="/">
            <h2 className="font-bold ml-4">ASVA</h2>
            </Link>
            </Link>
        </div>
        {step === 1 && (
        <Emailstep
        email={email}
        setEmail={setEmail}
        nextStep={() => setStep(2)} 
        />
    )}
        </>
    )
}

export default Signup