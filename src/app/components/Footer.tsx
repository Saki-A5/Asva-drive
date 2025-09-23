import Image from "next/image";
import Link from "next/link";

const Footer = () => {

    return (
        <footer className="bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 py-10 mt-20 transition-colors">
           <div className="container mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
    
    {/* Brand */}
    <div className="border-r">
      <Image src="/asva logo1.jpg" alt="Asva Drive Logo" width={60} height={70} className="mb-4"/>
      <h1 className="text-2xl font-bold">Asva Drive</h1>
    </div>

    {/* Quick Links */}
    <div className="lg:border-r">
      <h3 className="font-bold mb-3">Quick Links</h3>
      <ul className="space-y-2 text-sm">
        <li><Link href="/" className="hover:text-xl hover:font-semibold">Home</Link></li>
        <li><Link href="#" className="hover:text-xl hover:font-semibold">About</Link></li>
        <li><Link href='#' className="hover:text-xl hover:font-semibold">Services</Link></li>
        <li><Link href="#" className="hover:text-xl hover:font-semibold">Contact</Link></li>
      </ul>
    </div>

    {/* Contact */}
    <div className="border-r">
      <h3 className="font-bold mb-3">Contact</h3>
      <p className="text-sm">support@domain.com -- don't forget to replace</p>
      <p className="text-sm">+234 800 000 0000</p>
    </div>

    {/* Socials */}
    <div >
      <h3 className="font-bold mb-3">Follow Us</h3>
      <div className="flex space-x-4">
        <a href="#" aria-label="Twitter">🐦</a>
        <a href="#" aria-label="Facebook">📘</a>
        <a href="#" aria-label="Instagram">📸</a>
        <a href="#" aria-label="LinkedIn">💼</a>
      </div>
    </div>
  </div>

  {/* Bottom */}
  <div className="mt-10 border-t border-gray-700 pt-4 text-center text-sm">
    © 2025 YourBrand. All rights reserved.
  </div>

        </footer>
    );
}

export default Footer;