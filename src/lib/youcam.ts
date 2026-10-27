// Server-only YouCam (Perfect Corp) S2S client. Never import this from a client
// component: the API key must stay on the server.
//
// Flow for every feature: declare file -> PUT bytes to presigned URL -> create
// task -> poll task until success/error. See docs/youcam-api-notes.md.

const BASE = process.env.YOUCAM_API_BASE ?? "https://yce-api-01.makeupar.com";

export class YouCamError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number,
  ) {
    super(message);
  }
}

export function hasKey(): boolean {
  return Boolean(process.env.YOUCAM_API_KEY);
}

function headers(): Record<string, string> {
  const key = process.env.YOUCAM_API_KEY;
  if (!key) throw new YouCamError("No YouCam API key configured", "NoApiKey");
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

async function readJson(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function errorFrom(status: number, body: Record<string, unknown>): YouCamError {
  const code = String(body.error_code ?? body.error ?? `HTTP${status}`);
  const message = String(body.error ?? body.error_message ?? body.raw ?? `YouCam request failed (${status})`);
  return new YouCamError(message, code, status);
}

/** Live task errors can arrive as a stringified tuple: "('message', 'error_code')". */
export function parseTaskError(raw: unknown, fallbackMessage?: unknown): { code: string; message: string } {
  const s = String(raw ?? "");
  const m = /\('(.+?)',\s*'(.+?)'\)/.exec(s);
  if (m) return { message: m[1], code: m[2] };
  return { code: s || "unknown_error", message: String(fallbackMessage || s || "The analysis failed") };
}

/** Upload one image and return its file_id. */
export async function uploadImage(bytes: Uint8Array, contentType: string, feature: string): Promise<string> {
  const body = JSON.stringify({
    files: [{ content_type: contentType, file_name: `rangi-${feature}.${contentType.includes("png") ? "png" : "jpg"}`, file_size: bytes.byteLength }],
  });
  // The feature-scoped path is what live integrations used; the bare path is the documented fallback.
  let res = await fetch(`${BASE}/s2s/v2.0/file/${feature}`, { method: "POST", headers: headers(), body });
  if (res.status === 404) res = await fetch(`${BASE}/s2s/v2.0/file`, { method: "POST", headers: headers(), body });
  const json = await readJson(res);
  if (!res.ok) throw errorFrom(res.status, json);

  const data = (json.data ?? json.result) as { files?: { file_id: string; requests: { method: string; url: string; headers: Record<string, string | number> }[] }[] };
  const file = data?.files?.[0];
  const req = file?.requests?.[0];
  if (!file?.file_id || !req?.url) throw new YouCamError("Unexpected upload response", "BadUploadResponse");

  const putHeaders: Record<string, string> = {};
  for (const [k, v] of Object.entries(req.headers ?? {})) putHeaders[k] = String(v);
  const put = await fetch(req.url, { method: req.method || "PUT", headers: putHeaders, body: Buffer.from(bytes) });
  if (!put.ok) throw new YouCamError(`Image upload failed (${put.status})`, "UploadFailed", put.status);
  return file.file_id;
}

type TaskOptions = { version?: "v2.0" | "v2.1"; timeoutMs?: number; intervalMs?: number };

/** Create a task and poll it to completion. Returns data.results. */
export async function runTask<T = Record<string, unknown>>(
  slug: string,
  payload: Record<string, unknown>,
  { version = "v2.0", timeoutMs = 90_000, intervalMs = 1_500 }: TaskOptions = {},
): Promise<T> {
  const create = await fetch(`${BASE}/s2s/${version}/task/${slug}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const cj = await readJson(create);
  if (!create.ok) throw errorFrom(create.status, cj);
  const taskId = (cj.data as { task_id?: string })?.task_id;
  if (!taskId) throw new YouCamError("No task id returned", "NoTaskId");

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, intervalMs));
    const poll = await fetch(`${BASE}/s2s/${version}/task/${slug}/${encodeURIComponent(taskId)}`, { headers: headers() });
    const pj = await readJson(poll);
    if (!poll.ok) throw errorFrom(poll.status, pj);
    const d = pj.data as { task_status?: string; results?: T; error?: unknown; error_message?: unknown };
    if (d?.task_status === "success") return d.results as T;
    if (d?.task_status === "error") {
      const e = parseTaskError(d.error, d.error_message);
      throw new YouCamError(e.message, e.code);
    }
  }
  throw new YouCamError("The analysis took too long", "TaskTimeout");
}

/** Remaining API units (sum across token types), or null if unavailable. */
export async function getCredit(): Promise<number | null> {
  if (!hasKey()) return null;
  try {
    const res = await fetch(`${BASE}/s2s/v1.0/client/credit`, { headers: headers(), cache: "no-store" });
    if (!res.ok) return null;
    const j = (await res.json()) as { results?: { amount?: number }[] };
    return (j.results ?? []).reduce((s, r) => s + (Number(r.amount) || 0), 0);
  } catch {
    return null;
  }
}

/** Friendly, non-blaming copy for the image-check errors YouCam can return. */
export function friendlyError(code: string): string {
  const map: Record<string, string> = {
    error_insufficient_lighting: "The photo is too dim. Face a window or step into daylight.",
    error_face_position_too_small: "Your face is too small in the frame. Hold the phone a little closer.",
    error_src_face_too_small: "Your face is too small in the frame. Hold the phone a little closer.",
    error_face_position_out_of_boundary: "Your face goes past the edge of the photo. Step back slightly.",
    error_face_position_invalid: "We couldn't see your whole face. Keep your face and the top of your hair in frame.",
    error_face_angle_invalid: "The head angle didn't fit. Look straight ahead for the front photo, and turn clearly for the side photos.",
    error_mismatch_image_size: "The three photos came out different sizes. Retake them in one go.",
    error_no_face: "We couldn't find a face in the photo.",
    error_no_shoulder: "Try-on needs your shoulders in the photo.",
    error_hair_too_short: "Your hair is too short for this try-on.",
    CreditInsufficiency: "The demo has used up its API budget for now.",
    TaskTimeout: "The analysis took too long. Please try again.",
  };
  return map[code] ?? "Something went wrong with this photo. Try again in even light, looking straight at the camera.";
}
