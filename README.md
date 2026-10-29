# edge.wise — catch it while it can grow back

edge.wise tracks your hairline between installs and catches styling-related thinning (traction hair loss from tight braids, cornrows, weaves, glued wigs, slick buns) while it can still be reversed. It plans gentler versions of the styles you want, shows them on you, and gives your stylist a card telling them how to install gently.

Built for the [YouCam API Skin AI & eCommerce Hackathon](https://youcam-api-skin-ai-ecommerce.devpost.com/).

## The problem

- In an American Academy of Dermatology survey of **5,594** African-American women, **47.6%** reported hair loss on the crown or top of the scalp, and **81.4% had never seen a doctor** about it. Braids, weaves and relaxers were linked to it. ([summary](https://www.sciencedaily.com/releases/2016/03/160304093239.htm))
- A Johns Hopkins review estimates **one-third** of African-American women have traction alopecia, and rates braids with extensions, weaves and glued wigs highest risk. ([summary](https://hub.jhu.edu/2016/05/05/risky-hairstyles-traction-alopecia))
- Trichologists warn the mainstream slicked-back bun trend causes it too, and that it's **reversible early, permanent late**.
- Real cases: Kenyan women describe depression, teasing, being turned away from ceremonies, and growth creams that irritated their skin ([The Standard](https://www.standardmedia.co.ke/evewoman/living/article/2001523478/struggle-of-traction-alopecia-among-kenyan-women)).
- Wigs and extensions are an **$8.1B** global market (2025), growing to **$15.7B by 2034**.

The gap: hair loss caught early is more likely to be reversible, but nobody tracks the hairline between installs. Dermatologists call the stylist "the front line", yet stylists never see the history.

## What it does

| | |
|---|---|
| **Check in** (`/check`) | Current style, weeks worn, extensions, relaxer, and how it feels (pain, broken edges, crown itching). Then two hairline photos. |
| **Measure** | YouCam **Hair Density Detection** runs on *both* takes; the gap between them flags unreliable readings. **Hair Length** and (with side photos) **Hair Type Detection** add context. |
| **Track** (`/dashboard`) | Your own baseline, change vs baseline, consecutive declines, and a 6-month **tension load** (style tension × weeks, weighted to recent). Status: **Steady / Watch / Act now**, each with plain-language reasons and next steps. Routes to a dermatologist when it matters. |
| **Plan** (`/plan`) | Gentler ways to get the look you want (knotless vs knotted, glueless vs glued, bigger/shorter, edges left out), with install rules from the AAD, and **YouCam Hairstyle Generator** try-on. |
| **Share** (`/card/…`) | A stylist card (status, what to avoid, how to install gently) shared by link, WhatsApp or the share sheet. No photos inside. |

Engine: `src/lib/edges.ts` (deterministic, every rule cites its source), tests in `src/lib/edges.test.ts`. Methods, rules, limits and sources are public at `/method`.

## Honesty and privacy

- Cosmetic tracking, not a diagnosis. It never names a condition as yours.
- Photos are resized on the phone, sent to YouCam for one check-in, never stored. History (numbers only) stays in the browser and can be deleted. No accounts.
- Without an API key, or when the unit budget runs out, readings are clearly labelled demo values. A sample history is available and always marked.

## Run it

```bash
npm install
cp .env.example .env.local   # add YOUCAM_API_KEY
npm run dev
npm test
```

Next.js 16, TypeScript, react-three-fiber (landing page), Vitest. YouCam S2S API v2.0/v2.1, notes in `docs/youcam-api-notes.md`. A full check-in costs at most 7 units.
