# Design System
## PRERNA — Visual Identity & UI Component Guidelines

**Version:** 1.0  
**Status:** Living Document  
**Last Updated:** 2026-10-29

> The design system prevents random UI generation. Every screen, component, and interaction should feel like it belongs to the same product. When in doubt, consult this document before creating new UI.

---

## 0. Core Design Philosophy

### The Two Tensions PRERNA Must Resolve

1. **Fun, not clinical.** Every screen must feel like a game/app, not a psychological assessment form. Transparency does not mean sterile. Duolingo doesn't feel like a language test.
2. **Honest, not alarming.** Disclosures, mood check-ins, and crisis resources must be calm and approachable — not scary. A teen in distress should see something that feels safe, not institutional.

### Design Principles (Ordered by Priority)
1. **Clarity first.** A 13-year-old must understand every screen without a parent's help.
2. **Warmth over neutrality.** Use color, illustration, and animation to signal safety and belonging.
3. **Control is visible.** Every data setting, consent record, and audit log entry must be findable within 2 taps from any screen.
4. **Progressive disclosure.** Show the essential thing now; let deeper detail be one tap away — not buried, but not cluttering the main view.
5. **Calm in the critical moments.** Crisis resource screens and notification flows must be the calmest, most reassuring screens in the app.

---

## 1. Color Palette

### Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#6C63FF` | Primary CTAs, active navigation, highlights |
| `--color-primary-light` | `#A5A0FF` | Hover states, soft backgrounds |
| `--color-primary-dark` | `#4B44CC` | Pressed states, text on light backgrounds |
| `--color-secondary` | `#FF6584` | Gamification accents, XP rewards, celebrations |
| `--color-secondary-light` | `#FFB3C1` | Secondary tags, soft emphasis |
| `--color-accent` | `#43D88B` | Success states, completion checkmarks, streaks |
| `--color-accent-light` | `#A7F3CF` | Success backgrounds, subtle positive feedback |

### Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-surface` | `#0F0E17` | Main app background (dark mode primary) |
| `--color-surface-raised` | `#1A1827` | Cards, panels, raised surfaces |
| `--color-surface-overlay` | `#252338` | Modals, dropdowns |
| `--color-border` | `#2E2C45` | Dividers, input borders |
| `--color-text-primary` | `#FFFFFE` | Main body text |
| `--color-text-secondary` | `#A7A5B8` | Supporting text, captions, metadata |
| `--color-text-muted` | `#5C5A72` | Disabled states, placeholders |
| `--color-warning` | `#FFB347` | Non-critical warnings, gentle nudges |
| `--color-error` | `#FF6B6B` | Validation errors, destructive actions |
| `--color-crisis-calm` | `#5B8DB8` | **Crisis resource screens only** — a calm, trustworthy blue distinct from brand purple |

### Light Mode Equivalents
Light mode uses the same token names; values swap. Define in `src/styles/tokens.css`:
```css
:root {
  --color-surface: #F8F7FF;
  --color-surface-raised: #FFFFFF;
  --color-surface-overlay: #F0EFFB;
  --color-border: #E0DEFF;
  --color-text-primary: #0F0E17;
  --color-text-secondary: #4A4867;
}
```

---

## 2. Typography

