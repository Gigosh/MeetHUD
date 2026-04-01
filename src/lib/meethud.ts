export type MeetingStatus = "upcoming" | "live" | "locked";

export interface Participant {
  id: string;
  name: string;
  role: string;
  initials: string;
  presence: "live" | "queued" | "async";
}

export interface MeetingSummary {
  id: string;
  title: string;
  room: string;
  status: MeetingStatus;
  scheduledFor: string;
  durationMinutes: number;
  facilitator: string;
  summary: string;
  focus: string;
  progressLabel: string;
  agendaCount: number;
  participantCount: number;
}

export interface AgendaItem {
  id: string;
  label: string;
  owner: string;
  startsAt: string;
  durationMinutes: number;
  outcome: string;
}

export interface NoteBlock {
  id: string;
  agendaItemId: string;
  title: string;
  body: string;
  tone: "neutral" | "decision" | "risk" | "action";
}

export interface Decision {
  id: string;
  title: string;
  rationale: string;
  owner: string;
  confidence: "locked" | "watch" | "pending";
}

export interface ActionItem {
  id: string;
  title: string;
  assignee: string;
  dueLabel: string;
  status: "ready" | "watching" | "blocked";
  project: string;
}

export interface WorkspaceMetric {
  label: string;
  value: string;
  detail: string;
}

export interface MeetingWorkspace {
  meeting: MeetingSummary;
  participants: Participant[];
  agenda: AgendaItem[];
  noteBlocks: NoteBlock[];
  decisions: Decision[];
  actionItems: ActionItem[];
  metrics: WorkspaceMetric[];
  relatedMeetings: MeetingSummary[];
}

export interface DashboardStat {
  label: string;
  value: string;
  trend: string;
}

export interface MeetingsDashboard {
  heading: string;
  subheading: string;
  stats: DashboardStat[];
  meetings: MeetingSummary[];
  watchlist: string[];
}

export interface OnboardingSnapshot {
  headline: string;
  detail: string;
  pillars: Array<{ title: string; detail: string }>;
  steps: Array<{ title: string; detail: string; owner: string }>;
}

export interface NewMeetingInput {
  title: string;
  room: string;
  startsAt: string;
  durationMinutes: number;
  template: "sync" | "retro" | "planning";
  goal: string;
}

export interface DraftMeetingResult {
  id: string;
  title: string;
  room: string;
  startsAt: string;
  durationMinutes: number;
  template: NewMeetingInput["template"];
  goal: string;
}

const participants: Participant[] = [
  {
    id: "p1",
    name: "Maya Torres",
    role: "Delivery lead",
    initials: "MT",
    presence: "live",
  },
  {
    id: "p2",
    name: "Jon Park",
    role: "Product",
    initials: "JP",
    presence: "live",
  },
  {
    id: "p3",
    name: "Iris Hall",
    role: "Engineering",
    initials: "IH",
    presence: "queued",
  },
  {
    id: "p4",
    name: "Sam Chen",
    role: "Design",
    initials: "SC",
    presence: "async",
  },
];

const meetings: MeetingSummary[] = [
  {
    id: "factory-rhythm",
    title: "Factory Rhythm",
    room: "Forge Bay 02",
    status: "live",
    scheduledFor: "Today, 11:30 UTC",
    durationMinutes: 45,
    facilitator: "Maya Torres",
    summary: "Live operating review aligning delivery, QA heat, and stakeholder asks.",
    focus: "Keep the team on the same orange line from agenda to action.",
    progressLabel: "3 of 5 agenda blocks in flight",
    agendaCount: 5,
    participantCount: 7,
  },
  {
    id: "q2-launch-drumbeat",
    title: "Q2 Launch Drumbeat",
    room: "Orbit Room",
    status: "upcoming",
    scheduledFor: "Today, 15:00 UTC",
    durationMinutes: 30,
    facilitator: "Jon Park",
    summary: "Tight launch standup for copy, funnel instrumentation, and QA cut line.",
    focus: "Make launch blockers explicit before the window closes.",
    progressLabel: "Agenda staged and ready",
    agendaCount: 4,
    participantCount: 5,
  },
  {
    id: "signal-retro",
    title: "Signal Retro",
    room: "Afterglow",
    status: "locked",
    scheduledFor: "Yesterday, 17:00 UTC",
    durationMinutes: 60,
    facilitator: "Iris Hall",
    summary: "Locked retro capturing what sped up delivery and what burned cycles.",
    focus: "Turn recurring friction into a smaller operating surface.",
    progressLabel: "Summary exported",
    agendaCount: 6,
    participantCount: 9,
  },
  {
    id: "design-handoff-grid",
    title: "Design Handoff Grid",
    room: "North Wall",
    status: "upcoming",
    scheduledFor: "Tomorrow, 09:00 UTC",
    durationMinutes: 40,
    facilitator: "Sam Chen",
    summary: "UI handoff review for layout system, states, and responsiveness.",
    focus: "Preserve velocity without letting polish fragment.",
    progressLabel: "Assets linked",
    agendaCount: 4,
    participantCount: 4,
  },
];

