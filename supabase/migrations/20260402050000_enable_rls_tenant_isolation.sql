-- Supabase RLS Migration: Enable Row Level Security for all tenant-scoped tables
-- Parent issue: FULA-52 / FULA-53
-- Purpose: Enforce tenant isolation via default-deny + explicit same-team allow policies

-- =============================================================================
-- TEAMS
-- =============================================================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Default deny: no access unless policy explicitly allows
DROP POLICY IF EXISTS "teams_default_deny" ON teams;
CREATE POLICY "teams_default_deny" ON teams
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Allow team members to read their own team
DROP POLICY IF EXISTS "teams_members_read" ON teams;
CREATE POLICY "teams_members_read" ON teams
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_memberships
      WHERE team_memberships.team_id = teams.id
      AND team_memberships.user_id = auth.uid()
    )
  );

-- Allow users to create teams (they become owner via trigger/application logic)
DROP POLICY IF EXISTS "teams_insert" ON teams;
CREATE POLICY "teams_insert" ON teams
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- =============================================================================
-- TEAM_MEMBERSHIPS
-- =============================================================================

ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;

-- Default deny
DROP POLICY IF EXISTS "team_memberships_default_deny" ON team_memberships;
CREATE POLICY "team_memberships_default_deny" ON team_memberships
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Allow members to read their own memberships
DROP POLICY IF EXISTS "team_memberships_members_read" ON team_memberships;
CREATE POLICY "team_memberships_members_read" ON team_memberships
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM team_memberships AS my_membership
      WHERE my_membership.team_id = team_memberships.team_id
      AND my_membership.user_id = auth.uid()
    )
  );

-- Allow users to insert their own memberships
DROP POLICY IF EXISTS "team_memberships_insert_own" ON team_memberships;
CREATE POLICY "team_memberships_insert_own" ON team_memberships
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow members to update memberships within their team
DROP POLICY IF EXISTS "team_memberships_members_update" ON team_memberships;
CREATE POLICY "team_memberships_members_update" ON team_memberships
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM team_memberships AS my_membership
      WHERE my_membership.team_id = team_memberships.team_id
      AND my_membership.user_id = auth.uid()
    )
  );

-- =============================================================================
-- MEETINGS
-- =============================================================================

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Default deny
DROP POLICY IF EXISTS "meetings_default_deny" ON meetings;
CREATE POLICY "meetings_default_deny" ON meetings
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Allow team members to read meetings in their team (via direct team_id or meeting_participants)
DROP POLICY IF EXISTS "meetings_members_read" ON meetings;
CREATE POLICY "meetings_members_read" ON meetings
  FOR SELECT
  USING (
    -- Direct team membership
    EXISTS (
      SELECT 1 FROM team_memberships
      WHERE team_memberships.team_id = meetings.team_id
      AND team_memberships.user_id = auth.uid()
    )
    -- OR via meeting_participants
    OR EXISTS (
      SELECT 1 FROM meeting_participants
      WHERE meeting_participants.meeting_id = meetings.id
      AND meeting_participants.user_id = auth.uid()
    )
  );

-- Allow team members to insert meetings in their team
DROP POLICY IF EXISTS "meetings_members_insert" ON meetings;
CREATE POLICY "meetings_members_insert" ON meetings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_memberships
      WHERE team_memberships.team_id = meetings.team_id
      AND team_memberships.user_id = auth.uid()
    )
  );

-- Allow team members to update meetings in their team (unless locked/completed)
DROP POLICY IF EXISTS "meetings_members_update" ON meetings;
CREATE POLICY "meetings_members_update" ON meetings
  FOR UPDATE
  USING (
    -- Must be team member
    EXISTS (
      SELECT 1 FROM team_memberships
      WHERE team_memberships.team_id = meetings.team_id
      AND team_memberships.user_id = auth.uid()
    )
    -- Cannot modify completed meetings
    AND meetings.status != 'completed'
  );

-- Allow team members to delete meetings in their team (unless locked/completed)
DROP POLICY IF EXISTS "meetings_members_delete" ON meetings;
CREATE POLICY "meetings_members_delete" ON meetings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM team_memberships
      WHERE team_memberships.team_id = meetings.team_id
      AND team_memberships.user_id = auth.uid()
    )
    AND meetings.status != 'completed'
  );

-- =============================================================================
-- MEETING_PARTICIPANTS
-- =============================================================================

ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;

-- Default deny
DROP POLICY IF EXISTS "meeting_participants_default_deny" ON meeting_participants;
CREATE POLICY "meeting_participants_default_deny" ON meeting_participants
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Allow team members to read participants in their team's meetings
DROP POLICY IF EXISTS "meeting_participants_members_read" ON meeting_participants;
CREATE POLICY "meeting_participants_members_read" ON meeting_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_participants.meeting_id
      AND (
        EXISTS (
          SELECT 1 FROM team_memberships
          WHERE team_memberships.team_id = meetings.team_id
          AND team_memberships.user_id = auth.uid()
        )
        OR meeting_participants.user_id = auth.uid()
      )
    )
  );