### Font Stack
```css
/* Headings */
font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;

/* Body */
font-family: 'Inter', system-ui, sans-serif;

/* Monospace (data, code, audit log) */
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `text-display` | 48px / 3rem | 700 | 1.1 | Hero moments, onboarding splash |
| `text-h1` | 32px / 2rem | 700 | 1.2 | Page titles |
| `text-h2` | 24px / 1.5rem | 600 | 1.3 | Section headings |
| `text-h3` | 20px / 1.25rem | 600 | 1.4 | Card headings, activity titles |
| `text-body-lg` | 18px / 1.125rem | 400 | 1.6 | Lead paragraph, disclosure text |
| `text-body` | 16px / 1rem | 400 | 1.6 | Default body copy |
| `text-body-sm` | 14px / 0.875rem | 400 | 1.5 | Supporting text, labels |
| `text-caption` | 12px / 0.75rem | 400 | 1.4 | Timestamps, metadata |
| `text-button` | 16px / 1rem | 600 | 1 | Button labels |

### Disclosure Text (Special Rule)
Teen-readable disclosures must always use:
- `text-body-lg` (18px minimum) — not smaller
- `--color-text-primary` — no muted/secondary color
- Maximum line width: 65ch
- Must pass readability for a 13-year-old (Flesch-Kincaid Grade ≤ 7)

---

## 3. Spacing System

Uses an 8px base grid (Tailwind's default 4px spacing mapped to 8px increments for layouts):

| Token | Value | Usage |
|---|---|---|
| `space-1` | 4px | Micro gaps (icon + label) |
| `space-2` | 8px | Component internal padding |
| `space-3` | 12px | Tight card padding |
| `space-4` | 16px | Default padding |
| `space-6` | 24px | Card padding, section gaps |
| `space-8` | 32px | Section separators |
| `space-12` | 48px | Major layout gaps |
| `space-16` | 64px | Page-level padding |

---

## 4. Border Radius

| Token | Value | Usage |
|---|---|---|
| `radius-sm` | 8px | Small chips, tags |
| `radius-md` | 12px | Buttons, input fields |
| `radius-lg` | 16px | Cards, panels |
| `radius-xl` | 24px | Modal dialogs, bottom sheets |
| `radius-full` | 9999px | Avatar circles, pill badges |

---

## 5. Component Guidelines

### 5.1 Buttons

```
Primary CTA:       bg-primary, text-white, radius-md, py-3 px-6, text-button
Secondary:         bg-transparent, border border-primary, text-primary
Destructive:       bg-error/10, text-error, border border-error/30
Ghost:             bg-transparent, text-text-secondary, hover:text-primary
Danger confirm:    Requires a second explicit confirmation tap — never one tap for irreversible actions
```

**Button rules:**
- Minimum tap target: 44×44px (WCAG 2.5.5)
- Loading state: spinner replaces label text (never just "Loading...")
- Disabled state: 40% opacity, `cursor-not-allowed`, no pointer events
- Destructive actions (Data Delete): always show a confirmation dialog with consequences spelled out clearly

### 5.2 Cards

```
Activity cards:    bg-surface-raised, radius-lg, border border-border
                   Hover: border-primary/40 + subtle scale(1.02) with Framer Motion spring
                   Active/selected: border-primary + glow shadow
Trait cards:       Same base + gradient left-border accent in the RIASEC/Big Five category color
```

### 5.3 Input Fields

```
Base:     bg-surface-overlay, border border-border, radius-md, py-3 px-4
Focus:    border-primary, ring-2 ring-primary/20
Error:    border-error, ring-2 ring-error/20
Label:    text-body-sm, text-text-secondary, mb-1
Helper:   text-caption, text-text-muted, mt-1
Error msg: text-caption, text-error, mt-1
```

**Never:** placeholder text as a substitute for a label. Always use visible labels.

### 5.4 Disclosure Cards (Special Component)

Shown before each activity type. Design requirements:
- Full-width, prominent card — not an afterthought banner
- Icon relevant to the activity
- **Plain-language explanation** in `text-body-lg` — the actual disclosure text, not legalese
- "What this helps you understand:" bullet list (max 3 bullets)
- "Learn more" expandable section for detail
- Primary CTA: "Got it, let's go!" (positive framing)
- Secondary link: "See this again anytime in Settings"

```
bg-primary/10, border border-primary/30, radius-xl, p-8
Icon: 48px, color: primary
Heading: text-h3, text-primary
Body: text-body-lg, text-text-primary (not muted — this matters)
CTA: Primary button
```

### 5.5 Crisis Resource Surface (Special Component)

Used in the always-accessible crisis support screen. Design requirements:
- **Calm, not alarming.** Uses `--color-crisis-calm` (blue), NOT the brand purple or red
- Must feel approachable: "It's okay to reach out" framing
- Helpline numbers displayed in large, tappable `tel:` links (minimum `text-h2` size)
- No assessment score context shown on this screen — this is help, not diagnosis

```
bg-crisis-calm/10, border border-crisis-calm/30, radius-xl
Heading: text-h2, text-crisis-calm
Body: text-body-lg, calm and direct language
Helpline numbers: text-h2, font-bold, tappable
```

### 5.6 Progress & Gamification Elements

```
XP bar:    Animated gradient fill (primary → secondary), height 8px, radius-full
Streaks:   Flame icon (Lucide), secondary color, animated pulse on new streak day
Level-up:  Full-screen celebration overlay, Framer Motion spring animation
           Uses confetti/particle effect — NOT a modal interrupt during crisis-adjacent moments
