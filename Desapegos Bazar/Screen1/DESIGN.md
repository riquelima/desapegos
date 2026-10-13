---
name: Obsidian & Ochre
colors:
  surface: '#faf9f6'
  surface-dim: '#dbdad7'
  surface-bright: '#faf9f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f0'
  surface-container: '#efeeeb'
  surface-container-high: '#e9e8e5'
  surface-container-highest: '#e3e2e0'
  on-surface: '#1a1c1a'
  on-surface-variant: '#47464a'
  inverse-surface: '#2f312f'
  inverse-on-surface: '#f2f1ee'
  outline: '#77767b'
  outline-variant: '#c8c6ca'
  surface-tint: '#5f5e60'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1d'
  on-primary-container: '#858386'
  inverse-primary: '#c8c6c8'
  secondary: '#a83819'
  on-secondary: '#ffffff'
  secondary-container: '#fd7550'
  on-secondary-container: '#691600'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1b1c19'
  on-tertiary-container: '#858480'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e1e4'
  primary-fixed-dim: '#c8c6c8'
  on-primary-fixed: '#1b1b1d'
  on-primary-fixed-variant: '#474649'
  secondary-fixed: '#ffdbd1'
  secondary-fixed-dim: '#ffb5a1'
  on-secondary-fixed: '#3c0800'
  on-secondary-fixed-variant: '#872002'
  tertiary-fixed: '#e4e2dd'
  tertiary-fixed-dim: '#c8c6c2'
  on-tertiary-fixed: '#1b1c19'
  on-tertiary-fixed-variant: '#474744'
  background: '#faf9f6'
  on-background: '#1a1c1a'
  surface-variant: '#e3e2e0'
typography:
  display-lg:
    fontFamily: Epilogue
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Epilogue
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Epilogue
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Epilogue
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Epilogue
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.75rem
  gutter-md: 1rem
  margin: 1rem
  margin-md: 1.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system targets discerning shoppers seeking high-craft, curated products within an editorialized mobile shopping experience. The aesthetic balances architectural minimalism with tactile luxury: calm, confident, and deliberate. Every interaction must project restraint and clarity, elevating product imagery to gallery status.

### Design Principles
- **Editorial Subtraction:** Interface chrome yields entirely to content. Whitespace serves as a physical cushion around products rather than vacant space.
- **Warm Rigor:** Clean geometric structure tempered with warm off-white grounds and resonant obsidian accents, avoiding the sterile clinical feeling of pure black-and-white layouts.
- **Tactile Refinement:** Micro-interactions mimic premium material finishes: subtle boundary tints, crisp edges softened with microscopic inner radiuses, and smooth spring curves.

## Colors

The palette establishes an architectural dynamic between three distinct color roles:

- **Primary (`#121214` - Deep Obsidian):** Used for authoritative typography, primary CTA buttons, active state indicators, and solid icon fills. Provides sharp graphic contrast against lighter planes.
- **Secondary (`#D85A38` - Terracotta Coral):** The solitary high-heat accent. Reserved strictly for conversion levers, sale badges, active selection rings, and micro-delight moments (e.g., favorite toggles, progress bars). Never applied to large layout areas.
- **Tertiary (`#8A8985` - Muted Pumice):** Serves metadata, unselected icons, subtle borders, and secondary descriptions. Keeps hierarchy distinct without muddying the canvas.
- **Neutral (`#F9F8F5` - Soft Alabaster):** The tactile canvas. Replaces cold `#FFFFFF` to give screens an editorial, natural linen quality that reduces eye fatigue and pairs organically with studio product photography. Pure white (`#FFFFFF`) is reserved solely for floating elevated cards or layered multimedia sheets.

## Typography

The typographic hierarchy pairs the structured architectural rhythm of **Epilogue** for display titles and collection headers with the humanized, ultra-legible geometry of **Plus Jakarta Sans** for interfaces, product specs, and transactional microcopy.

- Headings use optical kerning and tightened tracking (`-0.01em` to `-0.03em`) to mimic high-end editorial magazines.
- Prices utilize `headline-sm` or `label-lg` with monospaced tabular numerals enabled via open-type features (`tnum`), preventing layout jitter during variant toggling.
- All product badges and category tags leverage `label-sm` in full uppercase with a tracking bonus of `0.04em` for crisp rendering at tiny scales.

## Layout & Spacing