const workspaceSeeds: Record<string, Omit<MeetingWorkspace, "meeting" | "relatedMeetings">> =
  {
    "factory-rhythm": {
      participants,
      agenda: [
        {
          id: "agenda-1",
          label: "Shipment heat map",
          owner: "Maya",
          startsAt: "11:30",
          durationMinutes: 10,
          outcome: "Name the top two dates that cannot move.",
        },
        {
          id: "agenda-2",
          label: "Decision sweep",
          owner: "Jon",
          startsAt: "11:40",
          durationMinutes: 8,
          outcome: "Lock channel ownership before launch comms go out.",
        },
        {
          id: "agenda-3",
          label: "Action lane",
          owner: "Iris",
          startsAt: "11:48",
          durationMinutes: 12,
          outcome: "Leave with named work and no floating blockers.",
        },
        {
          id: "agenda-4",
          label: "Search backlog",
          owner: "Sam",
          startsAt: "12:00",
          durationMinutes: 8,
          outcome: "Choose what ships in the next cycle.",
        },
      ],
      noteBlocks: [
        {
          id: "note-1",
          agendaItemId: "agenda-1",
          title: "Release pressure",
          body:
            "Search indexing is healthy. The only red lane is notification QA, which still has two flaky handoffs on mobile widths.",
          tone: "risk",
        },
        {
          id: "note-2",
          agendaItemId: "agenda-1",
          title: "Customer pulse",
          body:
            "Ops teams want locked notes immediately after the meeting, not at end-of-day. Post-meeting summary speed is a differentiator.",
          tone: "neutral",
        },
        {
          id: "note-3",
          agendaItemId: "agenda-2",
          title: "Decision candidate",
          body:
            "Keep decision capture inline in the workspace rail instead of opening a detached modal. It keeps the meeting moving.",
          tone: "decision",
        },
        {
          id: "note-4",
          agendaItemId: "agenda-3",
          title: "Action inventory",
          body:
            "Sam owns responsive polish notes. Iris owns realtime contract verification. Jon owns launch copy review with customer success.",
          tone: "action",
        },
        {
          id: "note-5",
          agendaItemId: "agenda-4",
          title: "Scope brake",
          body:
            "AI extraction stays visually implied only. The MVP needs a clean manual flow before automation earns space.",
          tone: "neutral",
        },
      ],
      decisions: [
        {
          id: "decision-1",
          title: "Decision capture stays inline",
          rationale:
            "The team can mark a note as a decision without losing meeting context or breaking keyboard flow.",
          owner: "Jon Park",
          confidence: "locked",
        },
        {
          id: "decision-2",
          title: "Search ships with locked summaries only",
          rationale:
            "Live note search creates noise. Locked history gives a smaller, faster, and safer MVP surface.",
          owner: "Maya Torres",
          confidence: "watch",
        },
      ],
      actionItems: [
        {
          id: "action-1",
          title: "Verify block payload shape with backend contract",
          assignee: "Iris Hall",
          dueLabel: "Today",
          status: "ready",
          project: "MeetHUD core",
        },
        {
          id: "action-2",
          title: "Tune mobile note card spacing for keyboard overlap",
          assignee: "Sam Chen",
          dueLabel: "Tomorrow",
          status: "watching",
          project: "Workspace UX",
        },
        {
          id: "action-3",
          title: "Prepare launch room facilitation script",
          assignee: "Maya Torres",
          dueLabel: "This week",
          status: "blocked",
          project: "Launch readiness",
        },
      ],
      metrics: [
        {
          label: "Decision velocity",
          value: "02",
          detail: "Calls already locked in the room",
        },
        {
          label: "Open actions",
          value: "03",
          detail: "Named owners with due labels",
        },
        {
          label: "Live attendance",
          value: "04",
          detail: "Two more queued for async review",
        },
      ],
    },
    "signal-retro": {
      participants,
      agenda: [
        {
          id: "retro-1",
          label: "What sped us up",
          owner: "Iris",
          startsAt: "17:00",
          durationMinutes: 15,
          outcome: "Keep the decisions that reduced cycle time.",
        },
        {
          id: "retro-2",
          label: "What burned time",
          owner: "Maya",
          startsAt: "17:15",
          durationMinutes: 20,
          outcome: "Name repeat issues and kill one this sprint.",
        },
      ],
      noteBlocks: [
        {
          id: "retro-note-1",
          agendaItemId: "retro-1",
          title: "Signal wins",
          body:
            "Single-room ownership helped. People stopped scattering updates across docs and chat threads.",
          tone: "neutral",
        },
        {
          id: "retro-note-2",
          agendaItemId: "retro-2",
          title: "Signal drag",
          body:
            "Lack of named action items created cleanup work the next morning. The new workspace rail fixes that.",
          tone: "risk",
        },
      ],
      decisions: [
        {
          id: "retro-decision-1",
          title: "Ship locked summaries as a default closeout state",
          rationale: "History is stronger when the room closes cleanly.",
          owner: "Maya Torres",
          confidence: "locked",
        },
      ],
      actionItems: [
        {
          id: "retro-action-1",
          title: "Reduce duplicated recap work in Monday ops review",
          assignee: "Jon Park",
          dueLabel: "Next Monday",
          status: "ready",
          project: "Ops rhythm",
        },
      ],
      metrics: [
        {
          label: "Summary mode",
          value: "Locked",
          detail: "Read-only history with decisions intact",
        },
        {
          label: "Carryover items",
          value: "01",
          detail: "Only one follow-up remained after the room",
        },
      ],
    },
  };

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeMeetingFromDraft(result: DraftMeetingResult): MeetingSummary {
  return {
    id: result.id,
    title: result.title,
    room: result.room,
    status: "upcoming",
    scheduledFor: new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(new Date(result.startsAt)),
    durationMinutes: result.durationMinutes,
    facilitator: "Maya Torres",
    summary: result.goal,
    focus:
      result.template === "retro"
        ? "Close the loop on what helped and what dragged."
        : result.template === "planning"
          ? "Leave with sharper sequencing and named owners."
          : "Keep the room moving without losing the operating line.",
    progressLabel: "Fresh room, agenda staged",
    agendaCount: 4,
    participantCount: 5,
  };
}

