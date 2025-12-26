"use client"
import { Button } from "@/components/ui/button"
import { LogOut, Settings, Search, Moon, Sun, Bell } from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useState, useEffect } from "react"
import axios from "axios"
import { auth } from "@/lib/firebaseClient"
import { useRouter } from "next/navigation"
import { getAuth, signOut } from "firebase/auth"
import Link from "next/link"
import NotificationBell from "./NotificationBell"
import SearchBar from "./SearchBar"

type User = {
    id: string;
    name: string
    email: string 
}

const getInitials = (name: string | null | undefined) => {
    if (!name) return "U"; // Default initials
    const names = name.split(" ");
    if (names.length === 1) return names[0][0].toUpperCase();
    return (names[0][0] + names[1][0]).toUpperCase();
}

const Loginnav = () => {
    const { setTheme } = useTheme()
    const [user, setUser] = useState<User | null>(null)
    const router = useRouter()

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      await axios.post('/api/logout');
      router.push('/login');
    } catch (error) {
      console.error("Logout Error:", error);
    }
  }

    // const refreshToken = async () => {
    //   try{
    //     const currentUser = auth.currentUser;
    //     if (!currentUser) return

    //     const idToken = await currentUser.getIdToken(true);

    //     await axios.post('/api/refresh', {idToken})
    //   } catch (error) {
    //     console.error("Error refreshing token:", error);
    //   }
    // }

    const fetchUser = async () => {
          try {
            const res = await axios.get('/api/me');
            setUser(res.data.user);
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
    }

    useEffect(() => {
      const init = async () => {
        // await refreshToken();
        await fetchUser();
      }
      init();
      
      // const interval = setInterval(refreshToken, 55 * 60 * 1000); // Refresh every 55 minutes
      // return () => clearInterval(interval);
    }, []);

    const initials = getInitials(user?.name || user?.email);


  return (
    <>
      <div className="flex h-20 sm:p-0 pl-12 mt-4">
        <div className="flex-1 max-w-xl ml-2 mr-4">
            <div className="relative">
                <SearchBar />
            </div>
        </div>
        <div className="flex ml-auto mr-4 gap-x-4">
          {/* settings */}
          <Link href="/settings"><Settings className="hidden md:flex h-6 w-6 mt-2 text-foreground cursor-pointer"/></Link>
          {/* notifications */}
          <Bell className="h-6 w-6 mt-2 text-foreground cursor-pointer"/>
          {/* <NotificationBell /> */}
            {/* User Menu */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                    {initials}
                </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4 text-red-500" />
                    <span className="text-red-500">Logout</span>
                </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="hidden md:flex">
                            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setTheme("light")}>
                            Light
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("dark")}>
                            Dark
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setTheme("system")}>
                            System
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>


            
        </div>
      </div>
    </>
  );

}

export default Loginnav