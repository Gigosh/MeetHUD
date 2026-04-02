# MeetHUD MVP Executable QA Scenarios

## Purpose

This document converts the critical-path matrix from [FULA-36](/FULA/issues/FULA-36) into runnable test scenarios for MeetHUD MVP. It is written for manual execution first, but the scenario IDs are stable enough to map into Playwright or other automation later.

## Dependencies And Exit Rules

- Use the preview or staging environment defined by [FULA-34](/FULA/issues/FULA-34). Do not execute from a local-only developer build for sign-off evidence.
- Treat auth, realtime, or access-control drift as release blocking if any scenario below fails in a way that exposes another team's data, loses notes, duplicates note blocks, or allows edits after meeting lock.
- Validate implementation against the currently scoped behavior from [FULA-28](/FULA/issues/FULA-28), the frontend shell in [FULA-29](/FULA/issues/FULA-29), the backend contract in [FULA-30](/FULA/issues/FULA-30), and the isolation expectations in [FULA-35](/FULA/issues/FULA-35).

## Test Data And Roles

- `owner-a`: Team owner using Browser A primary profile.
- `member-b`: Invited teammate using Browser B separate profile.
- `outsider-c`: Authenticated user in a different team.
- `project-alpha`: Existing project tag or project option used for action items.
- `meeting-alpha`: New meeting created during the run.
- `decision-text`: "Ship action-item export in MVP."
- `action-item-text`: "Prepare rollout checklist."
- Browser A: Chrome stable desktop, 1440x900.
- Browser B: Firefox stable desktop, 1440x900.
- Mobile Safari viewport: 390x844.
- Mobile Chrome viewport: 412x915.

## Critical Path Scenarios

### AUTH-01 Team owner onboarding and workspace entry

Preconditions:
- `owner-a` does not have an active MeetHUD session.
- Preview or staging email delivery is working for magic links.

Steps:
1. Open the product landing or auth entry page.
2. Request a magic link for `owner-a`.
3. Complete the link flow.
4. Create a new team if the product requires first-run team setup.
5. Land on the default team workspace or meeting list page.
6. Refresh the browser tab.

Expected results:
- `owner-a` is authenticated without manual token handling.
- Team context is visible and stable after redirect.
- Refresh preserves the authenticated session.
- No redirect loop or blank state appears.

Release impact:
- Blocking if login fails, team context is wrong, or refresh loses the session.

### AUTH-02 Invite acceptance lands the user in the correct team

Preconditions:
- `owner-a` completed `AUTH-01`.
- An invite flow exists for adding `member-b` to `owner-a`'s team.

Steps:
1. From `owner-a`, send an invite to `member-b`.
2. In Browser B, open the invite.
3. Complete magic link or invite acceptance.
4. Land in the product after acceptance.
5. Open the team switcher or workspace header if one exists.

Expected results:
- `member-b` joins the same team as `owner-a`.
- The first landing route is inside the invited team context.
- No other team is shown as active by default.

Release impact:
- Blocking if acceptance lands in the wrong workspace or creates a detached account with no team membership.

### AUTH-03 Non-member cannot access another team's meeting

Preconditions:
- `meeting-alpha` exists for `owner-a`'s team.
- `outsider-c` belongs to a different team and is logged in.

Steps:
1. Copy the direct URL for `meeting-alpha`.
2. Open the URL as `outsider-c`.
3. Try again after a hard refresh.
4. If the product exposes realtime channels before page render, leave the page open for 30 seconds.

Expected results:
- `outsider-c` cannot view meeting content.
- The product returns a denial state, redirect, or not-found response without leaking title, notes, decisions, or action items.
- No late-arriving realtime data appears after the initial denial.

Release impact:
- Immediate release blocker if any meeting content is exposed cross-team.

### MEET-01 Create a meeting with agenda items

Preconditions:
- `owner-a` is logged in and on the meeting list or team dashboard.

Steps:
1. Start meeting creation.
2. Enter a meeting title and optional details.
3. Add at least two agenda items.
4. Save the meeting.
5. Return to the meeting list or history view.
6. Re-open `meeting-alpha`.

