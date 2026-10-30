# edge.wise — know if your hair treatment is working

Hair-loss treatments take months to show results, and most people quit before they do. edge.wise measures your hairline against your own starting point every month with YouCam AI, tells you where you are against the usual results window for your treatment, and keeps your routine stocked through a partner brand's shop. Brands and clinics embed it to keep subscribers past month six.

Built for the [YouCam API Skin AI & eCommerce Hackathon](https://youcam-api-skin-ai-ecommerce.devpost.com/).

## The problem, and who pays

- **People quit before results show.** In a study of 400 patients at a dermatology clinic, **86.3% stopped topical minoxidil**, most within six months ([Dermatology and Therapy, 2023](https://link.springer.com/article/10.1007/s13555-023-00919-x)).
- **Results take months.** Minoxidil usually takes **6–12 months**; finasteride about **4 months** to notice improvement ([American Academy of Dermatology](https://www.aad.org/public/diseases/hair-loss/treatment/diagnosis-treat)).
- **It's a large, growing subscription market.** Hims & Hers reports year-on-year subscriber growth above **45% in men's and 170% in women's hair loss**, and about **$84** monthly revenue per subscriber company-wide ([Q1 2025 shareholder letter](https://www.sec.gov/Archives/edgar/data/1773751/000177375125000152/finalq12025shareholderle.htm)).
- **Who pays:** treatment brands, telehealth services, pharmacies and clinics, per active user. Every subscriber kept past month six is months of revenue they would otherwise lose. Consumers use it free.
- **Brands already pay to fight this, without measurement.** Hims runs a month-3 hair check-in questionnaire; Nutrafol's app has a photo log and its Real Growth Guarantee requires three sets of photos in fixed windows, graded by hand. Consumer tracker apps exist but sit outside the brand; clinic imaging (e.g. Canfield HairMetrix) needs in-office hardware.
- **Traction hair loss** (tight braids, glued wigs, slick buns) is supported too: choosing "Gentler styles" adds style-tension tracking, gentler-style planning with YouCam try-on, and a stylist card.

## What it does

| | |
|---|---|
| **Plan** (`/dashboard`) | Pick your treatments (minoxidil, finasteride, spironolactone, PRP, microneedling, laser, ketoconazole, gentler styles) and start dates. |
| **Check in monthly** (`/check`) | Two hairline photos, head lowered 45°. YouCam **Hair Density Detection** runs on both takes; the gap between them flags unreliable readings. **Hair Length** and **Hair Type Detection** add context. |
| **Progress report** | Baseline, change, month on treatment and the results window. Verdicts: *Started / On track / Early dip / Holding / Working / Talk to your prescriber*. A nudge through the months when most people quit. Side-by-side thumbnails kept only on the phone. |
| **Two hairline measures** | YouCam **Hair Density** (tilted photo, two takes) and **Face Analyzer** horizontal thirds (front photo: the top third grows as a hairline recedes). The report says whether they agree. |
| **Breakage** | YouCam **Hair Frizziness Detection** on front and side photos; breakage can look like thinning. |
| **Look fuller now** (`/fuller`) | YouCam **Hair Volume**, **Bangs** and **Hair Color** try-ons on a front photo, each linked to fibers, a topper, a fringe cut or a colour booking. Labelled as illustrations. |
| **Picked for you** | A signal → product engine: each reading (skin, breakage, density, hairline height) maps to a reason and a product in the routine shop. |
| **Skin check** | Optional: YouCam **AI Skin Analysis** (redness, moisture, breakouts, texture) on the front photo each month. Irritation rising on minoxidil solution suggests the propylene-glycol-free foam and a fragrance-free moisturizer, one tap into the cart. |
| **Guarantee photos** | Results guarantees need standardized photos in set windows (days 1–37, 97–127, 187–217), graded by hand today. The monthly check-in fills them and exports an evidence pack with the measured trend. |
| **Routine shop** | Run-out reminders and a cart with the partner brand's products; prescription items route to the prescriber, clinic treatments to booking. Demo checkout, clearly labelled. |
| **For brands** (`/brands`) | The retention case, alternatives, guarantee automation, ROI calculator, pilot plan and pricing. |
| **Partner portal** (`/brands/portal`) | Sample cohort: KPIs, the published drop-off curve, guarantee evidence, and a ranked at-risk list with tailored nudges. |
| **Gentler styles** (`/plan`, `/card/…`) | For traction hair loss: gentler versions of a style with **YouCam Hairstyle Generator** try-on, and a stylist card. |

Engines: `src/lib/treatments.ts` (treatment timelines and progress verdicts) and `src/lib/edges.ts` (trend and style tension), both deterministic and unit-tested. Methods, timelines, limits and sources are public at `/method`.

## Honesty and privacy

- Cosmetic tracking, not a diagnosis. It never names a condition as yours or judges whether a treatment works medically; the prescriber does.
- Photos are resized on the phone and sent to YouCam for one check-in; edge.wise keeps no copy on its servers. History, plan and small thumbnails stay in the browser and can be deleted. No accounts.
- Every shop listing on the demo is a sample; no payment is taken.
- Without an API key, or when the unit budget runs out, readings are clearly labelled demo values. A sample history is available and always marked.

## Testing it (for judges)

- **Live:** https://reskinned.vercel.app, free and open, no login.
- **Fastest tour:** My progress → **See a sample** (seven months on minoxidil: report, two hairline measures, skin check, picked-for-you products, cart, guarantee photos) → **Look fuller** (add a front photo, try Volume, Fringe or Colour) → **For brands** → **Partner portal**.
- **Real check-in:** Check in → two photos with the head lowered about 45°; add a front photo and both sides for hairline height, length, curl pattern, breakage and the skin check.
- Readings run on the live YouCam API. If the API budget runs low, results are clearly labelled demo values so the app keeps working.
- Shop listings are samples; checkout takes no payment.

## Run it locally

```bash
npm install
cp .env.example .env.local   # add YOUCAM_API_KEY
npm run dev
npm test
```

Next.js 16, TypeScript, react-three-fiber (landing page), Vitest. YouCam S2S API v2.0/v2.1, notes in `docs/youcam-api-notes.md`. A full check-in costs at most 7 units.

## License

MIT. Stock photos are from Pexels under the Pexels License (credits at `/method#credits`).
