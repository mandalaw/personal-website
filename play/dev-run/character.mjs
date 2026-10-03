import { shoe, shoeDefinitions } from './footwear.mjs?v=5c81a98406d8';
import { material, resolvePalette } from './palette.mjs?v=dd92ec3032ad';
import { slideArtwork } from "./slide-body.mjs?v=f69e9bf83f88";
import { TURN_SECONDS } from "./locomotion.mjs?v=9390228e9641";
import {
  definitions,
  poses,
} from "../../images/characters/motion/poses.mjs?v=755e8af1f27e";
import { STAGES, stageProgress } from "./course.mjs?v=1b77db058418";
const part = (id, transform = "") =>
  `<g transform="${transform}"><use href="#dev-part-${id}"/></g>`;
const turn = (a, x, y) => `rotate(${a} ${x} ${y})`;
const bag = (dx = 0, dy = 0, angle = 0) =>
  `<g transform="translate(${dx} ${dy}) rotate(${angle} 133 119)"><path d="M126 77Q110 78 108 95L104 151Q103 167 121 174L146 167 151 92Q144 74 126 77Z" fill="#253247"/><path d="M117 90Q126 81 137 87L138 149Q121 157 112 147Z" fill="#47566e"/><path d="M115 123L135 119 134 147 112 151Z" fill="#344159"/><path d="M118 128L129 126" stroke="#f8a78f" stroke-width="3"/><path d="M130 79Q128 66 138 72L143 84" fill="none" stroke="#29374b" stroke-width="5"/><path d="M139 87Q155 104 148 151" fill="none" stroke="#86969e" stroke-width="5"/></g>`;
const laptop = (x = 120, y = 349, angle = 0, open = 0) =>
  `<g transform="translate(${x} ${y}) rotate(${angle})"><path d="M0 8L116 8 125 14 9 16Z" fill="#c7d0d2"/><path d="M9 16L125 14 122 20 16 22Z" fill="#7e919b"/><path d="M17 10L103 10" stroke="#39485c" stroke-width="2"/>${open ? `<path d="M5 7L9 ${-open} 108 ${-open - 4} 115 7Z" fill="#2b394e" stroke="#b4c0c3" stroke-width="3"/><path d="M44 ${-open * 0.48}h28m-20 7h23" stroke="#f77062" stroke-width="3"/>` : ""}<circle cx="37" cy="23" r="4" fill="#263043"/><circle cx="102" cy="22" r="4" fill="#263043"/></g>`;
