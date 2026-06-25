"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  Compass,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import { PopIn } from "@/components/motion/Pop";
import { Button } from "@/components/ui";
import {
  POP_IN_SPRING,
  POP_TAP_SPRING,
  popSmHover,
  popSmRestShadow,
  popSmTap,
} from "@/lib/motion-presets";
import { APP_NAME } from "@/lib/brand";
import { useApp } from "@/lib/store";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, color: "bg-accent-cyan" },
  { href: "/applications", label: "Applications", icon: Briefcase, color: "bg-accent-yellow" },
  { href: "/discover", label: "Discover", icon: Compass, color: "bg-accent-pink" },
  { href: "/settings", label: "Settings", icon: Settings, color: "bg-accent-lime" },
] as const;

const MotionLink = motion.create(Link);

function SidebarNavTab({
  href,
  label,
  icon: Icon,
  color,
  active,
  reduceMotion,
}: {
  href: string;
  label: string;
  icon: (typeof navItems)[number]["icon"];
  color: string;
  active: boolean;
  reduceMotion: boolean | null;
}) {
  return (
    <MotionLink
      href={href}
      style={{ boxShadow: popSmRestShadow }}
      whileHover={reduceMotion ? undefined : popSmHover}
      whileTap={reduceMotion ? undefined : popSmTap}
      transition={POP_TAP_SPRING}
      className={clsx(
        "flex items-center gap-3 border-[3px] border-black px-3 py-3 text-sm font-bold uppercase tracking-wide",
        active ? color : "bg-white hover:bg-accent-cyan/30",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </MotionLink>
  );
}

function MobileNavTab({
  href,
  label,
  icon: Icon,
  color,
  active,
  reduceMotion,
}: {
  href: string;
  label: string;
  icon: (typeof navItems)[number]["icon"];
  color: string;
  active: boolean;
  reduceMotion: boolean | null;
}) {
  return (
    <MotionLink
      href={href}
      whileHover={reduceMotion ? undefined : { scale: 1.06, y: -1 }}
      whileTap={reduceMotion ? undefined : { scale: 0.92, y: 0 }}
      transition={POP_TAP_SPRING}
      className={clsx(
        "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-bold uppercase",
        active ? color : "text-black/50",
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </MotionLink>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useApp();
  const reduceMotion = useReducedMotion();

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isOnboarding = pathname === "/onboarding";
  const isDiscover = pathname === "/discover";

  if (isAuthPage || isOnboarding) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen text-black">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col self-start border-r-[3px] border-black bg-white md:flex">
        <div className="border-b-[3px] border-black bg-accent-yellow p-6">
          <PopIn delay={0.05}>
            <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center border-[3px] border-black bg-black brutal-shadow-sm">
              <Briefcase className="h-5 w-5 text-accent-lime" />
            </div>
            <div>
              <p className="brutal-heading text-xl">{APP_NAME}</p>
              <p className="text-xs font-bold uppercase tracking-widest">Job hunt</p>
            </div>
          </Link>
          </PopIn>
        </div>

        <nav className="flex-1 space-y-2 p-4">
          {navItems.map(({ href, label, icon: Icon, color }, index) => {
            const active = pathname === href;
            return (
              <motion.div
                key={href}
                initial={reduceMotion ? false : { opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...POP_IN_SPRING, delay: reduceMotion ? 0 : 0.08 + index * 0.05 }}
              >
                <SidebarNavTab
                  href={href}
                  label={label}
                  icon={Icon}
                  color={color}
                  active={active}
                  reduceMotion={reduceMotion}
                />
              </motion.div>
            );
          })}
        </nav>

        <div className="mt-auto shrink-0 border-t-[3px] border-black bg-white p-4">
          {user ? (
            <div className="flex items-center gap-3 border-[3px] border-black bg-white p-3 brutal-shadow-sm">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-black bg-accent-pink">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{user.name}</p>
                <p className="truncate text-xs">{user.email}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                pop={false}
                onClick={logout}
                className="h-8 w-8 shrink-0 border-2 hover:bg-accent-yellow"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link
              href="/login"
              className="brutal-card-hover block border-[3px] border-black bg-black px-4 py-3 text-center text-sm font-bold uppercase text-white brutal-shadow-sm"
            >
              Sign in
            </Link>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b-[3px] border-black bg-accent-cyan px-4 py-3 md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center border-2 border-black bg-black">
              <Briefcase className="h-4 w-4 text-accent-lime" />
            </div>
            <span className="brutal-heading text-lg">{APP_NAME}</span>
          </Link>
        </header>

        <main
          className={clsx(
            "flex-1",
            isDiscover ? "overflow-y-auto" : "overflow-auto",
          )}
        >
          {children}
        </main>

        <nav className="flex border-t-[3px] border-black bg-white md:hidden">
          {navItems.map(({ href, label, icon: Icon, color }) => {
            const active = pathname === href;
            return (
              <MobileNavTab
                key={href}
                href={href}
                label={label}
                icon={Icon}
                color={color}
                active={active}
                reduceMotion={reduceMotion}
              />
            );
          })}
        </nav>
      </div>
    </div>
  );
}
