# edge.wise design notes

Inspired by bar-topas.ch: bold, warm and printed, with motion driven by scroll.

## Palette
Crimson `#b21236` (brand, headings), tomato `#e8432b`, orange `#f47b20`, saffron `#feb914` (highlights, numbers), teal `#2c9fa2` (the "how it works" band), cream paper `#efebdf` (page), pink `#f6b3c2` (secondary text on crimson). The five-colour stripe band (crimson → tomato → orange → saffron → teal) opens the hero, closes the page and tops the footer.

## Type
- Archivo variable at 62–80% width, weight 850–900, uppercase: headings, card names, the wordmark.
- Barlow Condensed 600/700, uppercase and letter-spaced: labels, buttons, numbers.
- Source Sans 3: body copy.
- Caveat: short handwritten asides ("two photos, two minutes!").

## Pieces
- Tickets: cream cards with a dashed saffron inner border, slightly rotated.
- Ribbons: tilted marquee strips that speed up with scroll velocity.
- Wavy dividers between colour sections.
- Pill buttons, uppercase condensed.

## Motion (src/components/topas/Motion.tsx)
GSAP ScrollTrigger + SplitText with Lenis smooth scroll, all opt-in through data attributes:
- **Card rail**: the "Same look. Less pull." section pins while the 11 style cards (sorted by tension) slide sideways. Each card tilts and shrinks with its distance from the centre of the screen, over a giant outlined ghost word.
- **Steps**: "Four steps" pins; each step drops a new card on a pile (photo → trend → swap → stylist card).
- Headings rise word by word; stamps and tickets drop in tilted; rows of words drift sideways.
- Reduced motion: no pins or smoothing; the rail becomes a native swipeable row and every step's text shows.
