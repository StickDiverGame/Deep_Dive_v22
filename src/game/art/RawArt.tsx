// Hand-drawn training pictures stored as SVG files, scaled to fill their card.
import { memo, useEffect, useRef } from "react";
import longhose from "./longhose.svg?raw";
import lhShort from "./longhose-short.svg?raw";
import lhDangle from "./longhose-dangle.svg?raw";
import lhLeft from "./longhose-left.svg?raw";
import lhDouble from "./longhose-double.svg?raw";
import lhSingle from "./longhose-single.svg?raw";
import full from "./twinset-full.svg?raw";
import single from "./twinset-single.svg?raw";
import noManifold from "./twinset-noManifold.svg?raw";
import noIso from "./twinset-noIso.svg?raw";
import noLonghose from "./twinset-noLonghose.svg?raw";
import noBands from "./twinset-noBands.svg?raw";
import techfins from "./techfins.svg?raw";
import cylinder from "./cylinder.svg?raw";

export const TWINSET_ART: Record<string, string> = { full, single, noManifold, noIso, noLonghose, noBands };
/** Keyed by Long Hose puzzle option id. */
export const LONGHOSE_ART: Record<string, string> = {
  h1: longhose, h2: lhShort, h3: lhDangle, h4: lhLeft, h5: lhDouble, h6: lhSingle,
};

/* ---------- Tech fins: same drawing, different leg animations ---------- */
const KT = "0; 0.22; 0.44; 0.58; 0.76; 1";
type Joint = [string, string, string]; // hip, knee, ankle values (left side; right is mirrored)
function legs(left: Joint, right: Joint, keyTimes = KT): string {
  const vals = [...left, ...right];
  let i = 0;
  return techfins
    .replace(/values="[^"]*"/g, () => `values="${vals[i++]}"`)
    .replace(/keyTimes="[^"]*"/g, `keyTimes="${keyTimes}"`);
}
const neg = (v: string) => v.split(";").map((x) => String(-Number(x.trim()))).join("; ");
const mirror = (j: Joint): Joint => [neg(j[0]), neg(j[1]), neg(j[2])];
const KT5 = "0; 0.25; 0.5; 0.75; 1";
const flutterL: Joint = ["0; 6; 0; -6; 0", "0; 25; 0; 0; 0", "0; -15; 0; 10; 0"];
const flutterR: Joint = ["0; -6; 0; 6; 0", "0; 0; 0; -25; 0", "0; -10; 0; 15; 0"];
const bikeL: Joint = ["0; 10; 0; 0; 0", "0; -60; 0; 0; 0", "0; 40; 0; 0; 0"];
const bikeR: Joint = ["0; 0; 0; -10; 0", "0; 0; 0; 60; 0", "0; 0; 0; -40; 0"];
const scissorL: Joint = ["0; 30; 0; -10; 0", "0; 0; 0; 0; 0", "0; 0; 0; 0; 0"];
const scissorR: Joint = ["0; 10; 0; -30; 0", "0; 0; 0; 0; 0", "0; 0; 0; 0; 0"];
const frogL: Joint = ["0; 0; 60; 30; 0; 0", "0; 0; -100; 0; 0; 0", "0; 0; 120; 0; 0; 0"];

/** Keyed by Tech Fins puzzle option id; tf1 is the correct frog kick. */
export const TECHFINS_ART: Record<string, string> = {
  tf1: techfins,
  tf2: legs(flutterL, flutterR, KT5),
  tf3: legs(bikeL, bikeR, KT5),
  tf4: legs(scissorL, scissorR, KT5),
  tf5: techfins.replace(/<animateTransform[\s\S]*?\/>/g, ""),
  // frog kick but the fins never turn out (ankles locked) — feet push with no power
  tf6: legs(
    [frogL[0], frogL[1], "0; 0; 100; 0; 0; 0"],
    mirror([frogL[0], frogL[1], "0; 0; 100; 0; 0; 0"]),
  ).replace(/<polygon points="-7,16 7,16 16,68 -16,68"[^>]*\/>/g, "").replace(/<line x1="(-?5|0|-?12|12)" y1="(24|42)"[^>]*\/>/g, ""),
};

/* ---------- Cylinder: full rig is correct, each wrong one misses a part ---------- */
function cut(svg: string, startMarker: string, endMarker: string): string {
  const a = svg.indexOf(startMarker);
  const b = svg.indexOf(endMarker, a + 1);
  return a < 0 || b < 0 ? svg : svg.slice(0, a) + svg.slice(b);
}
const H1 = "<!-- HOSE 1";
const H2 = "<!-- HOSE 2";
const H3 = "<!-- HOSE 3";
const H4 = "<!-- HOSE 4";
/** Keyed by Cylinder puzzle option id. */
export const CYLINDER_ART: Record<string, string> = {
  t1: cylinder,
  t2: cut(cylinder, H4, "</svg>"), // no pressure gauge
  t3: cut(cylinder, H2, H3), // no octopus
  t4: cut(cylinder, H1, H2), // no primary regulator
  t5: cut(cylinder, H3, H4), // no inflator hose
  // hoses in the wrong place: gauge on the regulator hose, regulator on the gauge hose
  t6: cylinder
    .replace('href="#secondStagePrimary"', 'href="#__P"')
    .replace('href="#spg"', 'href="#secondStagePrimary"')
    .replace('href="#__P"', 'href="#spg"'),
};

/** Injects the SVG once so its built-in animation keeps running between game frames. */
export const RawArt = memo(function RawArt({ svg }: { svg: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = svg;
  }, [svg]);
  return (
    <div
      ref={ref}
      className="pointer-events-none h-full w-full [&>svg]:h-full [&>svg]:w-full [&_*]:pointer-events-none"
    />
  );
});
