// Ambient sea life: pure decoration, no input, no collisions.
// Bodies are real outlines (smooth curves, countershaded gradients) whose shape is
// animated as a traveling spine wave, so the whole animal undulates instead of
// swinging a rigid tail.
import { memo } from "react";

type Bed = (x: number) => number;

const rnd = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
/** Round every generated number so server and client markup match exactly. */
const f = (n: number) => n.toFixed(3);

/* ---------------------------------------------------------------- body engine */

type Ctrl = [number, number][];
interface BodySpec {
  id: string;
  len: number;
  /** half-width (m) along the body, u = 0 nose .. 1 tail tip */
  prof: Ctrl;
  tailStart: number;
  /** upper / lower tail lobe tips: [u, vertical extent] */
  up: [number, number];
  low: [number, number];
  notch: number;
  amp: number;
  /** wave number along the body */
  k?: number;
  seg?: number;
  /** multiplier for the belly half-width */
  belly?: number;
}
type Pt = [number, number, boolean];

/** Smooth cubic Hermite interpolation of the width profile. */
const prof = (c: Ctrl, u: number) => {
  const n = c.length;
  const at = (j: number): [number, number] => c[Math.max(0, Math.min(n - 1, j))] as [number, number];
  if (u <= at(0)[0]) return at(0)[1];
  if (u >= at(n - 1)[0]) return at(n - 1)[1];
  let i = 1;
  while (u > at(i)[0]) i++;
  const [u0, w0] = at(i - 1);
  const [u1, w1] = at(i);
  const h = u1 - u0;
  const t = (u - u0) / h;
  const sl = (j: number) => {
    const a = at(j - 1);
    const b = at(j + 1);
    return (b[1] - a[1]) / (b[0] - a[0] || 1);
  };
  const m0 = sl(i - 1) * h;
  const m1 = sl(i) * h;
  const t2 = t * t;
  const t3 = t2 * t;
  return Math.max(0, (2 * t3 - 3 * t2 + 1) * w0 + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * w1 + (t3 - t2) * m1);
};

function outline(s: BodySpec, phi: number): Pt[] {
  const S = s.seg ?? 14;
  const k = s.k ?? 4.2;
  const P = (u: number, v: number, sharp = false): Pt => [
    s.len / 2 - u * s.len,
    s.amp * (0.08 + 0.92 * u * u) * Math.sin(phi - k * u) + v,
    sharp,
  ];
  const pts: Pt[] = [];
  for (let i = 0; i <= S; i++) {
    const u = (s.tailStart * i) / S;
    pts.push(P(u, -prof(s.prof, u), i === 0));
  }
  pts.push(P(s.up[0], -s.up[1], true));
  pts.push(P(s.notch, 0, true));
  pts.push(P(s.low[0], s.low[1], true));
  for (let i = S; i >= 1; i--) {
    const u = (s.tailStart * i) / S;
    pts.push(P(u, prof(s.prof, u) * (s.belly ?? 1)));
  }
  return pts;
}

function pathD(pts: Pt[]) {
  const p0 = pts[0] as Pt;
  let d = `M${f(p0[0])} ${f(p0[1])}`;
  for (let i = 1; i < pts.length; i++) {
    const [x, y, sh] = pts[i] as Pt;
    if (sh) {
      d += `L${f(x)} ${f(y)}`;
      continue;
    }
    const nx = pts[i + 1];
    if (!nx) d += `Q${f(x)} ${f(y)} ${f(p0[0])} ${f(p0[1])}`;
    else if (nx[2]) d += `Q${f(x)} ${f(y)} ${f(nx[0])} ${f(nx[1])}`;
    else d += `Q${f(x)} ${f(y)} ${f((x + nx[0]) / 2)} ${f((y + nx[1]) / 2)}`;
  }
  return d + "Z";
}

const frameCache = new Map<string, string[]>();
function frames(s: BodySpec, N: number) {
  const key = `${s.id}:${N}`;
  let r = frameCache.get(key);
  if (!r) {
    r = Array.from({ length: N + 1 }, (_, j) => pathD(outline(s, (2 * Math.PI * j) / N)));
    frameCache.set(key, r);
  }
  return r;
}

