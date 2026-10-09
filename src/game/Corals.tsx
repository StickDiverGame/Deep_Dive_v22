// Procedural, deterministic reef corals. Each piece is drawn in local metres with
// its base at (0,0) growing upward (negative y). All numbers are rounded so the
// server and client markup match.
import { memo } from "react";

const f = (n: number) => n.toFixed(3);
const rnd = (i: number) => {
  const v = Math.sin(i * 91.7 + 47.3) * 43758.5453;
  return v - Math.floor(v);
};

/* ------------------------------------------------------- branching (Acropora) */

interface Seg { x1: number; y1: number; x2: number; y2: number; w: number; tip: boolean }

function grow(seed: number, depth: number, x: number, y: number, a: number, len: number, w: number, out: Seg[], spread: number) {
  const x2 = x + Math.cos(a) * len;
  const y2 = y + Math.sin(a) * len;
  const tip = depth === 0;
  out.push({ x1: x, y1: y, x2, y2, w, tip });
  if (tip) return;
  const n = rnd(seed) > 0.55 ? 3 : 2;
  for (let j = 0; j < n; j++) {
    const s = seed * 3 + j + 1;
    const da = (j - (n - 1) / 2) * spread + (rnd(s) - 0.5) * 0.35;
    grow(s, depth - 1, x2, y2, a + da, len * (0.68 + rnd(s + 9) * 0.18), w * 0.68, out, spread);
  }
}

export const Staghorn = memo(function Staghorn({ seed, color = "var(--color-coral-gold)", scale = 1 }: { seed: number; color?: string; scale?: number }) {
  const segs: Seg[] = [];
  const stems = 2 + Math.floor(rnd(seed) * 2);
  for (let s = 0; s < stems; s++) {
    const a = -Math.PI / 2 + (s - (stems - 1) / 2) * 0.55 + (rnd(seed + s) - 0.5) * 0.3;
    grow(seed * 10 + s, 3, (s - (stems - 1) / 2) * 0.12, 0, a, 0.42, 0.11, segs, 0.62);
  }
  return (
    <g transform={`scale(${f(scale)})`} strokeLinecap="round" fill="none">
      {/* shadow side */}
      {segs.map((g, i) => (
        <line key={`s${i}`} x1={f(g.x1 + 0.015)} y1={f(g.y1)} x2={f(g.x2 + 0.015)} y2={f(g.y2)} stroke="var(--color-sea-deep)" strokeWidth={f(g.w + 0.02)} opacity={0.35} />
      ))}
      {segs.map((g, i) => (
        <line key={i} x1={f(g.x1)} y1={f(g.y1)} x2={f(g.x2)} y2={f(g.y2)} stroke={color} strokeWidth={f(g.w)} />
      ))}
      {/* lit edge */}
      {segs.map((g, i) => (
        <line key={`h${i}`} x1={f(g.x1 - g.w * 0.25)} y1={f(g.y1)} x2={f(g.x2 - g.w * 0.25)} y2={f(g.y2)} stroke="var(--color-coral-tip)" strokeWidth={f(g.w * 0.25)} opacity={0.35} />
      ))}
      {/* corallite pores */}
      {segs.filter((_, i) => i % 2 === 0).map((g, i) => (
        <circle key={`p${i}`} cx={f((g.x1 + g.x2) / 2)} cy={f((g.y1 + g.y2) / 2)} r={f(g.w * 0.22)} fill="var(--color-sea-deep)" opacity={0.3} />
      ))}
      {/* pale growing tips */}
      {segs.filter((g) => g.tip).map((g, i) => (
        <circle key={`t${i}`} cx={f(g.x2)} cy={f(g.y2)} r={f(g.w * 0.62)} fill="var(--color-coral-tip)" />
      ))}
    </g>
  );
});

/* ---------------------------------------------------------- brain (Diploria) */

