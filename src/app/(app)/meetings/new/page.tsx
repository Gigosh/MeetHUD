"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewMeetingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [agendaItems, setAgendaItems] = useState<string[]>([""]);

  const addAgendaItem = () => {
    setAgendaItems([...agendaItems, ""]);
  };

  const removeAgendaItem = (index: number) => {
    setAgendaItems(agendaItems.filter((_, i) => i !== index));
  };

  const updateAgendaItem = (index: number, value: string) => {
    const newItems = [...agendaItems];
    newItems[index] = value;
    setAgendaItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // Look up the user's team membership to get team_id
    const { data: membership } = await supabase
      .from("team_memberships")
      .select("team_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      alert("You must belong to a team to create a meeting.");
      setIsLoading(false);
      return;
    }

    const { data: meeting, error: meetingError } = await supabase
      .from("meetings")
      .insert({
        title,
        description,
        scheduled_at: scheduledAt || new Date().toISOString(),
        status: "scheduled",
        created_by: user.id,
        team_id: membership.team_id,
      })
      .select()
      .single();

    if (meetingError) {
      alert(meetingError.message);
      setIsLoading(false);
      return;
    }

    // Add creator as meeting participant
    await supabase.from("meeting_participants").insert({
      meeting_id: meeting.id,
      user_id: user.id,
      role: "organizer",
    });

    const validAgendaItems = agendaItems.filter((item) => item.trim() !== "");
    if (validAgendaItems.length > 0) {
      await supabase.from("agenda_items").insert(
        validAgendaItems.map((item, index) => ({
          meeting_id: meeting.id,
          title: item,
          order: index + 1,
        }))
      );
    }

    router.push(`/meetings/${meeting.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto animate-slide-in-bottom">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create a Meeting</h1>
        <p className="text-muted-foreground">
          Set up your meeting workspace
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Meeting Details</CardTitle>
            <CardDescription>
              Basic information about your meeting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                placeholder="Sprint Planning"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                placeholder="What will this meeting cover?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-24 w-full rounded-xl border border-border bg-secondary/30 px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="scheduledAt" className="text-sm font-medium">
                Date & Time
              </label>
              <Input
                id="scheduledAt"
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agenda</CardTitle>
            <CardDescription>
              Add topics to discuss (optional)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {agendaItems.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Agenda item ${index + 1}`}
                  value={item}
                  onChange={(e) => updateAgendaItem(index, e.target.value)}
                  className="flex-1"
                />
                {agendaItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAgendaItem(index)}
                  >
                    <svg
                      className="h-4 w-4"
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
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addAgendaItem}
              className="mt-2"
            >
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Agenda Item
            </Button>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !title.trim()}>
            {isLoading ? "Creating..." : "Create Meeting"}
          </Button>
        </div>
      </form>
    </div>
  );
}
