import { YouCamError, friendlyError, getCredit, hasKey, runTask, uploadImage } from "@/lib/youcam";

export const maxDuration = 120;

// Try a lower-tension hairstyle on your own photo (YouCam Hairstyle Generator).
export async function POST(req: Request) {
  const form = await req.formData();
  const photo = form.get("photo");
  const templateId = String(form.get("template") ?? "");
  if (!photo || typeof photo === "string" || !templateId) {
    return Response.json({ error: "A photo and a style are required." }, { status: 400 });
  }
  if (!hasKey()) return Response.json({ mode: "demo", demoReason: "Try-on needs a live YouCam API key on this deployment." });
  const units = await getCredit();
  if (units !== null && units < 2) return Response.json({ mode: "demo", demoReason: `The API budget is used up (${units} units left).` });
  try {
    const bytes = new Uint8Array(await photo.arrayBuffer());
    const id = await uploadImage(bytes, "image/jpeg", "hair-transfer");
    const r = await runTask<{ url: string }>("hair-transfer", { src_file_id: id, template_id: templateId }, { version: "v2.1" });
    return Response.json({ mode: "live", url: r.url });
  } catch (e) {
    const c = e instanceof YouCamError ? e.code : "unknown_error";
    return Response.json({ error: friendlyError(c), code: c }, { status: 502 });
  }
}