export const BrainCoral = memo(function BrainCoral({ seed, rx = 0.55, ry = 0.45 }: { seed: number; rx?: number; ry?: number }) {
  const grooves: string[] = [];
  const rows = 6;
  for (let r = 1; r < rows; r++) {
    const yy = -ry * 2 + (r / rows) * ry * 2; // dome from -2ry..0, centre -ry
    const dy = (yy + ry) / ry;
    const half = rx * Math.sqrt(Math.max(0, 1 - dy * dy)) * 0.88;
    if (half < 0.06) continue;
    const steps = 10;
    let d = "";
    for (let j = 0; j <= steps; j++) {
      const x = -half + (2 * half * j) / steps;
      const y = yy + Math.sin(j * 1.9 + seed + r * 1.3) * 0.045 * (1 - Math.abs(dy) * 0.5);
      d += j === 0 ? `M${f(x)} ${f(y)}` : ` T${f(x)} ${f(y)}`;
    }
    grooves.push(d);
  }
  return (
    <g>
      <ellipse cx={0} cy={0.02} rx={f(rx * 1.05)} ry={0.08} fill="var(--color-sea-deep)" opacity={0.4} />
      <ellipse cx={0} cy={f(-ry)} rx={f(rx)} ry={f(ry)} fill="var(--color-brain)" />
      <ellipse cx={f(-rx * 0.25)} cy={f(-ry * 1.35)} rx={f(rx * 0.55)} ry={f(ry * 0.4)} fill="var(--color-coral-tip)" opacity={0.18} />
      <g stroke="var(--color-brain-groove)" strokeWidth={0.035} fill="none" opacity={0.75} strokeLinecap="round">
        {grooves.map((d, i) => <path key={i} d={d} />)}
      </g>
      <ellipse cx={0} cy={f(-ry * 0.45)} rx={f(rx * 0.95)} ry={f(ry * 0.5)} fill="var(--color-sea-deep)" opacity={0.18} />
    </g>
  );
});

/* ------------------------------------------------------------- sea fan */

export const SeaFan = memo(function SeaFan({ seed, color = "var(--color-coral-pink)", h = 1.3 }: { seed: number; color?: string; h?: number }) {
  const segs: Seg[] = [];
  grow(seed, 4, 0, 0, -Math.PI / 2, h * 0.32, 0.07, segs, 0.42);
  const tips = segs.filter((s) => s.tip);
  // lattice mesh between neighbouring branch midpoints
  const mids = segs.filter((s) => !s.tip && s.w < 0.04).map((s) => [(s.x1 + s.x2) / 2, (s.y1 + s.y2) / 2] as const);
  return (
    <g>
      <animateTransform attributeName="transform" type="rotate" values="-3 0 0; 3 0 0; -3 0 0" dur={`${f(5 + rnd(seed) * 3)}s`} repeatCount="indefinite" calcMode="spline" keySplines="0.45 0 0.55 1; 0.45 0 0.55 1" />
      <g stroke={color} strokeWidth={0.012} opacity={0.45} fill="none">
        {tips.slice(1).map((t, i) => (
          <line key={i} x1={f(tips[i]!.x2)} y1={f(tips[i]!.y2)} x2={f(t.x2)} y2={f(t.y2)} />
        ))}
        {mids.slice(1).map((m, i) => (
          <line key={`m${i}`} x1={f(mids[i]![0])} y1={f(mids[i]![1])} x2={f(m[0])} y2={f(m[1])} />
        ))}
      </g>
      <g stroke={color} fill="none" strokeLinecap="round">
        {segs.map((g, i) => (
          <line key={i} x1={f(g.x1)} y1={f(g.y1)} x2={f(g.x2)} y2={f(g.y2)} strokeWidth={f(Math.max(0.015, g.w))} />
        ))}
      </g>
      {tips.map((t, i) => (i % 2 ? <circle key={i} cx={f(t.x2)} cy={f(t.y2)} r={0.018} fill="var(--color-coral-tip)" opacity={0.7} /> : null))}
    </g>
  );
});

/* ---------------------------------------------------------- table coral */

