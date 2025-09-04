"use client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu" 

const Navbar  = () => {
    const { setTheme } = useTheme()

    return (
    <div className=" flex h-20 pt-2">
        <Link href="/">
        <h2 className="font-bold ml-4">ASVA</h2>
        </Link>

        <div className="gap-2 flex ml-auto mr-4">
            <Link href="/signup" >
                <Button className="bg-blue-600 hover:bg-blue-800">Sign up</Button>
            </Link>
        
            <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-800">Log in</Button>
            </Link>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
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
    )
}

export default Navbar