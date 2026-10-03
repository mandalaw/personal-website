import { flag, tower, billboard } from "./environment.mjs?v=6759a2a50bf9";
import { cat } from "./world.mjs?v=8426e57ab827";
import { drawTrophy, round } from "./scenery.mjs?v=5014aceabc11";
export const CEREMONY_SECONDS = 16;
export const CEREMONY_BEATS = Object.freeze([
  "arrival",
  "crowd gathers",
  "cart procession",
  "cat passenger",
  "presenter approaches",
  "trophy handoff",
  "Dev inspects",
  "trophy raise",
  "applause",
  "cat hops down",
  "Dev pets cat",
  "congratulations",
  "epilogue",
]);
export const CROWD_VARIANTS = 6;
const clamp = (x) => Math.max(0, Math.min(1, x));
function person(c, x, y, color, phase, t, kind = 0) {
  c.save();
  c.translate(x, y);
  c.scale(1.6, 1.6);
  const arm = Math.sin(t * 5 + phase) * 7;
  c.fillStyle = "#d2ae9d";
  c.beginPath();
  c.arc(0, -71, 9, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = kind % 2 ? "#263348" : "#5e4e4b";
  c.beginPath();
  c.arc(0, -74, 10, Math.PI, Math.PI * 2);
  c.fill();
  c.fillStyle = color;
  round(c, -12, -60, 24, 37, 8);
  c.fill();
  c.strokeStyle = color;
  c.lineWidth = 8;
  c.lineCap = "round";
  c.beginPath();
  if (kind === 6) {
    c.moveTo(-9, -53);
    c.lineTo(-20, -51);
    c.lineTo(-20, -51);
    c.moveTo(9, -53);
    c.lineTo(-6, -46);
    c.lineTo(-17, -49);
  } else {
    c.moveTo(-9, -53);
    c.lineTo(-20, -42 - arm);
    c.lineTo(kind % 3 === 1 ? -27 : -4, -55 - arm);
    c.moveTo(9, -53);
    c.lineTo(20, -46 + arm);
    c.lineTo(kind % 3 === 2 ? 24 : 5, -61 + arm);
  }
  c.stroke();
  c.strokeStyle = "#293548";
  c.lineWidth = 9;
  c.beginPath();
  c.moveTo(-5, -25);
  c.lineTo(-9, 0);
  c.moveTo(5, -25);
  c.lineTo(11, 0);
  c.stroke();
  c.restore();
}
export function drawCeremony(c, w, game, assets, reduced = false, arrivalX) {
  const t = game.ceremony,
    clock = reduced ? 0 : t,
    ground = 421;
  const center = w * 0.5,
    hero = center - 70,
    presenter = center + 48;
  const entrance = reduced ? 1 : clamp(t / 1.2);
  c.save();
  c.globalAlpha = entrance;
  c.fillStyle = "#ffe2af0d";
  c.fillRect(0, 0, w, 540);
  // A clearly poster-like callback joins both places behind the real stage.
  c.save();
  c.globalAlpha = 0.55 * entrance;
  tower(c, w * 0.19, t, 0.78, true);
  c.strokeStyle = "#bb8b7e";
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(w * 0.68, 295);
  c.lineTo(w * 0.68, 168);
  c.moveTo(w * 0.89, 295);
  c.lineTo(w * 0.89, 168);
  c.moveTo(w * 0.61, 193);
  c.quadraticCurveTo(w * 0.78, 305, w * 0.96, 193);
  c.stroke();
  c.restore();
  flag(c, assets.flags.canada, Math.max(28, center - 255), 135, 64, clock);
  flag(c, assets.flags.usa, Math.min(w - 95, center + 235), 135, 64, clock);
  billboard(
    c,
    Math.max(10, center - 370),
    82,
    140,
    48,
    clock,
    assets,
    0,
    t > 9,
  );
  billboard(
    c,
    Math.min(w - 150, center + 230),
    82,
    140,
    48,
    clock,
    assets,
    1,
    t > 9,
  );
  // Paper lanterns and a small stage create a destination, not a roadside pickup.
  c.strokeStyle = "#f5c8aa77";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(0, 107);
  c.quadraticCurveTo(w / 2, 142, w, 107);
  c.stroke();
  for (let i = 0; i < 9; i++) {
    const x = ((i + 0.5) * w) / 9,
      y = 110 + Math.sin((i / 8) * Math.PI) * 15;
    c.fillStyle = i % 2 ? "#d88f7d" : "#f3c392";
    round(c, x - 5, y, 10, 14, 3);
    c.fill();
  }
  c.fillStyle = "#637780";
  round(c, center - 180, ground + 8, 360, 19, 6);
  c.fill();
  c.fillStyle = "#f8a78f";
  c.fillRect(center - 175, ground + 8, 350, 3);
  c.restore();
  const crowd = clamp((t - 0.6) / 2);
  for (let i = 0; i < 8; i++) {
    const side = i < 4 ? -1 : 1,
      order = i % 4,
      x =
        center +
        side * (Math.min(190, w * 0.29) + order * Math.min(55, w * 0.065)) +
        (1 - crowd) * side * (w * 0.5 + 80);
    person(
      c,
      x,
      ground - 12,
      ["#536a7b", "#8b827d", "#ae817a", "#769089", "#62749a", "#a59887"][i % 6],
      i,
      clock,
      i,
    );
  }
  const cartProgress = clamp((t - 2.5) / 3),
    cartX = (w + 90) * (1 - cartProgress) + (center + 105) * cartProgress;
  if (t > 2.5) {
    person(c, cartX + 58, ground, "#627b83", 1, clock, 2);
    c.strokeStyle = "#b4c1bf";
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(cartX + 40, ground - 48);
    c.lineTo(cartX + 53, ground - 61);
    c.stroke();
    c.fillStyle = "#8fa2a6";
    round(c, cartX - 34, ground - 35, 77, 8, 3);
    c.fill();
    for (const x of [-22, 30]) {
      c.fillStyle = "#263246";
      c.beginPath();
      c.arc(cartX + x, ground - 8, 8, 0, Math.PI * 2);
      c.fill();
    }
    if (t < 10.8) cat(c, cartX + 15, ground - 36, 0.8, clock);
    else {
      const hop = clamp((t - 10.8) / 0.9),
        cx = (cartX + 15) * (1 - hop) + (hero + 42) * hop,
        cy = ground - 36 * (1 - hop) - Math.sin(hop * Math.PI) * 24;
      cat(c, cx, cy, 0.8 + 0.1 * hop, clock);
    }
  }
  if (t > 4.8) {
    c.save();
    c.globalAlpha = clamp((t - 4.8) / 0.35);
    const join = clamp((t - 4.8) / 2),
      x = center - 220 + join * 105;
    person(c, x, ground, "#ad7774", 0.7, clock * 0.35, t < 8.5 ? 6 : 1);
    if (t < 8.5) {
      c.strokeStyle = "#d2ae9d";
      c.lineWidth = 5;
      c.beginPath();
      c.moveTo(x + 15, ground - 80);
      c.lineTo(center - 26, ground - 82);
      c.stroke();
    }
    c.restore();
  }
  if (t > 5) {
    c.save();
    c.globalAlpha = clamp((t - 5) / 0.35);
    const x = center + 115 - 67 * clamp((t - 5) / 2);
    person(c, x, ground, "#59788b", 0.3, clock * 0.35, t < 8.5 ? 6 : 1);
    if (t < 8.5) {
      const handoff = clamp((t - 7.3) / 1.2),
        tx = (x - 19) * (1 - handoff) + (hero + 26) * handoff;
      drawTrophy(
        c,
        tx,
        ground - 36 - 39 * clamp((t - 5) / 0.7) - 9 * handoff,
        0.48,
        0,
      );
    }
    c.restore();
  }
  if (t >= 3 && t < 5) drawTrophy(c, cartX - 15, ground - 36, 0.42, 0);
  const pose =
    t < 3
      ? "slowing-" + Math.min(3, Math.floor((t / 3) * 4))
      : t < 6
        ? "surprise"
        : t < 8.5
          ? "accept-trophy"
          : t < 9.5
            ? "inspect-trophy"
            : t < 12
              ? "raise-trophy"
              : t < 14
                ? "pet-cat"
                : "victory";
  const img = assets.character[pose];
  const h = 145 + 31 * clamp(t / 2),
    sw = (h * 340) / 390,
    x = hero + ((arrivalX ?? hero - 80) - hero) * (1 - clamp(t / 2));
  c.drawImage(img, x - sw * 0.444, ground - h + 4, sw, h);
  if (t > 8.5 && !reduced) {
    for (let i = 0; i < 44; i++) {
      const x = (i * 79 + Math.sin(t + i) * 15) % w,
        y = ((t - 8.5) * 41 + i * 19) % 330;
      c.save();
      c.translate(x, y);
      c.rotate(i + t);
      c.fillStyle = ["#f8a78f", "#d1decd", "#809cb2"][i % 3];
      c.fillRect(-2, -2, 4, 7);
      c.restore();
    }
  }
  if (t > 12) {
    c.fillStyle = "#f4ecdc";
    c.textAlign = "center";
    c.font = `700 ${Math.min(34, w * 0.045)}px Arial`;
    c.fillText("CONGRATULATIONS", center, 192);
    c.font = `600 ${Math.min(22, w * 0.027)}px Arial`;
    c.fillText("You survived production. That counts.", center, 225);
    c.font = "12px Arial";
    c.fillStyle = "#d9d7cc";
    c.fillText(
      game.stats.collisions === 0
        ? "Clean build. Very calm cat."
        : "Build passed. The cat approves.",
      center,
      250,
    );
  }
}
