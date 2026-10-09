// BCD (donut wing) training pictures. Animations live in src/styles.css under `.bcd-*`.
import { useId } from "react";

export type BcdVariant = "correct" | "noHose" | "unbuckled" | "punctured" | "overinflated" | "dump";

function BubbleStream({ x, y, bub, cls = "bcd-hoseBubbles" }: { x: number; y: number; bub: string; cls?: string }) {
  return (
    <g className={cls} transform={`translate(${x} ${y})`}>
      <g className="bcd-rise1">
        <circle cx={0} cy={0} r={2.2} fill={bub} stroke="#0284c7" strokeWidth={0.7} />
        <circle cx={-0.6} cy={-0.6} r={0.7} fill="#ffffff" />
      </g>
      <g className="bcd-rise2">
        <circle cx={0.8} cy={-0.5} r={2.6} fill={bub} stroke="#0284c7" strokeWidth={0.7} />
        <circle cx={0.2} cy={-1.1} r={0.8} fill="#ffffff" />
      </g>
      <g className="bcd-rise3">
        <circle cx={-0.5} cy={-0.8} r={2.9} fill={bub} stroke="#0284c7" strokeWidth={0.8} />
        <circle cx={-1.1} cy={-1.4} r={0.85} fill="#ffffff" />
      </g>
      <g className="bcd-rise4">
        <circle cx={0.5} cy={-1.2} r={3.3} fill={bub} stroke="#0284c7" strokeWidth={0.8} />
        <circle cx={-0.2} cy={-1.9} r={0.95} fill="#ffffff" />
      </g>
    </g>
  );
}

