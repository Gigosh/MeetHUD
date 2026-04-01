import { Suspense } from "react";
import { MeetingsOverview } from "@/components/meetings-overview";
import { getMeetingsDashboard } from "@/lib/meethud";

export const metadata = {
  title: "Meetings",
};

export default function MeetingsPage() {
  return (
    <Suspense fallback={<MeetingsSkeleton />}>
      <MeetingsRoute />
    </Suspense>
  );
}

async function MeetingsRoute() {
  const dashboard = await getMeetingsDashboard();

  return <MeetingsOverview dashboard={dashboard} />;
}

function MeetingsSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="app-surface h-48 animate-pulse rounded-[2rem] border border-white/5" />
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="app-surface h-[34rem] animate-pulse rounded-[2rem] border border-white/5" />
        <div className="app-surface h-[34rem] animate-pulse rounded-[2rem] border border-white/5" />
      </div>
    </div>
  );
}