-- Allow team members to insert participants in their team's meetings
DROP POLICY IF EXISTS "meeting_participants_members_insert" ON meeting_participants;
CREATE POLICY "meeting_participants_members_insert" ON meeting_participants
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_participants.meeting_id
      AND EXISTS (
        SELECT 1 FROM team_memberships
        WHERE team_memberships.team_id = meetings.team_id
        AND team_memberships.user_id = auth.uid()
      )
      AND meetings.status != 'completed'
    )
  );

-- Allow team members to delete participants in their team's meetings
DROP POLICY IF EXISTS "meeting_participants_members_delete" ON meeting_participants;
CREATE POLICY "meeting_participants_members_delete" ON meeting_participants
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = meeting_participants.meeting_id
      AND EXISTS (
        SELECT 1 FROM team_memberships
        WHERE team_memberships.team_id = meetings.team_id
        AND team_memberships.user_id = auth.uid()
      )
      AND meetings.status != 'completed'
    )
  );

-- =============================================================================
-- AGENDA_ITEMS
-- =============================================================================

ALTER TABLE agenda_items ENABLE ROW LEVEL SECURITY;

-- Default deny
DROP POLICY IF EXISTS "agenda_items_default_deny" ON agenda_items;
CREATE POLICY "agenda_items_default_deny" ON agenda_items
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Allow team members to read agenda items in their team's meetings
DROP POLICY IF EXISTS "agenda_items_members_read" ON agenda_items;
CREATE POLICY "agenda_items_members_read" ON agenda_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = agenda_items.meeting_id
      AND EXISTS (
        SELECT 1 FROM team_memberships
        WHERE team_memberships.team_id = meetings.team_id
        AND team_memberships.user_id = auth.uid()
      )
    )
  );

-- Allow team members to insert agenda items in their team's meetings
DROP POLICY IF EXISTS "agenda_items_members_insert" ON agenda_items;
CREATE POLICY "agenda_items_members_insert" ON agenda_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = agenda_items.meeting_id
      AND EXISTS (
        SELECT 1 FROM team_memberships
        WHERE team_memberships.team_id = meetings.team_id
        AND team_memberships.user_id = auth.uid()
      )
      AND meetings.status != 'completed'
    )
  );

-- Allow team members to update agenda items in their team's meetings
DROP POLICY IF EXISTS "agenda_items_members_update" ON agenda_items;
CREATE POLICY "agenda_items_members_update" ON agenda_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = agenda_items.meeting_id
      AND EXISTS (
        SELECT 1 FROM team_memberships
        WHERE team_memberships.team_id = meetings.team_id
        AND team_memberships.user_id = auth.uid()
      )
      AND meetings.status != 'completed'
    )
  );

-- Allow team members to delete agenda items in their team's meetings
DROP POLICY IF EXISTS "agenda_items_members_delete" ON agenda_items;
CREATE POLICY "agenda_items_members_delete" ON agenda_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = agenda_items.meeting_id
      AND EXISTS (
        SELECT 1 FROM team_memberships
        WHERE team_memberships.team_id = meetings.team_id
        AND team_memberships.user_id = auth.uid()
      )
      AND meetings.status != 'completed'
    )
  );

-- =============================================================================
-- NOTE_BLOCKS
-- =============================================================================

ALTER TABLE note_blocks ENABLE ROW LEVEL SECURITY;

-- Default deny
DROP POLICY IF EXISTS "note_blocks_default_deny" ON note_blocks;
CREATE POLICY "note_blocks_default_deny" ON note_blocks
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Allow team members to read note blocks in their team's meetings
DROP POLICY IF EXISTS "note_blocks_members_read" ON note_blocks;
CREATE POLICY "note_blocks_members_read" ON note_blocks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = note_blocks.meeting_id
      AND EXISTS (
        SELECT 1 FROM team_memberships
        WHERE team_memberships.team_id = meetings.team_id
        AND team_memberships.user_id = auth.uid()
      )
    )
  );

-- Allow team members to insert note blocks in their team's meetings
DROP POLICY IF EXISTS "note_blocks_members_insert" ON note_blocks;
CREATE POLICY "note_blocks_members_insert" ON note_blocks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = note_blocks.meeting_id
      AND EXISTS (
        SELECT 1 FROM team_memberships
        WHERE team_memberships.team_id = meetings.team_id
        AND team_memberships.user_id = auth.uid()
      )
      AND meetings.status != 'completed'
    )
  );

