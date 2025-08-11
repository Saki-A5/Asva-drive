import { Button } from "@/components/ui/button"
import Link from "next/link"

const Navbar  = () => {

    return (
    <div className=" flex h-20">
        <Link href="/">
        <img src="/asva logo.jpg" alt="logo" width={60} height={60}/>
        </Link>

        <div className="gap-4 flex">
            <Link href="#" >
                <Button>Sign up</Button>
            </Link>
        
            <Link href="#">
                <Button>Log in</Button>
            </Link>
        </div>
    </div>
    )
}

export default Navbar