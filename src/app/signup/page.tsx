'use client'
import Emailstep from "../components/Email"
import { useState } from "react"
import Link from "next/link"
import Details from "../components/SignupDetail"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { auth, provider } from "@/lib/firebaseClient"
import { signInWithPopup } from "firebase/auth"


const Signup = () => {

    const [step, setStep] = useState<"email" | "details">("email")
    const [email, setEmail] = useState('')
    const nextStep = () => setStep("details")

    const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      // Send token to backend
      await axios.post("/api/auth/google", { idToken: token });
      alert("Google sign-in successful!");
    } catch (error) {
      console.error(error);
    }
  };
    return(
        <>
        <div className=" flex h-20 pt-2">
            <Link href="/">
            <h2 className="font-bold ml-4">ASVA</h2>
            </Link>
            <Link className="ml-auto mr-4" href="#">
                <Button className="bg-blue-600 hover:bg-blue-800">Log in</Button>
            </Link>
        </div>

        <div>
        <button
            onClick={handleGoogleSignIn}
            className="mb-4 bg-blue-600 text-white px-4 py-2 rounded mx-auto block"
        >
            Sign in with Google
        </button>
        
        {step === "email" ? (
        <Emailstep
        email={email}
        setEmail={setEmail}
        nextStep={nextStep} 
        />
        ) : (<Details email={email} />)}
        </div>
        </>
    )
}

export default Signup