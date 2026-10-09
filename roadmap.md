# DeepDive V13 Roadmap

Carried over from DeepDive V8 (remixed). The wreck tie-off hitbox fix
(rottated-frame `wreckHit` in `src/game/tech.tsx` + `nearWreck` in
`src/game/DiveGame.tsx`) is already in the codebase.

## 0. Browser tab title
- [x] Tab title and share title read "Learn to dive, one skill at a time"

## 1. Collapsible Badge Tray
- [x] Compact top-left button: `[ 🎖 Badges (N) ]`
- [x] Expanded drawer/grid showing all earned badges
- [x] Practice badges (BCD, Reg, Twinset, etc.) still clickable to open mini-games
- [x] Dismiss via dedicated `✕` close button on the tray
- [x] No gameplay/balance/physics changes

## 2. Mobile Phone Controls (always visible)
- [x] Bottom-left arrow cluster (←, →, ↑, ↓) for the left thumb:
      beach walking, water entry (↓), exit (↑), rhythmic ↑ tapping for ascent rate
- [x] Pointer capture so sliding a thumb off a button doesn't stick movement
- [x] Tap / tap+hold / tap+drag anywhere in the water: swim toward the touch
      (horizontal steer, ascend/descend), release → neutral buoyancy
- [x] HUD buttons consume their own pointer events (no accidental swimming)
- [x] Gear tray stays along the bottom edge, next to the arrow cluster

## 3. V10 features
- [x] Tech Fins puzzle (animated frog-kick drawing is the correct choice)
- [x] Wreck 2: stern x 57.8 at 45 m, bow x 72.2 at 80 m
- [x] Phone arrow pad always visible (safe-area aware, larger, on top)
- [x] Two-finger pinch zoom 0.5×–2.0×, view width follows screen shape
- [x] Drag down on the beach to enter the water

## 4. Upcoming
- [x] Natural cave entrances: recessed arches in the wall instead of boxes
- [x] Cylinder t6: regulator and gauge hoses swapped (instead of missing knob)

## 5. Cave and wreck penetration
- [x] Restyle cave entrances as sloping limestone arches with dark recessed mouths, overhangs, stalactites, and breakdown boulders
- [x] Add Cave-1-gated penetration holes to Wrecks 2, 3, and 4
- [x] Reveal wreck interiors and staged cylinders only inside the active torch beam
- [x] Allow wreck penetration without failing when the reel or torch is missing or switched off

## 6. Wreck entry, bells, sea life
- [x] Enter a wreck by clicking its breach within 3 m; auto-exit near the breach from inside
- [x] Inside a wreck the diver is confined to the hull
- [x] Ship's Bells hidden in Wrecks 2–4 after Cave-1; first awards Wreck-2, counted "Ship's Bell N", no respawn
- [x] Cheat on the caves step also grants Wreck-2 and a bell
- [x] Background sea life (schools, mantas, eagle rays, dolphins, sharks, lionfish, jellyfish, morays, mermaids)

## 7. Build list
- [x] Safety-stop loop fix after deco stops
- [x] Explicit success rules in the Cheat popup
- [x] 4-dive steps reduced to 2
- [x] Auto-check already-fulfilled steps
- [x] Rebreather: spawns after 2nd bell, beach tab, 480-min clock, Best Mix
- [x] More realistic sea life (tail beats, banking turns, ray wings, jelly pulse)
- [x] Thin black outline on the mask-puzzle arm

## 8. HUD and sea life realism
- [x] Top-right gauges no longer cover the Cheat / Explore buttons (click-through wrapper, narrower width, compact spacing)
- [x] Marine life redrawn: smooth anatomical outlines, countershaded gradients, traveling spine-wave swimming, depth haze

## 9. Reels, cave line, deep gear, buttons
- [x] After Wreck 3, a 360 m reel spawns on Wreck 2's deck on return to the beach (covers Wreck 3 → Wreck 4)
- [x] Cave lines follow the passage they're in instead of jumping to the nearest tunnel
- [x] Deep / 250 m torch and DPV spawn whenever their trigger is met, in any badge order
- [x] Cheat / Explore moved under the Badges button so they no longer overlap the gauges
