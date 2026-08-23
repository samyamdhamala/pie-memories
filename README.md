# Pie — Memories (concept build)

A small full-stack prototype modeling Pie's core RSVP flow, plus a proposed new feature: **Memories**.

## The pitch

Right now, if you RSVP'd "interested" to a Pie plan but couldn't make it, the plan just disappears once it's over — you never see what you missed. **Memories** fixes that: it's a past-plans-only feature (separate from the existing plan chat, which is for coordinating *before* and *during*). Once a plan has happened, anyone who RSVP'd — whether they attended in person or not — can post photos and videos from it. Those posts collect into an Instagram-Highlights-style reel: tap a face, watch a 10-second-per-post story that auto-advances, visible to everyone who RSVP'd — so even people who didn't show up get a glimpse of what the plan was like, and might be more likely to come next time.

Hosts stay in control:
- **On/off** — a host can turn Memories off for their plan entirely.
- **Window** — a host chooses how long memories stay visible after the plan ends: **24 hours, 2 days, 3 days, or 7 days**. Once the window closes, the memories are hidden for everyone (they're not deleted from a real backend — just gone from view, like the rest of Pie's ephemeral content).

This isn't a UI reskin — it's an actual client/server app with real eligibility rules enforced on the backend (not just hidden in the UI), and unit tests covering the interesting edge cases.

## Feature rules (enforced server-side, see `server/src/memories.ts`)

- **Posting** requires: you RSVP'd (going *or* interested — the intent is that RSVPing is what grants access, not physical attendance), the plan has actually *happened* (`now >= event.endTime` — no posting during the event, that's what chat is for), the host has Memories on, and the window hasn't closed yet.
- **Viewing** requires: you RSVP'd to the plan, or you're the host. Everyone else is blocked, even after the window opens.
- **Expiry** is computed as `event.endTime + windowHours`, checked live on every read — not a background cron job, so it works correctly in this demo without a job runner.

## The viewer

`client/src/components/StoryViewer.tsx` is a full-screen, Instagram/TikTok-style highlights viewer: a segmented progress bar per memory, 10 seconds per photo (auto-advancing), video slides that drive their own progress off actual playback and auto-advance on `ended`, tap-left/right or arrow keys to navigate, click-and-hold to pause, and auto-close once you reach the end. Entry points are circular "highlight" thumbnails (`MemoriesGrid.tsx`) styled after IG story rings, grouped by author — your own bubble is always pinned first, with a `+` badge to post more.

## Moderation: report & remove

Because this is UGC posted about other people, not just by them, there's a lightweight moderation path rather than none at all:

- **Report** — any RSVP'd viewer (other than the author) can flag a memory to the host, from the `⋯` menu inside the story viewer. Reporting doesn't hide the content — it's not a takedown, just a signal.
- **Remove** — the host can remove *any* memory from their own plan; the person who posted it can remove their own, regardless of who's hosting. Reported items get a small red marker on the host's highlight bubble and a "REPORTED" badge inside the viewer, so the host knows to look without anyone else seeing that state.

This is intentionally reactive rather than a full moderation queue: consent is implicit (you can only appear here if you were already RSVP'd into that plan — a closed circle, not a public feed), and the remove path is the escape hatch if that assumption is wrong for a given photo.

## Running it

Two processes, in two terminals. (On Windows PowerShell, run `cd` and `npm` as separate lines — PowerShell doesn't support `&&` as a statement separator.)

```bash
cd server
npm install
npm run dev      # API on http://localhost:4000
```

```bash
cd client
npm install
npm run dev       # UI on http://localhost:5173 (proxies /api to the server)
```

Open http://localhost:5173. Use the "Viewing as" avatar switcher in the header to jump between four seeded demo users and see how RSVP status changes what you can see and do. Seed data (`server/src/data/seed.ts`) includes:

- **Rooftop Sunset Mixer** — already past its 24h Memories window, so it demonstrates expiry (memories exist but are hidden).
- **Lakefront Volleyball Tournament** — ended recently, 7-day window still open, has an existing memory and accepts new ones.
- **Board Game Night** — hasn't happened yet, so RSVP works but Memories doesn't show at all until it's past.
- **Sunday Farmers Market Crawl** — ended ~40h ago on a 72h window, with three memories (two photos, one video) — the best one to try the highlights viewer on.

## Tests

```bash
cd server
npm test
```

19 unit tests cover the eligibility/expiry logic in `memories.ts` — the part of this feature most likely to have a subtle off-by-one or a gating bug in a real implementation.

## What's stubbed for the demo

- **Auth** — a user switcher stands in for real login.
- **Media upload** — posting a "photo" picks from a few sample image URLs rather than uploading a real file to blob storage; the API and data model treat `mediaUrl` as opaque, so swapping in real uploads (S3/Cloudinary presigned URLs, etc.) wouldn't change anything else.
- **Persistence** — data lives in memory and resets on server restart. The store is behind a small repository class (`server/src/store.ts`) so swapping in a real database is a contained change.
