import Image from "next/image"
import Navbar from "./components/Navbar"

const Home = () => {
  return (
    <div>
      <Navbar />
      <div>
        {/* <div className="relative border-4 border-black w-7/10 h-[400px] ml-8">
          <Image src='/myfiles.jpg' alt="first image" fill className="object-fill"/>
          <div className="absolute top-50 left-30 w-90 h-100 border-4 border-black shadow-lg overflow-hidden">
            <Image src="/myfiles.jpg" alt="overlay" fill className="object-fill"/>
          </div>
        </div> */}

        <div>
          <h2>Asva Drive - Your Smart Hub for Learning, Organizing, and Sharing</h2>
          <p>Manage your files and content effortlessly. Organize with precision, share without limits, and stay instantly informed on every update - easy to use platform</p>
        </div>
      </div>
    </div>
    )
}

export default Home
