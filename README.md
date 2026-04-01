# MeetHUD

MeetHUD is a Next.js 15 App Router shell for a meeting operating system. The current implementation focuses on the React product surface: onboarding, an authenticated shell, meeting list filtering, meeting creation, and a live workspace for agenda notes, decisions, and action items.

## Stack

- Next.js 15.5.14
- React 19
- Tailwind CSS 4
- App Router with Server Components and Suspense

## Product Routes

- `/onboarding` for initial workspace setup
- `/meetings` for the room list and watchlist
- `/meetings/new` for meeting composition
- `/meetings/[meetingId]` for the live workspace

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run build
```

## Notes

- The current data layer is intentionally mocked and centralized in `src/lib/meethud.ts`.
- Mobile and installed-PWA constraints are handled in the shell and layout primitives with safe-area-aware spacing and `viewport-fit=cover`.