function WaveBody({ spec, fill, N = 10, dur, begin = 0, opacity }: { spec: BodySpec; fill: string; N?: number; dur: number; begin?: number; opacity?: number }) {
  const fr = frames(spec, N);
  return (
    <path d={fr[0]} fill={fill} opacity={opacity}>
      <animate attributeName="d" values={fr.join(";")} dur={`${f(dur)}s`} begin={`-${f(begin * dur)}s`} repeatCount="indefinite" />
    </path>
  );
}

/** Fin that flutters around its root at (0,0). */
const Flutter = ({ amp, dur, delay = 0, children }: { amp: number; dur: number; delay?: number; children: React.ReactNode }) => (
  <g>
    <animateTransform attributeName="transform" type="rotate" values={`${-amp} 0 0; ${amp} 0 0; ${-amp} 0 0`} dur={`${f(dur)}s`} begin={`-${f(delay)}s`} repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
    {children}
  </g>
);

/* ------------------------------------------------------------------ gradients */

const Countershade = ({ id, top, belly, mid = 0.5 }: { id: string; top: string; belly: string; mid?: number }) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" style={{ stopColor: top }} />
    <stop offset={mid - 0.1} style={{ stopColor: top }} />
    <stop offset={mid + 0.12} style={{ stopColor: belly }} />
    <stop offset="1" style={{ stopColor: belly }} />
  </linearGradient>
);

const Defs = () => (
  <defs>
    <Countershade id="ml-shark" top="var(--color-shark-top)" belly="var(--color-shark-belly)" mid={0.55} />
    <Countershade id="ml-dolphin" top="var(--color-dolphin-top)" belly="var(--color-dolphin-belly)" mid={0.5} />
    <Countershade id="ml-manta" top="var(--color-manta-top)" belly="var(--color-manta-belly)" mid={0.6} />
    <Countershade id="ml-eagle" top="var(--color-eagle-top)" belly="var(--color-eagle-belly)" mid={0.55} />
    <Countershade id="ml-silver" top="var(--color-silver-top)" belly="var(--color-silver-belly)" mid={0.42} />
    <Countershade id="ml-gold" top="var(--color-gold-top)" belly="var(--color-silver-belly)" mid={0.45} />
    <Countershade id="ml-lion" top="var(--color-lion-top)" belly="var(--color-lion-belly)" mid={0.5} />
    <Countershade id="ml-moray" top="var(--color-moray-top)" belly="var(--color-moray-belly)" mid={0.55} />
    <linearGradient id="ml-mermaid" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0" style={{ stopColor: "var(--color-skin)" }} />
      <stop offset="0.34" style={{ stopColor: "var(--color-skin)" }} />
      <stop offset="0.42" style={{ stopColor: "var(--color-mer-tail)" }} />
      <stop offset="1" style={{ stopColor: "var(--color-mer-tail-deep)" }} />
    </linearGradient>
    <radialGradient id="ml-jelly" cx="0.5" cy="0.9" r="0.9">
      <stop offset="0" style={{ stopColor: "var(--color-jelly-core)", stopOpacity: 0.25 }} />
      <stop offset="0.6" style={{ stopColor: "var(--color-jelly-edge)", stopOpacity: 0.55 }} />
      <stop offset="1" style={{ stopColor: "var(--color-jelly-edge)", stopOpacity: 0.85 }} />
    </radialGradient>
  </defs>
);

/* -------------------------------------------------------------------- Patrol */

/** Swims back and forth across `span`, banking smoothly through each turn. */
function Patrol({ x, d, span, dur, children, bob = 0.6, k }: { x: number; d: number; span: number; dur: number; children: React.ReactNode; bob?: number; k: number }) {
  const begin = `-${f((k * 7) % dur)}s`;
  return (
    <g transform={`translate(${f(x)}, ${f(d)})`}>
      <g>
        <animateTransform attributeName="transform" type="translate" values={`0 0; ${f(span)} ${f(bob)}; 0 0`} keyTimes="0; 0.5; 1" dur={`${f(dur)}s`} begin={begin} repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
        <g>
          {/* banking turn: squash through edge-on instead of an instant flip */}
          <animateTransform attributeName="transform" type="scale" values="1 1; 1 1; 0.15 0.92; -1 1; -1 1; -0.15 0.92; 1 1" keyTimes="0; 0.46; 0.5; 0.54; 0.96; 0.995; 1" dur={`${f(dur)}s`} begin={begin} repeatCount="indefinite" />
          {children}
        </g>
      </g>
    </g>
  );
}

