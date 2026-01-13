"use client";
import React from "react";
import Link from "next/link";

import {
  CirclePlus,
  MessageSquare,
  Layers,
  CodeXml,
  Star,
  Trash2,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import useCurrentUser from "@/hooks/useCurrentUser";

// Icon type for lucide-react components
type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type LinkItem = { href: string; label: string; icon: IconType };
type SectionItem = { label: string; links: LinkItem[] };
type SideItem = LinkItem | SectionItem;

const sidelinks: SideItem[] = [
  { href: "/newchat", label: "New Chat", icon: CirclePlus },
  { href: "/chats", label: "Chats", icon: MessageSquare },
  { href: "/projects", label: "Projects", icon: Layers },
  { href: "/code", label: "Code", icon: CodeXml },
];

const AiSidebar = ({ children }: { children: React.ReactNode }) => {
  // sidebar can be 'open' (full), 'collapsed' (icons only), or 'hidden' (logo + trigger only)
  const [mode, setMode] = useState<"open" | "collapsed" | "hidden">("open");
  const isCollapsed = mode === "collapsed";
  const { user, loading } = useCurrentUser();

  if (loading) return null;

  const collapsedVisible = ["/newchat", "/chats", "/projects", "/code"];

  const desktopview = () => {
    const itemsToRender: SideItem[] = isCollapsed
      ? sidelinks.filter(
          (s) =>
            !("links" in s) && collapsedVisible.includes((s as LinkItem).href)
        )
      : sidelinks;

    return (
      <nav className="flex flex-col space-y-1">
        {itemsToRender.map((section) => {
          const isGroup = "links" in section;
          const key = section.label;

          if (isGroup) {
            return (
              <div key={key} className="pt-2 border-t border-border/20">
                {!isCollapsed && (
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
                        className="flex items-center gap-2 font-semibold rounded-lg text-[10px]  px-2 py-1 hover:bg-accent hover:text-accent-foreground transition"
                      >
                        <Icon className="h-4 w-4" />
                        {!isCollapsed && (
                          <span className="text-sm">{link.label}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          }

          // single link branch
          const single = section as LinkItem;
          const Icon = single.icon;
          const isCenteredIcon =
            isCollapsed && collapsedVisible.includes(single.href);
          const linkClass = isCenteredIcon
            ? "w-full flex items-center justify-center rounded-lg text-[10px] py-2 hover:bg-accent hover:text-accent-foreground transition"
            : "flex items-center gap-2 rounded-lg text-[10px] px-2 py-1 hover:bg-accent hover:text-accent-foreground transition";
          const iconClass = isCenteredIcon ? "h-5 w-5" : "h-4 w-4";

          return (
            <div key={key}>
              <Link href={single.href} className={linkClass}>
                <Icon className={iconClass} />
                {!isCollapsed && (
                  <span className="text-sm">{single.label}</span>
                )}
              </Link>
            </div>
          );
        })}
      </nav>
    );
  };

  return (
    <div className="flex h-screen bg-gradient-to-br overflow-hidden from-[#02427E] to-[#05081A]">
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col border-r border-border/80 bg-gradient-to-br from-[#02427E] to-[#05081A] p-4 text-white transition-all duration-300 ${
          mode === "open" ? "w-56" : mode === "collapsed" ? "w-24" : "w-20"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <Link href="/newchat" className="flex items-center">
            {!isCollapsed && mode !== "hidden" && (
              <span className="pl-2 font-semibold text-xl tracking-wide">
                ASVA AI
              </span>
            )}
            <Image
              src="/asva logo.png"
              alt="ASVA Logo"
              width={0}
              height={0}
              className={`h-6 w-6 min-w-[24px] ml-4 block ${
                isCollapsed ? "ml-2 mr-2" : ""
              }`}
              style={{ flexShrink: 0 }}
            />
          </Link>

          <div className="flex items-center">
            {/* single PanelLeft button that cycles: open -> collapsed -> hidden -> open */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (mode === "open") setMode("collapsed");
                else setMode("open");
              }}
              className="h-7 w-7"
            >
              {mode === "collapsed" ? (
                <PanelLeftClose className="h-10 w-10" />
              ) : (
                <PanelLeftOpen className="h-10 w-10" />
              )}
            </Button>
          </div>
        </div>

        {/* only render full nav when not fully hidden */}
        {mode !== "hidden" && desktopview()}

        {/* Bottom section */}
        <div className="mt-auto pt-0">
          {/* events (only in open mode) */}
          {user?.role === "admin" && mode === "open" && (
            <Link
              href="/events"
              className="flex items-center gap-2 rounded-lg text-sm px-2 py-1.5 hover:bg-accent hover:text-accent-foreground transition"
            >
              <Star className="h-5 w-5" />
              <span className="font-semibold">Events</span>
            </Link>
          )}
        </div>
        <div className="pt-2">
          {/* trash (only in open mode) */}
          {user?.role === "admin" && mode === "open" && (
            <Link
              href="/trash"
              className="flex items-center gap-2 rounded-lg text-sm px-2 py-1.5 hover:bg-accent hover:text-accent-foreground transition"
            >
              <Trash2 className="h-5 w-5" />
              <span className="font-semibold">Trash</span>
            </Link>
          )}
        </div>
      </div>
      {/* mobile view */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-5.5 left-4 lg:hidden"
          >
            <PanelLeftOpen className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-64 bg-gradient-to-b from-[#02427E] to-[#05081A] p-4 text-white flex flex-col space-y-0"
        >
          <div className="flex items-center justify-between mb-4">
            <Link href="/dashboard" className="flex font-bold items-center">
              <Image
                src="/asva logo.png"
                alt="ASVA Logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <span className="pl-2">ASVA AI</span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto">{desktopview()}</div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 bg-background text-foreground sm:mr-2 rounded-2xl shadow-lg sm:pl-12 sm:px-4 pb-12 overflow-y-auto flex flex-col h-full touch-pan-y">
        {children}
      </main>
    </div>
  );
};
export default AiSidebar;
