"use client"
import Image from "next/image"
import Navbar from "./components/Navbar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Footer from "./components/Footer"
import {motion} from "framer-motion"


const Home = () => {
  return (
    <div className="overflow-x:hidden">
      <Navbar />
      <div className="md:grid md:grid-cols-2">
        <motion.div 
        initial={{ opacity: 0, x: 100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        viewport={{ once: false }}
        className="w-4/5 mx-auto mb-8 md:order-2 lg:mr-100">
          <h2 className="font-bold text-2xl mb-2">Asva Drive - Your Smart Hub for Learning, Organizing, and Sharing</h2>
          <p className="mb-4">Manage your files and content effortlessly. Organize with precision, share without limits, and stay instantly informed on every update - easy to use platform</p>
          <Link href="/signup"><Button className="bg-blue-600 hover:bg-blue-800 w-full">Get Started</Button></Link>
        </motion.div>

        <motion.div 
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        viewport={{ once: false }}
        className="max-w-full pb-4 flex justify-center items-center">
        <div className="relative w-[250px] lg:w-[350px] h-[200px] right-10">
          <Image src='/myfiles.jpg' alt="first image" fill className="object-fill"/>
          <div className="absolute top-25 left-26 w-[250px] lg:w-[350px] h-[150px] shadow-lg overflow-hidden ">
            <Image src="/myfiles2.jpg" alt="overlay" fill className="object-fill"/>
          </div>
        </div>
        </motion.div>
      </div>

      {/* learning made easy */}
      <motion.div
       initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        viewport={{ once: false }}
       className="mb-45 mt-34">
        <div className="flex flex-col items-center w-70 mx-auto mb-4">
          <div className="flex items-center">
          <Image src="/reading.png" alt="learning made easy" width={26} height={26}/>
          <h3 className="pl-2 font-bold text-center leading-tight">learning made easy</h3>
          </div>
          <Image src="/liness.png" alt="lines" width={340} height={26} className="-mt-4"/>
        </div>
        <div className="mx-auto w-3/5">
        <p className="text-center text mb-8">Asva Drive makes learning easy with its intuitive interface and powerful features. Access your learning materials anytime, anywhere, and stay organized with smart content management.</p>
        </div>
        <div className="max-w-full pb-4 flex justify-center items-center">
        <div className="relative w-[270px] h-[200px] md:w-[330px] md:h-[280px] lg:w-[400px] left-10 md:left-20 lg:left-15 float-right">
          <Image src='/child.png' alt="first image" fill className="object-fill "/>
          <div className="absolute top-25 right-40 w-[200px] md:w-[270px] h-[150px] md:right-55 lg:right-65 md:top-38 md:h-[210px] shadow-lg overflow-hidden">
            <Image src="/books.png" alt="overlay" fill className="object-fill"/>
          </div>
        </div>        
        </div>
      </motion.div>

      {/* smart organization for content management */}
      <motion.div 
       initial={{ opacity: 0, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        viewport={{ once: false }}
       className="mb-24">
        <div className="flex justify-center items-center border rounded-lg w-80 sm:w-100 mx-auto mb-4">
          <Image src="/reading.png" alt="content management" width={26} height={26}/>
          <h3 className="pl-2 font-semibold text-center sm:text-left">Smart Organization for content Management</h3>
        </div>
        <div className="md:grid md:grid-cols-2">
          <div className="mx-auto w-4/5 text-center md:mr-0 md:my-auto">
            <p>Asva drive's smart organization features help you manage your content efficiently.</p>
            <p>Easily categorize, search, and retrieve files, enusring you always have what you need at your fingertips.</p>
          </div>
          <div className="flex justify-center items-center mt-6 w-[370px] h-[300px] lg:w-[440px] xl:w-[500px] xl:ml-12 lg:right-10 relative mx-auto">
            <Image src="/content management.png" alt="content management" fill />
          </div>
        </div>
      </motion.div>

      {/* Seamless file sharing */}
      <motion.div 
       initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        viewport={{ once: false }}
       className="mb-24 md:mb-52 lg:mb-68">
        <div className="flex flex-col items-center w-70 mx-auto mb-4">
          <div className="flex items-center">
          <Image src="/reading.png" alt="learning made easy" width={26} height={26}/>
          <h3 className="pl-2 font-bold text-center leading-tight">Seamless file sharing</h3>
          </div>
          <Image src="/liness.png" alt="lines" width={340} height={26} className="-mt-4"/>
        </div>
        <div className="md:grid md:grid-cols-2">
          <div className="mx-auto w-4/5 text-center md:mr-0 md:my-auto">
            <p>Share files seamlessly with Asva drive. Collaborate with team members and partners effortlessly, ensuring everyone has access to the latest verrsions of your documents.</p>
          </div>
          <div className="flex justify-center items-center mt-6 md:mt-0 md:top-10 w-[370px] h-[300px] lg:w-[440px] xl:w-[500px] xl:ml-12 lg:right-10 relative mx-auto">
            <Image src="/wifi.png" alt="file sharing" fill />
            <div className="absolute md:w-[380px] lg:w-[420px] xl:w-[445px] md:right-55 lg:right-85 md:top-55 md:h-[210px] lg:h-[260px] shadow-lg overflow-hidden z-[-1] hidden md:block">
            <Image src="/online-collaboration.png" alt="overlay" fill className="object-fill"/>
          </div>
          </div>
        </div>
      </motion.div>

      {/* Ai assistance */}
      <motion.div 
       initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        viewport={{ once: false }}
       className="mb-24">
        <div className="flex justify-center items-center border rounded-lg w-80 sm:w-100 mx-auto mb-4">
          <Image src="/reading.png" alt="content management" width={26} height={26}/>
          <h3 className="pl-2 font-semibold text-center sm:text-left">AI assistance and search</h3>
        </div>
        <div className="md:grid md:grid-cols-2">
          <motion.div 
           initial={{ opacity: 0, x: 100 }}
           whileInView={{ opacity: 1, x: 0 }}
           transition={{ duration: 1.0, ease: "easeOut" }}
           viewport={{ once: false }}
           className="mx-auto w-4/5 text-center md:mr-0 md:mt-10 text-pink-600">
            <p>Share files seamlessly with Asva Drive. Collaborate with team members, clients, and partners effortlessly, ensuring everyone has access to the latest versions of your documents.</p>
          </motion.div>
          <motion.div 
           initial={{ opacity: 0, x: -100 }}
           whileInView={{ opacity: 1, x: 0 }}
           transition={{ duration: 1.0, ease: "easeOut" }}
           viewport={{ once: false }}
           className="flex justify-center items-center mt-6 w-[370px] h-[300px] lg:w-[440px] xl:w-[500px] xl:ml-12 lg:right-10 relative mx-auto">
            <Image src="/robot.png" alt="content management" fill />
          </motion.div>
        </div>
      </motion.div>

      <Footer />
    </div>
    )
}

export default Home
