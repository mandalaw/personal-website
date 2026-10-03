import { groundAt } from "./course.mjs?v=1b77db058418";

export function pocketPlatforms(j, time) {
  const g = groundAt(j.x);
  if(j.exit){
    if(j.kind==='ascent')return [{id:`${j.id}-lift`,x:j.x+112,y:g-28-(.5-Math.cos(time*1.15+j.id)*.5)*94,w:126,kind:'lift'},{id:`${j.id}-exit`,x:j.x+260,y:g-82,w:156,kind:'exit'}];
    return [{id:`${j.id}-step`,x:j.x+18,y:g-34,w:64,kind:'step'},{id:`${j.id}-upper`,x:j.x+j.exit-34,y:g-(j.kind==='precision'?90:76),w:j.kind==='precision'?82:150,kind:'exit'}];
  }
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
