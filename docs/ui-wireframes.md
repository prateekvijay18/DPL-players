# UI wireframes

ASCII wireframes for the three pages. Mobile-first (screens drawn at ~375 px). Desktop scales up — rightmost details expand rather than rearrange.

## Theme tokens (used throughout)

- **Pitch green** `#0f4c2a` — nav header, primary buttons, rank badge
- **Gold** `#c9a14a` — top-3 medals, "Average" column highlight, accent borders
- **Off-white field** `#f5f3ee` — page background
- **Slab-serif display** (Roboto Slab / Bitter) — page headings only
- **Body font** — Inter (Next.js default stack)

Background flourish on `/leaderboard`: subtle horizontal pitch-stripe SVG pattern at ~5% opacity on the header band.

---

## `/register`

```
┌─────────────────────────────────────────┐
│ ▓▓▓ DPL • Player Registration ▓▓▓       │  ← pitch-green bar, slab-serif heading
├─────────────────────────────────────────┤
│                                         │
│  🏏 Join the League                     │  ← big slab-serif H1
│  Submit your details and skill ratings. │  ← muted body text
│                                         │
│  ┌─── Card ───────────────────────────┐ │
│  │ Name *                             │ │
│  │ ┌──────────────────────────────┐   │ │
│  │ │                              │   │ │
│  │ └──────────────────────────────┘   │ │
│  │                                    │ │
│  │ Photo (optional)                   │ │
│  │ ┌────────────┐  ┌──────────────┐   │ │
│  │ │  [preview] │  │ Upload image │   │ │
│  │ └────────────┘  └──────────────┘   │ │
│  │                  .jpg/.png/.webp   │ │
│  │                  ≤ 2 MB            │ │
│  │                                    │ │
│  │ Additional details (optional)      │ │
│  │ ┌──────────────────────────────┐   │ │
│  │ │                              │   │ │
│  │ │                              │   │ │
│  │ └──────────────────────────────┘   │ │
│  │                          0 / 500   │ │
│  │                                    │ │
│  │ ── Ratings ──────── 0.0 – 5.0 ──   │ │
│  │                                    │ │
│  │ Batting *                3.5 / 5   │ │
│  │ ●━━━━━━━━━━━▂▁▁▁▁▁▁▁▁  ┌─────┐    │ │
│  │ 0.0                5.0  │ 3.5 │    │ │
│  │                         └─────┘    │ │
│  │                                    │ │
│  │ Fielding *               4.0 / 5   │ │
│  │ ●━━━━━━━━━━━━━━━━▂▁▁▁  ┌─────┐    │ │
│  │ 0.0                5.0  │ 4.0 │    │ │
│  │                         └─────┘    │ │
│  │                                    │ │
│  │ Bowling *                2.8 / 5   │ │
│  │ ●━━━━━━━━━▂▁▁▁▁▁▁▁▁▁▁  ┌─────┐    │ │
│  │ 0.0                5.0  │ 2.8 │    │ │
│  │                         └─────┘    │ │
│  │                                    │ │
│  │        ┌────────────────────┐      │ │
│  │        │  Join the league 🏏│      │ │  ← pitch-green button
│  │        └────────────────────┘      │ │
│  └────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

Notes:
- Submit button disabled until Zod validation passes.
- Photo preview (~96 px square) appears to the left of the upload button after selection.
- No email field (identity = cookie after submit).

---

## `/leaderboard`

```
┌──────────────────────────────────────────────────────────┐
│ ▓▓▓ DPL — Leaderboard ▓▓▓              [Edit my info ›]  │  ← pitch-stripe bg
│ You're registered as Priya Sharma                        │
├──────────────────────────────────────────────────────────┤
│ ┌── Filters ────────────────────────────────────────────┐│
│ │ 🔍 Search name…                                     ✕ ││
│ │                                                       ││
│ │ Batting    0.0 ●━━━━━━━━━━━━━● 5.0    (3.0 – 5.0)     ││
│ │ Fielding   0.0 ●━━━━━━● 5.0           (2.5 – 5.0)     ││
│ │ Bowling    0.0 ●━━━━━━━━━━━━━● 5.0    (0.0 – 5.0)     ││
│ │                              [ Clear filters ]        ││
│ │                                                       ││
│ │ Active: [Batting 3.0–5.0 ✕]  [Fielding 2.5–5.0 ✕]     ││
│ └───────────────────────────────────────────────────────┘│
│                                                          │
│ ┌──┬────────────┬──────┬──────┬──────┬──────┐│
│ │# │ Player     │ Bat ▾│Field │ Bowl │ Avg  ││ ← sortable headers
│ ├──┼────────────┼──────┼──────┼──────┼──────┤│
│ │🥇│ 👤 Dev     │ 5.0  │ 4.5  │ 4.8  │ 4.77 ││ ← gold medal
│ │🥈│ 👤 Aisha   │ 4.5  │ 4.8  │ 4.0  │ 4.43 ││ ← silver
│ │🥉│ 👤 Rohan   │ 4.8  │ 4.2  │ 3.5  │ 4.17 ││ ← bronze
│ │ 4│ 👤 Vikram  │ 3.2  │ 3.5  │ 4.5  │ 3.73 ││
│ │ 5│ 👤 Priya ⭐│ 4.2  │ 3.8  │ 3.0  │ 3.67 ││ ← "You" badge
│ │ 6│ 👤 Arjun   │ 4.8  │ 3.0  │ 2.5  │ 3.43 ││
│ │ 7│ 👤 Karan   │ 4.0  │ 3.5  │ 3.0  │ 3.50 ││
│ │ 8│ 👤 Sana    │ 3.0  │ 3.5  │ 4.0  │ 3.50 ││ ← tiebreak: lower batting
│ └──┴────────────┴──────┴──────┴──────┴──────┘│
│                                                          │
│  ‹ Prev      Page 1 / 3      Next ›     [20 ▾] per page │
└──────────────────────────────────────────────────────────┘
```

Notes:
- Rank column: `🥇🥈🥉` for top 3 (gold-tinted badge background), numeric after.
- Avg column: bold, gold text colour — the headline number.
- "You" row: soft pitch-green background tint + star badge next to name.
- Mobile (<640 px): the table becomes horizontally scrollable. Rank and Name columns `position: sticky; left: 0` with a subtle shadow on the right edge. Filters collapse into a bottom drawer opened by a floating `[Filters (2)]` button.
- Sort column indicated by `▾` (desc) or `▴` (asc) next to the label.

---

## `/leaderboard/edit`

Same layout as `/register` with three differences:

1. Header copy: `✏️ Edit your profile` instead of `🏏 Join the league`
2. All fields pre-filled with current values
3. Submit button label: `Save changes`
4. Below the submit: secondary `← Back to leaderboard` link

```
┌─────────────────────────────────────────┐
│ ▓▓▓ DPL • Edit profile ▓▓▓              │
├─────────────────────────────────────────┤
│                                         │
│  ✏️ Edit your profile                   │
│  Update your info and ratings.          │
│                                         │
│  [ Same card as /register, prefilled ]  │
│                                         │
│         ┌─────────────────┐             │
│         │  Save changes   │             │
│         └─────────────────┘             │
│         ← Back to leaderboard           │
│                                         │
└─────────────────────────────────────────┘
```

Photo replace: uploading a new photo deletes the previous one from the bucket as part of the same server action (all-or-nothing).

---

## Empty states

- **No results for filters**: centred card, 🏏 icon, "No players match your filters", `[ Clear filters ]` button.
- **Lone registrant (only self on leaderboard)**: row shown as normal + a muted banner above the table: "Looks lonely here — share this link with your friends to get them registered."

## Loading skeletons

- Table rows: 5 skeleton rows with shimmer on each cell (avatar circle + 6 text rectangles).
- Register/Edit form: cards render immediately; only the photo preview and submit button show a spinner during async work.