function buildDraftWorkspace(result: DraftMeetingResult): Omit<
  MeetingWorkspace,
  "meeting" | "relatedMeetings"
> {
  const agenda =
    result.template === "retro"
      ? [
          {
            id: "draft-1",
            label: "What moved fast",
            owner: "Maya",
            startsAt: "00:00",
            durationMinutes: 12,
            outcome: "Keep high-signal habits in the next sprint.",
          },
          {
            id: "draft-2",
            label: "What dragged",
            owner: "Iris",
            startsAt: "00:12",
            durationMinutes: 12,
            outcome: "Name one drag source worth removing now.",
          },
          {
            id: "draft-3",
            label: "Actions",
            owner: "Jon",
            startsAt: "00:24",
            durationMinutes: 10,
            outcome: "Leave with one systems-level improvement.",
          },
        ]
      : result.template === "planning"
        ? [
            {
              id: "draft-1",
              label: "Frame the goal",
              owner: "Maya",
              startsAt: "00:00",
              durationMinutes: 8,
              outcome: "Get everyone on the same operating definition.",
            },
            {
              id: "draft-2",
              label: "Sequence the work",
              owner: "Iris",
              startsAt: "00:08",
              durationMinutes: 16,
              outcome: "Choose the order that protects the launch edge.",
            },
            {
              id: "draft-3",
              label: "Confirm ownership",
              owner: "Jon",
              startsAt: "00:24",
              durationMinutes: 10,
              outcome: "Exit with named owners and dates.",
            },
          ]
        : [
            {
              id: "draft-1",
              label: "Room scan",
              owner: "Maya",
              startsAt: "00:00",
              durationMinutes: 8,
              outcome: "Surface the few things that actually need attention.",
            },
            {
              id: "draft-2",
              label: "Decisions",
              owner: "Jon",
              startsAt: "00:08",
              durationMinutes: 10,
              outcome: "Resolve open calls while the whole room is present.",
            },
            {
              id: "draft-3",
              label: "Action lane",
              owner: "Iris",
              startsAt: "00:18",
              durationMinutes: 12,
              outcome: "Turn notes into trackable follow-through.",
            },
          ];

  return {
    participants,
    agenda,
    noteBlocks: agenda.map((item, index) => ({
      id: `draft-note-${index + 1}`,
      agendaItemId: item.id,
      title: item.label,
      body:
        index === 0
          ? result.goal
          : "Capture fast notes here. Blocks stay intentionally lightweight for MVP collaboration.",
      tone: index === 1 ? "decision" : index === 2 ? "action" : "neutral",
    })),
    decisions: [
      {
        id: "draft-decision-1",
        title: "Room goal accepted",
        rationale: result.goal,
        owner: "Maya Torres",
        confidence: "pending",
      },
    ],
    actionItems: [
      {
        id: "draft-action-1",
        title: "Confirm owners and follow-up path before the room closes",
        assignee: "Maya Torres",
        dueLabel: "After meeting",
        status: "ready",
        project: "MeetHUD workspace",
      },
    ],
    metrics: [
      {
        label: "Template",
        value: result.template,
        detail: "Configured from the creation flow",
      },
      {
        label: "Agenda blocks",
        value: `${agenda.length}`,
        detail: "Ready for collaborative notes",
      },
    ],
  };
}