Expected results:
- The meeting is created successfully.
- Agenda items persist and render in the meeting workspace.
- The meeting appears in team history immediately or after documented refresh behavior.

Release impact:
- Blocking if core meeting creation fails or agenda items do not persist.

### MEET-02 Invalid or incomplete meeting creation fails safely

Preconditions:
- `owner-a` is logged in.

Steps:
1. Start meeting creation.
2. Submit with the title blank, or with any other required field omitted.
3. Correct one field but leave another invalid if the UI supports multiple validations.
4. Cancel and reopen creation.

Expected results:
- Validation is shown inline and clearly explains what is missing.
- No partial or ghost meeting is added to history.
- Canceling returns the user to a stable prior view.

Release impact:
- Major if invalid forms create bad records; blocking if malformed meetings enter team history.

### DEC-01 Promote a note block into a decision with context

Preconditions:
- `meeting-alpha` exists and is editable.
- At least one note block contains `decision-text`.

Steps:
1. In the meeting workspace, add or locate the note block containing `decision-text`.
2. Trigger the "mark as decision" affordance.
3. Add decision context if the UI requires it.
4. Save or confirm the action.
5. Reload the page.

Expected results:
- The note block is promoted into a decision record without losing the original meeting context.
- Decision metadata remains linked to `meeting-alpha`.
- The decision remains visible after reload.

Release impact:
- Blocking if decisions cannot be captured or disappear after reload.

### DEC-02 Decision output survives meeting lock

Preconditions:
- `DEC-01` passed for `meeting-alpha`.

Steps:
1. Lock or end the meeting using the product's summary flow.
2. Open the post-meeting summary.
3. Find the decision created in `DEC-01`.
4. Refresh the summary route.

Expected results:
- The decision appears in the locked summary state.
- The decision remains linked to the same meeting history item.
- Refresh does not drop the decision or reopen editable state.

Release impact:
- Blocking if decision output is lost during summary generation or lock transition.

### ACT-01 Create an action item with assignee and project tag

Preconditions:
- `member-b` exists in the same team.
- `project-alpha` is available in the action item UI if project tagging is enabled.

Steps:
1. In `meeting-alpha`, create an action item from meeting context.
2. Enter `action-item-text`.
3. Assign the item to `member-b`.
4. Link it to `project-alpha`.
5. Save the action item.
6. Open the post-meeting summary or action item view.

Expected results:
- The action item is stored as a first-class record under `meeting-alpha`.
- Assignee and project tag are shown consistently in live and summary views.
- The saved item survives reload.

Release impact:
- Blocking if assignee or persistence fails; major if project tagging is silently dropped.

### ACT-02 Invalid action item states are handled clearly

Preconditions:
- `meeting-alpha` is editable.

Steps:
1. Attempt to create an action item with no assignee if assignee is required.
2. Attempt to save with an invalid or removed project tag if project tagging is enabled.
3. Try to submit an empty action item body.

Expected results:
- Validation clearly explains the problem.
- No broken action item is saved.
- The meeting notes area remains stable after validation errors.

Release impact:
- Major if bad action-item records are created; blocking if invalid state corrupts the meeting view.

### LOCK-01 Locking a meeting makes the notes read-only

Preconditions:
- `meeting-alpha` contains notes, at least one decision, and at least one action item.

Steps:
1. Complete the lock or end-meeting flow.
2. Attempt to edit an existing note block.
3. Attempt to add a new note block.
4. Attempt to modify an existing decision or action item from the locked view if the product exposes those controls.

Expected results:
- Note editing is blocked after lock.
- Add or edit controls are hidden or disabled with clear state communication.
- Decisions and action items remain visible as output, not editable meeting notes.

Release impact:
- Blocking if users can silently edit locked meeting notes.

### LOCK-02 Historical meeting view remains stable after lock

Preconditions:
- `LOCK-01` passed.

Steps:
1. Leave the meeting route.
2. Return to team history.
3. Re-open the locked meeting.
4. Compare title, agenda, decisions, and action items against the pre-lock state.

