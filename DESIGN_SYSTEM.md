# EMLAKIE Design System

## Color

| Token | Value | Usage |
|---|---|---|
| `brand-600` | `#16a34a` | Primary actions, links, focus rings |
| `brand-700` | `#15803d` | Hover state for brand-600 |
| `brand-50` | `#f0fdf4` | Tinted backgrounds on hover |
| `gray-900` | `#111827` | Primary text, headings |
| `gray-700` | `#374151` | Secondary text |
| `gray-500` | `#6b7280` | Muted text, ghost buttons |
| `gray-400` | `#9ca3af` | Placeholders, tertiary info |
| `gray-200` | `#e5e7eb` | Borders |
| `gray-100` | `#f3f4f6` | Section dividers |
| `gray-50` | `#f9fafb` | Alt section backgrounds |

## Typography

Three font families are loaded via `next/font/google`:

| Variable | Family | Usage |
|---|---|---|
| `--font-inter` | Inter | Body, UI text (default) |
| `--font-jakarta` | Plus Jakarta Sans | Marketing headings when weight > 700 is needed |
| `--font-playfair` | Playfair Display | All h1–h6 (applied globally in globals.css) |

### Scale

| Class | Size | Usage |
|---|---|---|
| `text-5xl font-bold` | 48px | Page hero h1 |
| `text-4xl font-bold` | 36px | Section hero h1 |
| `text-3xl font-bold` | 30px | Landlord section h2 |
| `text-2xl font-bold` | 24px | Standard section h2 (via SectionHeading) |
| `text-xl font-bold` | 20px | Card price |
| `text-base` | 16px | Body copy |
| `text-sm` | 14px | UI text, buttons, captions |
| `text-xs` | 12px | Badges, eyebrow labels |
| `text-[11px]` | 11px | Listing badges on photos |

## Spacing

Sections use consistent vertical padding:
- Standard section: `py-14` (56px)
- Prominent section or hero: `py-16` (64px) or `pt-20` hero
- Component content gap from edge: `px-4 sm:px-6` with `max-w-7xl mx-auto`

## Buttons — `components/ui/Button.tsx`

```tsx
<Button variant="primary" size="md" href="/path">Label</Button>
<Button variant="secondary" size="lg">Cancel</Button>
<Button variant="ghost" size="md" onClick={fn}>Sign In</Button>
```

| Variant | Appearance |
|---|---|
| `primary` | Brand-green fill, white text |
| `secondary` | White fill, gray border |
| `ghost` | No background, gray text → dark on hover |

| Size | Padding | Text |
|---|---|---|
| `sm` | `px-3 py-1.5` | `text-xs` |
| `md` | `px-4 py-2.5` | `text-sm` |
| `lg` | `px-5 py-3` | `text-sm` |
| `xl` | `px-8 py-3.5` | `text-sm` |

Pass `fullWidth` for `w-full`. Pass `href` to render as a `<Link>`.

Border radius is `rounded-xl` for primary/secondary, none for ghost.

## Badges — `components/ui/Badge.tsx`

Used on listing photos and anywhere a small status pill is needed.

```tsx
<Badge variant="brand" blur>By Owner</Badge>
<Badge variant="blue" blur>Broker</Badge>
<Badge variant="dark" blur>Sample</Badge>
<Badge variant="green">New</Badge>
<Badge variant="gray">ZIP</Badge>
```

Always `text-[11px] font-semibold rounded-full`. Add `blur` prop when overlaying on a photo.

## Section Headings — `components/ui/SectionHeading.tsx`

```tsx
<SectionHeading title="Latest rentals" seeAllHref="/rentals" />
<SectionHeading eyebrow="For landlords" title="List your rental." />
```

Renders `font-serif text-2xl font-bold` h2 with optional eyebrow label above and optional see-all link to the right.

## Cards — `components/ListingCard.tsx`

- Shape: `rounded-2xl border border-gray-100`
- Photo ratio: `aspect-[4/3]`
- Hover: `hover:border-gray-200 hover:shadow-card-hover` (custom shadow token)
- Image scale on hover: `group-hover:scale-[1.03] transition duration-500`

## Shadows

Defined in `tailwind.config.ts`:

| Token | Usage |
|---|---|
| `shadow-card` | Default card resting state |
| `shadow-card-hover` | Card on hover |

Avoid inline `shadow-[...]` values — use tokens or Tailwind defaults.

## Focus & Accessibility

`globals.css` sets `outline: 3px solid #16a34a` on all `:focus-visible` elements. Do not override with `outline-none` on interactive elements unless replacing with the Button component's built-in `focus-visible:ring-2 focus-visible:ring-brand-500`.

## Border Radius

| Usage | Class |
|---|---|
| Buttons, cards, modals | `rounded-xl` |
| Listing card | `rounded-2xl` |
| Badges, chips, pills | `rounded-full` |
| Small inline elements (ZIP chip, nav hover) | `rounded-lg` |

## Animation

| Token | Usage |
|---|---|
| `animate-glow-pulse` | Pulsing brand ring (use sparingly) |
| `animate-marquee` | Horizontal scroll ticker |
| `transition` | All interactive elements (default 150ms) |
| `duration-500` | Slow transitions (image scale) |

All animations are disabled when `prefers-reduced-motion: reduce` is set (enforced in `globals.css`).
