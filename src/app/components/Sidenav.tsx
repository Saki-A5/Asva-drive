'use client'
import { HomeIcon, ShareIcon } from "lucide-react";
import Link from "next/link";


const links = [

  {href:'/dashboard', label: "My Drive", icon: HomeIcon},
  {href:'#', label: "Recent", icon: HomeIcon},
  {href:'#', label: "Starred", icon: HomeIcon},
  {href:'#', label: "Files", icon: HomeIcon},
  {href:'#', label: "Trash", icon: HomeIcon},
  {href: "#", label: "Shared with me", icon: ShareIcon},  
  {href: "#", label: "AI", icon: ShareIcon},  
]

const Sidenav = ({children} : {children: React.ReactNode}) => {
  return (
    <>
    <div className="flex h-min-screen">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r bg-gray-50 p-4">
        <div>Asva</div>
        <nav className="flex flex-col space-y-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-200 transition"
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>

    <main className="flex-1 p-6">{children}</main>    
    </>
  );
}

export default Sidenav; 