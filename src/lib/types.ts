export type MeetingStatus = "scheduled" | "live" | "completed" | "cancelled";

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  status: MeetingStatus;
  scheduled_at: string;
  ended_at?: string;
  team_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AgendaItem {
  id: string;
  meeting_id: string;
  title: string;
  description?: string;
  order: number;
  duration_minutes?: number;
  created_at: string;
}

export interface NoteBlock {
  id: string;
  meeting_id: string;
  agenda_item_id?: string;
  content: string;
  block_type: "text" | "decision" | "action_item";
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Decision {
  id: string;
  meeting_id: string;
  note_block_id?: string;
  title: string;
  description?: string;
  decided_by?: string;
  created_at: string;
}

export interface ActionItem {
  id: string;
  meeting_id: string;
  note_block_id?: string;
  title: string;
  description?: string;
  assignee_id?: string;
  due_date?: string;
  status: "pending" | "in_progress" | "completed";
  project_id?: string;
  created_by: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  created_at: string;
}

export interface TeamMembership {
  id: string;
  team_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  created_at: string;
}

export interface MeetingParticipant {
  id: string;
  meeting_id: string;
  user_id: string;
  role: "organizer" | "participant";
  joined_at: string;
}