export const TableCoral = memo(function TableCoral({ seed }: { seed: number }) {
  const plates = [
    { y: -0.55, w: 0.95 },
    { y: -0.78, w: 0.65 },
    { y: -0.95, w: 0.38 },
  ];
  return (
    <g>
      <path d="M -0.08 0 Q -0.05 -0.3 -0.04 -0.55 L 0.04 -0.55 Q 0.06 -0.3 0.09 0 Z" fill="var(--color-coral-gold)" />
      {plates.map((p, i) => {
        const off = (rnd(seed + i) - 0.5) * 0.12;
        return (
          <g key={i} transform={`translate(${f(off)}, ${f(p.y)})`}>
            <path d={`M ${f(-p.w)} 0 Q 0 -0.1 ${f(p.w)} 0 Q 0 0.06 ${f(-p.w)} 0 Z`} fill="var(--color-coral-gold)" />
            <path d={`M ${f(-p.w * 0.95)} 0.02 Q 0 0.1 ${f(p.w * 0.95)} 0.02`} stroke="var(--color-sea-deep)" strokeWidth={0.04} fill="none" opacity={0.45} />
            <path d={`M ${f(-p.w)} 0 Q 0 -0.1 ${f(p.w)} 0`} stroke="var(--color-coral-tip)" strokeWidth={0.025} fill="none" opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
});

/* -------------------------------------------------------- tube sponges */

export const TubeSponges = memo(function TubeSponges({ seed }: { seed: number }) {
  const tubes = [-0.32, 0.02, 0.36].map((x, i) => ({ x, h: 0.6 + rnd(seed + i) * 0.6, w: 0.11 + rnd(seed + i + 4) * 0.05 }));
  return (
    <g>
      {tubes.map((t, i) => (
        <g key={i} transform={`translate(${f(t.x)}, 0) rotate(${f((i - 1) * 7)})`}>
          <path d={`M ${f(-t.w)} 0 Q ${f(-t.w * 1.3)} ${f(-t.h * 0.5)} ${f(-t.w * 1.1)} ${f(-t.h)} L ${f(t.w * 1.1)} ${f(-t.h)} Q ${f(t.w * 1.3)} ${f(-t.h * 0.5)} ${f(t.w)} 0 Z`} fill="var(--color-sponge)" />
          <path d={`M ${f(-t.w * 0.5)} -0.05 Q ${f(-t.w * 0.7)} ${f(-t.h * 0.5)} ${f(-t.w * 0.6)} ${f(-t.h + 0.04)}`} stroke="var(--color-coral-tip)" strokeWidth={0.02} fill="none" opacity={0.3} />
          <ellipse cx={0} cy={f(-t.h)} rx={f(t.w * 1.1)} ry={f(t.w * 0.4)} fill="var(--color-sponge)" />
          <ellipse cx={0} cy={f(-t.h + 0.01)} rx={f(t.w * 0.8)} ry={f(t.w * 0.26)} fill="var(--color-abyss)" opacity={0.75} />
        </g>
      ))}
    </g>
  );
});

/* ------------------------------------------------------------- crinoid */

export const Crinoid = memo(function Crinoid({ seed }: { seed: number }) {
  const arms = Array.from({ length: 7 }, (_, i) => {
    const a = -Math.PI + 0.25 + (i / 6) * (Math.PI - 0.5);
    const L = 0.45 + rnd(seed + i) * 0.15;
    const ex = Math.cos(a) * L;
    const ey = -0.95 + Math.sin(a) * L;
    const cx = Math.cos(a) * L * 0.5;
    const cy = -0.95 + Math.sin(a) * L * 0.9 - 0.05;
    const pins = Array.from({ length: 5 }, (_, j) => {
      const t = (j + 1) / 6;
      const px = (1 - t) * (1 - t) * 0 + 2 * (1 - t) * t * cx + t * t * ex;
      const py = (1 - t) * (1 - t) * -0.95 + 2 * (1 - t) * t * cy + t * t * ey;
      return `M${f(px)} ${f(py)} l${f(-0.05)} ${f(0.05)} M${f(px)} ${f(py)} l${f(0.05)} ${f(0.05)}`;
    }).join(" ");
    return { d: `M0 -0.95 Q${f(cx)} ${f(cy)} ${f(ex)} ${f(ey)}`, pins };
  });
  return (
    <g stroke="var(--color-coral-violet)" fill="none" strokeLinecap="round">
      <path d="M 0 0 Q 0.06 -0.5 0 -0.92" strokeWidth={0.05} />
      <g>
        <animateTransform attributeName="transform" type="rotate" values="-4 0 -0.95; 4 0 -0.95; -4 0 -0.95" dur={`${f(4 + rnd(seed) * 2)}s`} repeatCount="indefinite" />
        {arms.map((a, i) => (
          <g key={i}>
            <path d={a.d} strokeWidth={0.035} />
            <path d={a.pins} strokeWidth={0.012} opacity={0.75} />
          </g>
        ))}
      </g>
      <circle cx={0} cy={-0.95} r={0.06} fill="var(--color-coral-violet)" stroke="none" />
    </g>
  );
});