The foundation is built upon a responsive 4-column layout on mobile devices (`< 600px`), shifting to an 8-column layout on tablets (`600px – 1024px`) and a 12-column layout on wide screens.

- **Mobile Viewport:** Outer margins lock to `margin` (16px), with internal grid gutters at `gutter` (12px) to optimize screen real estate for two-column product grids.
- **Vertical Rhythm:** Sections step down rhythmically using increments of `space-xl` (40px) between major merchandising pods and `space-md` (16px) between product cards and metadata stacks.
- **Edge bleed rule:** Product galleries and hero carousel lookbooks bypass the horizontal page margin entirely to achieve full-width immersive edge-to-edge swipes, reintroducing 16px inset indicators below the fold.

## Elevation & Depth

To sustain a minimalist yet tactile luxury tone, elevation relies on subtle tonal planes and ambient color-tinted diffusion rather than heavy dropshadows.

- **Level 0 (Floor):** Canvas background (`#F9F8F5`). Completely matte.
- **Level 1 (Card/Container):** Flat pure white (`#FFFFFF`) or tinted obsidian overlays with low-contrast borders (`1px solid rgba(18, 18, 20, 0.05)`). No drop shadow.
- **Level 2 (Floating Action & Modals):** Utilizes an extra-diffused ambient shadow: `0px 12px 32px -4px rgba(18, 18, 20, 0.06), 0px 4px 12px -2px rgba(18, 18, 20, 0.03)`.
- **Level 3 (Sticky Navigation & Bottom Sheets):** Translucent backdrop blur (`backdrop-filter: blur(20px) saturate(180%)`) paired with an 85% opacity `#F9F8F5` surface and a hairline bottom/top separation border (`rgba(18, 18, 20, 0.06)`).

## Shapes

The interface balances sharp architectural discipline with organic touches:

- **Cards & Visual Containers:** Standardized at `0.5rem` (8px) for outer image containers and cards to maintain crisp, frame-like structural boundaries.
- **Interactive Micro-Elements:** Interactive pills, chips, secondary tags, and main primary CTAs break away into full rounded pill form (`rounded-full` / >`999px`) to create an immediate visual metaphor for touch and tap affordability.
- **Multimedia Tiles:** Video teasers and dynamic product carousels feature subtle inner corner-radius masking to ensure zoom transforms never clip the baseline grid.

## Components

### Buttons
- **Primary:** Full pill container filled with Obsidian (`#121214`), text in Alabaster (`#F9F8F5`), `label-lg` typography, 52px height for thumb ergonomics. Micro-tap state scales down to `0.98`.
- **Accent (Checkout / Instant Buy):** Full pill container in Terracotta Coral (`#D85A38`), text in `#FFFFFF`.
- **Ghost / Tertiary:** Transparent background, hairline border (`1px solid rgba(18, 18, 20, 0.12)`), text in Obsidian.

### Product Cards
- Contained within an edge-less or subtle `#FFFFFF` background.
- 4:5 vertical aspect ratio for media elements.
- Embedded heart/wishlist trigger floating in the top right corner: 36px circular pill blur (`rgba(249, 248, 245, 0.85)`).
- Clear typographical separation: Category brand in `label-sm` (Pumice), title in `body-md` (Obsidian), price formatted with bold tabular weights.

### Chips & Pill Tags
- Fully rounded (`rounded-full`), padded with `space-xs` vertically and `space-md` horizontally.
- **Filter Tags:** Unselected state uses transparent fill with subtle pumice outline; selected state uses solid Obsidian fill with white text.
- **Status/Badge Chips:** Micro-scale pill tags positioned over imagery (e.g., "NEW", "LIMITED") with warm terracotta tint (`rgba(216, 90, 56, 0.12)`) and Terracotta Coral text.

### Form Inputs & Selectors
- Flat off-white or white fill with a 1px border (`rgba(18, 18, 20, 0.1)`). Height 48px, roundedness level 2 (8px radius).
- Active focus shifts the border directly to Obsidian (`#121214`) with a zero-offset subtle glow (`box-shadow: 0 0 0 1px #121214`).
- Label rests above input using `label-md` to maintain vertical clarity on mobile zoom.

### Multimedia Gallery
- Swipable edge-to-edge carousel with pagination dots rendered as smooth pill dashes: active dot widens into an 18px pill in Obsidian, inactive dots remain 6px circles in Pumice.
- Integrated video modules auto-play muted inline, overlaid with a glassmorphic play/pause pill toggle.