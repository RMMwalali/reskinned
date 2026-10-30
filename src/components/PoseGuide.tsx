// Illustrated "take it like this" guides for the check-in photo slots, drawn
// in one deep maroon ink with thick round lines, solid curly hair and striped
// tops. YouCam's Hair Density model wants one pose: facing the camera, head
// lowered about 45°, whole hairline and face in frame.

const INK = "#731b24";
const BG = "#f6efe1";
const W = 7; // line weight

type Kind = "tilt" | "front" | "side";

const LABEL: Record<Kind, string> = { tilt: "Head down 45°", front: "Look straight ahead", side: "Quarter turn" };

const line = { fill: "none", stroke: INK, strokeWidth: W, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const shape = { fill: BG, stroke: INK, strokeWidth: W, strokeLinejoin: "round" } as const;

/** Curly hair: a cluster of solid circles. */
function Curls({ c }: { c: [number, number, number][] }) {
  return (
    <g fill={INK}>
      {c.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
      ))}
    </g>
  );
}

/** Striped tee, like the rest of the edge.wise drawings. */
function Body({ id }: { id: string }) {
  const d = "M18 404 C 22 344 78 320 128 318 Q 150 334 172 318 C 222 320 278 344 282 404 Z";
  return (
    <>
      <clipPath id={id}>
        <path d={d} />
      </clipPath>
      <path d={d} fill={BG} />
      <g clipPath={`url(#${id})`} stroke={INK} strokeWidth="9">
        {[342, 364, 386].map((y) => (
          <path key={y} d={`M0 ${y} H300`} />
        ))}
      </g>
      <path d={d} {...line} />
      <path d="M128 318 Q150 334 172 318" {...line} />
    </>
  );
}

