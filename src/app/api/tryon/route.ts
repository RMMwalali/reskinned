import { findCode } from "@/lib/codes";
import { UNITS_PER_TRYON } from "@/lib/demo";
import { YouCamError, friendlyError, getCredit, hasKey, runTask, uploadImage } from "@/lib/youcam";

export const maxDuration = 120;

// Colour try-on: re-colours the shopper's own hair to a measured or coded hex,
// so she sees the extension colour on herself before buying.
export async function POST(req: Request) {
  const form = await req.formData();
  const photo = form.get("photo");
  const code = String(form.get("code") ?? "");
  const hexIn = String(form.get("hex") ?? "");
  const hex = /^#[0-9a-f]{6}$/i.test(hexIn) ? hexIn : findCode(code)?.hex;

  if (!photo || typeof photo === "string" || !hex) {
    return Response.json({ error: "A photo and a colour are required." }, { status: 400 });
  }
  if (!hasKey()) {
    return Response.json({ mode: "demo", demoReason: "Try-on needs a live YouCam API key on this deployment." });
  }
  const units = await getCredit();
  if (units !== null && units < UNITS_PER_TRYON) {
    return Response.json({ mode: "demo", demoReason: `The API budget is used up (${units} units left).` });
  }

  try {
    const bytes = new Uint8Array(await photo.arrayBuffer());
    const id = await uploadImage(bytes, photo.type || "image/jpeg", "hair-color");
    const r = await runTask<{ url: string }>("hair-color", {
      src_file_id: id,
      pattern: { name: "full" },
      palettes: [{ color: hex, color_intensity: 85, shine_intensity: 35 }],
    });
    return Response.json({ mode: "live", url: r.url, hex });
  } catch (e) {
    const c = e instanceof YouCamError ? e.code : "unknown_error";
    return Response.json({ error: friendlyError(c), code: c }, { status: 502 });
  }
}