const legs = (tuck = 0) => tuck ? `<g data-leg="rear"><path d="M147 186Q126 228 105 258L147 306 163 289 137 256 183 206Z" fill="${material("pants")}"/>${shoe('rear',161,313,19,.9)}</g><g data-leg="front"><path d="M178 184L211 238 239 268 224 282 187 258 156 214Z" fill="${material("pants")}"/>${shoe('front',239,289,23,.9)}</g>` : "";
function armTo(x, y, side = "left") {
  const sx = side === "left" ? 147 : 200,
    ex = (sx + x) / 2 + (side === "left" ? -13 : 10),
    ey = Math.max(110, (96 + y) / 2 + 12);
  return `<path d="M${sx} 96Q${ex} ${ey} ${x} ${y}" fill="none" stroke="${material("jacket")}" stroke-width="16" stroke-linecap="round"/><path d="M${x} ${y - 4}L${x + 2} ${y + 5}" stroke="#ffb8b8" stroke-width="9" stroke-linecap="round"/>`;
}
const grip = (x, y, angle, along = 20) => [
  x +
    along * Math.cos((angle * Math.PI) / 180) -
    10 * Math.sin((angle * Math.PI) / 180),
  y +
    along * Math.sin((angle * Math.PI) / 180) +
    10 * Math.cos((angle * Math.PI) / 180),
];
function rig(l = 0, r = 0, a = 0, b = 0, lean = 0, options = {}) {
  const o = { bx: 0, by: 0, ba: 0, tuck: 0, head: 0, bounce: 0, ...options };
  return `<g transform="translate(0 ${o.bounce})">${o.tuck ? legs(o.tuck) : part("leg-left", turn(l, 150, 195)) + part("leg-right", turn(r, 176, 195))}<g transform="${turn(lean, 170, 195)}">${bag(o.bx, o.by, o.ba)}${part("torso")}${part("head", turn(o.head, 170, 65))}<circle cx="147" cy="96" r="8" fill="${material("jacket")}"/><circle cx="200" cy="96" r="8" fill="${material("jacket")}"/>${o.left ? armTo(...o.left) : part("left", turn(a, 147, 96))}${o.right ? armTo(...o.right, "right") : part("right", turn(b, 200, 96))}</g></g>`;
}
function crouch(lean = 0, board = false) {
  return `${board ? `<g transform="translate(-16 0) scale(1.15 1)">${laptop(112, 342, lean)}</g>` : ""}<g data-leg="rear"><path d="M155 265Q117 278 103 312L165 342 176 327 139 304 184 290Z" fill="${material("pants")}"/>${shoe('rear',177,351,0,.9)}</g><g data-leg="front"><path d="M180 270L205 299 230 327 217 344 190 317 158 284Z" fill="${material("pants")}"/>${shoe('front',235,350,0,.9)}</g><g transform="translate(-25 83) rotate(${50 + lean} 170 195)">${bag(-5, -6, -7)}${part("torso")}${part("head", turn(-10, 170, 65))}${part("left", turn(-48, 147, 96))}${part("right", turn(15, 200, 96))}</g>`;
}
export const trophyArt =
  '<path d="M129 119H213V173Q171 206 129 173Z" fill="#f8a78f"/><path d="M129 128H113Q107 162 139 169M213 128H230Q235 162 202 169" fill="none" stroke="#f8a78f" stroke-width="9"/><path d="M171 190V220M147 222H195" stroke="#f8a78f" stroke-width="10" stroke-linecap="round"/><rect x="143" y="137" width="57" height="28" rx="5" fill="#fa6771"/><text x="171" y="157" text-anchor="middle" font-family="Arial" font-weight="700" font-size="20" fill="#fff">DEV</text>';