/* ------------------------------------------------------------------ species */

const FISH: BodySpec = {
  id: "fish", len: 0.5, tailStart: 0.78, up: [1, 0.1], low: [1, 0.1], notch: 0.88, amp: 0.05, k: 5, seg: 8,
  prof: [[0, 0], [0.06, 0.04], [0.3, 0.085], [0.55, 0.07], [0.78, 0.022]],
};

const Fish = ({ k }: { k: number }) => (
  <g>
    <WaveBody spec={FISH} fill={k % 5 === 0 ? "url(#ml-gold)" : "url(#ml-silver)"} N={6} dur={0.45 + rnd(k) * 0.25} begin={rnd(k + 3)} />
    <path d="M 0.06 -0.075 L -0.03 -0.14 L -0.1 -0.065 Z" fill="var(--color-silver-top)" opacity={0.8} />
    <path d="M 0.2 -0.005 Q 0 -0.02 -0.12 0.005" stroke="var(--color-foam)" strokeWidth={0.012} fill="none" opacity={0.6} />
    <circle cx={0.18} cy={-0.015} r={0.014} fill="var(--color-abyss)" />
  </g>
);

function School({ k }: { k: number }) {
  return (
    <g>
      {Array.from({ length: 16 }, (_, i) => {
        const s = 0.7 + rnd(k * 13 + i) * 0.6;
        const j = rnd(k * 7 + i);
        return (
          <g key={i} transform={`translate(${f((rnd(k * 31 + i) - 0.5) * 3)}, ${f((rnd(k * 17 + i) - 0.5) * 1.4)}) scale(${f(s)})`} opacity={f(0.5 + j * 0.45)}>
            <g>
              <animateTransform attributeName="transform" type="translate" values={`0 0; ${f(0.15 + j * 0.2)} ${f((j - 0.5) * 0.3)}; 0 0`} dur={`${f(2 + j * 2)}s`} begin={`-${f(j * 3)}s`} repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
              <Fish k={k * 50 + i} />
            </g>
          </g>
        );
      })}
    </g>
  );
}

/** Ray seen from the side: broad wings that flap with a lagging trailing edge. */
function Ray({ sc, dur, eagle }: { sc: number; dur: number; eagle?: boolean }) {
  const wing = (t: number) =>
    `M0.5 0.02 C0.4 ${f(t * 0.45)} 0.12 ${f(t * 0.85)} -0.2 ${f(t)} C-0.2 ${f(t * 0.5)} -0.35 ${f(t * 0.12)} -0.55 0.02 Z`;
  const ts = [-0.4, -0.05, 0.3, 0.08, -0.4];
  const top = eagle ? "url(#ml-eagle)" : "url(#ml-manta)";
  const wingTop = eagle ? "var(--color-eagle-top)" : "var(--color-manta-top)";
  const keySplines = "0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1; 0.4 0 0.6 1";
  const tailEnd = eagle ? -2 : -1.4;
  const tail = (a: number, b: number) => `M-0.5 0.01 Q${f(tailEnd * 0.55)} ${f(a)} ${f(tailEnd)} ${f(b)}`;
  return (
    <g transform={`scale(${f(sc)})`}>
      <path d={wing(-0.32)} fill={wingTop} opacity={0.75}>
        <animate attributeName="d" values={ts.map((t) => wing(t * 0.8)).join(";")} dur={`${f(dur)}s`} begin={`-${f(dur * 0.08)}s`} repeatCount="indefinite" calcMode="spline" keySplines={keySplines} />
      </path>
      <path d={tail(0.02, 0.08)} stroke={top} strokeWidth={eagle ? 0.025 : 0.035} strokeLinecap="round" fill="none">
        <animate attributeName="d" values={`${tail(0.02, 0.08)};${tail(0.1, -0.05)};${tail(0.02, 0.08)}`} dur={`${f(dur)}s`} repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
      </path>
      <path d="M0.75 0 Q0.3 -0.14 -0.5 0 Q0.3 0.09 0.75 0 Z" fill={top} />
      {eagle ? (
        <>
          <path d="M0.7 -0.02 Q0.84 -0.03 0.88 0.03 Q0.8 0.07 0.66 0.04 Z" fill={top} />
          {[0.4, 0.26, 0.12, -0.02, -0.16].map((x, i) => (
            <circle key={i} cx={x} cy={-0.045 + (i % 2) * 0.012} r={0.02} fill="var(--color-foam)" opacity={0.85} />
          ))}
        </>
      ) : (
        <>
          <path d="M0.72 -0.01 Q0.92 -0.05 0.98 0 Q0.9 0.04 0.72 0.02 Z" fill="var(--color-manta-top)" />
          <ellipse cx={0.3} cy={-0.05} rx={0.14} ry={0.03} fill="var(--color-foam)" opacity={0.85} />
          <ellipse cx={0.02} cy={-0.04} rx={0.08} ry={0.02} fill="var(--color-foam)" opacity={0.5} />
        </>
      )}
      <path d={wing(-0.4)} fill={wingTop}>
        <animate attributeName="d" values={ts.map(wing).join(";")} dur={`${f(dur)}s`} repeatCount="indefinite" calcMode="spline" keySplines={keySplines} />
      </path>
      <circle cx={0.62} cy={-0.03} r={0.018} fill="var(--color-foam)" />
      <circle cx={0.62} cy={-0.03} r={0.009} fill="var(--color-abyss)" />
    </g>
  );
}
const Manta = () => <Ray sc={1.6} dur={4.2} />;
const EagleRay = () => <Ray sc={0.9} dur={2.6} eagle />;