Expected results:
- Historical view opens reliably from meeting history.
- Locked meeting content matches the final saved state.
- No editable controls reappear during normal history browsing.

Release impact:
- Blocking if locked history reopens in editable mode or loses final content.

### SEARCH-01 Search returns relevant locked meeting data

Preconditions:
- `meeting-alpha` is locked.
- The meeting contains unique searchable text in title, decision, or action item.

Steps:
1. Open global or meeting-history search.
2. Search for the unique meeting title fragment.
3. Search for `decision-text`.
4. Search for `action-item-text`.

Expected results:
- Search returns `meeting-alpha` or its associated decision/action-item records.
- Results open the expected meeting or summary route.
- Search does not require manual index repair or unexplained delay beyond documented expectations.

Release impact:
- Blocking if locked meetings cannot be found at all; major if only one record type is missing.

### SEARCH-02 Search respects team boundaries and handles no-result states

Preconditions:
- `owner-a` and `outsider-c` belong to different teams.

Steps:
1. As `owner-a`, search for a unique record from `meeting-alpha`.
2. As `outsider-c`, search for the same text.
3. Search for a random string with no matches in both accounts.

Expected results:
- `owner-a` sees only their own team's results.
- `outsider-c` does not see `meeting-alpha`, its decisions, or its action items.
- No-result handling is explicit and does not imply a broken search service.

Release impact:
- Immediate release blocker if search leaks records across teams.

## Realtime Validation Runbook

### RT-01 Cross-session concurrent editing

Preconditions:
- `owner-a` is in Browser A and `member-b` is in Browser B.
- Both users open the same editable `meeting-alpha`.

Steps:
1. In Browser A, create a new note block under the first agenda item.
2. Confirm Browser B receives the new block without page refresh.
3. In Browser B, edit that new block by appending "update from member-b".
4. Confirm Browser A receives the appended text.
5. In Browser A, create a second block under a different agenda item.
6. Confirm Browser B renders the second block in the correct section.

Expected results:
- New blocks and block updates appear in the peer session within the expected interaction window.
- Blocks render in the correct agenda section and order.
- Presence or editing cues, if shown, map to the correct user.

Release impact:
- Blocking if updates do not propagate, arrive in the wrong order, or appear as the wrong user.

### RT-02 Same-session multi-tab behavior

Preconditions:
- `owner-a` is logged in.

Steps:
1. Open `meeting-alpha` in two tabs of Browser A.
2. In Tab 1, edit a block by appending "tab-one".
3. In Tab 2, verify the same block updates without refresh.
4. In Tab 2, append "tab-two" to an adjacent line or adjacent block.
5. Confirm Tab 1 receives the second update.

Expected results:
- Same account state remains consistent across tabs.
- No duplicate blocks or stale overwrite occurs.
- Editing indicators do not attribute the action to another user.

Release impact:
- Blocking if same-session edits create divergence or duplicate content.

### RT-03 Same-block collision handling

Preconditions:
- Browser A and Browser B are connected to the same editable meeting.
- A shared note block exists.

Steps:
1. Coordinate both users to edit the same block within five seconds.
2. Have Browser A prepend "A:" to the block.
3. Have Browser B append "B:" to the block nearly simultaneously.
4. Wait for sync to settle.
5. Reload both sessions.

Expected results:
- The product resolves the collision in a deterministic way.
- Reload shows the same final content in both sessions.
- No phantom duplicate block appears.

Release impact:
- Blocking if collision handling causes data loss, divergent final state, or block duplication.

### RT-04 Reconnect and refresh during an active meeting

Preconditions:
- Browser A and Browser B are both editing `meeting-alpha`.

Steps:
1. In Browser B, disconnect the network for 30 seconds.
2. While Browser B is offline, add a new block from Browser A.
3. Reconnect Browser B.
4. Verify Browser B receives the missed block.
5. Refresh Browser B during the active meeting.
6. Confirm the refreshed page restores the current meeting state and can continue editing.

Expected results:
- Reconnect replays missing changes without corrupting nearby blocks.
- Refresh during active collaboration does not drop the user from the meeting permanently.
- Both sessions show the same persisted state after reconnect.

