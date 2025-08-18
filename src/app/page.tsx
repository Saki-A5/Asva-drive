import Image from "next/image"
import Navbar from "./components/Navbar"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const Home = () => {
  return (
    <div>
      <Navbar />
      <div className="md:grid md:grid-cols-2">
        <div className="w-4/5 mx-auto mb-8">
          <h2 className="font-bold text-2xl mb-2">Asva Drive - Your Smart Hub for Learning, Organizing, and Sharing</h2>
          <p className="mb-4">Manage your files and content effortlessly. Organize with precision, share without limits, and stay instantly informed on every update - easy to use platform</p>
          <Link href="/signup"><Button className="bg-blue-600 hover:bg-blue-800 w-full">Get Started</Button></Link>
        </div>

        <div className="max-w-full pb-4 flex justify-center items-center">
        <div className="relative w-[250px] h-[200px] right-10">
          <Image src='/myfiles.jpg' alt="first image" fill className="object-fill"/>
          <div className="absolute top-25 left-26 w-[250px] h-[150px] shadow-lg overflow-hidden ">
            <Image src="/myfiles2.jpg" alt="overlay" fill className="object-fill"/>
          </div>
        </div>
        </div>
      </div>

      {/* learning made easy */}
      <div className="mb-100 mt-34">
        <div className="mx-auto w-4/5">
        <p className="text-center mb-8">Asva makes learning easy with its intuitive interface and powerful features. Access your learning materials anytime, anywhere, and stay organized with smart content management.</p>
        </div>
        <div className="max-w-full pb-4 flex justify-center items-center">
        <div className="relative w-[270px] h-[200px] left-10 float-right">
          <Image src='/child.png' alt="first image" fill className="object-fill "/>
          <div className="absolute top-25 right-40 w-47 sm:w-75 h-[150px] shadow-lg overflow-hidden">
            <Image src="/books.png" alt="overlay" fill className="object-fill"/>
          </div>
        </div>        </div>
      </div>


    </div>
    )
}

export default Home
