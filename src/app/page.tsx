import Image from "next/image"
import Navbar from "./components/Navbar"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const Home = () => {
  return (
    <div>
      <Navbar />
      <div>
        <div className="w-4/5 mx-auto mb-8">
          <h2 className="font-bold text-2xl mb-2">Asva Drive - Your Smart Hub for Learning, Organizing, and Sharing</h2>
          <p className="mb-4">Manage your files and content effortlessly. Organize with precision, share without limits, and stay instantly informed on every update - easy to use platform</p>
          <Link href="/signup"><Button className="bg-blue-600 hover:bg-blue-800 w-full">Get Started</Button></Link>
        </div>

        <div className="w-screen pb-4">
        <div className="relative w-7/10 h-[200px] sm:w-6/10 ml-6 mr-4 sm: ml-14">
          <Image src='/myfiles.jpg' alt="first image" fill className="object-fill "/>
          <div className="absolute top-25 left-30 w-55 sm: w-75 h-[150px] border-4 border-black shadow-lg overflow-hidden">
            <Image src="/myfiles2.jpg" alt="overlay" fill className="object-fill"/>
          </div>
        </div>
        </div>
      </div>
    </div>
    )
}

export default Home
