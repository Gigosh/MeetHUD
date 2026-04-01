"use client";

import Link from "next/link";
import { startTransition, useDeferredValue, useState } from "react";
import type { MeetingStatus, MeetingsDashboard } from "@/lib/meethud";

const filters: Array<{ value: MeetingStatus | "all"; label: string }> = [
  { value: "all", label: "All rooms" },
  { value: "live", label: "Live now" },
  { value: "upcoming", label: "Upcoming" },
  { value: "locked", label: "Locked" },
];

export function MeetingsOverview({
  dashboard,
}: {
  dashboard: MeetingsDashboard;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<MeetingStatus | "all">("all");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredMeetings = dashboard.meetings.filter((meeting) => {
    const matchesFilter = filter === "all" ? true : meeting.status === filter;
    const haystack = `${meeting.title} ${meeting.summary} ${meeting.room}`.toLowerCase();
    const matchesQuery = deferredQuery ? haystack.includes(deferredQuery) : true;
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="grid gap-4">
      <section className="app-surface rise-in overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.32em] text-orange-300/80">
              Meeting shell
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl leading-none tracking-[-0.06em] text-white md:text-6xl">
              <span className="text-gradient">{dashboard.heading}</span>
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
              {dashboard.subheading}
            </p>
          </div>

          <div className="grid flex-1 gap-3 sm:grid-cols-3 xl:max-w-[40rem]">
            {dashboard.stats.map((stat, index) => (
              <div
                key={stat.label}
                className="panel rise-in rounded-[1.6rem] p-4"
                style={{ animationDelay: `${120 + index * 70}ms` }}
              >
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  {stat.label}
                </p>
                <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-400">{stat.trend}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="app-surface rise-in delay-1 rounded-[2rem] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Rooms in motion</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Filter the list without a page refresh. The data still flows through a
                typed server boundary.
              </p>
            </div>
            <Link
              href="/meetings/new"
              className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-400"
            >
              Create meeting
            </Link>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto]">
            <label className="rounded-full border border-white/10 bg-white/4 px-4 py-3 text-sm text-slate-300">
              <span className="sr-only">Search meetings</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search room, goal, or focus..."
                className="w-full bg-transparent outline-none placeholder:text-slate-500"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {filters.map((option) => {
                const active = filter === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      startTransition(() => {
                        setFilter(option.value);
                      })
                    }
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      active
                        ? "border-orange-400/30 bg-orange-500/10 text-white"
                        : "border-white/8 text-slate-400 hover:border-orange-400/20 hover:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {filteredMeetings.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/meetings/${meeting.id}`}
                className="panel rounded-[1.6rem] p-5 transition hover:border-orange-400/20 hover:bg-white/6"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] ${
                          meeting.status === "live"
                            ? "bg-orange-500 text-white"
                            : meeting.status === "locked"
                              ? "bg-white/10 text-slate-300"
                              : "bg-emerald-500/15 text-emerald-200"
                        }`}
                      >
                        {meeting.status}
                      </span>
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                        {meeting.scheduledFor}
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-white">
                      {meeting.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                      {meeting.summary}
                    </p>
                  </div>

                  <div className="grid gap-2 text-sm text-slate-300 md:min-w-[17rem]">
                    <p>{meeting.room}</p>
                    <p>{meeting.progressLabel}</p>
                    <p>
                      {meeting.agendaCount} agenda blocks and {meeting.participantCount} collaborators
                    </p>
                  </div>
                </div>
              </Link>
            ))}

            {filteredMeetings.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-white/12 p-8 text-center text-sm text-slate-400">
                No rooms match this filter yet.
              </div>
            ) : null}
          </div>
        </section>

        <aside className="grid gap-4">
          <section className="app-surface rise-in delay-2 rounded-[2rem] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-orange-300/80">
              Watchlist
            </p>
            <div className="mt-4 grid gap-3">
              {dashboard.watchlist.map((item) => (
                <div key={item} className="panel rounded-[1.4rem] p-4 text-sm leading-6 text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="app-surface rise-in delay-3 rounded-[2rem] p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-orange-300/80">
              Workspace stance
            </p>
            <div className="mt-4 grid gap-3">
              <div className="panel rounded-[1.4rem] p-4">
                <p className="text-sm font-semibold text-white">Block notes only</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  The shell leaves CRDT and rich-text complexity out of MVP one.
                </p>
              </div>
              <div className="panel rounded-[1.4rem] p-4">
                <p className="text-sm font-semibold text-white">Decision rail stays visible</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Capture decisions beside the notes that produced them.
                </p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
