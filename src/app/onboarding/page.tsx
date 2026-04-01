import { Suspense } from "react";
import { completeOnboardingAction } from "./actions";
import { OnboardingForm } from "@/components/onboarding-form";
import { getOnboardingSnapshot } from "@/lib/meethud";

export const metadata = {
  title: "Onboarding",
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingSkeleton />}>
      <OnboardingRoute />
    </Suspense>
  );
}

async function OnboardingRoute() {
  const snapshot = await getOnboardingSnapshot();

  return (
    <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="app-surface rise-in overflow-hidden rounded-[2rem] p-6 md:p-8">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.32em] text-orange-300/80">
            Onboarding entry
          </p>
          <h1 className="mt-4 max-w-xl font-[family-name:var(--font-heading)] text-4xl leading-none tracking-[-0.06em] text-white md:text-6xl">
            <span className="text-gradient">{snapshot.headline}</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 md:text-lg">
            {snapshot.detail}
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {snapshot.pillars.map((pillar, index) => (
            <div
              key={pillar.title}
              className="panel rise-in rounded-[1.75rem] p-5"
              style={{ animationDelay: `${120 + index * 80}ms` }}
            >
              <p className="text-xs uppercase tracking-[0.24em] text-orange-300/80">
                Pillar 0{index + 1}
              </p>
              <h2 className="mt-3 text-xl font-semibold text-white">{pillar.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">{pillar.detail}</p>
            </div>
          ))}
        </div>

        <div className="panel mt-6 rounded-[1.75rem] p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-orange-300/80">
            Launch sequence
          </p>
          <div className="mt-4 grid gap-3">
            {snapshot.steps.map((step) => (
              <div
                key={step.title}
                className="flex flex-col gap-2 rounded-[1.4rem] border border-white/6 bg-white/3 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h3 className="text-base font-semibold text-white">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{step.detail}</p>
                </div>
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                  {step.owner}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <OnboardingForm action={completeOnboardingAction} />
    </section>
  );
}

function OnboardingSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
      <div className="app-surface h-[38rem] animate-pulse rounded-[2rem] border border-white/5" />
      <div className="app-surface h-[38rem] animate-pulse rounded-[2rem] border border-white/5" />
    </div>
  );
}
