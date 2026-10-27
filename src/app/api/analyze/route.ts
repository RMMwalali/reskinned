import { DEMO_YOUCAM, UNITS_PER_SCAN } from "@/lib/demo";
import { matchHair, type HairLengthTerm, type HairTypeMapping, type LeaveOutState, type Measurements } from "@/lib/match";
import { YouCamError, friendlyError, getCredit, hasKey, runTask, uploadImage } from "@/lib/youcam";

export const maxDuration = 120;

type Failure = { feature: string; code: string; message: string };

async function bytesOf(f: FormDataEntryValue | null): Promise<{ bytes: Uint8Array; type: string } | null> {
  if (!f || typeof f === "string") return null;
  return { bytes: new Uint8Array(await f.arrayBuffer()), type: f.type || "image/jpeg" };
}

export async function POST(req: Request) {
  const form = await req.formData();
  const front = await bytesOf(form.get("front"));
  const right = await bytesOf(form.get("right"));
  const left = await bytesOf(form.get("left"));
  const sampleHex = String(form.get("sampleHex") ?? "");
  const spread = Number(form.get("sampleSpread") ?? 0);
  const n = Number(form.get("sampleN") ?? 0);
  const leaveOut = (String(form.get("leaveOut") ?? "natural") as LeaveOutState);

  if (!front || !/^#[0-9a-f]{6}$/i.test(sampleHex)) {
    return Response.json({ error: "A front photo and a hair colour sample are required." }, { status: 400 });
  }
  for (const f of [front, right, left]) {
    if (f && f.bytes.byteLength > 10 * 1024 * 1024) {
      return Response.json({ error: "Photos must be under 10 MB." }, { status: 413 });
    }
  }

  const sample = { hex: sampleHex.toUpperCase(), spread, n };

  // Demo mode: no key, or the budget guard trips. Always labelled in the UI.
  let demoReason: string | null = null;
  if (!hasKey()) demoReason = "No YouCam API key is configured on this deployment.";
  else {
    const units = await getCredit();
    if (units !== null && units < UNITS_PER_SCAN) demoReason = `The API budget is below one scan (${units} units left).`;
  }
  if (demoReason) {
    const measurements: Measurements = { ...DEMO_YOUCAM, sample, leaveOut };
    const match = matchHair(measurements);
    // Demo values can't justify high confidence, so cap it and say why.
    if (match.confidence.level === "high") match.confidence.level = "medium";
    match.confidence.reasons.unshift("Curl pattern, length and YouCam's colour check are demo values, so this can't be high confidence.");
    return Response.json({ mode: "demo", demoReason, measurements, match, failures: [] });
  }

  const failures: Failure[] = [];
  const attempt = async <T,>(feature: string, fn: () => Promise<T>): Promise<T | null> => {
    try {
      return await fn();
    } catch (e) {
      const code = e instanceof YouCamError ? e.code : "unknown_error";
      failures.push({ feature, code, message: friendlyError(code) });
      return null;
    }
  };

  const [hairType, hairLength, skinTone] = await Promise.all([
    right && left
      ? attempt("hair-type", async () => {
          const ids = await Promise.all([
            uploadImage(front.bytes, front.type, "hair-type-detection"),
            uploadImage(right.bytes, right.type, "hair-type-detection"),
            uploadImage(left.bytes, left.type, "hair-type-detection"),
          ]);
          // Order per spec: front, RIGHT, left.
          const r = await runTask<{ hair_type: { mapping: HairTypeMapping; term: string } }>("hair-type-detection", { src_file_ids: ids });
          return r.hair_type;
        })
      : Promise.resolve(null),
    attempt("hair-length", async () => {
      const id = await uploadImage(front.bytes, front.type, "hair-length-detection");
      const r = await runTask<{ hair_length: { term: HairLengthTerm } }>("hair-length-detection", { src_file_id: id });
      return r.hair_length;
    }),
    attempt("skin-tone", async () => {
      const id = await uploadImage(front.bytes, front.type, "skin-tone-analysis");
      const r = await runTask<{
        face_quality?: { lighting?: string };
        color: { hair_color: string; hair_color_name: string; eyebrow_color?: string; skin_color?: string };
      }>("skin-tone-analysis", { src_file_id: id, face_angle_strictness_level: "medium" });
      return {
        hairColor: r.color.hair_color,
        hairColorName: r.color.hair_color_name,
        eyebrowColor: r.color.eyebrow_color,
        skinColor: r.color.skin_color,
        lighting: r.face_quality?.lighting,
      };
    }),
  ]);

  const measurements: Measurements = { hairType, hairLength, skinTone, sample, leaveOut };
  return Response.json({ mode: "live", measurements, match: matchHair(measurements), failures });
}