const DOLPHIN: BodySpec = {
  id: "dolphin", len: 1.9, tailStart: 0.84, up: [1, 0.3], low: [1, 0.3], notch: 0.93, amp: 0.1, k: 3.6, seg: 18,
  prof: [[0, 0], [0.025, 0.035], [0.09, 0.055], [0.15, 0.1], [0.26, 0.19], [0.45, 0.225], [0.65, 0.16], [0.84, 0.045]],
};
const Dolphin = () => (
  <g>
    <WaveBody spec={DOLPHIN} fill="url(#ml-dolphin)" N={10} dur={1.1} />
    <g transform="translate(0.05, -0.22)">
      <path d="M0.22 0 Q0.05 -0.1 -0.1 -0.32 Q-0.12 -0.12 -0.3 0 Z" fill="var(--color-dolphin-top)" />
    </g>
    <g transform="translate(0.4, 0.12)">
      <Flutter amp={14} dur={1.1}>
        <path d="M0.06 0 Q-0.06 0.14 -0.3 0.3 Q-0.12 0.1 -0.1 0 Z" fill="var(--color-dolphin-top)" />
      </Flutter>
    </g>
    <path d="M0.9 0.035 Q0.7 0.06 0.55 0.07" stroke="var(--color-abyss)" strokeWidth={0.012} fill="none" opacity={0.7} />
    <circle cx={0.62} cy={-0.01} r={0.022} fill="var(--color-abyss)" />
  </g>
);

const SHARK: BodySpec = {
  id: "shark", len: 2.4, tailStart: 0.8, up: [1, 0.58], low: [0.96, 0.26], notch: 0.89, amp: 0.08, k: 4.4, seg: 18, belly: 0.9,
  prof: [[0, 0], [0.025, 0.05], [0.1, 0.13], [0.25, 0.22], [0.4, 0.26], [0.6, 0.19], [0.8, 0.04]],
};
const Shark = () => (
  <g>
    <WaveBody spec={SHARK} fill="url(#ml-shark)" N={10} dur={1.7} />
    <path d="M0.3 -0.25 L0.02 -0.78 Q0.0 -0.45 -0.22 -0.22 Z" fill="var(--color-shark-top)" />
    <path d="M-0.55 -0.15 L-0.65 -0.32 L-0.78 -0.15 Z" fill="var(--color-shark-top)" />
    <g transform="translate(0.5, 0.18)">
      <Flutter amp={9} dur={2.4}>
        <path d="M0.05 0 Q-0.14 0.2 -0.45 0.38 Q-0.3 0.14 -0.25 0 Z" fill="var(--color-shark-top)" />
      </Flutter>
    </g>
    {[0, 1, 2, 3].map((i) => (
      <path key={i} d={`M${f(0.75 - i * 0.045)} -0.08 Q${f(0.73 - i * 0.045)} 0.0 ${f(0.76 - i * 0.045)} 0.07`} stroke="var(--color-abyss)" strokeWidth={0.012} fill="none" opacity={0.6} />
    ))}
    <circle cx={1.0} cy={-0.04} r={0.025} fill="var(--color-abyss)" />
    <path d="M1.12 0.04 Q0.95 0.1 0.8 0.08" stroke="var(--color-abyss)" strokeWidth={0.014} fill="none" opacity={0.7} />
  </g>
);

