"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Meeting, AgendaItem, NoteBlock, Decision, ActionItem } from "@/lib/types";

export default function MeetingWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [noteBlocks, setNoteBlocks] = useState<NoteBlock[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [activeAgendaId, setActiveAgendaId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [meetingRes, agendaRes, notesRes, decisionsRes, actionsRes] =
        await Promise.all([
          supabase.from("meetings").select("*").eq("id", meetingId).single(),
          supabase
            .from("agenda_items")
            .select("*")
            .eq("meeting_id", meetingId)
            .order("order"),
          supabase
            .from("note_blocks")
            .select("*")
            .eq("meeting_id", meetingId)
            .order("created_at"),
          supabase
            .from("decisions")
            .select("*")
            .eq("meeting_id", meetingId)
            .order("created_at"),
          supabase
            .from("action_items")
            .select("*")
            .eq("meeting_id", meetingId)
            .order("created_at"),
        ]);

      setMeeting(meetingRes.data);
      setAgendaItems(agendaRes.data || []);
      setNoteBlocks(notesRes.data || []);
      setDecisions(decisionsRes.data || []);
      setActionItems(actionsRes.data || []);
      if (agendaRes.data?.[0]) setActiveAgendaId(agendaRes.data[0].id);
      setIsLoading(false);
    };

    fetchData();

    const channel = supabase
      .channel(`meeting-${meetingId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "note_blocks", filter: `meeting_id=eq.${meetingId}` },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [meetingId, supabase]);

  const addNoteBlock = async (type: NoteBlock["block_type"]) => {
    if (meeting?.status === "completed") return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("note_blocks").insert({
      meeting_id: meetingId,
      agenda_item_id: activeAgendaId,
      content: newNoteContent || "",
      block_type: type,
      created_by: user.id,
    });

    setNewNoteContent("");
    if (type === "decision" || type === "action_item") {
      const title =
        type === "decision"
          ? "New Decision"
          : "New Action Item";
      if (type === "decision") {
        await supabase.from("decisions").insert({
          meeting_id: meetingId,
          title,
          note_block_id: undefined,
        });
      } else {
        await supabase.from("action_items").insert({
          meeting_id: meetingId,
          title,
          status: "pending",
          created_by: user.id,
        });
      }
    }

    const [, agendaRes, notesRes, decisionsRes, actionsRes] = await Promise.all([
      null,
      supabase
        .from("agenda_items")
        .select("*")
        .eq("meeting_id", meetingId)
        .order("order"),
      supabase
        .from("note_blocks")
        .select("*")
        .eq("meeting_id", meetingId)
        .order("created_at"),
      supabase
        .from("decisions")
        .select("*")
        .eq("meeting_id", meetingId)
        .order("created_at"),
      supabase
        .from("action_items")
        .select("*")
        .eq("meeting_id", meetingId)
        .order("created_at"),
    ]);

    setAgendaItems(agendaRes.data || []);
    setNoteBlocks(notesRes.data || []);
    setDecisions(decisionsRes.data || []);
    setActionItems(actionsRes.data || []);
  };

  const updateNoteBlock = async (id: string, content: string) => {
    if (meeting?.status === "completed") return;
    await supabase
      .from("note_blocks")
      .update({ content })
      .eq("id", id);
    setNoteBlocks((blocks) =>
      blocks.map((b) => (b.id === id ? { ...b, content } : b))
    );
  };

  const deleteNoteBlock = async (id: string) => {
    if (meeting?.status === "completed") return;
    await supabase.from("note_blocks").delete().eq("id", id);
    setNoteBlocks((blocks) => blocks.filter((b) => b.id !== id));
  };

  const toggleActionItemStatus = async (id: string, currentStatus: ActionItem["status"]) => {
    if (meeting?.status === "completed") return;
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    await supabase.from("action_items").update({ status: newStatus }).eq("id", id);
    setActionItems((items) =>
      items.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading meeting...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Meeting not found</h2>
        <Button variant="outline" onClick={() => router.push("/meetings")}>
          Back to meetings
        </Button>
      </div>
    );
  }

  const activeNotes = noteBlocks.filter(
    (n) => n.agenda_item_id === activeAgendaId || (!activeAgendaId && !n.agenda_item_id)
  );

  return (
    <div className="space-y-6 animate-slide-in-bottom">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{meeting.title}</h1>
            <Badge
              variant={
                meeting.status === "live"
                  ? "success"
                  : meeting.status === "completed"
                  ? "secondary"
                  : "outline"
              }
            >
              {meeting.status}
            </Badge>
          </div>
          {meeting.description && (
            <p className="text-muted-foreground">{meeting.description}</p>
          )}
        </div>
        <Button variant="outline" onClick={() => router.push("/meetings")}>
          <svg
            className="h-4 w-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop sidebar - visible on lg+ */}
        <div className="hidden lg:block lg:col-span-1 space-y-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <svg
                className="h-4 w-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Agenda
            </h3>
            <div className="space-y-2">
              {agendaItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveAgendaId(item.id)}
                  className={`w-full text-left min-h-[44px] px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    activeAgendaId === item.id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-secondary/50"
                  }`}
                >
                  <span className="font-medium">{item.order}.</span> {item.title}
                </button>
              ))}
              {agendaItems.length === 0 && (
                <p className="text-sm text-muted-foreground px-3">
                  No agenda items
                </p>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <svg
                className="h-4 w-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Decisions ({decisions.length})
            </h3>
            <div className="space-y-2">
              {decisions.map((decision) => (
                <div
                  key={decision.id}
                  className="px-3 py-2 rounded-lg bg-secondary/30 text-sm"
                >
                  {decision.title}
                </div>
              ))}
              {decisions.length === 0 && (
                <p className="text-sm text-muted-foreground px-3">
                  No decisions yet
                </p>
              )}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <svg
                className="h-4 w-4 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Action Items ({actionItems.length})
            </h3>
            <div className="space-y-2">
              {actionItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleActionItemStatus(item.id, item.status)}
                  disabled={meeting?.status === "completed"}
                  className={`w-full text-left min-h-[44px] px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                    item.status === "completed"
                      ? "bg-green-500/10 text-green-400 line-through"
                      : "bg-secondary/30 hover:bg-secondary/50"
                  }`}
                >
                  <span
                    className={`h-4 w-4 rounded border ${
                      item.status === "completed"
                        ? "bg-green-500 border-green-500"
                        : "border-muted-foreground"
                    }`}
                  />
                  {item.title}
                </button>
              ))}
              {actionItems.length === 0 && (
                <p className="text-sm text-muted-foreground px-3">
                  No action items yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile sidebar FAB - visible on mobile only */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Open agenda"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
        </button>

        {/* Mobile sidebar drawer */}
        {isSidebarOpen && (
          <>
            {/* Overlay */}
            <div
              className="lg:hidden fixed inset-0 z-50 bg-black/50 animate-slide-in-bottom"
              onClick={() => setIsSidebarOpen(false)}
            />

            {/* Bottom sheet */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl border-t border-border animate-slide-in-bottom max-h-[70vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Meeting Panel</h3>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="h-11 min-w-[44px] flex items-center justify-center rounded-lg hover:bg-secondary/50 transition-colors"
                    aria-label="Close panel"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2 text-sm">
                    <svg
                      className="h-4 w-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                    Agenda
                  </h4>
                  <div className="space-y-2">
                    {agendaItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveAgendaId(item.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full text-left min-h-[44px] px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                          activeAgendaId === item.id
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-secondary/50"
                        }`}
                      >
                        <span className="font-medium">{item.order}.</span> {item.title}
                      </button>
                    ))}
                    {agendaItems.length === 0 && (
                      <p className="text-sm text-muted-foreground px-3">
                        No agenda items
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2 text-sm">
                    <svg
                      className="h-4 w-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Decisions ({decisions.length})
                  </h4>
                  <div className="space-y-2">
                    {decisions.map((decision) => (
                      <div
                        key={decision.id}
                        className="px-3 py-2 rounded-lg bg-secondary/30 text-sm"
                      >
                        {decision.title}
                      </div>
                    ))}
                    {decisions.length === 0 && (
                      <p className="text-sm text-muted-foreground px-3">
                        No decisions yet
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2 text-sm">
                    <svg
                      className="h-4 w-4 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Action Items ({actionItems.length})
                  </h4>
                  <div className="space-y-2">
                    {actionItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => toggleActionItemStatus(item.id, item.status)}
                        disabled={meeting?.status === "completed"}
                        className={`w-full text-left min-h-[44px] px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed ${
                          item.status === "completed"
                            ? "bg-green-500/10 text-green-400 line-through"
                            : "bg-secondary/30 hover:bg-secondary/50"
                        }`}
                      >
                        <span
                          className={`h-4 w-4 rounded border ${
                            item.status === "completed"
                              ? "bg-green-500 border-green-500"
                              : "border-muted-foreground"
                          }`}
                        />
                        {item.title}
                      </button>
                    ))}
                    {actionItems.length === 0 && (
                      <p className="text-sm text-muted-foreground px-3">
                        No action items yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                {activeAgendaId
                  ? agendaItems.find((a) => a.id === activeAgendaId)?.title
                  : "General Notes"}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addNoteBlock("decision")}
                  disabled={meeting?.status === "completed"}
                >
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Decision
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addNoteBlock("action_item")}
                  disabled={meeting?.status === "completed"}
                >
                  <svg
                    className="h-4 w-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Action Item
                </Button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {activeNotes.map((note) => (
                <NoteBlockItem
                  key={note.id}
                  note={note}
                  onUpdate={updateNoteBlock}
                  onDelete={deleteNoteBlock}
                  readOnly={meeting?.status === "completed"}
                />
              ))}
              {activeNotes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Start taking notes...
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Type a note..."
                disabled={meeting?.status === "completed"}
                className="flex-1 min-h-20 rounded-xl border border-border bg-secondary/30 px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none disabled:opacity-50"
              />
              <div className="flex flex-col gap-2">
                <Button
                  variant="primary"
                  onClick={() => addNoteBlock("text")}
                  disabled={!newNoteContent.trim() || meeting?.status === "completed"}
                >
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NoteBlockItem({
  note,
  onUpdate,
  onDelete,
  readOnly = false,
}: {
  note: NoteBlock;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(note.content);

  const handleSave = () => {
    onUpdate(note.id, content);
    setIsEditing(false);
  };

  const getBlockTypeStyles = () => {
    switch (note.block_type) {
      case "decision":
        return "border-l-4 border-l-primary bg-primary/5";
      case "action_item":
        return "border-l-4 border-l-yellow-500 bg-yellow-500/5";
      default:
        return "";
    }
  };

  return (
    <div
      className={`p-3 rounded-lg bg-secondary/20 transition-all ${getBlockTypeStyles()}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {note.block_type === "decision" && (
            <Badge variant="default" className="mb-2">
              Decision
            </Badge>
          )}
          {note.block_type === "action_item" && (
            <Badge variant="warning" className="mb-2">
              Action Item
            </Badge>
          )}
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-16 rounded-lg border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              autoFocus
            />
          ) : (
            <p className="text-sm whitespace-pre-wrap">{note.content}</p>
          )}
        </div>
        <div className="flex gap-1">
          {isEditing ? (
            <>
              <Button size="sm" variant="ghost" onClick={handleSave}>
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setContent(note.content);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                disabled={readOnly}
              >
                Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDelete(note.id)} disabled={readOnly}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
