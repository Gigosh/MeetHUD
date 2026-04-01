"use client";

import { useState } from "react";
import type { ActionItem, MeetingWorkspace } from "@/lib/meethud";

type MobilePanel = "notes" | "decisions" | "actions";

function statusClasses(status: ActionItem["status"]) {
  switch (status) {
    case "ready":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200";
    case "blocked":
      return "border-rose-400/20 bg-rose-500/10 text-rose-200";
    default:
      return "border-amber-400/20 bg-amber-500/10 text-amber-200";
  }
}

export function WorkspaceBoard({ workspace }: { workspace: MeetingWorkspace }) {
  const [activeAgendaId, setActiveAgendaId] = useState(workspace.agenda[0]?.id);
  const [activeMobilePanel, setActiveMobilePanel] = useState<MobilePanel>("notes");
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(workspace.noteBlocks.map((block) => [block.id, block.body])),
  );
  const [actionItems, setActionItems] = useState(workspace.actionItems);

  const scopedBlocks = workspace.noteBlocks.filter(
    (block) => block.agendaItemId === activeAgendaId,
  );

  function cycleActionStatus(id: string) {
    setActionItems((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          status:
            item.status === "ready"
              ? "watching"
              : item.status === "watching"
                ? "blocked"
                : "ready",
        };
      }),
    );
  }

  return (
    <div className="grid gap-4">
      <section className="app-surface rise-in overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] ${
                  workspace.meeting.status === "live"
                    ? "bg-orange-500 text-white"
                    : workspace.meeting.status === "locked"
                      ? "bg-white/10 text-slate-300"
                      : "bg-emerald-500/15 text-emerald-200"
                }`}
              >
                {workspace.meeting.status}
              </span>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                {workspace.meeting.room}
              </span>
            </div>
            <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl leading-none tracking-[-0.06em] text-white md:text-6xl">
              <span className="text-gradient">{workspace.meeting.title}</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              {workspace.meeting.focus}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              {workspace.meeting.summary}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:max-w-[38rem]">
            {workspace.metrics.map((metric) => (
              <div key={metric.label} className="panel rounded-[1.5rem] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                  {metric.label}
                </p>
                <p className="mt-3 text-2xl font-semibold text-white">{metric.value}</p>
                <p className="mt-2 text-sm leading-6 text-slate-400">{metric.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {workspace.participants.map((participant) => (
            <div
              key={participant.id}
              className="rounded-full border border-white/10 bg-white/4 px-3 py-2 text-sm text-slate-300"
            >
              <span className="font-semibold text-white">{participant.initials}</span>{" "}
              {participant.name}
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[0.34fr_0.66fr]">
        <aside className="app-surface rise-in delay-1 rounded-[2rem] p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Agenda</h2>
            <span className="text-xs uppercase tracking-[0.22em] text-slate-500">
              {workspace.meeting.scheduledFor}
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {workspace.agenda.map((item) => {
              const active = item.id === activeAgendaId;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveAgendaId(item.id)}
                  className={`rounded-[1.5rem] border p-4 text-left transition ${
                    active
                      ? "border-orange-400/30 bg-orange-500/10"
                      : "border-white/8 bg-white/3 hover:border-orange-400/18"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    {item.startsAt} and {item.durationMinutes} min
                  </p>
                  <p className="mt-2 text-base font-semibold text-white">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.outcome}</p>
                </button>
              );
            })}
          </div>

          <div className="panel mt-5 rounded-[1.5rem] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-orange-300/80">
              Related history
            </p>
            <div className="mt-3 grid gap-3">
              {workspace.relatedMeetings.map((meeting) => (
                <div key={meeting.id} className="rounded-[1.25rem] bg-white/4 p-3">
                  <p className="font-medium text-white">{meeting.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{meeting.scheduledFor}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section className="grid gap-4">
          <div className="app-surface rise-in delay-2 rounded-[2rem] p-5">
            <div className="flex flex-wrap items-center gap-2 md:hidden">
              {(["notes", "decisions", "actions"] as const).map((panel) => (
                <button
                  key={panel}
                  type="button"
                  onClick={() => setActiveMobilePanel(panel)}
                  className={`rounded-full px-4 py-2 text-sm ${
                    activeMobilePanel === panel
                      ? "bg-orange-500 text-white"
                      : "border border-white/10 text-slate-400"
                  }`}
                >
                  {panel}
                </button>
              ))}
            </div>

            <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <div
                className={`${activeMobilePanel === "notes" ? "block" : "hidden"} md:block`}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Block notes</h2>
                  <span className="text-xs uppercase tracking-[0.22em] text-slate-500">
                    Agenda scoped
                  </span>
                </div>

                <div className="mt-4 grid gap-3">
                  {scopedBlocks.map((block) => (
                    <div key={block.id} className="panel rounded-[1.5rem] p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-[0.68rem] uppercase tracking-[0.2em] ${
                            block.tone === "decision"
                              ? "bg-orange-500 text-white"
                              : block.tone === "risk"
                                ? "bg-rose-500/12 text-rose-200"
                                : block.tone === "action"
                                  ? "bg-emerald-500/12 text-emerald-200"
                                  : "bg-white/8 text-slate-300"
                          }`}
                        >
                          {block.tone}
                        </span>
                        <p className="text-sm font-medium text-white">{block.title}</p>
                      </div>
                      <textarea
                        value={drafts[block.id] ?? block.body}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [block.id]: event.target.value,
                          }))
                        }
                        rows={5}
                        className="mt-4 w-full rounded-[1.35rem] border border-white/8 bg-white/4 px-4 py-3 text-sm leading-6 text-slate-200 outline-none focus:border-orange-400/35"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div
                  className={`${activeMobilePanel === "decisions" ? "block" : "hidden"} md:block`}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Decisions</h2>
                    <span className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      Inline capture
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {workspace.decisions.map((decision) => (
                      <div key={decision.id} className="panel rounded-[1.5rem] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-white">{decision.title}</p>
                          <span
                            className={`rounded-full px-3 py-1 text-[0.68rem] uppercase tracking-[0.2em] ${
                              decision.confidence === "locked"
                                ? "bg-orange-500 text-white"
                                : decision.confidence === "watch"
                                  ? "bg-amber-500/12 text-amber-200"
                                  : "bg-white/8 text-slate-300"
                            }`}
                          >
                            {decision.confidence}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-400">
                          {decision.rationale}
                        </p>
                        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                          Owner: {decision.owner}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className={`${activeMobilePanel === "actions" ? "block" : "hidden"} md:block`}
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white">Action lane</h2>
                    <span className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      Named follow-through
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3">
                    {actionItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => cycleActionStatus(item.id)}
                        className="panel rounded-[1.5rem] p-4 text-left transition hover:border-orange-400/18"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                          <span
                            className={`rounded-full border px-3 py-1 text-[0.68rem] uppercase tracking-[0.2em] ${statusClasses(item.status)}`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-400">
                          <span>{item.assignee}</span>
                          <span>{item.project}</span>
                          <span>{item.dueLabel}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