const LION: BodySpec = {
  id: "lion", len: 0.5, tailStart: 0.82, up: [1, 0.1], low: [1, 0.1], notch: 0.9, amp: 0.02, k: 4, seg: 10,
  prof: [[0, 0], [0.05, 0.06], [0.3, 0.13], [0.6, 0.1], [0.82, 0.04]],
};
const Lionfish = () => {
  const rays = (n: number, a0: number, a1: number, len: number, root: [number, number], stroke: string, w: number) =>
    Array.from({ length: n }, (_, i) => {
      const a = a0 + ((a1 - a0) * i) / (n - 1);
      const L = len * (0.8 + 0.2 * Math.sin(i * 1.7));
      return <line key={i} x1={f(root[0])} y1={f(root[1])} x2={f(root[0] + Math.cos(a) * L)} y2={f(root[1] + Math.sin(a) * L)} stroke={stroke} strokeWidth={w} strokeLinecap="round" />;
    });
  return (
    <g>
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0; 0 -0.015; 0 0" dur="3s" repeatCount="indefinite" />
        {/* dorsal spines */}
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-2 0.1 -0.1; 3 0.1 -0.1; -2 0.1 -0.1" dur="2.6s" repeatCount="indefinite" />
          {rays(10, -2.2, -0.5, 0.34, [0.1, -0.1], "var(--color-lion-top)", 0.014)}
          {rays(10, -2.2, -0.5, 0.3, [0.1, -0.1], "var(--color-lion-belly)", 0.006)}
        </g>
        <WaveBody spec={LION} fill="url(#ml-lion)" N={6} dur={2} />
        {[0.14, 0.27, 0.4, 0.54, 0.68].map((u, i) => {
          const w = prof(LION.prof, u) * 0.9;
          const x = LION.len / 2 - u * LION.len;
          return <line key={i} x1={f(x)} y1={f(-w)} x2={f(x)} y2={f(w)} stroke="var(--color-lion-stripe)" strokeWidth={0.016} opacity={0.75} />;
        })}
        {/* pectoral fan */}
        <g transform="translate(0.1, 0.03)">
          <Flutter amp={7} dur={1.8}>
            {rays(13, 1.9, 3.7, 0.42, [0, 0], "var(--color-lion-top)", 0.017)}
            {rays(13, 1.9, 3.7, 0.38, [0, 0], "var(--color-lion-belly)", 0.006)}
          </Flutter>
        </g>
        <circle cx={0.19} cy={-0.025} r={0.016} fill="var(--color-abyss)" />
      </g>
    </g>
  );
};

const MERMAID: BodySpec = {
  id: "mermaid", len: 1.6, tailStart: 0.8, up: [1, 0.28], low: [1, 0.28], notch: 0.9, amp: 0.09, k: 4, seg: 16,
  prof: [[0, 0], [0.03, 0.05], [0.1, 0.095], [0.2, 0.085], [0.3, 0.06], [0.4, 0.085], [0.6, 0.06], [0.8, 0.025]],
};
const Mermaid = () => {
  const hair = (a: number, b: number) => `M0.9 -0.13 Q0.65 ${f(-0.22 + a)} 0.3 ${f(-0.1 + b)} Q0.55 ${f(-0.06 + a)} 0.85 0.0 Z`;
  return (
    <g>
      <path d={hair(0, 0)} fill="var(--color-mer-hair)" opacity={0.9}>
        <animate attributeName="d" values={`${hair(0, 0)};${hair(0.06, 0.12)};${hair(-0.03, -0.04)};${hair(0, 0)}`} dur="3s" repeatCount="indefinite" />
      </path>
      <WaveBody spec={MERMAID} fill="url(#ml-mermaid)" N={10} dur={1.5} />
      <circle cx={0.9} cy={-0.03} r={0.1} fill="var(--color-skin)" />
      <path d="M0.98 -0.1 Q1.0 -0.02 0.97 0.02" stroke="var(--color-abyss)" strokeWidth={0.008} fill="none" opacity={0.5} />
      <g transform="translate(0.68, 0.05)">
        <Flutter amp={12} dur={1.5}>
          <path d="M0 0 Q-0.22 0.06 -0.4 0.14" stroke="var(--color-skin)" strokeWidth={0.05} strokeLinecap="round" fill="none" />
        </Flutter>
      </g>
    </g>
  );
};

