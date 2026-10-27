# YouCam (Perfect Corp) S2S API notes

Compiled 2026-10-27. Base: `https://yce-api-01.makeupar.com`. Auth on every call: `Authorization: Bearer <API_KEY>`, `Content-Type: application/json`.

Sources:
- [DOCS]: OpenAPI bundles `docs.perfectcorp.com/_bundle/reference/<name>.json` (ai_hair_type_detection, ai_hair_length_detection, ai_skin_tone_analysis, ai_hair_extension, ai_hair_color), `reference/ai_hairstyle` + integration guide, `developers/unit_system/.../client/credit/get.md`.
- [ALOUD]: github.com/StephenSook/aloud `lib/youcam.ts` + `tests/fixtures/youcam/*.json` (live-verified 2026-07/08).
- [SHADESPAN]: github.com/Abhinav0905/shadespan `src/shadespan/youcam/{endpoints,client}.py` (live-verified 2026-08-16).

Caveat: docs.perfectcorp.com was blocked for raw download, so the bundles were read through a summarising fetcher. Field names, paths and enums below are as that fetcher reported them from the spec. Prose descriptions are paraphrased. The repo code was read directly and is verbatim.

## Conventions (all v2.0 tasks)

- Create: `POST /s2s/v2.0/task/<slug>` with a flat JSON body. Response `200`: `{"status": 200, "data": {"task_id": "<string>"}}`. `task_id` can be queried for 24 h.
- Poll: `GET /s2s/v2.0/task/<slug>/{task_id}`. The task id goes in the path, not in `?task_id=`.
- Poll `200`: `{"status": int, "data": {"task_status": "running"|"success"|"error", "error": <string|null>, "error_message": <string>, "results": {...}}}`
- Output-image features return `data.results.url`, a single object (not an array). The link is valid for 2 h.
- No units are consumed while a task is `running`. [ALOUD] measured that failed tasks bill 0. If a task succeeds but is never polled, units are still consumed and a later poll returns `InvalidTaskId`.
- v1.0 is a trap ([SHADESPAN]). It uses a nested `request_id`/`payload`/`actions` body, polls with `?task_id=`, and replies under `result` instead of `data`. Do not mix the two versions.
- Feature slug confirmed by [SHADESPAN]: apparel is `cloth`, not `clothes`/`apparel`.
- Every source file needs either `src_file_id` (from the file API) or `src_file_url` (a public URL).

## 1. File upload

Path variants:
- `POST /s2s/v2.0/file`: the path given in [DOCS] prose and in the hairstyle integration guide. The path is not defined under `paths` in any bundle.
- `POST /s2s/v2.0/file/{feature}`: [ALOUD] used this live with feature `skin-analysis` and `skin-tone-analysis`, and it worked.
- `POST /s2s/v1.1/file/{feature}`: [SHADESPAN] used this live. It replies under `result`, not `data`.
- For hair features, the `{feature}` slug is presumably the task slug (`hair-type-detection`, `hair-ext`, `hair-color`, ...). UNCONFIRMED. Fallback: `POST /s2s/v2.0/file` with no slug.

Request (schema `FileV1.1`):
```json
{"files": [{"content_type": "image/jpg", "file_name": "my-selfie.jpg", "file_size": 50000}]}
```
- All three item fields are required.
- `file_size` is an integer in bytes, at most 10MB.
- `content_type`: the spec says "values listed in the enum", but no enum is defined. The example is `image/jpg`. [ALOUD] and [SHADESPAN] send `image/jpeg` and `image/png`.

Response (schemas `FileResponseV2` and `BasicFileResponse`):
```json
{"status": 200,
 "data": {"files": [{
   "content_type": "image/jpg",
   "file_name": "my-selfie.jpg",
   "file_id": "U8aqJbsXGT537jtGnEDFHqxdDXqh8+oTF/cSkLimzuvVwMP+Jb1XbjPsf7ZgUgLY",
   "requests": [{"method": "PUT", "url": "https://example.com/presigned-upload-url",
                 "headers": {"Content-Type": "image/jpg", "Content-Length": 50000}}]}]}}
```

Upload the bytes:
- Send `PUT` to `data.files[0].requests[0].url` with exactly `requests[0].headers` and the raw bytes as the body.
- [ALOUD] reads `body.data.files[0].file_id` and `.requests[0].url/.headers`.
- If you skip the PUT, the AI task later fails with 500/404 ([DOCS], skin tone).
- `file_id` strings contain `+`, `/` and `=`, so URL-encode them if they ever go into a URL.

## 2. AI Hair Type Detection

- `POST /s2s/v2.0/task/hair-type-detection`
- `GET  /s2s/v2.0/task/hair-type-detection/{task_id}`

