import { groundAt } from "./course.mjs?v=3d15474f11f1";

export function pocketPlatforms(j, time) {
  const g = groundAt(j.x);
  const phase = 0.5 - Math.cos(time * 1.15 + j.id) * 0.5;
  return [
    { id: `${j.id}-step`, x: j.x + 36, y: g - 38, w: 74, kind: "step" },
    {
      id: `${j.id}-lift`,
      x: j.x + 116,
      y: g - 32 - phase * 79,
      w: 118,
      kind: "lift",
    },
    { id: `${j.id}-return`, x: j.x - 154, y: g - 98, w: 262, kind: "return" },
    { id: `${j.id}-exit`, x: j.x + 244, y: g - 54, w: 142, kind: "exit" },
  ];
}

export function supportFor(player, x, base, platforms, previousY) {
  // One-way platforms may be entered from below, but only support feet crossing their top.
  let support = { id: "ground", y: base, x: -Infinity, w: Infinity };
  for (const p of platforms) {
    const on = x > p.x - 10 && x < p.x + p.w + 10;
    const wasAbove = previousY <= p.y + (player.support === p.id ? 9 : 2);
    if (on && wasAbove && p.y < support.y) support = p;
  }
  return support;
}