function Dashes({ list }: { list: string[] }) {
  return (
    <g {...line} strokeWidth={5}>
      {list.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
  );
}

function Frame() {
  return (
    <g {...line} strokeWidth={5} opacity="0.55">
      <path d="M26 96 V58 H64" />
      <path d="M236 58 H274 V96" />
    </g>
  );
}

function Tilt() {
  // Front view, head bowed: the crown fills the top, the face is short and
  // low, and the hairline runs across the middle of the frame.
  return (
    <>
      <Body id="pose-body-tilt" />
      <path d="M132 276 L130 320 M168 276 L170 320" {...line} />
      <path d="M92 190 C 90 252 118 286 150 286 C 182 286 210 252 208 190 Z" {...shape} />
      <path d="M94 222 q-12 4 -6 18 q4 8 10 4 M206 222 q12 4 6 18 q-4 8 -10 4" {...line} strokeWidth={6} />
      <circle cx="92" cy="254" r="8" {...line} strokeWidth={5} />
      <circle cx="208" cy="254" r="8" {...line} strokeWidth={5} />
      <Curls
        c={[
          [150, 128, 74], [94, 150, 40], [206, 150, 40], [108, 92, 38], [192, 92, 38], [150, 66, 40],
          [80, 186, 22], [220, 186, 22], [108, 184, 20], [134, 178, 20], [166, 178, 20], [192, 184, 20],
        ]}
      />
      {/* crown parting and curl highlights */}
      <path d="M150 70 V150 M124 112 q-10 14 -4 30 M178 112 q10 14 4 30" fill="none" stroke={BG} strokeWidth="4" strokeLinecap="round" />
      {/* the hairline: what the photo is for */}
      <path d="M106 208 Q150 190 194 208" fill="none" stroke="#feb914" strokeWidth="6" strokeDasharray="9 7" strokeLinecap="round" />
      {/* eyes looking down, nose, mouth */}
      <path d="M118 234 q10 8 20 0 M162 234 q10 8 20 0" {...line} strokeWidth={6} />
      <path d="M150 240 c 6 8 5 14 -4 15" {...line} strokeWidth={6} />
      <path d="M140 266 q10 5 20 0" {...line} strokeWidth={6} />
      <Dashes list={["M56 82 L42 70", "M48 118 L32 116", "M244 82 L258 70", "M252 118 L268 116"]} />
      {/* side view: 45° */}
      <g transform="translate(248 296)">
        <circle r="30" fill={BG} stroke={INK} strokeWidth="5" />
        <path d="M-12 18 V-20" stroke={INK} strokeWidth="4" strokeDasharray="4 5" strokeLinecap="round" />
        <path d="M-12 18 L14 -8" {...line} strokeWidth={6} />
        <path d="M-12 -1 A19 19 0 0 1 1 5" fill="none" stroke={INK} strokeWidth="4" />
        <text x="5" y="22" fontSize="13" fontWeight="800" fill={INK} fontFamily="var(--font-cond)">45°</text>
      </g>
    </>
  );
}

function Front() {
  return (
    <>
      <Body id="pose-body-front" />
      <path d="M130 280 L128 320 M170 280 L172 320" {...line} />
      <path d="M90 168 C 88 252 118 292 150 292 C 182 292 212 252 210 168 Z" {...shape} />
      <path d="M92 208 q-12 4 -6 18 q4 8 10 4 M208 208 q12 4 6 18 q-4 8 -10 4" {...line} strokeWidth={6} />
      <circle cx="90" cy="240" r="8" {...line} strokeWidth={5} />
      <circle cx="210" cy="240" r="8" {...line} strokeWidth={5} />
      <Curls
        c={[
          [150, 104, 68], [92, 130, 38], [208, 130, 38], [114, 70, 34], [186, 70, 34], [150, 50, 34],
          [78, 172, 24], [222, 172, 24], [108, 160, 18], [132, 154, 18], [168, 154, 18], [192, 160, 18],
        ]}
      />
      <path d="M126 84 q-8 12 -2 26 M176 84 q8 12 2 26" fill="none" stroke={BG} strokeWidth="4" strokeLinecap="round" />
      <path d="M116 192 q12 -7 24 0 M160 192 q12 -7 24 0" {...line} strokeWidth={6} />
      <circle cx="128" cy="210" r="6" fill={INK} />
      <circle cx="172" cy="210" r="6" fill={INK} />
      <path d="M150 214 c 7 10 6 18 -4 19" {...line} strokeWidth={6} />
      <path d="M132 252 q18 14 36 0" {...line} strokeWidth={6} />
      <Dashes list={["M52 74 L38 62", "M44 110 L28 108", "M248 74 L262 62", "M256 110 L272 108"]} />
    </>
  );
}

function Side() {
  // Profile facing right.
  return (
    <>
      <Body id="pose-body-side" />
      <path d="M138 284 L134 320 M178 282 L180 320" {...line} />
      <path
        d="M196 150 C 206 170 207 186 205 198 L 222 222 Q 225 229 216 231 L 206 233 C 208 243 206 251 200 256 Q 205 262 199 268 C 191 284 172 292 152 290 C 126 288 106 262 104 232 L 120 160 Z"
        {...shape}
      />
      <Curls
        c={[
          [135, 125, 62], [88, 165, 40], [96, 215, 30], [168, 96, 38], [110, 84, 32], [188, 130, 18], [116, 248, 18],
        ]}
      />
      <path d="M118 110 q-8 14 0 30 M162 94 q10 10 6 26" fill="none" stroke={BG} strokeWidth="4" strokeLinecap="round" />
      <path d="M150 210 q-12 4 -6 18 q4 8 10 4" {...line} strokeWidth={6} />
      <circle cx="148" cy="246" r="8" {...line} strokeWidth={5} />
      <circle cx="191" cy="203" r="5.5" fill={INK} />
      <path d="M184 188 q8 -5 16 0" {...line} strokeWidth={5} />
      <path d="M196 262 l9 -2" {...line} strokeWidth={5} />
      {/* turn arrow */}
      <path d="M244 140 q26 34 2 70" {...line} strokeWidth={6} />
      <path d="M232 204 l14 8 l4 -16" {...line} strokeWidth={6} />
      <Dashes list={["M60 76 L46 64", "M52 112 L36 110"]} />
    </>
  );
}

export function PoseGuide({ kind, flip = false, label: showLabel = true }: { kind: Kind; flip?: boolean; label?: boolean }) {
  const label = LABEL[kind];
  return (
    <svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <rect width="300" height="400" fill={BG} />
      <g transform={flip ? "translate(300 0) scale(-1 1)" : undefined}>
        {kind === "tilt" ? <Tilt /> : kind === "front" ? <Front /> : <Side />}
      </g>
      {showLabel ? <Frame /> : null}
      {showLabel ? (
      <g transform="translate(14 14)">
        <rect width={label.length * 9.2 + 24} height="30" rx="15" fill={INK} />
        <text x="12" y="20.5" fontSize="15" fontWeight="700" letterSpacing="1.2" fill={BG} fontFamily="var(--font-cond)">
          {label.toUpperCase()}
        </text>
      </g>
      ) : null}
    </svg>
  );
}