export const PLAYER_STATES = Object.freeze([
  "idle",
  "run",
  "accelerated-run",
  "slowing",
  "jump-anticipation",
  "push-off",
  "jump-ascent",
  "air-tuck",
  "jump-apex",
  "fall",
  "landing-prepare",
  "landing",
  "hard-landing",
  "recovery-run",
  "crouch",
  "slide",
  "laptop-reach",
  "laptop-extract",
  "laptop-flip",
  "laptop-mount",
  "laptop-ride",
  "laptop-balance",
  "laptop-pop",
  "laptop-catch",
  "laptop-stow",
  "board-jump",
  "stumble",
  "hit",
  "recovery",
  "look-up",
  "look-back",
  "adjust-pack",
  "check-map",
  "catch-breath",
  "shrug",
  "point",
  "wave",
  "facepalm",
  "checkpoint-type",
  "surprise",
  "accept-trophy",
  "inspect-trophy",
  "raise-trophy",
  "pet-cat",
  "victory",
  "game-over",
  "restart",
]);
export function characterArt() {
  const art = {
    idle: rig(),
    "jump-anticipation": `<g transform="translate(0 29) scale(1 .92)">${rig(10, -12, -30, 35, 14, { by: 9, ba: 4 })}</g>`,
    "push-off": rig(-17, 24, -78, 43, -5, { by: 11, ba: 9 }),
    "jump-ascent": rig(-35, 39, -72, 45, -9, { by: 10, ba: 8 }),
    "air-tuck": rig(0, 0, -85, 47, -4, { tuck: 1, by: 4, head: -6 }),
    "jump-apex": rig(0, 0, -65, 65, 1, { tuck: 1, by: -6, head: 4 }),
    fall: rig(22, -20, -37, 30, 8, { by: -10, ba: -7 }),
    "landing-prepare": rig(16, -13, -54, 26, 16, { by: -8, head: 8 }),
    landing: `<g transform="translate(0 39) scale(1 .89)">${rig(-14, 19, -35, 28, 19, { by: 13, ba: 9 })}</g>`,
    "hard-landing": `<g transform="translate(0 63) scale(1 .82)">${rig(-19, 26, -47, 34, 27, { by: 19, ba: 11 })}</g>`,
    "recovery-run": rig(-12, 20, -30, 25, 13, { by: 5 }),
    crouch: crouch(),
    slide: crouch(3),
    "board-jump": rig(-25, 32, -63, 41, 12, { by: 9 }) + laptop(105, 335, -9),
    stumble: rig(-28, 18, 43, -53, 22, { by: -7, ba: -12 }),
    hit: rig(31, -21, -55, 43, -23, { bx: 8, by: -12, ba: 18 }),
    recovery: rig(12, -13, -15, 27, 8, { by: 8 }),
    "look-up": rig(8, -8, -16, 20, 4, { head: -18 }),
    "look-back": rig(15, -17, -27, 48, 5, { head: -24 }),
    "adjust-pack": rig(3, -4, 70, -8, 3, { by: -5 }),
    "check-map":
      rig(1, -3, -46, -48, 3, { head: 15 }) +
      '<path d="M183 135L226 128 234 173 194 181Z" fill="#dae1d6"/><path d="M191 143L224 158 201 169" fill="none" stroke="#6e8e88" stroke-width="4"/>',
    "catch-breath": rig(-8, 8, -12, 14, 20, { head: 13, by: 6 }),
    shrug: rig(-5, 5, -65, 62, 0, { head: 10 }),
    point: rig(3, -5, -90, 10, 0),
    wave: bag() + poses.wave.art,
    facepalm: rig(2, -3, -155, 12, 6, { head: 18 }),
    "checkpoint-type": rig(0, 0, -57, -40, 8) + laptop(153, 153, -4, 35),
    surprise: rig(-7, 10, -48, 57, -10, { head: -8, by: 7 }),
    "accept-trophy": rig(0, 0, 0, 0, 0, {
      left: [210, 159],
      right: [246, 151],
    }),
    "inspect-trophy":
      rig(0, 0, 0, 0, 0, { head: 18, left: [210, 172], right: [240, 172] }) +
      `<g transform="translate(130 68) scale(.58)">${trophyArt}</g>`,
    "raise-trophy":
      rig(0, 0, 0, 0, 0, { by: -6, left: [215, 75], right: [231, 75] }) +
      `<g transform="translate(115 -67) scale(.65)">${trophyArt}</g>`,
    "pet-cat":
      crouch(-12).replace(part("right", turn(15, 200, 96)), "") +
      `<path d="M226 217Q250 253 278 306" fill="none" stroke="${material("jacket")}" stroke-width="15" stroke-linecap="round"/><path d="M278 306L284 313" stroke="#ffb8b8" stroke-width="9" stroke-linecap="round"/>`,
    victory:
      rig(0, 0, 0, 0, 0, { left: [230, 166], right: [254, 169] }) +
      `<g transform="translate(135 40) scale(.65)">${trophyArt}</g>`,
    "game-over": rig(6, -6, 0, 0, 24, { by: 8, head: 15 }),
    restart: bag() + poses.wave.art,
  };
  for (let i = 0; i < 12; i++) {
    const t = Math.sin((i / 12) * Math.PI * 2),
      b = Math.cos((i / 12) * Math.PI * 4);
    art["run-" + i] = rig(t * 31, -t * 31, -t * 40, t * 37, 8, {
      by: -b * 4,
      ba: t * 3,
      bounce: b * 2,
    });
    art["accelerated-run-" + i] = rig(t * 40, -t * 38, -t * 48, t * 44, 17, {
      by: -b * 7,
      ba: t * 7,
      bounce: b * 3,
    });
    art["laptop-ride-" + i] = crouch(t * 3, true);
  }
  for (let i = 0; i < 4; i++) {
    const t = i / 3;
    art["slowing-" + i] = rig(
      18 * (1 - t),
      -18 * (1 - t),
      -28 * (1 - t),
      25 * (1 - t),
      10 * (1 - t),
      { by: 4 * t },
    );
    art["laptop-reach-" + i] = rig(-8, 12, 0, 0, 0, {
      left: [147 - 27 * t, 190 - 102 * t],
      by: -4 * t,
    });
    let x = 105 + 45 * t,
      y = 117 + 45 * t,
      a = 90 * (1 - t);
    art["laptop-extract-" + i] =
      rig(-8, 12, 0, 0, 0, {
        left: grip(x, y, a),
        right: t > 0.6 ? grip(x, y, a, 100) : [203, 190],
      }) + laptop(x, y, a, 28 * t);
    x = 150 - 38 * t;
    y = 162 + 180 * t;
    a = -4 * t;
    art["laptop-flip-" + i] =
      rig(-10, 13, 0, 0, 0, {
        left: [165 - 35 * t, 172 - 42 * t],
        right: [245 - 25 * t, 172 - 35 * t],
      }) + laptop(x, y, a, 28 * (1 - t));
    art["laptop-mount-" + i] =
      `<g transform="translate(-16 0) scale(1.15 1)">${laptop(112, 342, 0)}</g><g transform="translate(0 ${-35 * (1 - t)})">${crouch(-35 * (1 - t), false)}</g>`;
    art["laptop-pop-" + i] =
      rig(-10, 14, 0, 0, 12 - 8 * t, {
        left: [158 + 20 * t, 190 - 20 * t],
        right: [217 + 20 * t, 184 - 15 * t],
      }) + laptop(98 + 35 * t, 342 - 120 * t, -35 * t);
    x = 133 + 17 * t;
    y = 222 - 60 * t;
    a = -35 * (1 - t);
    art["laptop-catch-" + i] =
      rig(-7, 10, 0, 0, 0, { left: grip(x, y, a), right: grip(x, y, a, 100) }) +
      laptop(x, y, a);
    x = 150 - 45 * t;
    y = 162 - 64 * t;
    a = 85 * t;
    art["laptop-stow-" + i] =
      `<g opacity="${1 - Math.max(0, t - 0.65) / 0.35}">${laptop(x, y, a)}</g>` +
      rig(-5, 7, 0, 0, 0, {
        left: grip(x, y, a),
        right: [245 - 42 * t, 172 + 18 * t],
      });
  }
  art["laptop-balance"] = crouch(-12, true);
  // Separate body parts rotate in depth; no scaleX interpolation on the silhouette.
  art["turn-quarter"] =
    rig(-3, 4, 8, -8, 0, { bx: 7, head: 3 }) +
    '<path d="M151 105Q159 139 153 173" fill="none" stroke="#334158" stroke-width="6" opacity=".4"/>';
  art["turn-front"] =
    `${part("leg-left", "translate(5 0)")}${part("leg-right", "translate(-2 0)")}${bag(17, 0, 0)}${part("torso")}<path d="M168 98L175 189" stroke="var(--dev-shirt,#fa6771)" stroke-width="9"/><g transform="translate(-5 0)">${part("head")}</g>${part("left", "translate(-3 0)")}${part("right", "translate(3 0)")}<path d="M146 104L149 172M198 104L195 172" stroke="#334158" stroke-width="3" opacity=".45"/>`;
  for(let i=0;i<24;i++)art["slide-body-"+i]=slideArtwork(i/23,"A",{part,bag,armTo});
  return art;
}
export function characterSvg(art,theme='light') {
  return resolvePalette(`<svg xmlns="http://www.w3.org/2000/svg" width="340" height="390" viewBox="20 -10 340 390"><defs>${shoeDefinitions(definitions)}</defs>${art}</svg>`,theme);
}
export async function loadCharacter(theme = document.documentElement.dataset.theme === 'night' ? 'dark' : 'light') {
  const entries = await Promise.all(
    Object.entries(characterArt()).map(async ([k, v]) => {
      const url = URL.createObjectURL(
        new Blob([characterSvg(v,theme)], { type: "image/svg+xml" }),
      );
      const img = new Image();
      try {
        img.src = url;
        await img.decode();
        return [k, img];
      } finally {
        URL.revokeObjectURL(url);
      }
    }),
  );
  return Object.fromEntries(entries);
}
export function poseFor(game, time) {
  const p = game.player,
    s = STAGES[game.stage],
    progress = stageProgress(game);
  const frame = (name, t, n = 4) =>
    name + "-" + Math.min(n - 1, Math.max(0, Math.floor(t * n)));
  if (game.status === "title") return "adjust-pack";
  if (game.status === "won")
    return game.ceremony < 3
      ? "surprise"
      : game.ceremony < 8
        ? "accept-trophy"
        : game.ceremony < 9
          ? "inspect-trophy"
          : game.ceremony < 12
            ? "raise-trophy"
            : game.ceremony < 14
              ? "pet-cat"
              : "victory";
  if (game.status === "over") return "facepalm";
  if (p.invulnerable > 1.55) return "hit";
  if (p.invulnerable > 1.3) return "stumble";
  if (p.invulnerable > 1) return "recovery";
  if (p.anticipate > 0) return "jump-anticipation";
  if (p.takeoff > 0.07) return "push-off";
  if (!p.grounded) {
    if (p.board) return "board-jump";
    if (p.vy < -360) return "jump-ascent";
    if (p.vy < -110) return "air-tuck";
    if (p.vy < 110) return "jump-apex";
    if (p.y > game.surfaceAt(game.distance) - 35) return "landing-prepare";
    return "fall";
  }
  if (p.land > 0.14) return p.impact > 700 ? "hard-landing" : "landing";
  if (p.land > 0) return "recovery-run";
  if (p.ride && game.mode !== "planner") {
    const age = p.ride.age;
    if (p.ride.phase === "extract") {
      if (age < 0.25) return frame("laptop-reach", age / 0.25);
      if (age < 0.55) return frame("laptop-extract", (age - 0.25) / 0.3);
      if (age < 0.85) return frame("laptop-flip", (age - 0.55) / 0.3);
      return frame("laptop-mount", (age - 0.85) / 0.25);
    }
    if (p.ride.phase === "exit") {
      if (age < 0.4) return frame("laptop-pop", age / 0.4);
      if (age < 0.8) return frame("laptop-catch", (age - 0.4) / 0.4);
      return frame("laptop-stow", (age - 0.8) / 0.4);
    }
    if (game.input.axis < 0) return "laptop-balance";
    return frame("laptop-ride", (time * 1.5) % 1, 12);
  }
  if (p.turn > 0) return "turn-quarter";
  if(p.slidePhase)return 'slide-body-'+Math.min(23,Math.floor(p.slideAge/p.slideDuration*24));
  if (p.duck > 0) return "crouch";
  if (
    p.idle > 0.4 &&
    (!game.upcoming() || game.upcoming().x - game.distance > 300)
  )
    return ["idle", "adjust-pack", "look-up", "check-map"][
      Math.floor(p.idle / 2.4) % 4
    ];
  if (Math.abs(p.vx || 0) < 65 && game.mode !== "planner")
    return frame("slowing", 1 - Math.abs(p.vx || 0) / 65);
  if (game.reaction?.until > game.stats.time) return game.reaction.name;
  const incoming = game.upcoming();
  if (
    incoming &&
    ["server", "build"].includes(incoming.type) &&
    incoming.x - game.distance > 280 &&
    incoming.x - game.distance < 340
  )
    return "look-up";
  if (game.mode === "planner" || game.status === "paused") return "check-map";
  if (s.movement === "travel") return "point";
  if (s.movement === "arrival") return frame("slowing", progress);
  return frame(
    s.movement === "sprint" ? "accelerated-run" : "run",
    (time * (s.movement === "sprint" ? 1.8 : 1.4)) % 1,
    12,
  );
}
