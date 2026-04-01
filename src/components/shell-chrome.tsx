"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useShellNav } from "@/hooks/use-shell-nav";

const navItems = [
  {
    href: "/onboarding",
    label: "Onboarding",
    detail: "Warm start",
  },
  {
    href: "/meetings",
    label: "Meetings",
    detail: "Live rooms",
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ShellChrome({ children }: { children: ReactNode }) {
  const { pathname, mobileOpen, toggleMobileOpen, setMobileOpen } = useShellNav();

  return (
    <div className="factory-grid min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-4 px-3 pb-24 pt-3 md:px-6 md:pb-6 md:pt-6">
        <aside className="app-surface safe-pt hidden w-[290px] shrink-0 rounded-[2rem] p-6 md:flex md:flex-col">
          <div className="rise-in">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-orange-300/80">
              MeetHUD
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-heading)] text-[2rem] leading-none tracking-[-0.04em] text-white">
              Meeting OS with a warmer edge.
            </h1>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">
              One room for agenda flow, block notes, decisions, and follow-through.
            </p>
          </div>

          <nav className="mt-8 flex flex-col gap-3">
            {navItems.map((item, index) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rise-in rounded-[1.5rem] border px-4 py-4 transition duration-200 ${
                    active
                      ? "border-orange-400/30 bg-orange-500/12 text-white"
                      : "border-white/6 bg-white/3 text-slate-300 hover:border-orange-400/20 hover:bg-white/6"
                  }`}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-500">
                      {item.detail}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="panel mt-auto rounded-[1.75rem] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-orange-300/80">
              Team pulse
            </p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl bg-white/4 p-4">
                <p className="text-2xl font-semibold text-white">07 live</p>
                <p className="mt-1 text-sm text-slate-400">
                  teammates already inside active rooms
                </p>
              </div>
              <div className="rounded-2xl bg-white/4 p-4">
                <p className="text-2xl font-semibold text-white">11 decisions</p>
                <p className="mt-1 text-sm text-slate-400">
                  promoted out of notes this week
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="app-surface safe-pt sticky top-3 z-20 rounded-[2rem] px-4 py-4 md:top-6 md:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMobileOpen}
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/4 text-sm text-slate-200 md:hidden"
                aria-label="Toggle navigation"
              >
                HUD
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-[0.68rem] uppercase tracking-[0.28em] text-orange-300/80">
                  Fullstack Forge
                </p>
                <div className="mt-1 flex items-center gap-3">
                  <h2 className="truncate font-[family-name:var(--font-heading)] text-xl tracking-[-0.04em] text-white md:text-2xl">
                    React shell in motion
                  </h2>
                  <span className="hidden rounded-full border border-orange-400/25 bg-orange-500/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-orange-200 sm:inline-flex">
                    PWA safe
                  </span>
                </div>
              </div>

              <div className="hidden items-center gap-3 md:flex">
                <div className="rounded-full border border-white/10 bg-white/4 px-3 py-2 text-sm text-slate-300">
                  Maya Torres
                </div>
                <Link
                  href="/meetings/new"
                  className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
                >
                  New meeting
                </Link>
              </div>
            </div>
          </header>

          {mobileOpen ? (
            <div
              className="fixed inset-0 z-30 bg-black/60 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
          ) : null}

          <div
            className={`app-surface fixed inset-y-3 left-3 z-40 w-[min(78vw,320px)] rounded-[2rem] p-5 transition duration-300 md:hidden ${
              mobileOpen ? "translate-x-0" : "-translate-x-[120%]"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.24em] text-orange-300/80">
                Navigation
              </p>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300"
              >
                Close
              </button>
            </div>
            <div className="mt-6 grid gap-3">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-[1.4rem] border px-4 py-4 ${
                      active
                        ? "border-orange-400/30 bg-orange-500/10 text-white"
                        : "border-white/8 bg-white/3 text-slate-300"
                    }`}
                  >
                    <p className="font-medium">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                  </Link>
                );
              })}
            </div>
          </div>

          <main className="flex-1 px-1 pb-4 pt-4 md:px-0 md:pt-6">{children}</main>

          <nav className="app-surface safe-pb fixed inset-x-3 bottom-3 z-20 grid grid-cols-3 rounded-[1.75rem] p-2 md:hidden">
            {[
              ...navItems,
              { href: "/meetings/new", label: "Compose", detail: "New room" },
            ].map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-[1.25rem] px-3 py-3 text-center ${
                    active ? "bg-orange-500 text-white" : "text-slate-400"
                  }`}
                >
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="mt-1 block text-[0.68rem] uppercase tracking-[0.18em]">
                    {item.detail}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
