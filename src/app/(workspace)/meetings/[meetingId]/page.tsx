import { Suspense } from "react";
import { WorkspaceBoard } from "@/components/workspace-board";
import {
  getMeetingWorkspace,
  type DraftMeetingResult,
} from "@/lib/meethud";

type RouteProps = {
  params: Promise<{ meetingId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: RouteProps) {
  const { meetingId } = await params;

  return {
    title: `Workspace ${meetingId}`,
  };
}

export default function MeetingWorkspacePage(props: RouteProps) {
  return (
    <Suspense fallback={<WorkspaceSkeleton />}>
      <MeetingWorkspaceRoute {...props} />
    </Suspense>
  );
}

async function MeetingWorkspaceRoute({ params, searchParams }: RouteProps) {
  const { meetingId } = await params;
  const resolvedSearchParams = await searchParams;

  const draft: Partial<DraftMeetingResult> = {
    title: asSingleValue(resolvedSearchParams.title),
    room: asSingleValue(resolvedSearchParams.room),
    startsAt: asSingleValue(resolvedSearchParams.startsAt),
    durationMinutes: asNumber(resolvedSearchParams.durationMinutes),
    template: asTemplate(asSingleValue(resolvedSearchParams.template)),
    goal: asSingleValue(resolvedSearchParams.goal),
  };

  const workspace = await getMeetingWorkspace(meetingId, draft);

  return <WorkspaceBoard workspace={workspace} />;
}

function WorkspaceSkeleton() {
  return (
    <div className="grid gap-4">
      <div className="app-surface h-48 animate-pulse rounded-[2rem] border border-white/5" />
      <div className="grid gap-4 xl:grid-cols-[0.34fr_0.66fr]">
        <div className="app-surface h-[34rem] animate-pulse rounded-[2rem] border border-white/5" />
        <div className="app-surface h-[34rem] animate-pulse rounded-[2rem] border border-white/5" />
      </div>
    </div>
  );
}

function asSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function asNumber(value: string | string[] | undefined) {
  const raw = asSingleValue(value);
  return raw ? Number(raw) : undefined;
}

function asTemplate(
  value: string | undefined,
): DraftMeetingResult["template"] | undefined {
  if (value === "sync" || value === "planning" || value === "retro") {
    return value;
  }

  return undefined;
}
