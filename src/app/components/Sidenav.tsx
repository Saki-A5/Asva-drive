'use client';
import React from 'react';
import Link from 'next/link';
import { COLLEGE_META } from '@/lib/college';
import {
  HomeIcon,
  Share2,
  Star,
  Clock,
  Folder,
  Trash2,
  Cloud,
  PanelLeftOpen,
  PanelLeftClose,
} from 'lucide-react';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';
import useCurrentUser from '@/hooks/useCurrentUser';

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
    label: 'Colleges',
    links: Object.values(COLLEGE_META).map(meta => ({
      href: `/colleges/${meta.slug}`,
      label: meta.label,
      icon: Folder,
    })),
  },
];

const Sidenav = ({ children }: { children: React.ReactNode }) => {
  // sidebar can be 'open' (full), 'collapsed' (icons only), or 'hidden' (logo + trigger only)
  const [mode, setMode] = useState<'open' | 'collapsed' | 'hidden'>('open');
  const isCollapsed = mode === 'collapsed';
  const { user, loading } = useCurrentUser();

  if (loading) return null;

  const collapsedVisible = [
    '/dashboard',
    '/files',
    '/recent',
    '/starred',
    '/shared',
  ];

  const desktopview = () => {
    const itemsToRender: SideItem[] = isCollapsed
      ? sidelinks.filter(
          (s) =>
            !('links' in s) && collapsedVisible.includes((s as LinkItem).href)
        )
      : sidelinks;

    return (
      <nav className="flex flex-col space-y-1">
        {itemsToRender.map((section) => {
          const isGroup = 'links' in section;
          const key = section.label;

          if (isGroup) {
            return (
              <div
                key={key}
                className="pt-2 border-t border-border/20">
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
                        className="flex items-center gap-2 font-semibold rounded-lg text-[10px]  px-2 py-1 hover:bg-accent hover:text-accent-foreground transition">
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
            ? 'w-full flex items-center justify-center rounded-lg text-[10px] py-2 hover:bg-accent hover:text-accent-foreground transition'
            : 'flex items-center gap-2 rounded-lg text-[10px] px-2 py-1 hover:bg-accent hover:text-accent-foreground transition';
          const iconClass = isCenteredIcon ? 'h-5 w-5' : 'h-4 w-4';

          return (
            <div key={key}>
              <Link
                href={single.href}
                className={linkClass}>
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
          mode === 'open' ? 'w-56' : mode === 'collapsed' ? 'w-24' : 'w-20'
        }`}>
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/dashboard"
            className="flex items-center">
            <Image
              src="/asva logo.png"
              alt="ASVA Logo"
              width={0}
              height={0}
              className={`h-6 w-6 min-w-[24px] block ${
                isCollapsed ? 'ml-2 mr-2' : ''
              }`}
              style={{ flexShrink: 0 }}
            />
            {!isCollapsed && mode !== 'hidden' && (
              <span className="pl-2 font-semibold text-xl tracking-wide">
                ASVA HUB
              </span>
            )}
          </Link>

          <div className="flex items-center">
            {/* single PanelLeft button that cycles: open -> collapsed -> hidden -> open */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (mode === 'open') setMode('collapsed');
                else setMode('open');
              }}
              className="h-7 w-7">
              {mode === 'collapsed' ? (
                <PanelLeftClose className="h-10 w-10" />
              ) : (
                <PanelLeftOpen className="h-10 w-10" />
              )}
            </Button>
          </div>
        </div>

        {/* only render full nav when not fully hidden */}
        {mode !== 'hidden' && desktopview()}

        {/* Bottom section */}
        <div className="mt-auto pt-4">
          {/* trash (only in open mode) */}
          {user?.role === 'admin' && mode === 'open' && (
            <Link
              href="/trash"
              className="flex items-center gap-2 rounded-lg text-sm px-2 py-1.5 hover:bg-accent hover:text-accent-foreground transition">
              <Trash2 className="h-5 w-5" />
              <span className="font-semibold">Trash</span>
            </Link>
          )}
        </div>

        {/* storage box (only in open mode) */}
        {mode === 'open' && (
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
        )}
      </div>

      {/* mobile view */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-5.5 left-4 lg:hidden">
            <PanelLeftOpen className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-64 bg-gradient-to-b from-[#02427E] to-[#05081A] p-4 text-white">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/dashboard"
              className="flex font-bold items-center">
              <Image
                src="/asva logo.png"
                alt="ASVA Logo"
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <span className="pl-2">ASVA HUB</span>
            </Link>
          </div>
          {desktopview()}
        </SheetContent>
      </Sheet>
      {/* Main content */}
      <main
        className="flex-1 bg-background text-foreground sm:mr-2 rounded-2xl shadow-lg
sm:pl-12 sm:px-4 pb-12 overflow-y-auto flex flex-col">
        {children}
      </main>
    </div>
  );
};
export default Sidenav;