Create body (anyOf):
- `src_file_ids`: `string[]`, minItems 3, maxItems 3, ordered front, right, left.
- Or `src_file_urls`: `string[]`, 3 items, same order.
- There are NO separate `front`/`left`/`right` fields.
- The order is front, RIGHT, LEFT per the spec. Note that it is not front, left, right.

Poll `200` (schema `TaskStatusResponseHairType`):
```json
{"status": 200, "data": {"task_status": "success", "error": null, "error_message": "",
  "results": {"hair_type": {"mapping": "3c to 4a", "term": "Tight Curls to Kinky Soft"}}}}
```
`results.hair_type.mapping` enum (index-paired with `term`):

| mapping | term |
|---|---|
| `1 to 2a` | `Straight to Slight Wavy` |
| `2a to 2b` | `Slight to Medium Wavy` |
| `2b to 2c` | `Medium to Thick Wavy` |
| `2c to 3a` | `Thick Wavy to Loose Curls` |
| `3a to 3b` | `Loose to Medium Curls` |
| `3b to 3c` | `Medium to Tight Curls` |
| `3c to 4a` | `Tight Curls to Kinky Soft` |
| `4a to 4b` | `Kinky Soft to Coily` |
| `4b to 4c` | `Coily to Extremely Coily` |

The pairing of `mapping` to `term` assumes both enums are listed in the same order. UNCONFIRMED.