function Jelly({ x, d, k }: { x: number; d: number; k: number }) {
  const dur = 9 + rnd(k) * 6;
  const arm = (tx: number, w: number) => `M${tx} 0 q${w} 0.25 0 0.5 q${-w} 0.25 0 0.5`;
  return (
    <g transform={`translate(${f(x)}, ${f(d)})`} opacity={0.6}>
      <g>
        {/* pulse up quickly, then drift down slowly */}
        <animateTransform attributeName="transform" type="translate" values="0 0; 0.1 -0.5; 0.15 -0.35; 0.25 -0.85; 0.3 -0.7; 0 0" keyTimes="0; 0.1; 0.4; 0.5; 0.8; 1" dur={`${f(dur)}s`} begin={`-${f(k * 3)}s`} repeatCount="indefinite" />
        {[-0.2, -0.07, 0.07, 0.2].map((tx, i) => (
          <path key={i} d={arm(tx, 0.07)} stroke="var(--color-jelly-edge)" strokeWidth={0.022} fill="none" opacity={0.7}>
            <animate attributeName="d" values={`${arm(tx, 0.07)};${arm(tx, -0.07)};${arm(tx, 0.07)}`} dur={`${f(2 + i * 0.3)}s`} repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
          </path>
        ))}
        {[-0.1, 0.1].map((tx, i) => (
          <path key={`o${i}`} d={`M${tx} 0.02 q${tx * 0.5} 0.2 0 0.4 q${-tx * 0.5} 0.2 0 0.4`} stroke="var(--color-jelly-core)" strokeWidth={0.05} fill="none" opacity={0.45} strokeLinecap="round">
            <animate attributeName="d" values={`M${tx} 0.02 q0.06 0.2 0 0.4 q-0.06 0.2 0 0.4;M${tx} 0.02 q-0.06 0.2 0 0.4 q0.06 0.2 0 0.4;M${tx} 0.02 q0.06 0.2 0 0.4 q-0.06 0.2 0 0.4`} dur={`${f(2.6 + i * 0.5)}s`} repeatCount="indefinite" />
          </path>
        ))}
        <g>
          <animateTransform attributeName="transform" type="scale" values="1 1; 0.74 1.14; 1 1; 1 1" keyTimes="0; 0.15; 0.4; 1" dur="1.8s" repeatCount="indefinite" />
          <path d="M-0.32 0 Q-0.36 -0.46 0 -0.46 Q0.36 -0.46 0.32 0 Q0.15 0.07 0 0.03 Q-0.15 0.07 -0.32 0 Z" fill="url(#ml-jelly)" />
          <path d="M-0.18 -0.12 Q0 -0.3 0.18 -0.12" stroke="var(--color-jelly-core)" strokeWidth={0.02} fill="none" opacity={0.6} />
          <ellipse cx={0} cy={-0.16} rx={0.09} ry={0.05} fill="var(--color-jelly-core)" opacity={0.4} />
        </g>
      </g>
    </g>
  );
}

const MORAY: BodySpec = {
  id: "moray", len: 0.9, tailStart: 0.96, up: [1, 0.02], low: [1, 0.02], notch: 0.985, amp: 0.035, k: 6, seg: 14,
  prof: [[0, 0], [0.02, 0.04], [0.1, 0.085], [0.2, 0.065], [0.35, 0.07], [0.75, 0.08], [0.96, 0.06]],
};

