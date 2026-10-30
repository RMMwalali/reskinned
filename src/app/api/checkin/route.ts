import type { DensityTerm } from "@/lib/edges";
import { YouCamError, friendlyError, getCredit, hasKey, runTask, uploadImage } from "@/lib/youcam";

export const maxDuration = 120;

// One check-in = two takes of the tilted hairline photo (Hair Density ×2, so we
// can measure how repeatable the reading is), plus Hair Length on the front
// photo and, if side photos are given, Hair Type. At most 7 units.
const UNITS = 7;
// Skin Analysis (SD, 4 concerns) on the front photo: 9 units, only when asked.
const SKIN_UNITS = 9;
const SKIN_ACTIONS = ["redness", "moisture", "acne", "texture"];

type Failure = { feature: string; code: string; message: string };

async function fileOf(f: FormDataEntryValue | null) {
  if (!f || typeof f === "string") return null;
  if (f.size > 10 * 1024 * 1024) throw new YouCamError("Photo too large", "exceed_max_filesize");
  return { bytes: new Uint8Array(await f.arrayBuffer()), type: f.type || "image/jpeg" };
}

const TERMS: DensityTerm[] = ["Extremely Low Density", "Low Density", "Medium Density", "High Density"];
const termFor = (d: number): DensityTerm => TERMS[Math.min(3, Math.max(0, Math.floor((d / 3) * 4)))];

export async function POST(req: Request) {
  const form = await req.formData();
  let tiltA, tiltB, front, right, left;
  try {
    [tiltA, tiltB, front, right, left] = await Promise.all(["tiltA", "tiltB", "front", "right", "left"].map((k) => fileOf(form.get(k))));
  } catch {
    return Response.json({ error: "Photos must be under 10 MB." }, { status: 413 });
  }
  if (!tiltA) return Response.json({ error: "A hairline photo is required." }, { status: 400 });
  const wantSkin = form.get("skin") === "1" && Boolean(front);

  let demoReason: string | null = null;
  if (!hasKey()) demoReason = "No YouCam API key is configured on this deployment.";
  else {
    const units = await getCredit();
    if (units !== null && units < UNITS + (wantSkin ? SKIN_UNITS : 0)) demoReason = `The API budget is below one check-in (${units} units left).`;
  }

  if (demoReason) {
    // Clearly labelled sample reading so the flow can be tried without a key.
    const density = 2.12;
    return Response.json({
      mode: "demo",
      demoReason,
      density,
      spread: 0.06,
      term: termFor(density),
      length: front ? "above chest" : undefined,
      hairType: right && left ? "4a to 4b · Kinky Soft to Coily" : undefined,
      skin: wantSkin ? { redness: 74, moisture: 66, acne: 82, texture: 69 } : undefined,
      failures: [],
    });
  }

  const failures: Failure[] = [];
  const attempt = async <T,>(feature: string, fn: () => Promise<T>): Promise<T | null> => {
    try {
      return await fn();
    } catch (e) {
      const code = e instanceof YouCamError ? e.code : "unknown_error";
      // The density model wants one specific pose, so say exactly which.
      const message =
        feature === "hair-density" && code === "error_face_angle_invalid"
          ? "The hairline photo needs one pose: face the camera, then lower your head about 45° so your whole hairline shows, with your face still in frame."
          : friendlyError(code);
      failures.push({ feature, code, message });
      return null;
    }
  };

  const density = (img: { bytes: Uint8Array; type: string }) =>
    attempt("hair-density", async () => {
      const id = await uploadImage(img.bytes, img.type, "hair-density-detection");
      const r = await runTask<{ hair_density: { mapping: string; term: DensityTerm } }>("hair-density-detection", { src_file_id: id });
      return { value: Number(r.hair_density.mapping), term: r.hair_density.term };
    });

  const [d1, d2, len, type, skin] = await Promise.all([
    density(tiltA),
    tiltB ? density(tiltB) : Promise.resolve(null),
    front
      ? attempt("hair-length", async () => {
          const id = await uploadImage(front.bytes, front.type, "hair-length-detection");
          const r = await runTask<{ hair_length: { term: string } }>("hair-length-detection", { src_file_id: id });
          return r.hair_length.term;
        })
      : Promise.resolve(null),
    front && right && left
      ? attempt("hair-type", async () => {
          const ids = await Promise.all([front, right, left].map((f) => uploadImage(f.bytes, f.type, "hair-type-detection")));
          const r = await runTask<{ hair_type: { mapping: string; term: string } }>("hair-type-detection", { src_file_ids: ids });
          return `${r.hair_type.mapping} · ${r.hair_type.term}`;
        })
      : Promise.resolve(null),
    wantSkin && front
      ? attempt("skin", async () => {
          const id = await uploadImage(front.bytes, front.type, "skin-analysis");
          const r = await runTask<{ output: { type: string; ui_score: number }[] }>("skin-analysis", {
            src_file_id: id,
            dst_actions: SKIN_ACTIONS,
            miniserver_args: { enable_mask_overlay: false },
            format: "json",
          });
          return Object.fromEntries(r.output.filter((o) => SKIN_ACTIONS.includes(o.type)).map((o) => [o.type, Math.round(o.ui_score)]));
        })
      : Promise.resolve(null),
  ]);

  const readings = [d1, d2].filter((x): x is { value: number; term: DensityTerm } => !!x && Number.isFinite(x.value));
  if (!readings.length) {
    return Response.json({ error: failures[0]?.message ?? "The hairline reading failed. Please retake the photo.", failures }, { status: 502 });
  }
  const avg = readings.reduce((s, r) => s + r.value, 0) / readings.length;
  const spread = readings.length > 1 ? Math.abs(readings[0].value - readings[1].value) : 0;
  return Response.json({
    mode: "live",
    density: Math.round(avg * 100) / 100,
    spread: Math.round(spread * 100) / 100,
    term: readings.length > 1 && readings[0].term !== readings[1].term ? termFor(avg) : readings[0].term,
    length: len ?? undefined,
    hairType: type ?? undefined,
    skin: skin ?? undefined,
    failures,
  });
}
