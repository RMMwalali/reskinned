# Rangi — brand sheet

**Direction:** clean beauty-retail. Inspired by modern beauty product pages (split gallery + buying column, soft serif titles, undertone-grouped shade swatches, sticky buy bar), with Rangi's own name, palette and copy.

**Voice:** the friend at the hair shop who measures before she guesses. Warm, direct, specific, never oversells. We say "we're not sure" out loud.

**Signature elements:** the colour ring (hero), the hair-bundle illustration drawn in measured colour (product art), and the shade grid grouped by colour family.

## Colour

| Token | Hex | Role |
|---|---|---|
| `--ink` | `#7A2533` | Berry ink: all text, outlines |
| `--coral` | `#CF3F1A` | Primary actions, promo bar (white text, AA) |
| `--cream` | `#F8F1EB` | Gallery panels, footer, soft surfaces |
| `--lilac` / `--lilac-2` | `#EEE2F3` / `#DCC9E8` | Tags, feature bands (jacaranda nod) |
| `--white` | `#FFFFFF` | Page background |
| `--blend` / `--clash` | `#1E7A4E` / `#B42318` | Verdicts only |

Hair swatch colours are data, never decoration. They come only from `src/lib/codes.ts`.

## Type

- **Display — Fraunces (SOFT 100, light ~320–340).** Soft, rounded serif for titles and results.
- **Text — Hanken Grotesk 500, +0.02em tracking.** Body, UI, buttons. Tabular figures for measured values (`.data`).
- **Labels — `.label`:** 700, uppercase, +0.06em. Field labels only (COLOUR, TEXTURE), never above every heading.

## Components

- Pill buttons (coral primary, berry outline ghost), pill tags in lilac.
- Product page: cream gallery left with thumbnails, buying column right, "Not sure? Scan your hair" link, shade grid with unstocked codes slashed, full-width CTA, sticky buy bar after the CTA scrolls away.
- Lilac band for the one big message per page. FAQ as a ruled accordion.

## Motion

UI 150–250ms ease-out; one hero sequence (the ring fanning open, ~800ms); sticky bar slides 220ms. Respect reduced motion.
