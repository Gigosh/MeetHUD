"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { OnboardingState } from "@/app/onboarding/actions";

const initialState: OnboardingState = {
  error: null,
};

export function OnboardingForm({
  action,
}: {
  action: (
    previousState: OnboardingState,
    formData: FormData,
  ) => Promise<OnboardingState>;
}) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <div className="app-surface rise-in delay-1 rounded-[2rem] p-6 md:p-8">
      <p className="text-xs uppercase tracking-[0.32em] text-orange-300/80">
        Configure the room
      </p>
      <h2 className="mt-4 font-[family-name:var(--font-heading)] text-3xl leading-none tracking-[-0.05em] text-white">
        Set the operating defaults.
      </h2>
      <p className="mt-4 text-sm leading-6 text-slate-400">
        This mock onboarding stores the workspace profile in a secure cookie so the
        shell can feel authenticated without waiting on backend delivery.
      </p>

      <form action={formAction} className="mt-8 grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-slate-200">Workspace name</span>
          <input
            type="text"
            name="workspace"
            placeholder="Forge Delivery"
            className="rounded-[1.3rem] border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-orange-400/40 focus:bg-white/6"
          />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">Team size</span>
            <select
              name="teamSize"
              className="rounded-[1.3rem] border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400/40 focus:bg-white/6"
              defaultValue="6-12"
            >
              <option value="1-5">1-5</option>
              <option value="6-12">6-12</option>
              <option value="13-25">13-25</option>
              <option value="25+">25+</option>
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-200">Meeting rhythm</span>
            <select
              name="rhythm"
              className="rounded-[1.3rem] border border-white/10 bg-white/4 px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400/40 focus:bg-white/6"
              defaultValue="daily"
            >
              <option value="daily">Daily room</option>
              <option value="weekly">Weekly operating review</option>
              <option value="mixed">Mixed cadence</option>
            </select>
          </label>
        </div>

        {state.error ? (
          <p className="rounded-[1.2rem] border border-rose-400/25 bg-rose-500/8 px-4 py-3 text-sm text-rose-200">
            {state.error}
          </p>
        ) : null}

        <div className="panel rounded-[1.5rem] p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            What ships in this shell
          </p>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-slate-300">
            <li>Authenticated entry and responsive product shell.</li>
            <li>Meeting list, creation flow, and live workspace layout.</li>
            <li>Agenda notes, decisions, and action item surfaces with typed mocks.</li>
          </ul>
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 disabled:cursor-wait disabled:opacity-70"
      disabled={pending}
    >
      {pending ? "Opening workspace..." : "Continue to shell"}
    </button>
  );
}
