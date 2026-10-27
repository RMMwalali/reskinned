# Rangi — will your hair blend?

Rangi measures your natural hair (colour, curl pattern and length) and tells you which wig, weave or braiding hair will blend with it, then shows the colour on your own photo before you buy. Hair vendors get a *Will it blend?* link to send customers on WhatsApp before they pay.

Built for the [YouCam API Skin AI & eCommerce Hackathon](https://youcam-api-skin-ai-ecommerce.devpost.com/). *Rangi* is Swahili for colour.

## Why

Most hair in Kenya is sold from a vendor's photo on WhatsApp or Instagram. Buyers guess between colour codes (1, 1B, 2…) and textures (kinky straight, afro kinky…) that have no industry standard, and the mismatch shows exactly where a leave-out meets the bundle.

## How it works

| Step | Engine | Decides |
|---|---|---|
| Curl pattern from front, right and left photos | YouCam **Hair Type Detection** | Extension texture (adjusted for natural, stretched or relaxed leave-out) |
| Length band | YouCam **Hair Length Detection** | Install type: leave-out sew-in, closure or full wig |
| Hair colour class and lighting quality | YouCam **Skin Tone Analysis** | Independent cross-check on Rangi's colour reading |
| Tapped hair pixels → robust mean → CIEDE2000 vs every code | Rangi colour engine (`src/lib/colour.ts`) | Colour code, with "between two codes" detection |
| Recolour your own hair to the matched hex | YouCam **Hair Color** | Visual proof at the hairline |

Every result carries a confidence level with plain-language reasons (`src/lib/match.ts`). Disagreement between YouCam and Rangi, poor light, a mixed sample or a split reading all lower it. See `/method` in the app.

## Run it

```bash
npm install
cp .env.example .env.local   # add YOUCAM_API_KEY
npm run dev
```

Without a key the app runs in a labelled demo mode: YouCam values are samples, your colour measurement is still real. The server checks the unit balance before each scan (24 units) and falls back to demo when the budget runs out. The API key never reaches the browser.

```bash
npm test     # colour science + matching (incl. Sharma et al. CIEDE2000 reference pairs)
npm run build
```

## Privacy

Photos are resized on the phone, sent to YouCam for one scan, and never stored by Rangi. No accounts. Vendor links encode only product details in the URL. Rangi measures colour and curl. It never estimates race, ethnicity, age or identity.

## Stack

Next.js 16 (App Router), TypeScript, CSS Modules, Vitest. YouCam S2S API v2.0. API notes: `docs/youcam-api-notes.md`.