-- Allow team members to update note blocks in their team's meetings
DROP POLICY IF EXISTS "note_blocks_members_update" ON note_blocks;
CREATE POLICY "note_blocks_members_update" ON note_blocks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = note_blocks.meeting_id
      AND EXISTS (
        SELECT 1 FROM team_memberships
        WHERE team_memberships.team_id = meetings.team_id
        AND team_memberships.user_id = auth.uid()
      )
      AND meetings.status != 'completed'
    )
  );

-- Allow team members to delete note blocks in their team's meetings
DROP POLICY IF EXISTS "note_blocks_members_delete" ON note_blocks;
CREATE POLICY "note_blocks_members_delete" ON note_blocks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = note_blocks.meeting_id
      AND EXISTS (
        SELECT 1 FROM team_memberships
        WHERE team_memberships.team_id = meetings.team_id
        AND team_memberships.user_id = auth.uid()
      )
      AND meetings.status != 'completed'
    )
  );

-- =============================================================================
-- DECISIONS
-- =============================================================================

ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;

-- Default deny
DROP POLICY IF EXISTS "decisions_default_deny" ON decisions;
CREATE POLICY "decisions_default_deny" ON decisions
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Allow team members to read decisions in their team's meetings
DROP POLICY IF EXISTS "decisions_members_read" ON decisions;
CREATE POLICY "decisions_members_read" ON decisions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = decisions.meeting_id
      AND EXISTS (
        SELECT 1 FROM team_memberships
        WHERE team_memberships.team_id = meetings.team_id
        AND team_memberships.user_id = auth.uid()
      )
    )
  );

-- Allow team members to insert decisions in their team's meetings
DROP POLICY IF EXISTS "decisions_members_insert" ON decisions;
CREATE POLICY "decisions_members_insert" ON decisions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = decisions.meeting_id
      AND EXISTS (
        SELECT 1 FROM team_memberships
        WHERE team_memberships.team_id = meetings.team_id
        AND team_memberships.user_id = auth.uid()
      )
      AND meetings.status != 'completed'
    )
  );

-- Allow team members to update decisions in their team's meetings
DROP POLICY IF EXISTS "decisions_members_update" ON decisions;
CREATE POLICY "decisions_members_update" ON decisions
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = decisions.meeting_id
      AND EXISTS (
        SELECT 1 FROM team_memberships
        WHERE team_memberships.team_id = meetings.team_id
        AND team_memberships.user_id = auth.uid()
      )
      AND meetings.status != 'completed'
    )
  );

-- Allow team members to delete decisions in their team's meetings
DROP POLICY IF EXISTS "decisions_members_delete" ON decisions;
CREATE POLICY "decisions_members_delete" ON decisions
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = decisions.meeting_id
      AND EXISTS (
        SELECT 1 FROM team_memberships
        WHERE team_memberships.team_id = meetings.team_id
        AND team_memberships.user_id = auth.uid()
      )
      AND meetings.status != 'completed'
    )
  );

-- =============================================================================
-- ACTION_ITEMS
-- =============================================================================

ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;

-- Default deny
DROP POLICY IF EXISTS "action_items_default_deny" ON action_items;
CREATE POLICY "action_items_default_deny" ON action_items
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Allow team members to read action items in their team's meetings
DROP POLICY IF EXISTS "action_items_members_read" ON action_items;
CREATE POLICY "action_items_members_read" ON action_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = action_items.meeting_id
      AND EXISTS (
        SELECT 1 FROM team_memberships
        WHERE team_memberships.team_id = meetings.team_id
        AND team_memberships.user_id = auth.uid()
      )
    )
  );

-- Allow team members to insert action items in their team's meetings
DROP POLICY IF EXISTS "action_items_members_insert" ON action_items;
CREATE POLICY "action_items_members_insert" ON action_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = action_items.meeting_id
      AND EXISTS (
        SELECT 1 FROM team_memberships
        WHERE team_memberships.team_id = meetings.team_id
        AND team_memberships.user_id = auth.uid()
      )
      AND meetings.status != 'completed'
    )
  );

-- Allow team members to update action items in their team's meetings
DROP POLICY IF EXISTS "action_items_members_update" ON action_items;
CREATE POLICY "action_items_members_update" ON action_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = action_items.meeting_id
      AND EXISTS (
        SELECT 1 FROM team_memberships
        WHERE team_memberships.team_id = meetings.team_id
        AND team_memberships.user_id = auth.uid()
      )
      AND meetings.status != 'completed'
    )
  );

-- Allow team members to delete action items in their team's meetings
DROP POLICY IF EXISTS "action_items_members_delete" ON action_items;
CREATE POLICY "action_items_members_delete" ON action_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM meetings
      WHERE meetings.id = action_items.meeting_id
      AND EXISTS (
        SELECT 1 FROM team_memberships
        WHERE team_memberships.team_id = meetings.team_id
        AND team_memberships.user_id = auth.uid()
      )
      AND meetings.status != 'completed'
    )
  );
