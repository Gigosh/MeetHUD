import { CreateMeetingForm } from "@/components/create-meeting-form";

export const metadata = {
  title: "Create Meeting",
};

export default function CreateMeetingPage() {
  return (
    <section className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
      <div className="app-surface rise-in overflow-hidden rounded-[2rem] p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.32em] text-orange-300/80">
          Meeting creation flow
        </p>
        <h1 className="mt-4 max-w-2xl font-[family-name:var(--font-heading)] text-4xl leading-none tracking-[-0.06em] text-white md:text-6xl">
          Compose a room that can go live without cleanup later.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
          This flow validates a draft, runs it through the typed meeting boundary, and
          opens a fully rendered workspace route using the same contract.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["Sync", "Fast operating room with a clear action lane."],
            ["Planning", "Sequence the work before it becomes thrash."],
            ["Retro", "Lock the learnings while the room still remembers."],
          ].map(([title, detail], index) => (
            <div
              key={title}
              className="panel rise-in rounded-[1.6rem] p-5"
              style={{ animationDelay: `${110 + index * 70}ms` }}
            >
              <p className="text-xl font-semibold text-white">{title}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">{detail}</p>
            </div>
          ))}
        </div>
      </div>

      <CreateMeetingForm />
    </section>
  );
}