Release impact:
- Blocking if reconnect loses data, duplicates blocks, or strands one participant outside the active meeting.

### RT-05 Authorization and subscription isolation

Preconditions:
- `outsider-c` is logged in on Browser C or an incognito session.

Steps:
1. Attempt to open the direct route for `meeting-alpha` as `outsider-c`.
2. Leave the denied page open for 30 seconds while Browser A continues editing.
3. Refresh the denied page.

Expected results:
- `outsider-c` never receives meeting content or realtime updates.
- Unauthorized sessions cannot infer participant presence, agenda names, or note text.

Release impact:
- Immediate release blocker if unauthorized subscription or content leakage occurs.

## Mobile Smoke Coverage

### MOB-01 iPhone-width meeting lifecycle smoke

Environment:
- Safari responsive viewport 390x844 or equivalent device emulation.

Steps:
1. Complete login or resume an existing session.
2. Open the meeting list.
3. Create or open `meeting-alpha`.
4. Add one note block.
5. Mark one note as a decision.
6. Open the post-meeting summary.

Expected results:
- No horizontal overflow blocks the main flow.
- Keyboard open, focus, and scroll remain usable while editing.
- Primary actions remain reachable without desktop-only hover behavior.

Release impact:
- Blocking if the core meeting flow cannot be completed on an iPhone-width viewport.

### MOB-02 Android-width collaboration and summary smoke

Environment:
- Chrome responsive viewport 412x915 or equivalent device emulation.

Steps:
1. Sign in as `member-b`.
2. Open `meeting-alpha`.
3. Add or edit one note block.
4. Create one action item.
5. Lock or review the post-meeting summary if available.

Expected results:
- Input controls remain visible and tappable.
- The meeting workspace scrolls cleanly without trapping the user.
- Summary output is readable without clipping or overlapping controls.

Release impact:
- Blocking if Android-width users cannot read or complete core meeting actions.

## PWA Smoke Coverage

### PWA-01 Installability metadata and launch behavior

Preconditions:
- The build includes PWA support from the MVP scope.

Steps:
1. Open the app in a supported mobile browser.
2. Inspect install eligibility or use the browser install prompt.
3. Install the app to the home screen.
4. Launch the installed app.

Expected results:
- App exposes a valid name, icon, and start route.
- Installed launch opens inside the product shell instead of a broken browser tab fallback.
- Authenticated users land in a stable route after launch.

Release impact:
- Major if install metadata is missing; blocking if installed launch is broken or routes to an unusable page.

### PWA-02 Resume from background and rejoin active meeting

Preconditions:
- `owner-a` is editing `meeting-alpha` in the installed app.

Steps:
1. Add a note block in the installed app.
2. Send the app to the background for at least 30 seconds.
3. While the app is backgrounded, update the same meeting from Browser B.
4. Restore the installed app.
5. Verify the latest meeting state and continue editing.

Expected results:
- The installed app resumes without dropping the session unexpectedly.
- Realtime state catches up after restore.
- Unsaved visible work is not lost during background and resume.

Release impact:
- Blocking if background/restore breaks active meeting recovery or loses visible user work.

## Execution Notes For QA Lead

- Execute the critical path in the listed order so later search and lock scenarios inherit realistic meeting data.
- Collect screenshots or short recordings for every blocking-path failure, especially `AUTH-03`, `RT-03`, `RT-04`, `RT-05`, `LOCK-01`, and `SEARCH-02`.
- If project tagging for action items is not implemented yet, mark `ACT-01` and `ACT-02` as blocked by [FULA-29](/FULA/issues/FULA-29) rather than rewriting the scenario.

## Open Contract Questions

- Project-tag behavior for action items is referenced in scope but the allowed project source and required validation states are not yet specified in [FULA-29](/FULA/issues/FULA-29).
- Search freshness expectations are not explicitly quantified; the execution team should record the observed indexing delay if results are eventually consistent.
- Meeting lock ownership and whether privileged users can edit post-lock are not specified; execute the scenarios against the default assumption that MVP lock means read-only for normal team members.
