import { drawLivingWorld, shadow } from "./living-world.mjs?v=073a4f43e5ab";
import { STAGES } from "./course.mjs?v=3d15474f11f1";
import { background, round } from "./scenery.mjs?v=5014aceabc11";
import { drawCityMotion } from "./world.mjs?v=8426e57ab827";
const splits = {
  snow: [0.52, "transit"],
  grid: [0.55, "layers"],
  fog: [0.55, "golden"],
  bridge: [0.55, "cloud"],
};
export const ZONES = STAGES.flatMap((s) => {
  const split = splits[s.id],
    make = (scene, start, end) => ({ scene, start, end, stage: s.index });
  if (!split) return [make(s.style, s.start, s.end)];
  const at = s.start + (s.end - s.start) * split[0];
  return [make(s.style, s.start, at), make(split[1], at, s.end)];
});
const colors = {
  morning: ["#82a2ab", "#c2cec1", "#263c4b"],
  roofs: ["#607e96", "#a4b8bd", "#2c4052"],
  snow: ["#546a83", "#bcc9cd", "#455c68"],
  transit: ["#24354d", "#738b97", "#263b4b"],
  tunnel: ["#172333", "#52616c", "#243244"],
  grid: ["#183743", "#6a9599", "#233b43"],
  layers: ["#244450", "#86a8a8", "#2a4449"],
  transition: ["#334762", "#bbafb0", "#2d4053"],
  fog: ["#587c92", "#c0b9ae", "#324b59"],
  golden: ["#637692", "#d7a084", "#314853"],
  hills: ["#506d88", "#bc9a8d", "#304754"],
  bridge: ["#567d96", "#c6a597", "#324652"],
  cloud: ["#7a94a8", "#d5c2b0", "#354e5d"],
  deploy: ["#293a58", "#9c8594", "#27394d"],
  finish: ["#687b99", "#d7a084", "#344a55"],
};
const smooth = (x) => {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
};
export function mix(a, b, t) {
  const n = (x) => parseInt(x, 16),
    rgb = (h) => [n(h.slice(1, 3)), n(h.slice(3, 5)), n(h.slice(5, 7))];
  const aa = rgb(a),
    bb = rgb(b);
  return (
    "#" +
    aa
      .map((x, i) =>
        Math.round(x + (bb[i] - x) * t)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
export function paletteAt(x) {
  let palette = colors[ZONES[0].scene];
  for (let i = 1; i < ZONES.length; i++) {
    const z = ZONES[i],
      p = smooth((x - z.start + 650) / 1300);
    if (!p) break;
    palette = palette.map((a, j) => mix(a, colors[z.scene][j], p));
  }
  return palette;
}
export function visibleZones(camera, width) {
  return ZONES.filter(
    (z, i) =>
      (i === 0 || z.start < camera + width + 200) &&
      (i === ZONES.length - 1 || z.end > camera - 200),
  );
}
export function flag(c, image, x, y, width = 64, time = 0, base = 368) {
  if (!image) return;
  c.save();
  c.strokeStyle = "#bfcdd0";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(x, y - 3);
  c.lineTo(x, base);
  c.stroke();
  shadow(c, x, base + 2, 14, 0.2);
  c.fillStyle = "#73878c";
  c.fillRect(x - 6, base - 5, 12, 6);
  c.fillStyle = "#d4dcd1";
  c.beginPath();
  c.arc(x, y - 5, 3, 0, 7);
  c.fill();
  const iw = image.naturalWidth || image.width,
    ih = image.naturalHeight || image.height;
  const height = (width * ih) / iw;
  if (!time) c.drawImage(image, x + 2, y, width, height);
  else
    for (let i = 0; i < 16; i++) {
      const ratio = i / 16,
        sw = iw / 16;
      const wave = Math.sin(time * 1.4 - ratio * 4) * ratio * 1.25;
      c.drawImage(
        image,
        sw * i,
        0,
        sw,
        ih,
        x + 2 + width * ratio,
        y + wave,
        width / 16 + 0.15,
        height,
      );
    }
  c.restore();
}
export function tower(c, x, t, scale = 1, celebrate = false) {
  c.save();
  c.translate(x, 0);
  c.scale(scale, scale);
  c.fillStyle = "#253a4f";
  c.beginPath();
  c.moveTo(-13, 358);
  c.lineTo(-4, 87);
  c.lineTo(0, 33);
  c.lineTo(4, 87);
  c.lineTo(13, 358);
  c.fill();
  round(c, -30, 121, 60, 20, 8);
  c.fill();
  round(c, -20, 111, 40, 11, 4);
  c.fill();
  const lights = celebrate
    ? ["#ff877c", "#fff0de"]
    : ["#ecdfc7", "#fa8e91", "#87b9ec", "#c499dd"];
  const q = t / 6;
  const col = mix(
    lights[Math.floor(q) % lights.length],
    lights[(Math.floor(q) + 1) % lights.length],
    smooth(q % 1),
  );
  c.strokeStyle = col;
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(-5, 146);
  c.lineTo(-8, 332);
  c.moveTo(5, 146);
  c.lineTo(8, 332);
  c.stroke();
  c.fillStyle = col;
  c.fillRect(-24, 125, 48, 3);
  c.fillRect(-13, 116, 26, 2);
  c.restore();
}
const messages = [
  "BUILD PASSED",
  "HELLO, WORLD",
  "404? NOT TODAY",
  "DEBUG THE CITY",
  "DEV RUN",
  "SHIP IT",
];
export function billboard(
  c,
  x,
  y,
  w,
  h,
  t,
  assets,
  index = 0,
  celebrate = false,
) {
  c.save();
  c.translate(x, y);
  c.transform(1, -0.045 * (index % 2 ? 1 : -1), 0, 1, 0, 0);
  c.fillStyle = "#334953";
  // Paired posts meet a solid concrete service plinth at the street plane.
  const base = 368 - y;
  for (const px of [w * 0.16, w * 0.84]) {
    c.fillRect(px, h, 5, base - h);
    c.fillRect(px - 5, base - 3, 15, 5);
  }
  c.strokeStyle = "#5b747d";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(w * 0.16, h + 10);
  c.lineTo(w * 0.84, Math.min(base - 8, h + 64));
  c.moveTo(w * 0.84, h + 10);
  c.lineTo(w * 0.16, Math.min(base - 8, h + 64));
  c.stroke();
  c.fillStyle = "#607982";
  c.fillRect(-9, base, w + 20, 9);
  shadow(c, w / 2, base + 9, w * 0.6, 0.16);
  c.fillStyle = "#334953";
  round(c, -4, -4, w + 8, h + 8, 4);
  c.fill();
  c.fillStyle = "#152e3d";
  c.fillRect(0, 0, w, h);
  const phase = t / 8 + index;
  const logo = index % 4 === 3 && Math.floor(phase) % 3 === 1 && !celebrate;
  const text = celebrate
    ? ["BUILD PASSED", "DEV RUN COMPLETE"][index % 2]
    : messages[(Math.floor(phase) + index) % messages.length];
  if (logo) {
    const image = assets.tools[[0, 1, 3][index % 3]];
    if (image) {
      const size = Math.min(h * 0.58, 38);
      const scale = Math.min(
          size / image.naturalWidth,
          size / image.naturalHeight,
        ),
        iw = image.naturalWidth * scale,
        ih = image.naturalHeight * scale;
      c.drawImage(image, w / 2 - iw / 2, 5 + (size - ih) / 2, iw, ih);
    }
    c.fillStyle = "#c9dcd3";
    c.font = "8px Arial";
    c.textAlign = "center";
    c.fillText("TOOLKIT SPOTLIGHT", w / 2, h - 6);
  } else {
    c.fillStyle = "#d8e5d5";
    c.font = `700 ${Math.min(15, (w / text.length) * 1.5)}px Arial`;
    c.textAlign = "center";
    c.fillText(text, w / 2, h * 0.53);
    c.fillStyle = "#f8a78f";
    c.font = "8px Arial";
    c.fillText("DEV RUN  /  DIGITAL DISTRICT", w / 2, h - 7);
  }
  c.fillStyle = "#c9dfdd0a";
  c.fillRect(0, (t * 7 + index * 13) % h, w, 2);
  c.restore();
}
export class WorldRenderer {
  constructor() {
    this.cache = new Map();
    this.layer = document.createElement("canvas");
    this.layer.width = 1800;
    this.layer.height = 540;
    this.ctx = this.layer.getContext("2d");
  }
  preload(camera, width) {
    const visible = visibleZones(camera, width);
    const indexes = visible.map((z) => ZONES.indexOf(z));
    const need = new Set(visible.map((z) => z.scene));
    for (const i of [Math.min(...indexes) - 1, Math.max(...indexes) + 1])
      if (ZONES[i]) need.add(ZONES[i].scene);
    for (const scene of need)
      if (!this.cache.has(scene))
        this.cache.set(scene, background(scene, true));
    for (const key of this.cache.keys())
      if (!need.has(key)) this.cache.delete(key);
  }
  draw(c, w, game, camera, t, assets, reduced, balanced = false) {
    const pal = paletteAt(game.distance),
      sky = c.createLinearGradient(0, 0, 0, 540);
    sky.addColorStop(0, pal[0]);
    sky.addColorStop(0.75, pal[1]);
    sky.addColorStop(1, pal[2]);
    c.fillStyle = sky;
    c.fillRect(0, 0, w, 540);
    this.preload(camera, w);
    const clock = reduced ? 0 : t;
    for (const z of visibleZones(camera, w)) {
      const k = this.ctx;
      k.clearRect(0, 0, 1800, 540);
      const offset = (((camera * 0.075) % 1800) + 1800) % 1800;
      k.drawImage(this.cache.get(z.scene), -offset, 0);
      k.drawImage(this.cache.get(z.scene), 1800 - offset, 0);
      drawCityMotion(
        k,
        w,
        { ...game, stage: z.stage, distance: game.distance },
        clock,
        reduced,
        {
          scene: z.scene,
          camera,
          weather:
            z.scene === "snow"
              ? "snow"
              : z.scene === "fog"
                ? "fog"
                : z.scene === "golden"
                  ? "clearing"
                  : z.scene === "hills"
                    ? "rain"
                    : "clear",
        },
      );
      drawLivingWorld(k, w, game, camera, clock, z, reduced, balanced || w < 800);
      if (
        z.stage < 5 &&
        !["transit", "tunnel", "grid", "layers"].includes(z.scene)
      ) {
        const tx = 620 - ((camera * 0.1) % 950);
        tower(k, tx, clock);
        if (tx < 0) tower(k, tx + 950, clock);
      }
      const left = z === ZONES[0] ? -10000 : z.start - camera,
        right = z === ZONES.at(-1) ? 10000 : z.end - camera;
      k.globalCompositeOperation = "destination-in";
      const mask = k.createLinearGradient(
        Math.min(left - 160, 0),
        0,
        Math.max(right + 160, w),
        0,
      );
      const span = Math.max(right + 160, w) - Math.min(left - 160, 0),
        origin = Math.min(left - 160, 0);
      const stop = (x, a) =>
        mask.addColorStop(
          Math.max(0, Math.min(1, (x - origin) / span)),
          `rgba(0,0,0,${a})`,
        );
      stop(left - 160, 0);
      stop(left + 160, 1);
      stop(right - 160, 1);
      stop(right + 160, 0);
      k.fillStyle = mask;
      k.fillRect(0, 0, 1800, 540);
      k.globalCompositeOperation = "source-over";
      c.drawImage(this.layer, 0, 0);
    }
    const travel = STAGES[5],
      mapX = (travel.start + travel.end) / 2 - camera;
    if (mapX > -650 && mapX < w + 650) {
      c.save();
      c.translate(mapX - 370, 0);
      c.strokeStyle = "#acc7c688";
      c.lineWidth = 1;
      for (let i = 0; i < 7; i++) {
        c.beginPath();
        c.ellipse(370, 210, 330 - i * 28, 100, 0, 0, 7);
        c.stroke();
      }
      c.strokeStyle = "#f8a78f";
      c.lineWidth = 3;
      c.setLineDash([6, 9]);
      c.beginPath();
      c.moveTo(85, 230);
      c.bezierCurveTo(210, 82, 445, 325, 650, 175);
      c.stroke();
      c.setLineDash([]);
      flag(c, assets.flags.canada, 75, 150, 50, clock);
      flag(c, assets.flags.usa, 655, 100, 50, clock);
      c.fillStyle = "#edf0de";
      c.font = "600 17px Arial";
      c.textAlign = "left";
      c.fillText("TORONTO", 45, 282);
      c.fillText("THE BAY", 615, 241);
      c.font = "12px Arial";
      c.fillText("SAME BACKPACK. NEW TIME ZONE.", 230, 323);
      c.restore();
    }
    // Physical seams cross the viewport; they do not replace an entire frame.
    for (const z of ZONES.slice(1)) {
      const x = z.start - camera;
      if (x < -180 || x > w + 180) continue;
      c.save();
      c.globalAlpha = 0.4;
      c.fillStyle = ["transit", "tunnel", "grid"].includes(z.scene)
        ? "#26394c"
        : "#acc2bf";
      if (["transit", "tunnel", "grid", "layers"].includes(z.scene)) {
        c.fillRect(x - 18, 68, 36, 340);
        c.fillRect(x - 85, 68, 170, 14);
      } else {
        const haze = c.createLinearGradient(x - 125, 0, x + 125, 0);
        haze.addColorStop(0, "#dbe4d800");
        haze.addColorStop(0.5, "#dbe4d820");
        haze.addColorStop(1, "#dbe4d800");
        c.fillStyle = haze;
        c.fillRect(x - 125, 80, 250, 330);
      }
      c.restore();
    }
    for (const [x, country, label] of [
      [230, "canada", "TORONTO / WATERFRONT"],
      [STAGES[6].start + 140, "usa", "THE BAY / WESTBOUND"],
    ]) {
      const xx = x - camera;
      if (xx > -140 && xx < w + 100) {
        flag(c, assets.flags[country], xx, 212, 68, clock);
        c.fillStyle = "#dce3d6";
        c.font = "10px Arial";
        c.textAlign = "left";
        c.fillText(label, xx - 30, 323);
      }
    }
    const bayStart = STAGES[6].start;
    c.save();
    c.globalAlpha = game.status === "won" ? 1 - smooth(game.ceremony / 1.2) : 1;
    for (
      let x =
        Math.max(Math.ceil(bayStart / 480), Math.floor(camera / 480)) * 480;
      x < camera + w + 500;
      x += 480
    ) {
      if (x < bayStart) continue;
      const sx = x - camera;
      billboard(
        c,
        sx,
        170 + (Math.floor(x / 480) % 3) * 32,
        130,
        60,
        clock,
        assets,
        Math.floor(x / 480),
      );
    }
    c.restore();
    if (game.intro > 0 && game.status === "running") {
      c.fillStyle = "#e6e9db";
      c.font = "600 20px Arial";
      c.textAlign = "center";
      c.fillText("TORONTO → THE BAY", w / 2, 75);
      c.font = "13px Arial";
      c.fillText(
        "A / D to move · jump onto the ledge · return left",
        w / 2,
        100,
      );
    }
    return pal;
  }
}
