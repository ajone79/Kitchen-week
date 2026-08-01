# Kitchen Week — shared database setup (Netlify)

This turns the tablet app from "saved on this device only" into a shared
database every tablet in the kitchen reads and writes to.

## What's in this folder
- `public/index.html` — the app itself (open this on each tablet once deployed)
- `netlify/functions/data.js` — a small serverless function that reads and
  writes data to Netlify Blobs (Netlify's built-in database)
- `netlify.toml`, `package.json` — configuration Netlify needs

## Deploy it (about 5 minutes, no coding required)

1. Go to **app.netlify.com** and log in (or create a free account).
2. Click **Add new site → Deploy manually**, then drag this whole folder
   (`netlify-site`) onto the page.
   - If you'd rather connect it to GitHub for easier future updates, that
     works too — push this folder to a repo and "Import an existing project"
     instead.
3. Netlify will give the site a random address like
   `https://random-name-123.netlify.app`. You can rename it under
   **Site settings → Change site name**, or add your own domain later.
4. That's it — Netlify Blobs works automatically, no extra setup needed.

## Open it on each tablet
Go to the site address Netlify gave you (e.g. `https://your-site.netlify.app`)
and add it to the home screen like before. Every tablet pointed at the same
site address now shares the same data.

## Optional: lock it with a password
Anyone who finds your site's web address could otherwise read or overwrite
the kitchen's data through the API. To stop that:

1. In Netlify: **Site settings → Environment variables → Add a variable**.
2. Name: `SITE_KEY`. Value: any password you choose, e.g. `sunrise-kitchen-42`.
3. Redeploy the site (Netlify does this automatically after saving the
   variable, or trigger it under **Deploys → Trigger deploy**).
4. On each tablet, open the app → **Master → unlock with a Kitchen
   Manager, General Manager, or Duty Manager PIN →
   Settings → Shared database**, and type in the same password. Do this once
   per tablet.

If you don't set `SITE_KEY`, the shared database still works — it's just
open to anyone who has the site's web address, which is usually fine for an
internal kitchen tool that isn't advertised anywhere.

## Collapsible sections
Each section on a day page (Morning, Prep, Weekly, Defrost, Closedown) has
a **Show/Hide** button in its header. A section collapses to just its
header automatically once everything in it is done (or, for defrost,
once everything that needed pulling has been pulled) — tap the header
button to reopen it, or to collapse an unfinished one early if you want it
out of the way. Your choice sticks for that section until you tap it
again; if it later becomes incomplete and complete again, it goes back to
collapsing itself.

## Printing
The **Print this day** button at the bottom of a day page prints
everything on it. The Prep and Defrost sections also have their own
**Print prep list** / **Print defrost list** button in their header, for
when you just want that one list on paper (e.g. to hand to a prep cook, or
stick by the fridge) without the rest of the day.

## Master admin screen
A jump-nav bar at the top (and repeated at the start of every card) lets you
jump straight to any section — Morning, Defrost, Prep, Weekly, Closedown,
Staff, Duty Managers, Bookings, Settings — without scrolling through the
whole page.

Weekly cleaning and the daily closedown list are edited with one box per
task/field (task, method, detail, note, photo) rather than typing
pipe-separated lines into a big textarea — same style as the Prep and
Defrost tables. Add/remove rows with the buttons next to each list. Weekly
tasks can each have a reference photo too, shown the same way as the
others — tap the <b>i</b> next to the task on the day page.

## Bookings (from a run sheet PDF)
Under **Master → Bookings**, pick the date and upload a run sheet PDF (e.g.
exported from DesignMyNight) — it's stored exactly as uploaded, nothing is
read or parsed out of it. Once saved, a **Show today's bookings** card
appears automatically on that date's day page; tapping it opens a reminder
that it's a snapshot (not live) plus an **Open PDF** link that opens the
original file in a new tab, full screen, with the browser's own PDF viewer
and pinch-to-zoom.

If you paste your live run sheet link into the Bookings section, the popup
also links straight to it. Live pulling isn't possible automatically: run
sheet systems like DesignMyNight require you to be logged in to view them,
and a static site like this one can't fetch another company's admin pages
in the background — so a PDF upload (once a day, or whenever bookings
change materially) is the practical way to get this info onto the tablet.
Saved bookings are cleared automatically after two weeks to keep things
tidy.

## Staff login
Under **Master → Staff**, a manager can add each person's name and a short
PIN. On each tablet, tap **Log in** at the top of the screen, pick your
name, and enter your PIN — you stay logged in on that tablet until someone
taps **Switch user**.

Once logged in, ticking off a cleaning, prep, or closedown job stamps your
name and the time automatically — there's no initials box to fill in
anymore. The same applies to signing off as closing chef, marking the
defrost as completed, adding a handover note, and acknowledging a
handover. If nobody's logged in yet, ticking a box or tapping a sign-off
button will prompt you to log in first.

The **duty manager sign-off** at closedown is kept separate on purpose.
Under **Master → Duty Managers**, add each duty manager's name and their
own PIN. Tapping **Duty manager sign-off** always asks for that PIN there
and then — it doesn't use whoever happens to be logged in on the tablet —
so the sign-off can only be completed by an actual duty manager.

## Manager roles &amp; PINs
Master used to be behind one shared PIN. It's now behind named people at
three tiers:

- **Kitchen Managers** and **General Managers** — full access. Either can
  open and change every part of Master (pars, cleaning lists, staff,
  bookings, settings), and either can also sign off *anything* elsewhere in
  the app — chef, duty manager, defrost, handover — in place of a regular
  staff or duty manager PIN. Manage both lists under **Master → Kitchen
  Managers / General Managers**.
- **Duty Managers** — unlock Master too, but only see **Staff** and
  **Bookings**: adding/removing staff PINs and uploading bookings. They
  still do the duty manager sign-off at closedown as before. Managed under
  **Master → Duty Managers** (a Kitchen/General Manager has to add or
  remove duty managers themselves).
- **Staff** — no Master access at all; just the ordinary clock-in used to
  tick off jobs and sign as chef/defrost.

Whoever unlocks Master (top of the screen, next to **Lock master
tables**) shows their name and access level, so it's clear who's making
changes. If a site was set up before this existed, its old single admin
PIN is carried forward automatically as a named "Kitchen Manager" so
nobody gets locked out — worth renaming and adding real people once you're
in.

## Home screen icon
The site now has a proper icon and manifest, so "Add to Home Screen" looks
like a real app on both platforms instead of a bookmark or a screenshot
thumbnail — same icon file works for iOS and Android, no separate setup
needed. It's a small checklist motif using the app's own section colours,
in `public/icons/`, referenced from `public/manifest.json` (Android) and
an `apple-touch-icon` link (iOS).

## Trail sign-off flag
In **Master → Weekly**, each task has an "Also needs signing off in
Trail" checkbox. Tick it for any job that also needs logging in Trail
separately, and a small "Sign off in Trail" badge appears next to that
task on the day page, right in the checklist — nothing else about the
task changes, it's just a visible reminder.

## Notice Board
Above the handover notes on every day page, there's a Notice Board — for
things everyone should see, not just the next shift (a fridge that's down,
a delivery running late, a heads-up for the week). Anyone can read it, but
posting or removing a notice asks for a Kitchen or General Manager PIN.
It's shared across the whole site and every day, not filed away when a day
or week ends, so it stays visible until a manager removes it. A photo can
be attached when posting — tap **Add photo**, it's compressed the same way
other reference photos in the app are, then shows as a thumbnail on the
posted notice (tap it to view full-size).

## Leaving a message for someone
Under **Master → Messages** (Kitchen/General Managers only), pick anyone
with a PIN — staff, a duty manager, or another manager — and write them a
note. It pops up once, the next time that person logs in (staff clock-in,
duty manager sign-off, or unlocking Master), and then it's cleared.
Messages waiting to go out are listed underneath, with a **Cancel** button
if you change your mind before it's been seen.

## Ending a week (and undoing it if that was a mistake)
**Records → End week & start a fresh one** asks for confirmation, downloads
a CSV backup automatically, then files the current week into Records and
opens a blank set of sheets. Nothing is deleted by this — the finished week
is fully preserved in Records (every tick, note, and signature, plus a
snapshot of the master pars at the time).

If this gets tapped by accident, go to **Records**, find that week in
**Filed weeks**, and tap **Restore as current week**. It asks for
confirmation, then makes that week live again — whatever's currently on
the live sheets (e.g. the accidental blank new week) is filed into Records
first, so that isn't lost either.

## How it behaves day to day
- Every tick, note, and par change saves instantly on the tablet it was
  entered on (so wifi drops never lose anything), and quietly syncs to the
  shared database in the background.
- When a tablet is opened, it pulls the latest master pars and today's sheet
  from the shared database, so it catches up on anything entered elsewhere.
- The small text under the week date in the header shows the sync status:
  "Synced just now" or "Saved on this device only" if it can't reach the
  server (e.g. wifi is down) — nothing is lost either way, it'll catch up
  once it's back online.
- Records (filed weeks, backups, CSV/JSON downloads) work exactly as before.
