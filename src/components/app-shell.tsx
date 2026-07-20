"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Compass,
  Home,
  Inbox,
  Menu,
  Plus,
  Radio,
  Search,
  Settings,
  UserRound,
  Video,
} from "lucide-react";
import { useState } from "react";

import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/studio", label: "Go live", icon: Radio },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/profile", label: "Profile", icon: UserRound },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const immersive = pathname.startsWith("/live/");

  if (immersive) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#08090c] text-white">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[244px] flex-col border-r border-white/[.07] bg-[#0a0b0f]/95 px-4 py-5 backdrop-blur-xl lg:flex">
        <Brand className="px-2" />

        <nav className="mt-9 space-y-1" aria-label="Primary navigation">
          {navItems.slice(0, 2).map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-12 items-center gap-3 rounded-[14px] px-3.5 text-sm font-semibold transition-colors",
                  active ? "bg-white/[.09] text-white" : "text-[#8f94a1] hover:bg-white/[.05] hover:text-white",
                )}
              >
                <Icon className={cn("size-5", active && "text-[#7890ff]")} strokeWidth={active ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/studio"
          className="mt-5 flex h-12 items-center justify-center gap-2 rounded-full bg-[#5d73ff] text-sm font-bold text-white shadow-[0_12px_34px_rgba(93,115,255,.24)] transition hover:bg-[#6a7eff]"
        >
          <Plus className="size-4" strokeWidth={3} />
          Go live
        </Link>

        <div className="mt-8 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-[#5f6470]">Your space</div>
        <nav className="mt-2 space-y-1" aria-label="Personal navigation">
          {navItems.slice(3).map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-[13px] px-3.5 text-sm font-semibold transition-colors",
                  active ? "bg-white/[.08] text-white" : "text-[#8f94a1] hover:bg-white/[.05] hover:text-white",
                )}
              >
                <Icon className="size-[18px]" />
                {item.label}
                {item.label === "Inbox" && <span className="ml-auto size-1.5 rounded-full bg-[#ff3f63]" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[18px] border border-white/[.07] bg-white/[.035] p-3.5">
          <div className="flex items-center gap-3">
            <UserAvatar initials="MA" className="size-9 bg-gradient-to-br from-[#6377ff] to-[#9b62e8]" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-bold">Mahir Aman</div>
              <div className="truncate text-[11px] text-[#747a87]">Creator account</div>
            </div>
            <Settings className="size-4 text-[#707582]" />
          </div>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center border-b border-white/[.07] bg-[#08090c]/85 px-4 backdrop-blur-xl lg:left-[244px] lg:px-8">
        <div className="flex items-center lg:hidden">
          <Brand compact />
        </div>
        <div className="relative ml-3 hidden w-full max-w-[420px] sm:block lg:ml-0">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6c717d]" />
          <input
            type="search"
            aria-label="Search creators, topics, or live rooms"
            placeholder="Search creators, topics, or live rooms"
            className="h-10 w-full rounded-full border border-white/[.08] bg-white/[.045] pl-10 pr-4 text-sm text-white outline-none placeholder:text-[#616672] focus:border-[#5d73ff]/70 focus:bg-white/[.065]"
          />
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell />
            <span className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-[#ff3f63] ring-2 ring-[#08090c]" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <Menu />
          </Button>
          <UserAvatar initials="MA" className="ml-1 size-9 bg-gradient-to-br from-[#6377ff] to-[#9b62e8]" />
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-x-4 top-[72px] z-50 rounded-[20px] border border-white/10 bg-[#12141a] p-2 shadow-2xl lg:hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-[#b7bbc5] hover:bg-white/[.07] hover:text-white"
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      <main className="min-h-screen pb-24 pt-16 lg:ml-[244px] lg:pb-0">{children}</main>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex h-[68px] items-center justify-around rounded-[22px] border border-white/[.1] bg-[#111319]/95 px-2 shadow-[0_20px_60px_rgba(0,0,0,.5)] backdrop-blur-xl lg:hidden" aria-label="Mobile navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          const create = item.href === "/studio";
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={create ? "Go live" : undefined}
              className={cn(
                "flex min-w-12 flex-col items-center gap-1 text-[10px] font-semibold text-[#777d89]",
                active && "text-white",
                create && "-mt-6",
              )}
            >
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-xl",
                  active && !create && "bg-white/[.08]",
                  create && "size-12 rounded-full bg-[#5d73ff] text-white shadow-[0_10px_30px_rgba(93,115,255,.35)]",
                )}
              >
                {create ? <Video className="size-5" /> : <Icon className="size-[19px]" />}
              </span>
              {!create && item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
