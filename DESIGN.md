# Rangi — design notes

**Direction:** cinematic and calm. A near-white stage, one 3D world under the page, scroll-driven scenes. Product pages keep the beauty-retail layout (split gallery, shade grid, sticky buy bar) in the same neutral palette.

**Voice:** the friend at the hair shop who measures before she guesses. Warm, direct, specific. We say "we're not sure" out loud.

## The 3D story (homepage, `src/components/cinema/`)

One fixed WebGL canvas (react-three-fiber) sits between the grey panels and the text. Each section has `data-scene="n"`; `CinemaStage` tracks which section holds the middle of the viewport and its progress, and `Scene` blends each actor between keyframes (`keyframes.ts`).

| Scene | 3D | Page |
|---|---|---|
| 0 Hero | Colour codes fanned like a vendor's ring | Headline + shopper/vendor pill |
| 1 Problem | One hair bundle; colour cycles 1→27, curl goes straight→4C | Paragraph lights up word by word; live chip names the code + texture |
| 2 Photos | Three frosted photo cards (front/right/left) | Scan step |
| 3 Measure | Pixels stream from the bundle into an orb that fills with the measured colour; caption orbits it | Measurement readout counts up |
| 4 Try-on | Codes orbit the orb; 1B steps forward | Try-on step |
| 5 Vendors | Codes rest in a faint arc | Tilted WhatsApp cards, honesty cards, FAQ |
| 6 Finale | Ring opens again, centre stage | "Will it blend?" |

All textures are drawn on canvas at runtime: no image files, no network. Smooth scroll via Lenis. Reduced motion: no smoothing, no idle animation. If WebGL fails, the page reads fine without it. Phones put the 3D above a frosted text card.

## Colour

| Token | Hex | Role |
|---|---|---|
| `--stage` | `#FAFAF9` | Page |
| `--ink` / `--action` | `#17151B` | Text, primary buttons |
| `--cream` / panels | `#F3F2F0` / `#EFEDEB` | Panels, soft surfaces |
| `--accent` | `#5B3FB0` | Jacaranda: steps, links, focus |
| `--lilac` | `#EEE8F8` | Glow, pill, tags |
| `--mark` | `#F9D9CF` | Marker highlight |
| `--blend` / `--clash` | `#1E7A4E` / `#B42318` | Verdicts only |

Hair colours are data, never decoration. They come only from `src/lib/codes.ts`.

## Type

- **Display — Fraunces (wght 360, SOFT 30).** Headlines, large and tight.
- **Text — Hanken Grotesk 430.** Body and UI. Tabular figures for measured values (`.data`).
