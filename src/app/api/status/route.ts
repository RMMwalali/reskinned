import { connection } from "next/server";
import { UNITS_PER_SCAN } from "@/lib/demo";
import { getCredit, hasKey } from "@/lib/youcam";

// Tells the UI whether scans are live or demo, without exposing the key.
export async function GET() {
  await connection();
  if (!hasKey()) return Response.json({ live: false, reason: "no-key" });
  const units = await getCredit();
  const live = units === null || units >= UNITS_PER_SCAN;
  return Response.json({ live, units, reason: live ? null : "budget" });
}