- `data.error` (EngineErrorCode): `exceed_max_filesize`, `invalid_parameter`, `error_download_image`, `error_download_mask`, `error_decode_image`, `error_decode_mask`, `error_nsfw_content_detected`, `error_no_face`, `error_pose`, `error_face_parsing`, `error_inference`, `exceed_nsfw_retry_limits`, `error_upload`, `unknown_internal_error`
- Image-check codes (from the spec's file table; where they are surfaced is UNCONFIRMED): `error_mismatch_image_size` (all 3 photos must be the same size), `error_below_min_image_size`, `error_face_position_invalid`, `error_face_position_too_small`, `error_face_position_out_of_boundary`, `error_insufficient_lighting`, `error_face_angle_invalid` (front shot within 10°, side shots more than 15°)
- Image requirements:
  - jpg or png, under 10MB.
  - 320 to 4096 px per side. Sides over 1080 px are auto-downscaled.
  - The face should fill about 50 to 80% of the image width.
- Cost: 2 units.

## 3. AI Hair Length Detection

- `POST /s2s/v2.0/task/hair-length-detection`
- `GET  /s2s/v2.0/task/hair-length-detection/{task_id}`

Create body (`BasicRunTaskV2`): `src_file_id` or `src_file_url`. This is a single image.

Poll `200` (`TaskStatusResponseHairLength`):
- `data.results.hair_length.term`, enum: `above the ears`, `ear length`, `ear length or longer`, `short hair`, `short hair or longer`, `above chest`, `above chest or longer`, `long hair`
- `data.error`: same EngineErrorCode list as hair type.
- Image-check codes: `error_below_min_image_size`, `error_face_position_invalid`, `error_face_position_too_small`, `error_face_position_out_of_boundary`, `error_insufficient_lighting`, `error_face_angle_invalid` (within 10°)
- Image requirements:
  - jpg or png, under 10MB, 320 to 4096 px. Sides over 1080 px are auto-resized.
  - One forward-facing selfie with the face fully visible.
  - Hair down over the chest, not tied up.
- Cost: 2 units.

## 4. AI Skin Tone Analysis ("AI Facial Color Tones Analyzer")

- `POST /s2s/v2.0/task/skin-tone-analysis`
- `GET  /s2s/v2.0/task/skin-tone-analysis/{task_id}`
- [ALOUD] confirmed these paths live.

Create body (`RunSkinToneAnalysisTaskV2`):
- `src_file_id` or `src_file_url`.
- Optional `face_angle_strictness_level`: `strict` | `high` (default) | `medium` | `low` | `flexible`
- Tolerance by level:
  - `strict`: pitch, yaw and roll at most 4°/6°/4°
  - `high`: 10°
  - `medium`: 15°
  - `low`: 20°
  - `flexible`: 30°
- [ALOUD] also sends `"format": "json"`, which is accepted. The field is not in the spec.

Poll `200` (`SkinToneAnalysisTaskStatusResponseV2`). Shape of `data.results`:
```json
{"face_quality": {"has_face": true, "area": "<str>", "frontal": "<str>", "lighting": "<str>", "faceangle": "<str>"},
 "color": {"skin_color": "#RRGGBB", "eye_color": "#RRGGBB", "eye_color_name": "Brown",
           "lip_color": "#RRGGBB", "eyebrow_color": "#RRGGBB",
           "hair_color": "#000000", "hair_color_name": "Black"}}
```
- YES, HAIR COLOUR IS RETURNED: `color.hair_color` (hex) plus `color.hair_color_name`.
  - `hair_color` is a quantised hex from a fixed enum, not measured RGB: `#a0a0a0`, `#722626`, `#000000`, `#FAF0BE`, `#42280E`, `#808080`, `#B56637`.
  - `hair_color_name` enum: `Auburn`, `Black`, `Blonde`, `Brown`, `Grey/White`, `Red`.
  - The spec defines no hex-to-name map, and its own sample pairs `#a0a0a0` with `Auburn`. Do not derive one from the other. The name-to-hex mapping is UNCONFIRMED.
- `eye_color_name` enum: `Amber`, `Brown`, `Green`, `Blue`, `Gray`, `Other`.
- Hex fields match the pattern `^#([A-Fa-f0-9]{6})$`.
- The value strings of the `face_quality` fields are UNCONFIRMED. [ALOUD] reads `face_quality.lighting`.
- `data.error` adds `error_exceed_max_image_size` to the EngineErrorCode list.
- Image-check codes: `error_below_min_image_size`, `error_face_position_invalid`, `error_face_position_too_small`, `error_face_position_out_of_boundary`, `error_face_not_forward_facing`, `error_face_angle_upward`, `error_face_angle_downward`, `error_face_angle_leftward`, `error_face_angle_rightward`, `error_face_angle_left_tilt`, `error_face_angle_right_tilt`
- Image requirements:
  - jpg, jpeg or png, under 10MB, 320 to 4096 px. Sides over 1080 px are auto-resized.
  - A single person, face forward and centred.
  - Face width over 60% of the image width.
- Cost: 20 units, charged on success only. [ALOUD] observed that the parallel skin-tone call did not change their measured balance. Treat that observation as anecdotal.

## 5. AI Hair Extension

- List templates: `GET /s2s/v2.0/task/template/hair-ext?page_size=<1..20, default 20>&starting_token=<next_token>`
  - Omit `starting_token` (or send null) for the first page.
- Create: `POST /s2s/v2.0/task/hair-ext`, body `{"template_id": "<string, required>", "src_file_id": "<id>"}`. Use `src_file_url` in place of `src_file_id` if needed.
- Poll: `GET /s2s/v2.0/task/hair-ext/{task_id}`. The result is in `data.results.url` (2 h).

Template list `200` (`TemplateResponseSchema`):
```json
{"status": 200, "data": {"templates": [{"id": "good_template_001", "thumb": "<url>", "title": "<str>", "category_name": "<str>"}],
                         "next_token": "73a3c9e69b89"}}
```
- `id` is the value to send as `template_id`.
- TEMPLATE CATALOGUE: UNCONFIRMED.
  - Neither the spec nor the product page lists any template id, title or category. The only example id is `good_template_001`.
  - The product page mentions only "lengths from long to extra-long", bangs, styles and colours.
  - No braids, kinky, coily, afro, locs or textured styles appear anywhere in the public docs.
  - The real list is only available from the live list endpoint, which needs an API key. Call it before assuming textured or kinky coverage.
- `data.error` enum: `exceed_max_filesize`, `invalid_parameter`, `error_download_image`, `error_decode_image`, `error_nsfw_content_detected`, `error_inference`, `unknown_internal_error`
- Image-check codes (where they are surfaced is UNCONFIRMED): `error_no_shoulder`, `error_large_face_angle`, `error_insufficient_landmarks`, `error_hair_too_short`, `error_face_pose`, `error_bald_image`
- Image requirements:
  - jpg or jpeg ONLY, under 10MB, long side at most 1024 px.
  - Face width at least 128 px.
  - Pitch ±10°, yaw ±45°, roll ±15°.
  - Exactly one face, fully visible, with SHOULDERS VISIBLE.
- Cost: 1 unit.

## 6. AI Hair Color

- `POST /s2s/v2.0/task/hair-color`
- `GET  /s2s/v2.0/task/hair-color/{task_id}`. The result is in `data.results.url` (2 h).

Create body (`RunHairColorTaskV2`): `src_file_id` or `src_file_url`, plus EITHER `preset` OR `pattern` and `palettes`. If both are sent, `preset` wins.

`preset` enum:
- Full: `Jet Black`, `Chocolate Brown`, `Honey Blonde`, `Platinum Blonde`, `Ash Gray`, `Rose Gold`, `Burgundy`, `Copper Red`, `Lavender`, `Teal Blue`
- Ombre: `Dark Brown/Caramel Blonde`, `Jet Black/Silver Gray`, `Ash Brown/Lavender`, `Rose Gold/Peach Blonde`, `Burgundy/Magenta Pink`, `Deep Blue/Teal Green`, `Plum Purple/Pastel Lilac`, `Copper Red/Golden Blonde`, `Dark Gray/Ice Blonde`, `Midnight Blue/Denim Blue`

`pattern` object:
- `name` (required): `full` | `ombre`
- Ombre also requires:
  - `blend_strength`: int, 0 to 100
  - `line_offset`: number, -0.99 to 0.99
  - `coloring_section`: enum `top`

`palettes` array (1 item for full, 2 for ombre). Each item:
- `color`: hex, required, pattern `^#([A-Fa-f0-9]{6})$`
- `color_intensity`: int, 0 to 100, optional
- `shine_intensity`: int, 0 to 100, optional

Example (custom full colour):
```json
{"src_file_id": "<id>", "pattern": {"name": "full"}, "palettes": [{"color": "#42280E", "color_intensity": 80, "shine_intensity": 50}]}
```

- `data.error` enum: same as hair extension. The spec's error table also lists `error_below_min_image_size` and `error_exceed_max_image_size`.
- Image requirements:
  - jpg, jpeg or png, under 10MB.
  - The image must include the hair area.
  - The spec conflicts on size: one table says long side under 1920 px and face width at least 100 px. The error table says 320x320 minimum, under 1920 px wide and under 1080 px high. UNCONFIRMED which applies. A safe choice is a long side of at most 1080 px.
- Cost: 1 unit, for either full or ombre.

## 7. AI Hairstyle Generator (Hair Style VTO / "hair-transfer")

- List templates: `GET /s2s/v2.1/task/template/hair-transfer?page_size=20&starting_token=...`. The template response shape was not shown; assume it matches the hair-ext `TemplateResponse`. UNCONFIRMED.
- Create: `POST /s2s/v2.1/task/hair-transfer`.
  - Body: `src_file_id` or `src_file_url`.
  - Plus one reference: `template_id` (preset mode), or `ref_file_id` / `ref_file_url` (custom mode).
- Poll: `GET /s2s/v2.1/task/hair-transfer/{task_id}`. The result is in `data.results.url`.
- The documented example names are only "Curly Bob" and "Side-Swept Bangs", plus "curly", "long" and "buzz cut". No braids, locs or kinky styles are documented.
- Image requirements:
  - jpg or jpeg, under 10MB, long side at most 1024 px, face width at least 128 px.
  - Pitch ±10°, yaw ±45°, roll ±15°, with a single face.
- Error codes: same as hair extension, without `error_bald_image`.
- Cost:
  - v2.0: 1 unit for preset, 2 for custom.
  - v2.1: 2 units for preset, 2 for custom.
- A v2.0 path exists but was not captured. UNCONFIRMED.

## 8. Errors and credit

HTTP errors on create (`POST`):
- `400` (`RunError`): `{"status": 400, "error": "The operation could not be completed", "error_code": "<enum>"}`. `error_code` is one of `CreditInsufficiency`, `InvalidStyleGroup`, `InvalidStyle`, `BadRequest`, `InvalidParameters`.
- `401`: `{"status": 401, "error_code": "InvalidApiKey" | "InactiveApiKey" | "ExpiredApiKey"}`. The hairstyle guide also shows `InvalidAccessToken` with an `error` field.
- `429`: too many requests. No body schema; retry with backoff. The rate limit is not documented.

HTTP errors on poll (`GET`):
- `400`: `{"status": 400, "error_code": "InvalidTaskId"}`. Returned for an unknown task or one that has timed out or expired.
- `401`: same as on create.
- `500`: `{"status": 500, "error_code": "TaskTimeout"}`.

Task-level failure (HTTP 200, `data.task_status: "error"`):
- [DOCS] says `data.error` is an enum string.
- Live payloads can contain a stringified tuple instead ([ALOUD] fixture):
  ```json
  {"status": 200, "data": {"error": "('The face area in the uploaded image is too small', 'error_src_face_too_small')", "results": null, "task_status": "error"}}
  ```
- Parse with `/\('(.+?)',\s*'(.+?)'\)/` to get (message, code). Fall back to the raw string, and also read `data.error_message`.

Credit balance:
- `GET /s2s/v1.0/client/credit`. This is the only v1.0 endpoint that is safe to use. Both repos used it live.
- Response:
  ```json
  {"status": 200, "results": [{"id": 13105541279084536, "type": "SubsToken" | "PaygToken", "amount": 10, "expiry": 1704789135000}]}
  ```
  - `expiry` is Unix time in ms.
  - The response is top-level `results`, not `data`.
  - Sum `amount` across entries. [SHADESPAN] also reads an `amount_dec` field, which is not in the spec.
