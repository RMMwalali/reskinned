import { connection } from "next/server";
import { hasKey, listTemplates, type Template } from "@/lib/youcam";

// Lists the hairstyle try-on templates available on this account, tagged with
// a best-guess style family from their titles, so the planner can offer
// lower-tension looks to try on.

const FAMILY: [RegExp, string][] = [
  [/knotless|box|braid|cornrow|twist|plait/i, "braids"],
  [/loc|dread/i, "locs"],
  [/afro|natural|curl|coil|puff|kinky/i, "natural"],
  [/pony|bun|updo|top ?knot/i, "updo"],
  [/bob|straight|wave|layer|long|lob|pixie/i, "wig"],
];

export async function GET() {
  await connection();
  if (!hasKey()) return Response.json({ mode: "demo", templates: [] });
  try {
    const raw: Template[] = await listTemplates("hair-transfer", "v2.1");
    const templates = raw.map((t) => ({ ...t, family: FAMILY.find(([re]) => re.test(`${t.title} ${t.category_name ?? ""}`))?.[1] ?? "other" }));
    return Response.json({ mode: "live", templates });
  } catch {
    return Response.json({ mode: "live", templates: [], error: "Couldn't load try-on styles right now." });
  }
}
