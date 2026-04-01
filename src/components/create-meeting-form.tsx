"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createMeetingDraft } from "@/lib/meethud";

const templateLabels = {
  sync: "Sync room",
  planning: "Planning room",
  retro: "Retro room",
} as const;

export function CreateMeetingForm() {
  const router = useRouter();
  const [title, setTitle] = useState("MeetHUD Launch Room");
  const [room, setRoom] = useState("Forge Bay 03");
  const [startsAt, setStartsAt] = useState("2026-04-01T15:00");
  const [goal, setGoal] = useState(
    "Align the final launch path, lock open decisions, and leave with named next moves.",
  );
  const [template, setTemplate] = useState<"sync" | "planning" | "retro">("planning");
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!title.trim() || !room.trim() || !goal.trim() || !startsAt) {
      setError("Complete the title, room, start time, and goal before creating the room.");
      return;
    }

    startTransition(async () => {
      const meeting = await createMeetingDraft({
        title,
        room,
        startsAt: new Date(startsAt).toISOString(),
        durationMinutes,
        template,
        goal,
      });

      const params = new URLSearchParams({
        title: meeting.title,
        room: meeting.room,
        startsAt: meeting.startsAt,
        durationMinutes: `${meeting.durationMinutes}`,
        template: meeting.template,
        goal: meeting.goal,
      });

      router.push(`/meetings/${meeting.id}?${params.toString()}`);
    });
  }

  return (
    <div className="app-surface rise-in delay-1 rounded-[2rem] p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-orange-300/80">
            Draft the room
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Set the shape up front.</h2>
        </div>
        <span className="rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-orange-200">
          {templateLabels[template]}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-200">Meeting title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-[1.3rem] border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400/40 focus:bg-white/6"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">Room</span>
            <input
              value={room}
              onChange={(event) => setRoom(event.target.value)}
              className="rounded-[1.3rem] border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400/40 focus:bg-white/6"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">Start time</span>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              className="rounded-[1.3rem] border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400/40 focus:bg-white/6"
            />
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">Template</span>
            <select
              value={template}
              onChange={(event) =>
                setTemplate(event.target.value as "sync" | "planning" | "retro")
              }
              className="rounded-[1.3rem] border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400/40 focus:bg-white/6"
            >
              <option value="sync">Sync</option>
              <option value="planning">Planning</option>
              <option value="retro">Retro</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">Duration</span>
            <select
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(Number(event.target.value))}
              className="rounded-[1.3rem] border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400/40 focus:bg-white/6"
            >
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
            </select>
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-200">Room goal</span>
          <textarea
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            rows={4}
            className="rounded-[1.5rem] border border-white/10 bg-white/4 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400/40 focus:bg-white/6"
          />
        </label>

        {error ? (
          <p className="rounded-[1.2rem] border border-rose-400/25 bg-rose-500/8 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}

        <div className="panel rounded-[1.5rem] p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
            Preview
          </p>
          <div className="mt-3 grid gap-2 text-sm text-slate-300">
            <p className="text-lg font-semibold text-white">{title}</p>
            <p>
              {room} and {durationMinutes} minutes
            </p>
            <p>{goal}</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-wait disabled:opacity-70"
        >
          {isPending ? "Opening workspace..." : "Create and open workspace"}
        </button>
      </form>
    </div>
  );
}