/** Moray eel poking its head out of the wall, facing the open water (to the left). */
function Moray({ x, d, k }: { x: number; d: number; k: number }) {
  return (
    <g transform={`translate(${f(x)}, ${f(d)})`}>
      <ellipse cx={0.1} cy={0} rx={0.3} ry={0.2} fill="var(--color-abyss)" />
      <g>
        <animateTransform attributeName="transform" type="translate" values="0.45 0; 0.45 0; -0.2 0; -0.2 0; 0.45 0" keyTimes="0; 0.4; 0.5; 0.85; 1" dur={`${10 + (k % 4) * 2}s`} begin={`-${f(k * 2.3)}s`} repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1" />
        <g transform="scale(-1 1)">
          <WaveBody spec={MORAY} fill="url(#ml-moray)" N={8} dur={2.2} begin={rnd(k + 8)} />
          {[0.25, 0.4, 0.52, 0.65, 0.78].map((u, i) => (
            <circle key={i} cx={f(MORAY.len / 2 - u * MORAY.len)} cy={f((i % 2 ? 0.02 : -0.025))} r={0.016 + (i % 3) * 0.004} fill="var(--color-moray-spot)" opacity={0.6} />
          ))}
          <g>
            <animateTransform attributeName="transform" type="rotate" values="0 0.38 0.02; 9 0.38 0.02; 0 0.38 0.02" dur="1.4s" repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
            <path d="M0.44 0.02 Q0.3 0.05 0.2 0.075 Q0.3 0.1 0.45 0.07 Z" fill="var(--color-moray-spot)" opacity={0.8} />
          </g>
          <circle cx={0.31} cy={-0.03} r={0.018} fill="var(--color-foam)" />
          <circle cx={0.31} cy={-0.03} r={0.008} fill="var(--color-abyss)" />
        </g>
      </g>
    </g>
  );
}

/* ----------------------------------------------------------------- exports */

/** Water creatures, drawn behind the wall. */
export const MarineLife = memo(
  function MarineLife({ worldW, bed }: { worldW: number; bed: Bed }) {
    const items: React.ReactNode[] = [];
    const n = Math.max(6, Math.floor(worldW / 9));
    const kinds = [School, Manta, EagleRay, Dolphin, Shark, Lionfish, Mermaid] as const;
    for (let i = 0; i < n; i++) {
      const x = 8 + rnd(i) * (worldW - 14);
      const floor = bed(x);
      if (floor < 4) continue;
      const kind = i % kinds.length;
      const Comp = kinds[kind] as unknown as (p: { k: number }) => React.ReactElement;
      const shallow = kind === 3;
      const d = shallow ? 1.5 + rnd(i + 9) * 3 : 2 + rnd(i + 5) * Math.min(floor - 3, 140);
      const span = kind === 5 ? 1.5 : 6 + rnd(i + 3) * 10;
      // distance haze: deeper animals melt into the blue
      const fade = Math.max(0.5, 0.95 - d / 220);
      items.push(
        <Patrol key={`p${i}`} k={i} x={x} d={d} span={span} dur={kind === 5 ? 12 : 18 + rnd(i + 2) * 22} bob={kind === 3 ? 1.2 : 0.6}>
          <g opacity={f(fade)}>
            <Comp k={i} />
          </g>
        </Patrol>,
      );
    }
    for (let i = 0; i < Math.floor(worldW / 14); i++) {
      const x = 10 + rnd(i + 50) * (worldW - 16);
      const floor = bed(x);
      if (floor < 6) continue;
      items.push(<Jelly key={`j${i}`} k={i} x={x} d={4 + rnd(i + 70) * Math.min(floor - 5, 120)} />);
    }
    return (
      <g className="pointer-events-none" aria-hidden>
        <Defs />
        {items}
      </g>
    );
  },
  (a, b) => a.worldW === b.worldW,
);

/** Morays live in holes along the wall, drawn over the seabed. */
export const Morays = memo(
  function Morays({ worldW, bed }: { worldW: number; bed: Bed }) {
    const items: React.ReactNode[] = [];
    for (let i = 0; i < Math.floor(worldW / 18); i++) {
      const x = 12 + rnd(i + 200) * (worldW - 16);
      const d = bed(x);
      if (d < 5) continue;
      items.push(<Moray key={i} k={i} x={x + 0.1} d={d - 0.1} />);
    }
    return (
      <g className="pointer-events-none" aria-hidden>
        {items}
      </g>
    );
  },
  (a, b) => a.worldW === b.worldW,
);
