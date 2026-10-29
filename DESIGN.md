# edge.wise — design notes

**Name:** always written `edge.wise`, lowercase, with the period.

**Direction:** cinematic and calm. A near-white stage, one 3D world under the landing page, scroll-driven scenes. App pages are quiet white panels on the same stage.

**Voice:** a careful friend who knows hair. Plain, warm, never alarmist, never shaming protective styles. Says "see a dermatologist" whenever it matters and never diagnoses.

## The 3D story (landing, `src/components/cinema/`)

One fixed WebGL canvas (react-three-fiber) between the grey panels and the text. Each section has `data-scene="n"`; `CinemaStage` tracks which section holds the middle of the viewport and its progress, and `Scene` blends each actor between keyframes (`keyframes.ts`).

| Scene | 3D | Page |
|---|---|---|
| 0 Hero | A full hairline of coily strands on a glass form | Headline + "For me / I'm a stylist" pill |
| 1 Problem | Strands pulled taut, then the temples thin | Paragraph lights up word by word; live chip: tension, temples |
| 2 Check in | Two tilted-head photo cards; density gauge fills to 2.31 | Take 1 / take 2 readout |
| 3 Track | 3D trend: dip under tight styles, recovery after a break | Copy |
| 4 Plan | Tension bars drop from box braids to gentler options | Copy |
| 5 Share | Quiet stage | Stylist conversation, honesty cards, FAQ |
| 6 Finale | A full hairline again | "Keep your edges." |

All textures are drawn on canvas at runtime. Lenis smooth scroll; reduced motion disables smoothing and idle animation; if WebGL fails the page still reads. Phones put the 3D above a frosted text card.

## Colour

| Token | Hex | Role |
|---|---|---|
| `--stage` | `#FAFAF9` | Page |
| `--ink` / `--action` | `#17151B` | Text, primary buttons |
| `--accent` | `#5B3FB0` | Steps, links, focus, gauge |
| `--lilac` | `#EEE8F8` | Glow, selection, pill |
| `--blend` / `--amber` / `--clash` | `#1E7A4E` / `#8A5A00` / `#B42318` | Steady / Watch / Act now, tension levels |

## Type

- **Display — Fraunces (wght 360, SOFT 30).** Headlines.
- **Text — Hanken Grotesk 430.** Body and UI. Tabular figures for readings (`.data`).
