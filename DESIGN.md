# Rangi — brand sheet

**Voice:** the friend at the hair shop who measures before she guesses. Warm, direct, specific, never oversells. We say "we're not sure" out loud.

**Signature element:** the colour ring. Hair vendors carry a ring of numbered swatches (1, 1B, 2, 4, 27, 30, 99J…). Rangi's ring is drawn from measured values, with the code and hex printed on each swatch like a lab label. It appears once in the hero, then as the result card's spine.

## Colour

| Token | Hex | Role |
|---|---|---|
| `--ebony` | `#1D1A1F` | Ink, primary text, dark surfaces |
| `--pearl` | `#F6F4F8` | Page background (cool, not cream) |
| `--jacaranda` | `#5B3AA6` | Brand + primary actions. Nairobi's jacaranda trees. AA on pearl. |
| `--bloom` | `#E4DAF6` | Soft brand fills, selected states |
| `--blend` | `#1E7A4E` | "Blends" verdicts only |
| `--clash` | `#B0461A` | "Won't blend" verdicts only |

Hair swatch colours are data, never decoration. They come only from `src/lib/codes.ts`.

## Type

- **Display — Gloock.** High-contrast serif; editorial beauty, used large and sparingly (H1, H2, verdicts).
- **Text — Hanken Grotesk.** Everything readable: body, UI, buttons.
- **Data — IBM Plex Mono.** Every measured value: codes, hex, ΔE, confidence. If it was measured, it's in mono.

## Rules

- All colours, fonts, sizes and spaces are CSS variables in `src/app/globals.css`.
- No small caps-labels above headings. No gradients. One bold moment per page.
- Motion: UI 150–250ms ease-out; one hero sequence (the ring fanning open, ~800ms). Respect reduced motion.
