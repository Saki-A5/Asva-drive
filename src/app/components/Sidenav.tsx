'use client';
import React from 'react';
import Link from 'next/link';
import {
  HomeIcon,
  Share2,
  Star,
  Clock,
  Folder,
  Trash2,
  HardDrive,
  Cloud,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

// Icon type for lucide-react components
type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type LinkItem = { href: string; label: string; icon: IconType };
type SectionItem = { label: string; links: LinkItem[] };
type SideItem = LinkItem | SectionItem;

const sidelinks: SideItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { href: '/files', label: 'My Files', icon: Folder },
  { href: '/recent', label: 'Recent', icon: Clock },
  { href: '/starred', label: 'Starred', icon: Star },
  { href: '/shared', label: 'Shared with me', icon: Share2 },

  {
    label: 'Folders',
    links: [
      { href: '#', label: 'Engineering', icon: Folder },
      { href: '#', label: 'Law', icon: Folder },
      { href: '#', label: 'SMS', icon: Folder },
      { href: '#', label: 'Pharmacy', icon: Folder },
      { href: '#', label: 'Sciences', icon: Folder },
    ],
  },
];

const Sidenav = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const desktopview = () => {
    return (
      <nav className="flex flex-col space-y-1  ">
        {sidelinks.map((section) => {
          // Narrow: is this a grouped section (has links) or a single link?
          const isGroup = 'links' in section;
          // both LinkItem and SectionItem have `label`, so safe to use as key
          const key = section.label;

          if (isGroup) {
            return (
              <div
                key={key}
                className="pt-2 border-t border-border/20">
                {!collapsed && (
                  <p className="text-xs font-bold pl-4 md:pl-0 text-muted-foreground tracking-wide mb-1">
                    {section.label}
                  </p>
                )}
                <div className="space-y-2">
                  {section.links.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-2 font-semibold rounded-lg text-[10px]  px-2 py-1 hover:bg-accent hover:text-accent-foreground transition">
                        <Icon className="h-4 w-4" />
                        {!collapsed && (
                          <span className="text-sm">{link.label}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          // single link branch (safe to access href)
          const single = section as LinkItem;
          const Icon = single.icon;
          return (
            <div key={key}>
              <Link
                href={single.href}
                className="flex items-center gap-2 rounded-lg text-[10px] px-2 py-1 hover:bg-accent hover:text-accent-foreground transition">
                <Icon className="h-4 w-4" />
                {!collapsed && <span className="text-sm">{single.label}</span>}
              </Link>
            </div>
          );
        })}
      </nav>
    );
  };
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#02427E] to-[#05081A]">
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex w-56 flex-col border-r border-border/80 bg-gradient-to-br from-[#02427E] to-[#05081A] p-4 text-white ${
          collapsed ? 'w-16' : 'w-56'
        } transition-all duration-300`}>
        <Link
          href="/dashboard"
          className="flex items-center  mb-4">
          <Image
            src="/asva logo.png"
            alt="ASVA Logo"
            width={0}
            height={0}
            className="h-6 w-6 mt-1"
          />
          {!collapsed && (
            <div className="font-semibold mb-4 pl-2 text-xl tracking-wide">
              ASVA HUB
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="mb-4"
          onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? (
            <PanelLeftOpen className="h-6 w-6" />
          ) : (
            <PanelLeftClose className="h-6 w-6" />
          )}
        </Button>
        {desktopview()}

        {/* Bottom section */}
        <div className="mt-auto pt-4">
          {/* trash */}
          <Link
            href="/trash"
            className="flex items-center gap-2 rounded-lg text-sm px-2 py-1.5 hover:bg-accent hover:text-accent-foreground transition">
            <Trash2 className="h-5 w-5" />
            <span className="font-semibold">Trash</span>
          </Link>
        </div>

        {/* storage box */}
        <div className="mt-4 bg-white/10 p-3 rounded-xl">
          <div className="flex items-center gap mb-2 text-sm">
            <Cloud className="h-4 w-4 text-white/80" />
            <span className="pl-2 font-semibold">Storage</span>
          </div>
          <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
            <div className="bg-white h-2 w-[30%] rounded-full"></div>
          </div>
          <p className="text-xs mt-1 text-white/80">5.0 GB of 20 GB used</p>
        </div>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-7 left-4 lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-64  bg-gradient-to-b from-[#02427E] to-[#05081A] p-4 text-white">
          <Link
            href="/dashboard"
            className="font-bold mb-4 pl-6 pt-4">
            ASVA HUB
          </Link>
          {desktopview()}
        </SheetContent>
      </Sheet>
      {/* Main content */}
      <main className="flex-1 bg-background text-foreground my-2 mr-2 rounded-2xl shadow-lg lg:px-4 pl-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};
export default Sidenav;