Badges:    48×48px circular, gradient background per trait category
```

**Gamification rules:**
- Never show a streak counter or level-up prompt immediately after a crisis resource interaction
- Score/progress is always framed as "your journey" — never a comparison to other users
- No public leaderboards anywhere in the app

### 5.7 Navigation

```
Bottom tab bar (mobile-first layout):
  - Home (dashboard)
  - Activities (Life Quests, Skill Arena, etc.)
  - Mentor (AI Chat)
  - Profile
  - Settings (contains: consent summary, audit log, data export/delete)

Active tab: primary color icon + label
Inactive: text-muted icon + label
```

Crisis resources accessible from: Settings → Support Resources (always visible, not gated)

---

## 6. Motion & Animation

### Principles
- **Purposeful:** Every animation communicates state change; no decoration-only motion
- **Responsive:** < 300ms for micro-interactions; 400–600ms for page transitions
- **Reduced motion:** All animations respect `prefers-reduced-motion: reduce`

### Framer Motion Presets
```tsx
// Page transition
const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } }
};

// Card hover
const cardHover = {
  whileHover: { scale: 1.02, transition: { type: 'spring', stiffness: 300 } },
  whileTap: { scale: 0.98 }
};

// Success celebration
const celebrationVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 15 } }
};
```

### Rules
- Crisis resource screens: **no decorative animation.** Functional transitions only.
- Consent disclosure screens: no animation that could feel rushed. Give the text breathing room.
- Never use animation that could trigger motion sickness (rapid parallax, extreme zoom).

---

## 7. Accessibility

**Target:** WCAG 2.1 AA

| Requirement | Implementation |
|---|---|
| Color contrast | Text on background: ≥ 4.5:1 (AA). Large text: ≥ 3:1. Checked with Tailwind `oklch` |
| Focus indicators | Visible ring on all interactive elements (`ring-2 ring-primary/60`) |
| Tap targets | Minimum 44×44px for all interactive elements |
| Screen reader | Semantic HTML, ARIA labels on icon-only buttons, live regions for dynamic content |
| Language | `lang` attribute set per active locale |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` disables all non-functional animation |

---

## 8. Localisation Design Rules

- **Hindi UI:** Same font stack; Space Grotesk supports Devanagari glyphs
- **Right-to-left:** Not needed for Hindi or initial regional languages, but layout should be flex-based (not fixed direction) for future RTL support
- **Text expansion:** Hindi text typically 20–30% longer than English. Test all buttons and cards with Hindi content at design time.
- **Disclosure text in Hindi:** Must go through the same review process as English. A translation is not approved just because the English was approved.
- **Numbers:** Use locale-appropriate number formatting (`Intl.NumberFormat` with the active locale)

---

## 9. Illustration & Iconography

- **Icons:** Lucide React exclusively. Do not mix icon sets.
- **Illustrations:** Custom character (teen protagonist, culturally Indian — design to be commissioned). No stock Western-default avatars.
- **Activity icons:** Each activity type has a consistent visual identifier:
  - Life Quests → compass / map
  - Skill Arena → controller / puzzle piece
  - Mood Mirror → mirror / face with gradient
  - Social Compass → people / hands
  - Body Clock → clock / moon+sun
  - AI Mentor → sparkle / chat bubble

---

## 10. Dark Mode (Default) & Light Mode

PRERNA ships dark mode as default (teens prefer it; matches gaming aesthetic). Light mode is supported as a user toggle.

All color decisions must be tested in both modes. Use CSS custom properties (tokens) exclusively — never hardcode color hex values in component code. Always reference `--color-*` tokens.

