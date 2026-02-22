# VeinCheck Command — Brand & UI Guidelines

This document defines the branding and UI style for the VeinCheck Command demo application.

---

## Product identity

- **Product name:** VeinCheck Command
- **Tagline (optional):** “Unit-wide IV site monitoring and response coordination”
- **Primary context:** Hospital clinical operations dashboard (nursing + leadership + QA + biomed)
- **Demo hospital:** St. Anne Medical Center
- **Units:** ICU North, Oncology Infusion, Emergency Department, Radiology Contrast Suite

**Tone:**
- Clinically calm, precise, operational
- Minimal marketing language inside the UI
- Avoid anything that looks like a consumer app

**Copy style rules:**
- Prefer concise action language:
  - “Acknowledge”, “Escalate”, “Mark resolved”, “Snooze 5 min”
- Use “likelihood pattern” phrasing:
  - “High likelihood infiltration pattern”
  - “Moderate likelihood infiltration pattern”
  - “Sensor issue”
- Do not claim diagnosis or certainty.
- Avoid slang and exclamation points.

---

## Visual style goals

The dashboard should feel like an enterprise analytics product:
- **Minimal text**
- **Large status cues**
- **Consistent placement of alert actions**
- **Scan-first layout** (nurses should not hunt for next step)
- **One click** from unit overview to patient trends

---

## Color system (target tokens)

Use these values (or very close) consistently:

- **App background:** `#F4F7FB`
- **Surface / cards:** `#FFFFFF`
- **Borders:** `#E5EAF2`
- **Header/nav blue:** `#0F4C81`
- **Accent blue:** `#2563EB`
- **Text primary:** `#0F172A`
- **Text secondary:** `#475569`

### Status colors (restrained palette)
- **High alert:** red (use a red tint + icon + label; not full neon)
- **Moderate / Watch:** amber
- **Normal monitoring:** neutral/slate with subtle blue accents
- **Offline / No device:** gray
- **Resolved / Success:** green

**Accessibility note:** Do not rely on color alone. Every state must also show:
- an icon
- a label/badge
- (where appropriate) a small status line

---

## Typography

- Use a clean sans-serif system font stack (or Inter if included).
- Prefer compact hierarchy:
  - Page titles: 18–22px
  - Card titles: 14–16px, semibold
  - Body: 13–14px
  - Secondary text: 12–13px

**Do not** use playful type or oversized headings.

---

## Layout + spacing

- Desktop-first layout optimized for **1440px+**.
- Card radius: **14px**
- Control radius: **10px**
- Use consistent spacing:
  - Card padding: 16–20px
  - Grid gaps: 12–16px
- Avoid visual clutter:
  - no heavy gradients
  - no thick borders
  - no loud background patterns

---

## Shadows & depth

Use subtle depth only:
- Soft shadow on cards (low blur, low opacity)
- Slight elevation on hover
- Avoid strong glows or dramatic drop shadows

---

## Iconography

- Use Lucide icons.
- All icons should be consistent size:
  - 16px for inline
  - 18–20px for headers/tiles
- Use icons in badges sparingly (only for meaning).

---

## Component style guidance

### Header (top bar)
- Blue header with:
  - hospital + unit dropdown
  - search bar
  - live indicator (green dot + timestamp)
  - network status icon
  - role selector
  - privacy toggle (Reveal identifiers)
  - Create report button (role-gated)

### Cards
- White background, soft border, subtle shadow
- Clear title row + right-aligned actions/filters

### Alert cards
- Strong severity badge
- Bed + patient display at top
- “Recommended action” as a single line, not paragraph
- Action buttons always in the same location
- Acknowledged state: visually collapsed and calm, still readable

### Bed tiles
- Grid density: show all beds without scrolling on 1440px if possible
- State color + icon + label
- Selection highlight should be obvious but not loud

### Patient detail panel
- High-signal live status card first
- Two stacked trend charts with shared time axis
- Vertical alert trigger marker line
- Event timeline looks like audit trail
- Action panel with step-by-step checklist

---

## Animations

Keep motion subtle:
- Drawer slide-in/out
- Card hover elevation
- Collapse on acknowledge
- Toast fade in/out

**Avoid** pulsing animations in screenshot mode.

---

## Demo data / safety disclaimers

- Include a small badge in the UI: **“Demo data / not for clinical use.”**
- Use anonymized IDs by default.
- Never include real patient names or identifiable details.
- Ensure MRNs/initials only appear behind role + toggle gating.

---

## Naming patterns for synthetic identifiers

- Patient anonymized ID: `VC-<UNIT>-<BED><NN>`
  - Example: `VC-ICUN-1204`
- Pod ID: `VC-POD-####`
  - Example: `VC-POD-0417`
- Patch ID: `VC-PATCH-<bed>-<site>`
  - Example: `VC-PATCH-12-02`
- Alert ID: `A-YYYYMMDD-HHMM-B##`
  - Example: `A-20260222-0810-B12`
- Case review ID: `CR-YYYY-####-##`
  - Example: `CR-2026-0222-12`

---

## “Professional dashboard” checklist

Before calling UI complete, verify:
- No clipping or overlaps at 1440px
- Chart axes/labels never cut off
- Badge colors consistent across app
- Action buttons aligned consistently
- Alert queue is visually dominant but not overwhelming
- Right rail metrics readable and compact
- All pages feel part of the same product