export function BcdArt({ variant }: { variant: BcdVariant }) {
  const id = useId().replace(/:/g, "");
  const suit = `url(#bsuit${id})`;
  const wInf = `url(#binf${id})`;
  const wDef = `url(#bdef${id})`;
  const lens = `url(#blens${id})`;
  const bub = `url(#bbub${id})`;
  const hose = variant !== "noHose";
  const raised = variant === "correct" || variant === "unbuckled" || variant === "punctured";

  return (
    <svg viewBox="0 0 110 110" width="100%" height="100%" className={`bcd bcd-${variant}`}>
      <defs>
        <linearGradient id={`bsuit${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0b1e33" />
          <stop offset="50%" stopColor="#1e3a5f" />
          <stop offset="100%" stopColor="#0b1e33" />
        </linearGradient>
        <linearGradient id={`binf${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="40%" stopColor="#1e293b" />
          <stop offset="85%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        <linearGradient id={`bdef${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#090d16" />
        </linearGradient>
        <linearGradient id={`blens${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f0f9ff" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#7dd3fc" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id={`bbub${id}`} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#e0f2fe" stopOpacity="0.95" />
          <stop offset="75%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#0284c7" />
        </radialGradient>
      </defs>

      {/* 1. Wing layer (behind diver) */}
      <g className="bcd-wingsDef">
        <path
          d="M37 51 C34 51, 33 66, 35 78 C36 83, 40 87, 50 87 C60 87, 64 83, 65 78 C67 66, 66 51, 63 51 Z"
          fill={wDef}
          stroke="#090d16"
          strokeWidth={0.8}
        />
      </g>
      <g className="bcd-wingsInf">
        <path
          d="M50 45 C39 45, 33 52, 33 67 C33 80, 40 86, 50 86 C60 86, 67 80, 67 67 C67 52, 61 45, 50 45 Z"
          fill={wInf}
          stroke="#090d16"
          strokeWidth={1.1}
        />
        <path d="M35 54 C34 62, 34.5 73, 39 80" stroke="#f59e0b" strokeWidth={0.8} opacity={0.85} fill="none" strokeLinecap="round" />
        <path d="M65 54 C66 62, 65.5 73, 61 80" stroke="#f59e0b" strokeWidth={0.8} opacity={0.85} fill="none" strokeLinecap="round" />
        <circle cx={35} cy={76} r={1.8} fill="#090d16" stroke="#475569" strokeWidth={0.5} />
        <circle cx={35} cy={76} r={0.9} fill="#f59e0b" />
        {variant === "punctured" && (
          <path d="M64 63 l2 1.5 l-1.5 1 l2 1.5" stroke="#f87171" strokeWidth={0.8} fill="none" strokeLinecap="round" />
        )}
      </g>
      {variant === "punctured" && <BubbleStream x={67} y={64} bub={bub} cls="bcd-leak" />}
      {variant === "dump" && (
        <>
          <path d="M35 76 L30 70" stroke="#f59e0b" strokeWidth={0.6} />
          <BubbleStream x={33} y={73} bub={bub} cls="bcd-dumpBubbles" />
        </>
      )}

      {/* 2. Diver torso */}
      <g className="bcd-torso">
        <path
          d="M50 48 C57 48, 59.5 52, 60 57 C60.6 64, 59 73, 57.8 82 C57.2 87, 55 90, 50 90 C45 90, 42.8 87, 42.2 82 C41 73, 39.4 64, 40 57 C40.5 52, 43 48, 50 48 Z"
          fill={suit}
        />
        <path d="M50 50 L50 88" stroke="#081426" strokeWidth={0.8} opacity={0.6} />
        <path d="M44 51 L43 87 M56 51 L57 87" stroke="#0b1320" strokeWidth={1.8} fill="none" />
        {variant === "unbuckled" ? (
          <>
            <path d="M41 86 L38 92 L36 98" stroke="#0f172a" strokeWidth={3} strokeLinecap="round" fill="none" />
            <path d="M59 86 L62 92 L64 97" stroke="#0f172a" strokeWidth={3} strokeLinecap="round" fill="none" />
            <rect x={62.5} y={95.5} width={4} height={3} rx={0.5} fill="#94a3b8" />
          </>
        ) : (
          <>
            <rect x={41} y={86} width={18} height={4.5} rx={1} fill="#0f172a" />
            <rect x={48} y={86.8} width={4} height={3} rx={0.5} fill="#94a3b8" />
          </>
        )}
        <circle cx={43.5} cy={58} r={1.3} fill="#cbd5e1" />
        <circle cx={56.5} cy={58} r={1.3} fill="#cbd5e1" />
      </g>

      {/* 3. Right arm (screen left) */}
      {variant === "dump" ? (
        <g>
          <path d="M42 51 L33 60 L30 70" stroke="#1e3a5f" strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <g className="bcd-pull">
            <circle cx={30} cy={71} r={2} fill="#fed7aa" />
          </g>
        </g>
      ) : (
        <g>
          <path d="M42 51 L33 63 L31 77" stroke="#1e3a5f" strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M31 77 L30 82" stroke="#fed7aa" strokeWidth={3.5} strokeLinecap="round" fill="none" />
          <circle cx={30} cy={83} r={2} fill="#fed7aa" />
        </g>
      )}

      {/* 4. Head, hood & mask */}
      <g>
        <path d="M50 28 C57.5 28, 61 33.5, 61 40.5 C61 46.5, 56.5 50.5, 50 50.5 C43.5 50.5, 39 46.5, 39 40.5 C39 33.5, 42.5 28, 50 28 Z" fill="#0b1e33" />
        <path d="M50 30.5 C55 30.5, 58 34.5, 58 40 C58 44.8, 55 48.5, 50 48.5 C45 48.5, 42 44.8, 42 40 C42 34.5, 45 30.5, 50 30.5 Z" fill="#fed7aa" />
        <g className="bcd-cheeks">
          <ellipse cx={44} cy={43.5} rx={3.5} ry={2.7} fill="#fed7aa" />
          <ellipse cx={56} cy={43.5} rx={3.5} ry={2.7} fill="#fed7aa" />
        </g>
        <rect x={40.5} y={32.5} width={19} height={9.8} rx={3.5} fill="#0b1320" opacity={0.9} />
        <rect x={42} y={33.8} width={16} height={7} rx={2.2} fill={lens} />
        <path d="M43.5 34.8 L48 34.8 L44.5 39.5 L43 37 Z" fill="#ffffff" opacity={0.6} />
        <path d="M40.5 37 L38 36.5 M59.5 37 L62 36.5" stroke="#0b1320" strokeWidth={1.4} />
      </g>

      {/* 5. Oral-inflate pose (or power-inflate for overinflated, arm-only for noHose) */}
      {variant !== "dump" && (
        <g className="bcd-poseOral">
          {hose && (
            <>
              <path d="M56 49 C64 44, 62 36, 54 43" stroke="#1e293b" strokeWidth={3.5} strokeLinecap="round" fill="none" />
              <path d="M57 47.5 l1 2 M59.5 45.5 l1.2 1.8 M60.5 42.8 l0.8 2 M59 40.5 l-0.4 2.2 M56.5 41.5 l-1 2" stroke="#475569" strokeWidth={0.8} />
              <rect x={49} y={42} width={6} height={4.5} rx={1.2} fill="#0f172a" />
              <rect x={48} y={43} width={2} height={2.5} rx={0.5} fill="#475569" />
              <circle cx={52} cy={43.2} r={1.1} fill="#38bdf8" />
            </>
          )}
          <path d="M55 51 L66 57 L54.5 46" stroke="#1e3a5f" strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx={53.5} cy={45} r={2.2} fill="#fed7aa" />
        </g>
      )}
      {variant === "dump" && (
        <g>
          <path d="M56 49 C64 46, 66 56, 62 62" stroke="#1e293b" strokeWidth={3.5} strokeLinecap="round" fill="none" />
          <path d="M58 52 L64 62 L60 72" stroke="#1e3a5f" strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx={60} cy={73} r={2} fill="#fed7aa" />
        </g>
      )}

      {/* 6. Raised K-style inflator deflation pose */}
      {raised && (
        <g className="bcd-poseRaised">
          <path d="M57 49 Q65 37 68 28 L69 22" stroke="#1e293b" strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M58 46 l1.6 0.8 M60.5 41.5 l1.8 0.6 M63.5 36.5 l1.8 0.4 M66 31.5 l1.8 0.3 M68 26.5 l1.8 0.2" stroke="#475569" strokeWidth={0.9} />
          <path d="M58 52 L68 38 L70 26" stroke="#1e3a5f" strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <g>
            <rect x={67} y={20.5} width={4.5} height={2.2} rx={0.5} fill="#090d16" stroke="#475569" strokeWidth={0.5} />
            <rect x={66} y={17} width={6.5} height={10} rx={1.5} fill="#0f172a" stroke="#334155" strokeWidth={0.7} />
            <circle cx={70.5} cy={24.5} r={2.4} fill="#fed7aa" />
            <ellipse cx={68.5} cy={22.5} rx={1.3} ry={1.8} fill="#fed7aa" />
            <rect x={72.5} y={21} width={3.2} height={2} rx={0.4} fill="#cbd5e1" stroke="#475569" strokeWidth={0.5} />
            <line x1={74} y1={21} x2={74} y2={23} stroke="#64748b" strokeWidth={0.6} />
            <rect x={72.5} y={23.8} width={2} height={1.8} rx={0.3} fill="#94a3b8" stroke="#334155" strokeWidth={0.4} />
            <circle cx={68.2} cy={20} r={1.4} fill="#0284c7" stroke="#38bdf8" strokeWidth={0.5} />
            <path d="M67 17 L67 13.5 L71.5 13.5 L71.5 17 Z" fill="#1e293b" stroke="#090d16" strokeWidth={0.7} />
            <ellipse cx={69.2} cy={13.5} rx={2.8} ry={1.1} fill="#475569" stroke="#090d16" strokeWidth={0.5} />
            <ellipse cx={69.2} cy={13.5} rx={1.9} ry={0.7} fill="#020617" />
          </g>
          <BubbleStream x={69.2} y={13.5} bub={bub} />
        </g>
      )}
    </svg>
  );
}
