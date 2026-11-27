# DESIGN.md: Aku Mw Magang

Direction chosen by the project owner on 2026-11-27: **Campus field notebook**.
Anti-slop skills applied during the work; Apple HIG principles used as the accessibility and craft floor.

## Thesis

A working logbook for a student hunting internships, not a SaaS dashboard.
The interface should feel like a ruled notebook kept on a desk: warm paper, dark ink,
one signal color, entries written in order, and a stamp in the margin when something
changes state. The data is the content; the chrome stays out of its way.

Audience: Indonesian university students in semester 3 to 6, applying to 5 to 30
internships at a time, often at night, often on a laptop with a second tab open.

Dial: **ENERGY 2 / RHYTHM 2 / MOTION 1**

## Palette

Two core colors (paper, ink), one signal color (rust), plus semantic status colors.
Status colors are functional, not decorative: they only appear on stamps and alerts.

### Light: desk in daylight

| Token | Hex | Role |
| --- | --- | --- |
| `paper` | `#F2ECDF` | page background |
| `surface` | `#FAF6EC` | sheets, inputs, modal body |
| `ink` | `#211D16` | primary text |
| `muted` | `#5E5749` | secondary text, metadata |
| `rule` | `#D6CBB5` | decorative rules |
| `border` | `#7D7059` | control borders (3:1 minimum) |
| `accent` | `#8A3A1F` | one signal: primary action, active tab, focus |
| `accent-ink` | `#FBF7EC` | text on accent |
| `success` | `#2E5C42` | offer, completed checklist |
| `warning` | `#7A4E0E` | ghosting risk, conflicts |
| `danger` | `#8B2A2A` | rejection, destructive action |
| `highlight` | `#EFE7D2` | hover tint, selected row |

Contrast on `surface`: ink 14.25:1, muted 6.63:1, accent 7.19:1,
accent-ink on accent 7.25:1, border 4.49:1, success 7.14:1, warning 6.66:1, danger 7.90:1.

### Dark: desk lamp at night

| Token | Hex | Role |
| --- | --- | --- |
| `paper` | `#16130E` | page background |
| `surface` | `#1E1A13` | sheets, inputs |
| `ink` | `#F1EADC` | primary text |
| `muted` | `#B5AA93` | secondary text |
| `rule` | `#393327` | decorative rules |
| `border` | `#8C8168` | control borders |
| `accent` | `#E09A6E` | primary action, active tab, focus |
| `accent-ink` | `#1A1610` | text on accent |
| `success` | `#8CC4A6` | offer |
| `warning` | `#E5B968` | ghosting risk |
| `danger` | `#E59191` | rejection |
| `highlight` | `#2A251B` | hover tint |

Contrast on `surface`: ink 15.48:1, muted 7.54:1, accent 7.44:1,
accent-ink on accent 7.73:1, border 4.50:1, success 8.71:1, warning 9.46:1, danger 7.25:1.

The theme toggle writes `.dark` on `<html>`. Both modes are first-class.

## Typography

- Display: **Fraunces**, an old-style serif with a slightly soft, printed quality.
  Used for the wordmark, page titles, entry roles, large totals, and section headings.
- Body and controls: **IBM Plex Sans**, a humanist sans chosen for legibility at 12 to 14 px.
- Numbers, dates, IDs, counts: **IBM Plex Mono**, so columns of figures line up.
- Fallbacks: Georgia for display, system sans for body, system mono for data. The app must
  remain readable when the web fonts fail to load.

Scale:

| Role | Size / line | Face |
| --- | --- | --- |
| Page title | 28 / 34 | Fraunces 600 |
| Total figure | 40 / 42 | Fraunces 600 |
| Entry role | 20 / 28 | Fraunces 600 |
| Body | 14 / 22 | Plex Sans 400 |
| Meta | 12 / 18 | Plex Sans 400 |
| Field label | 11 / 16, uppercase, tracking 0.08em | Plex Sans 500 |
| Counter, date, ID | 12 / 18 | Plex Mono 400 |

Uppercase labels are used only for form fields and ledger column headers, never for page titles.

## Layout

- One column of content, max width 1180 px, with a left margin wide enough to hold a mono
  section index on desktop. The index drops inline on mobile.
- Page sections are separated by rules and whitespace, not by floating cards.
- A sheet is a bordered surface with 3 px radius. Shadows are reserved for the modal layer,
  because a modal is the only element that truly sits above the page.
- Ledger rows use a hairline bottom rule. Entries in the pipeline are peers, so they keep a
  consistent structure; urgency is expressed by a warning rule and a status stamp, not by
  random size changes.
- Radii: 2 px for controls, 3 px for sheets, 0 for stamps and rules. No pill shapes.

## Signature motif

Two repeated marks make the product recognisable:

1. **Status stamp**: a rectangular, uppercase mono label with a 1 px currentColor border.
   It marks application status, match tier, and the comparator recommendation. It replaces
   the pastel pill badge.
2. **Margin index**: section headings carry a mono number in the left margin (`01`, `02`).
   The pipeline stages are a real sequence, so numbering is information, not decoration.

## Components

- Primary button: accent fill, `accent-ink` text, 2 px radius, no shadow, hover darkens to ink.
  Label is an action specific to the screen ("Simpan lamaran", not "Submit").
- Secondary button: surface fill, 1 px border, ink text, hover highlight.
- Destructive action: danger text on transparent background, border only on hover.
- Inputs: surface fill, 1 px border, 2 px radius, visible focus ring in accent.
  Every input has a real associated `<label>`.
- Status stamp colors: wishlist muted, applied ink, screening accent, interview accent on
  highlight, offer success, rejected danger, ghosted warning.
- Match tier: success at 70+, warning at 40 to 69, danger below 40. Text and border, no fill.
- Toast: a sheet with a left accent rule, announced with `aria-live="polite"`, no bounce.
- Modal: scrim, sheet, Escape and backdrop close, focus moved in and restored, page scroll
  locked, `role="dialog"` and `aria-modal="true"`.

## Motion

MOTION 1: hover and focus transitions only, 120 to 160 ms, color and border. No looping
animation, no pulse, no bounce, no parallax. Respect `prefers-reduced-motion`.

## Copy voice

Indonesian, direct, specific, in the student's own register. Name the action and the outcome.
No marketing buzzwords, no em dash. Examples: "Simpan ke wishlist", "Catat lamaran",
"Pindahkan status", "Rekomendasi terbaik".

## Why these choices (one line each)

- Warm paper instead of slate: a logbook is handled daily, and a warm neutral reads as paper,
  not as a generic admin panel.
- Fraunces instead of a geometric sans: headings should sound written, not generated.
- One rust accent: the notebook uses one pen for emphasis; everything else is ink.
- Rules instead of cards: the product is a list of applications, and a ruled ledger shows more
  entries per screen without losing order.
- Mono for numbers: dates, percentages, and salaries are compared down a column.
- Stamps instead of pills: a stamp is a decision recorded once, which is what a status is.
- No gradients, glow, glass, or floating shadows: none of them carry any information about an
  internship application.
- Dark mode exists because students apply at night; it is a working, verified toggle, not a
  style statement.

## Avoid

Generic dashboard cards, pill badges, gradient buttons, glass headers, decorative sparkle
icons, animated counters, fake statistics, and any copy that could belong to another product.