export async function getOnboardingSnapshot(): Promise<OnboardingSnapshot> {
  await wait(120);

  return {
    headline: "Stand up the room before the room stands up on you.",
    detail:
      "MeetHUD turns agendas, live notes, decisions, and action follow-through into one operating surface instead of four scattered tools.",
    pillars: [
      {
        title: "Agenda first",
        detail: "Every meeting opens with a clear sequence and an owner per block.",
      },
      {
        title: "Inline decisions",
        detail:
          "Capture decisions directly beside the note that created them so context never disappears.",
      },
      {
        title: "Named follow-through",
        detail:
          "Every action leaves the room with an owner, a due label, and a project lane.",
      },
    ],
    steps: [
      {
        title: "Create your operating lane",
        detail: "Set team name, rhythm, and the warm-up defaults for your room.",
        owner: "Workspace owner",
      },
      {
        title: "Bring your live room online",
        detail: "Launch a meeting with agenda blocks already structured for notes.",
        owner: "Facilitator",
      },
      {
        title: "Lock the outcome",
        detail: "Decisions and actions stay readable after the room closes.",
        owner: "MeetHUD",
      },
    ],
  };
}

export async function getMeetingsDashboard(): Promise<MeetingsDashboard> {
  await wait(180);

  return {
    heading: "The room is already moving.",
    subheading:
      "Track what is live now, what is queued next, and what already became searchable history.",
    stats: [
      {
        label: "Meetings today",
        value: "04",
        trend: "+1 from yesterday",
      },
      {
        label: "Decisions locked",
        value: "11",
        trend: "2 awaiting confirmation",
      },
      {
        label: "Open actions",
        value: "19",
        trend: "4 due in the next 24h",
      },
    ],
    meetings,
    watchlist: [
      "Keep mobile keyboard overlap below the note composer.",
      "Backend contract for note block mutations is still pending.",
      "Search should only target locked summaries for MVP one.",
    ],
  };
}

export async function createMeetingDraft(
  input: NewMeetingInput,
): Promise<DraftMeetingResult> {
  await wait(240);

  return {
    id: slugify(input.title) || `meeting-${Date.now()}`,
    title: input.title,
    room: input.room,
    startsAt: input.startsAt,
    durationMinutes: input.durationMinutes,
    template: input.template,
    goal: input.goal,
  };
}

export async function getMeetingWorkspace(
  meetingId: string,
  draft?: Partial<DraftMeetingResult>,
): Promise<MeetingWorkspace> {
  await wait(150);

  const knownMeeting = meetings.find((meeting) => meeting.id === meetingId);
  const seed = workspaceSeeds[meetingId];

  if (knownMeeting && seed) {
    return {
      meeting: knownMeeting,
      ...seed,
      relatedMeetings: meetings.filter((meeting) => meeting.id !== meetingId).slice(0, 3),
    };
  }

  const fallbackDraft: DraftMeetingResult = {
    id: meetingId,
    title: draft?.title ?? "Fresh Working Session",
    room: draft?.room ?? "Forge Bay 04",
    startsAt: draft?.startsAt ?? new Date().toISOString(),
    durationMinutes: draft?.durationMinutes ?? 30,
    template: draft?.template ?? "sync",
    goal:
      draft?.goal ??
      "Use this room to align the sequence, capture the decisions, and leave with named next moves.",
  };

  const meeting = makeMeetingFromDraft(fallbackDraft);
  const workspace = buildDraftWorkspace(fallbackDraft);

  return {
    meeting,
    ...workspace,
    relatedMeetings: meetings.slice(0, 3),
  };
}
