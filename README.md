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
   Manager, General Manager, Deputy Manager, Kitchen Team Leader, or Team Leader PIN →
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

Under **Records**, **Print cleaning & closedown checks** prints Morning
cleaning, Weekly cleaning, and Daily closedown checks for a whole week in
one go — Monday through Sunday, each day starting on its own page, with
all three sections together on that page rather than split further. It's
available
for the current in-progress week ("This week"), and for any filed week
too, so past weeks can be reprinted for records just as easily.

## Master admin screen
**App title** (in Settings) changes what shows in the header and the
browser tab — defaults to "Kitchen Tasks", but can be set to a site name
or anything else, per deployment. This only affects the in-app text; the
name used for "Add to Home Screen" icons comes from `manifest.json` and
the `apple-mobile-web-app-title` meta tag in `index.html`, which are
static files — change those directly if a particular site wants its own
home-screen icon label too.

A jump-nav bar at the top (and repeated at the start of every card) lets you
jump straight to any section — Morning, Defrost, Prep, Weekly, Closedown,
Staff, Team Leaders, Bookings, Settings — without scrolling through the
whole page.

Weekly cleaning and the daily closedown list are edited with one box per
task/field (task, method, detail, note, photo) rather than typing
pipe-separated lines into a big textarea — same style as the Prep and
Defrost tables. Add/remove rows with the buttons next to each list. Weekly
tasks can each have a reference photo too, shown the same way as the
others — tap the <b>i</b> next to the task on the day page.

## Bookings (live link)
Under **Master → Bookings**, paste the base link to your booking system's
run sheet (e.g. from DesignMyNight) — the part before the date, something
like `https://admin.designmynight.com/yourvenue/sites/xxxxx/run-sheet`.
Master shows a preview of what today's link would resolve to, so you can
check you've pasted the right thing.

Each day's page then gets an **Open today's bookings ↗** button that
builds that day's exact link (`...run-sheet?date=YYYY-MM-DD`) and opens it
in a new tab. It's a genuinely live link straight into your real booking
system — not a snapshot — so you'll need to log in there the first time,
same as normal; the app itself never stores or reads any booking data.

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

The **team leader sign-off** at closedown is kept separate on purpose.
Under **Master → Team Leaders**, add each team leader's name and their
own PIN. Tapping **Team leader sign-off** always asks for that PIN there
and then — it doesn't use whoever happens to be logged in on the tablet —
so the sign-off can only be completed by an actual team leader.

## Manager roles &amp; PINs
Master used to be behind one shared PIN. It's now behind named people at
two tiers:

- **Kitchen Managers, General Managers, Deputy Managers,** and **Kitchen
  Team Leaders** — full access, all four identical in what they can do.
  Any of them can open and change every part of Master (pars, cleaning
  lists, staff, bookings, settings), and any of them can also sign off
  *anything* elsewhere in the app — chef, team leader, defrost, handover —
  in place of a regular staff or team leader PIN. They're kept as four
  separate named lists (rather than one combined list) so it's clear at a
  glance who holds which title, even though they all do the same thing.
  Manage them under **Master → Kitchen Managers / General Managers /
  Deputy Managers / Kitchen Team Leaders**.
- **Team Leaders** — unlock Master too, but only see **Staff** and
  **Bookings**: adding/removing staff PINs and setting the bookings link.
  They still do the team leader sign-off at closedown as before. Managed
  under **Master → Team Leaders**, listed just under Staff (a Kitchen/
  General/Deputy Manager or Kitchen Team Leader has to add or remove team
  leaders themselves — Team Leaders can't add more of themselves).
- **Staff** — no Master access at all; just the ordinary login used to
  tick off jobs and sign as chef/defrost.

To keep the jump-nav at the top of Master from being cluttered with six
near-identical chips, all of the above (bar the Team Leaders sign-off
list) are grouped under one **Users** chip — the individual sections
themselves are still all there, just not each getting their own link in
the quick-nav bar.

Whoever unlocks Master (top of the screen, next to **Lock master
tables**) shows their name and access level, so it's clear who's making
changes. If a site was set up before this existed, its old single admin
PIN is carried forward automatically as a named "Kitchen Manager" so
nobody gets locked out — worth renaming and adding real people once you're
in.

There's a safeguard stopping the very last person across the four
full-access lists combined from being removed, so nobody can accidentally
lock everyone out of Master.

Every PIN field uses a masked, `type="password"` input rather than a
plain numeric one — this is deliberate: it's what tells Android/iOS
keyboards not to remember or suggest what was typed, which matters on a
shared kitchen tablet where several people's PINs get typed into the same
field over time. The trade-off is the on-screen keyboard is a normal
keyboard rather than a dedicated numeric pad (an extra tap to reach the
number row) — worth it for PINs not leaking into keyboard suggestions.

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
with a PIN — staff, a team leader, or another manager — and write them a
note. It pops up once, the next time that person logs in (staff login,
team leader sign-off, or unlocking Master), and then it's cleared.
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
