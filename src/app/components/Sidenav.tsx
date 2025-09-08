'use client'
import React from "react"
import Link from "next/link"
import { HomeIcon, ShareIcon } from "lucide-react"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

// Icon type for lucide-react components
type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>

type LinkItem = { href: string; label: string; icon: IconType }
type SectionItem = { label: string; links: LinkItem[] }
type SideItem = LinkItem | SectionItem

const sidelinks: SideItem[] = [
  { href: '/dashboard', label: "Home", icon: HomeIcon },
  {
    label: "File manager",
    links: [
      { href: '#', label: "Recent", icon: HomeIcon },
      { href: '#', label: "Starred", icon: HomeIcon },
      { href: '#', label: "Files", icon: HomeIcon },
      { href: '#', label: "Trash", icon: HomeIcon },
    ],
  },
  {
    label: "Shared",
    links: [
      { href: "#", label: "Shared with me", icon: ShareIcon },
    ],
  },
  { href: "#", label: "AI", icon: ShareIcon },
  { href: "#", label: "settings", icon: ShareIcon },
]

const Sidenav = ({ children }: { children: React.ReactNode })  => {
  const desktopview = () => {
    return (
      <nav className="flex flex-col space-y-2">
          {sidelinks.map((section, index) => {
            // Narrow: is this a grouped section (has links) or a single link?
            const isGroup = 'links' in section && Array.isArray(section.links)
            // both LinkItem and SectionItem have `label`, so safe to use as key
            const key = section.label

            if (isGroup) {
              return (
                <div key={key}>
                  <div className="flex flex-col space-y-2">
                    {section.links.map((link) => {
                      const Icon = link.icon
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground transition"
                        >
                          <Icon className="h-5 w-5" />
                          <span className="font-semibold ">{link.label}</span>
                        </Link>
                      )
                    })}
                  </div>

                  {index < sidelinks.length - 1 &&  (
                    <div className="my-4 border-t pt-2">
                      {"links" in sidelinks[index + 1] && (
                      <p className="text-xs pl-4 md:pl-0 text-muted-foreground uppercase tracking-wide">
                        {sidelinks[index + 1]?.label ?? ""}
                      </p>
                      )}
                    </div>
                  )}
                </div>
              )
            }

            // single link branch (safe to access href)
            const single = section as LinkItem
            const Icon = single.icon
            return (
              <div key={key}>
                <Link
                  href={single.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground transition"
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-semibold">{single.label}</span>
                </Link>

                {index < sidelinks.length - 1 && (
                  <div className="my-4 border-t pt-2">
                    <p className="text-xs pl-4 md:pl-0 text-muted-foreground uppercase tracking-wide">
                      {sidelinks[index + 1]?.label ?? ""}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </nav>
    )
  }
  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden sm:flex w-56 flex-col border-r bg-background p-4">
        <Link href="/" className="font-bold mb-4">Asva</Link>
        {desktopview()}
      </div>


      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 left-4 sm:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <Link href="/" className="font-bold mb-4 pl-6 pt-4">Asva</Link>
          {desktopview()}
        </SheetContent>
      </Sheet>
      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
export default Sidenav