import { connection } from "next/server";
import { YouCamError, friendlyError, getCredit, hasKey, listTemplates, runTask, uploadImage, type Template } from "@/lib/youcam";

export const maxDuration = 120;

// "Look fuller now": YouCam Hair Volume, Bangs and Hair Color try-ons on a
// front photo. Each one is a styling or product answer to visible thinning
// while a treatment works. 2 units per look.

const SLUG = { volume: "hair-vol", bangs: "hair-bang", color: "hair-color" } as const;
type Kind = keyof typeof SLUG;
const COLORS = ["Jet Black", "Chocolate Brown", "Ash Gray"] as const;

export async function GET(req: Request) {
  await connection();
  const kind = new URL(req.url).searchParams.get("kind") as Kind | null;
  if (kind === "color") return Response.json({ mode: hasKey() ? "live" : "demo", templates: COLORS.map((c) => ({ id: c, title: c })) });
  if (kind !== "volume" && kind !== "bangs") return Response.json({ error: "Unknown look." }, { status: 400 });
  if (!hasKey()) return Response.json({ mode: "demo", templates: [] });
  try {
    const t: Template[] = await listTemplates(SLUG[kind], "v2.0", 24);
    return Response.json({ mode: "live", templates: t.map(({ id, title, thumb }) => ({ id, title, thumb })) });
  } catch {
    return Response.json({ mode: "live", templates: [], error: "Couldn't load looks right now." });
  }
}

export async function POST(req: Request) {
  const form = await req.formData();
  const photo = form.get("photo");
  const kind = String(form.get("kind")) as Kind;
  const option = String(form.get("option") ?? "");
  if (!photo || typeof photo === "string" || !(kind in SLUG) || !option) {
    return Response.json({ error: "A photo and a look are required." }, { status: 400 });
  }
  if (!hasKey()) return Response.json({ mode: "demo", demoReason: "Try-on needs a live YouCam API key on this deployment." });
  const units = await getCredit();
  if (units !== null && units < 2) return Response.json({ mode: "demo", demoReason: `The API budget is used up (${units} units left).` });
  try {
    const id = await uploadImage(new Uint8Array(await photo.arrayBuffer()), "image/jpeg", SLUG[kind]);
    const body: Record<string, unknown> =
      kind === "color" ? { src_file_id: id, preset: option, pattern: { name: "full" } } : { src_file_id: id, template_id: option };
    const r = await runTask<{ url: string }>(SLUG[kind], body);
    return Response.json({ mode: "live", url: r.url });
  } catch (e) {
    const c = e instanceof YouCamError ? e.code : "unknown_error";
    return Response.json({ error: friendlyError(c), code: c }, { status: 502 });
  }
}
