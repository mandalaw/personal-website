import { viewportPlan } from "./viewport.mjs?v=c77ee2bc882e";
import { collectibleFrame } from "./collectibles.mjs?v=31db57189395";
import { turnFrame } from "./locomotion.mjs?v=1e48e39f8dd4";
import { drawRobot } from "./robots.mjs?v=346697f0306a";
import { shadow } from "./living-world.mjs?v=073a4f43e5ab";
import { Camera } from "./camera.mjs?v=7af2e5e82987";
import {
  WorldRenderer,
  paletteAt,
  visibleZones,
} from "./environment.mjs?v=1301110e4474";
import {
  sceneFor,
  weatherFor,
  stageProgress,
} from "./course.mjs?v=3d15474f11f1";
import { hazardFrame } from "./dynamics.mjs?v=263cebe5feb5";
import { drawCityMotion, drawSurfaceDetails } from "./world.mjs?v=8426e57ab827";
import { drawCeremony } from "./ceremony.mjs?v=e6dbd8b8556c";
import {
  HAZARDS,
  TOOLS,
  STAGES,
  FINISH,
  groundAt,
} from "./course.mjs?v=3d15474f11f1";
import { playerBox, hazardBox } from "./physics.mjs?v=ff700b9e51ad";
import { loadCharacter, poseFor } from "./character.mjs?v=82e82450b008";
import {
  PALETTE as P,
  round,
  background,
  drawTrophy,
} from "./scenery.mjs?v=5014aceabc11";

function icon(c, glyph) {
  c.strokeStyle = P.peach;
  c.fillStyle = P.peach;
  c.lineWidth = 3;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.textAlign = "center";
  c.font = "bold 17px Arial";
  if (glyph === "bug" || glyph === "blob") {
    c.beginPath();
    c.ellipse(0, 0, 13, 18, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = P.navy;
    c.beginPath();
    c.moveTo(0, -12);
    c.lineTo(0, 14);
    c.stroke();
    c.strokeStyle = P.peach;
    for (const y of [-10, 0, 10]) {
      c.beginPath();
      c.moveTo(-11, y);
      c.lineTo(-21, y - 5);
      c.moveTo(11, y);
      c.lineTo(21, y + 5);
      c.stroke();
    }
  } else if (glyph === "server" || glyph === "box") {
    for (let y = -17; y <= 7; y += 12) {
      round(c, -21, y, 42, 10, 3);
      c.stroke();
      c.beginPath();
      c.arc(-14, y + 5, 1.5, 0, Math.PI * 2);
      c.fill();
    }
  } else if (glyph === "cloud") {
    c.beginPath();
    c.moveTo(-21, 10);
    c.bezierCurveTo(-39, 1, -20, -21, -8, -10);
    c.bezierCurveTo(-6, -36, 27, -26, 22, -7);
    c.bezierCurveTo(42, -3, 35, 18, 20, 17);
    c.lineTo(-17, 17);
    c.stroke();
    c.fillText("×", 1, 9);
  } else if (glyph === "hook") {
    c.beginPath();
    c.moveTo(3, -24);
    c.lineTo(3, 10);
    c.bezierCurveTo(3, 28, -20, 27, -20, 10);
    c.lineTo(-14, 16);
    c.stroke();
  } else if (glyph === "lock") {
    round(c, -18, -5, 36, 29, 4);
    c.stroke();
    c.beginPath();
    c.arc(0, -5, 12, Math.PI, 0);
    c.stroke();
    c.fillRect(-2, 4, 4, 10);
  } else if (glyph === "loop") {
    c.beginPath();
    c.arc(0, 0, 19, 0.3, Math.PI * 1.8);
    c.stroke();
    c.beginPath();
    c.moveTo(10, -17);
    c.lineTo(21, -19);
    c.lineTo(20, -8);
    c.stroke();
  } else if (glyph === "packet") {
    c.beginPath();
    c.moveTo(-25, -13);
    c.lineTo(15, -13);
    c.lineTo(27, 0);
    c.lineTo(15, 13);
    c.lineTo(-25, 13);
    c.closePath();
    c.stroke();
    c.fillText("!", 0, 6);
  } else if (glyph === "wave") {
    for (let y = -13; y <= 13; y += 13) {
      c.beginPath();
      c.moveTo(-24, y);
      c.bezierCurveTo(-10, y - 17, 9, y + 17, 24, y);
      c.stroke();
    }
  } else if (glyph === "wall") {
    for (let y = -18; y < 20; y += 13) {
      c.beginPath();
      c.moveTo(-23, y);
      c.lineTo(23, y);
      c.moveTo(y % 2 ? 10 : -9, y);
      c.lineTo(y % 2 ? 10 : -9, y + 13);
      c.stroke();
    }
  } else if (glyph === "map") {
    c.beginPath();
    c.moveTo(-24, -15);
    c.lineTo(-8, -22);
    c.lineTo(7, -13);
    c.lineTo(23, -21);
    c.lineTo(23, 16);
    c.lineTo(7, 22);
    c.lineTo(-8, 14);
    c.lineTo(-24, 20);
    c.closePath();
    c.stroke();
    c.beginPath();
    c.moveTo(-8, -22);
    c.lineTo(-8, 14);
    c.moveTo(7, -13);
    c.lineTo(7, 22);
    c.stroke();
  } else if (glyph === "drift") {
    c.beginPath();
    c.moveTo(-24, 19);
    c.lineTo(-24, -20);
    c.moveTo(-24, 19);
    c.lineTo(25, 19);
    c.moveTo(-18, 10);
    c.lineTo(-3, 0);
    c.lineTo(9, 8);
    c.lineTo(24, -15);
    c.stroke();
  } else c.fillText(glyph, 0, 6);
}
function hazardSprite(id) {
  const h = HAZARDS[id],
    canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 180;
  const c = canvas.getContext("2d");
  c.scale(2, 2);
  c.fillStyle = "#242d40";
  c.strokeStyle = "#f77062";
  c.lineWidth = 1.5;
  if (["bug", "blob"].includes(h.glyph)) {
    c.beginPath();
    c.ellipse(40, 48, 29, 30, 0, 0, Math.PI * 2);
    c.fill();
  } else if (h.glyph === "server" || h.glyph === "box") {
    for (let y = 21; y < 76; y += 18) {
      round(c, 8, y, 64, 15, 3);
      c.fill();
      c.stroke();
    }
  } else if (h.glyph === "packet") {
    c.beginPath();
    c.moveTo(5, 23);
    c.lineTo(59, 23);
    c.lineTo(78, 48);
    c.lineTo(59, 76);
    c.lineTo(5, 76);
    c.closePath();
    c.fill();
    c.stroke();
  } else if (h.glyph === "hook" || h.glyph === "wave" || h.glyph === "cloud") {
    /* The glyph itself is the silhouette. */
  } else {
    round(c, 7, 16, 66, 65, h.glyph === "wall" ? 2 : 10);
    c.fill();
    c.stroke();
  }
  c.fillStyle = P.coral;
  round(c, 16, 9, 48, 6, 3);
  c.fill();
  c.save();
  c.translate(40, 48);
  icon(c, h.glyph);
  c.restore();
  return canvas;
}
export async function loadAssets() {
  const [character, tools, flags] = await Promise.all([
    loadCharacter(),
    Promise.all(
      TOOLS.map(async (t) => {
        if (!t.file) return null;
        const i = new Image();
        i.src = t.file;
        try {
          await i.decode();
          return i;
        } catch {
          return null;
        }
      }),
    ),
    Promise.all(
      ["canada.png", "united-states.svg"].map(async (name) => {
        const image = new Image();
        image.src = "./assets/" + name;
        await image.decode();
        // Rasterize each complete flag once. Some engines crop an SVG using its
        // viewBox rather than decoded image dimensions when drawing cloth strips.
        const texture = document.createElement("canvas");
        texture.width = 380;
        texture.height = name.endsWith("svg") ? 200 : 190;
        texture
          .getContext("2d")
          .drawImage(image, 0, 0, texture.width, texture.height);
        return texture;
      }),
    ),
  ]);
  const feet = {},
    bounds = {};
  const measure = document.createElement("canvas");
  measure.width = 340;
  measure.height = 390;
  const mc = measure.getContext("2d", { willReadFrequently: true });
  for (const [name, img] of Object.entries(character)) {
    mc.clearRect(0, 0, 340, 390);
    mc.drawImage(img, 0, 0, 340, 390);
    const data = mc.getImageData(0, 0, 340, 390).data;
    let bottom = 0,
      left = 340,
      right = 0;
    for (let y = 0; y < 390; y++)
      for (let x = 0; x < 340; x++)
        if (data[(y * 340 + x) * 4 + 3] > 32) {
          bottom = Math.max(bottom, y + 1);
          left = Math.min(left, x);
          right = Math.max(right, x);
        }
    feet[name] = bottom / 390;
    bounds[name] = { left, right, bottom };
  }
  return {
    feet,
    bounds,
    flags: { canada: flags[0], usa: flags[1] },
    character,
    tools,
    hazards: Object.fromEntries(
      Object.keys(HAZARDS).map((k) => [k, hazardSprite(k)]),
    ),
  };
}
export class Renderer {
  constructor(canvas, assets) {
    this.canvas = canvas;
    this.c = canvas.getContext("2d", { alpha: false });
    this.assets = assets;
    this.width = 960;
    this.height = 540;
    this.backgrounds = new Map();
    this.camera = new Camera();
    this.world = new WorldRenderer();
    this.particles = [];
    this.pool = [];
    this.lead = 0.2;
    this.kick = 0;
    this.flash = 0;
    this.pose = "idle";
    this.reduced = false;
    this.resize();
  }
  resize(finale = this.finale || false) {
    const previousWidth = this.width;
    this.finale = finale;
    this.camera?.reset();
    const r = this.canvas.getBoundingClientRect(),
      dpr = Math.min(2, devicePixelRatio || 1);
    this.cssWidth = r.width;
    this.cssHeight = r.height;
    const shell = this.canvas.closest('#game'), safe = getComputedStyle(shell);
    this.view = viewportPlan({width:r.width,height:r.height,immersive:shell.classList.contains('is-immersive'),mobile:innerWidth<=700||innerHeight<=450,safeLeft:parseFloat(safe.getPropertyValue('--safe-left'))||0,safeRight:parseFloat(safe.getPropertyValue('--safe-right'))||0,finale});
    this.width = this.view.width;
    if (this.arrivalX !== undefined && previousWidth) this.arrivalX *= this.width / previousWidth;
    this.viewHeight = this.view.height;
    this.zoom = 540 / this.viewHeight;
    this.cameraY = this.view.cameraY;
    shell.dataset.camera = this.view.mode;
    shell.dataset.quality = this.view.quality;
    this.canvas.width = Math.round(r.width * dpr);
    this.canvas.height = Math.round(r.height * dpr);
    this.scale = this.canvas.width / this.width;
    this.scaleY = this.canvas.height / 540;
  }
  backdrop(style) {
    if (!this.backgrounds.has(style)) {
      if (this.backgrounds.size >= 3)
        this.backgrounds.delete(this.backgrounds.keys().next().value);
      this.backgrounds.set(style, background(style));
    }
    return this.backgrounds.get(style);
  }
  burst(x, y, kind = "pickup") {
    if (this.reduced) return;
    for (let i = 0; i < (kind === "win" ? (this.view.quality === "balanced" ? 16 : 30) : this.view.quality === "balanced" ? 5 : 8); i++)
      this.particles.push(
        Object.assign(this.pool.pop() || {}, {
          x,
          y,
          vx: (Math.random() - 0.5) * 150,
          vy: -25 - Math.random() * 135,
          life: kind === "win" ? 2 : 0.8,
          max: kind === "win" ? 2 : 0.8,
          color:
            kind === "snow"
              ? "#e3ece2"
              : kind === "land"
                ? "#899997"
                : i % 2
                  ? P.peach
                  : P.coral,
        }),
      );
    if (this.particles.length > 70)
      this.particles.splice(0, this.particles.length - 70);
  }
  event(e, game) {
    const x = game.distance - (this.camera.x ?? 0),
      y = game.player.y - 50;
    if (e.type === "hit") {
      this.flash = 0.15;
      this.burst(x, y, "hit");
    }
    if (e.type === "pickup" || e.type === "checkpoint") this.burst(x, y);
    if (e.type === "land") {
      this.kick = Math.min(3, (game.player.impact || 400) / 280);
      this.burst(
        x,
        game.player.y,
        weatherFor(game) === "snow" ? "snow" : "land",
      );
    }
    if (e.type === "near") this.burst(x + 12, y, "near");
  }
  draw(game, time = 0, dt = 0) {
    if ((game.status === "won") !== Boolean(this.finale)) this.resize(game.status === "won");
    time = game.stats.time + (game.status === "won" ? game.ceremony : 0);
    const c = this.c,
      w = this.width;
    this.reduced = game.mode === "planner";
    c.setTransform(this.scale / this.zoom, 0, 0, this.scaleY, 0, 0);
    const bgw = w * this.zoom;
    const stage = STAGES[game.stage],
      scene = sceneFor(game);
    const cam = this.camera.update({
      x: game.distance,
      y: game.player.y,
      vx: game.player.vx,
      ground: game.player.y,
      width: w,
      dt,
      finish: FINISH,
      quiet: this.reduced,
      board: game.player.board,
      frame: this.view,
    });
    if (game.status === "title") cam.reset();
    const cameraX = cam.x ?? -w * 0.32;
    const palette = this.world.draw(
      c,
      bgw,
      game,
      cameraX,
      time,
      this.assets,
      this.reduced,
      this.view.quality === "balanced",
    );
    c.setTransform(
      this.scale,
      0,
      0,
      this.scaleY * this.zoom,
      0,
      -(this.cameraY + this.camera.y + (!this.reduced ? this.kick : 0)) *
        this.scaleY *
        this.zoom,
    );
    this.kick *= Math.max(0, 1 - dt * 15);
    const heroX = this.reduced ? w * 0.27 : game.distance - cameraX,
      dist = this.reduced
        ? (game.upcoming()?.x ?? game.distance) - w * 0.43
        : game.distance;
    const ground = (x) => game.surfaceAt(dist + x - heroX);
    c.fillStyle = palette[2];
    c.beginPath();
    c.moveTo(0, ground(0));
    for (let x = 0; x <= w + 20; x += 20) c.lineTo(x, ground(x));
    c.lineTo(w, Math.max(540, this.cameraY + this.viewHeight + 80));
    c.lineTo(0, Math.max(540, this.cameraY + this.viewHeight + 80));
    c.fill();
    c.strokeStyle = "#a5b8b9";
    c.lineWidth = 3;
    c.beginPath();
    for (let x = 0; x <= w + 20; x += 20) {
      if (!x) c.moveTo(x, ground(x));
      else c.lineTo(x, ground(x));
    }
    c.stroke();
    for (const zone of visibleZones(cameraX, w)) {
      c.save();
      c.beginPath();
      const a = zone.start === 0 ? -10000 : zone.start - cameraX,
        b = zone.end === FINISH ? w + 10000 : zone.end - cameraX;
      c.rect(a, 0, b - a, 560);
      c.clip();
      drawSurfaceDetails(c, w, game, dist, heroX, ground, time, zone);
      c.restore();
    }
    if (game.status !== "won") this.arrivalX = heroX;
    if (game.status === "won") {
      this.pose = poseFor(game, time);
      drawCeremony(c, w, game, this.assets, this.reduced, this.arrivalX);
      return;
    }
    for (const p of game.platforms()) {
      const px = p.x - dist + heroX;
      if (px < -p.w || px > w + 50) continue;
      const base = ground(px);
      c.fillStyle = "#3c566677";
      if (p.kind === "lift") {
        for (const xx of [px + 8, px + p.w - 8]) {
          c.fillRect(xx, base - 139, 4, 144);
          c.fillStyle = "#b0c5bc66";
          c.fillRect(xx + 1, base - 134, 1, 132);
          c.fillStyle = "#3c566677";
        }
        c.fillRect(px + 4, base - 139, p.w - 4, 8);
        c.fillRect(px + 5, p.y + 10, p.w - 10, 5);
        c.fillStyle = "#cbb38a";
        c.fillRect(px + p.w / 2 - 10, p.y + 10, 20, 7);
      } else
        for (const xx of [px + 9, px + p.w - 15]) {
          c.fillRect(xx, p.y + 9, 6, base - p.y - 8);
        }
      shadow(c, px + p.w / 2, base + 3, p.w * 0.48, 0.13);
      c.fillStyle = p.kind === "lift" ? "#a7c3bd" : "#506d7e";
      round(c, px, p.y, p.w, 10, 4);
      c.fill();
      c.fillStyle = "#d1ded1";
      c.fillRect(px + 4, p.y, p.w - 8, 2);
      if (p.kind === "lift") {
        c.strokeStyle = "#77918b66";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(px + 12, p.y + 10);
        c.lineTo(px + 12, ground(px) + 15);
        c.moveTo(px + p.w - 12, p.y + 10);
        c.lineTo(px + p.w - 12, ground(px) + 15);
        c.stroke();
      }
    }
    for (const j of game.course.junctions) {
      const px = j.x - dist + heroX;
      if (px < -750 || px > w + 250) continue;
      const cleared = game.junctionDone.has(j.id),
        gy = game.surfaceAt(j.x);
      c.font = "bold 12px Arial";
      c.textAlign = "center";
      c.fillStyle = cleared ? "#a9c4b6" : "#f8a78f";
      if (j.kind === "ride") {
        c.fillText(
          cleared ? "GOOD LUCK, LAPTOP" : "↓ RIDE  /  ↑ WALK",
          px + 35,
          gy - 167,
        );
        c.strokeStyle = "#f8a78f88";
        c.lineWidth = 3;
        for (let n = 0; n < 3; n++) {
          c.beginPath();
          c.moveTo(px + n * 25, gy + 15);
          c.lineTo(px + 10 + n * 25, gy + 22);
          c.lineTo(px + n * 25, gy + 29);
          c.stroke();
        }
      } else {
        c.fillText(
          cleared ? "PATH OPEN →" : "↑ CLIMB, THEN ← RETURN",
          px + 45,
          gy - 164,
        );
        for (const offset of [-98, 0]) {
          c.fillStyle = cleared ? "#a9c4b6" : "#f8a78f";
          round(c, px - 140, gy + offset - 21, 24, 21, 4);
          c.fill();
          c.fillStyle = "#203546";
          c.fillText(offset ? "★" : "↓", px - 128, gy + offset - 6);
        }
        if (!cleared) {
          c.fillStyle = "#f8a78f";
          c.fillRect(px + 423, gy - 58, 4, 58);
          c.font = "10px Arial";
          c.fillText("SWITCH ←", px + 411, gy - 67);
        }
      }
    }
    const nearby =
      game.status === "title"
        ? []
        : game.course.hazards.filter(
            (h) =>
              h.x + h.width > dist - heroX - 100 &&
              h.x < dist + w - heroX + 100,
          );
    for (const h of nearby) {
      const def = HAZARDS[h.type],
        f = hazardFrame(h, game),
        x = f.x - dist + heroX,
        y = f.ground + f.y,
        done = game.done.has(h.id);
      if (
        (done && game.mode === "planner") ||
        (h.route === "low" && game.routes[h.stage] === "high")
      )
        continue;
      if (f.telegraph && !f.robot && !done) {
        c.fillStyle = "#f8a78f";
        c.font = "bold 12px Arial";
        c.textAlign = "center";
        c.fillText("↓", x + h.width / 2, f.ground - 8);
        c.fillStyle = "#f8a78f55";
        round(c, x, f.ground - 2, h.width, 4, 2);
        c.fill();
      }
      if (h.type === "timeout" && !f.active && !done) {
        c.fillStyle = "#f8a78f";
        round(c, x, f.ground - 4, h.width, 7, 3);
        c.fill();
        c.fillStyle = "#27394b";
        for (let k = 7; k < h.width; k += 15)
          c.fillRect(x + k, f.ground - 4, 5, 7);
        c.fillStyle = "#f8a78f";
        c.font = "bold 12px Arial";
        c.textAlign = "center";
        c.fillText("TTL", x + h.width / 2, f.ground - 12);
      }
      c.globalAlpha = done ? 0.35 : f.active ? 1 : 0.4;
      if (def.kind === "gap" && f.active) {
        c.fillStyle = "#111b2b";
        c.fillRect(x, y - 3, f.w, 119);
        c.strokeStyle = P.coral;
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(x, y);
        c.lineTo(x, y + 40);
        c.moveTo(x + h.width, y);
        c.lineTo(x + h.width, y + 40);
        c.stroke();
        c.fillStyle = P.peach;
        c.font = "bold 12px Arial";
        c.textAlign = "center";
        c.fillText(def.glyph, x + h.width / 2, y + 27);
      } else if (f.robot) {
        drawRobot(c, h, f, x, y, this.reduced);
      } else if (def.kind !== "gap") {
        if(def.kind==='slide'){
          c.save();c.strokeStyle='#66808b99';c.lineWidth=3;c.beginPath();c.moveTo(x+h.width+12,y+2);c.lineTo(x+h.width+12,y-146);c.lineTo(x-9,y-146);c.stroke();
          c.fillStyle='#768f95';c.fillRect(x+h.width+5,y-2,14,5);c.restore();
        }
        const yy = def.kind === "slide" ? y - 139 : y - h.height - 18;
        c.drawImage(
          this.assets.hazards[h.type],
          x - 7,
          yy,
          h.width + 14,
          def.kind === "slide" ? 77 : h.height + 20,
        );
      }
      if (!done) {
        c.fillStyle = P.paper;
        c.font = "bold 11px Arial";
        c.textAlign = "center";
        c.fillText(
          def.kind === "slide" ? "↓ SLIDE" : "↑ JUMP",
          x + h.width / 2,
          y -
            (def.kind === "slide"
              ? 155
              : def.kind === "gap"
                ? 20
                : h.height + 28),
        );
      }
    }
    c.globalAlpha = 1;
    for (const p of game.status === "title" ? [] : game.course.pickups) {
      if (game.taken.has(p.id)) continue;
      const x = p.x - dist + heroX;
      if (x < -50 || x > w + 50) continue;
      const f = collectibleFrame(p, game, this.reduced);
      const anchor = p.x - dist + heroX;
      shadow(c, anchor, f.ground + 2, 16, 0.16);
      c.fillStyle = "#90bdba";
      round(c, anchor - 13, f.ground - 6, 26, 6, 3);
      c.fill();
      const beam = c.createLinearGradient(0, f.y + 23, 0, f.ground - 6);
      beam.addColorStop(0, "#a5d8d318");
      beam.addColorStop(1, "#a5d8d34a");
      c.fillStyle = beam;
      c.beginPath();
      c.moveTo(anchor - 5, f.ground - 6);
      c.lineTo(f.x - dist + heroX - 21, f.y + 22);
      c.lineTo(f.x - dist + heroX + 21, f.y + 22);
      c.lineTo(anchor + 5, f.ground - 6);
      c.fill();
      this.tool(
        c,
        p.tool,
        f.x - dist + heroX,
        f.y,
        0,
        p.secret !== null,
        f.tilt,
      );
    }
    if (game.player.slidePhase && !this.reduced) {
      const snow = game.stage < 3;
      c.strokeStyle = snow ? "#dfe9de99" : "#d0b89766";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(heroX - game.player.facing * 50, game.player.y + 2);
      c.lineTo(heroX, game.player.y + 2);
      c.stroke();
      for (let k = 0; k < 5; k++) {
        c.fillStyle = snow ? "#dfe9de88" : "#c0a58d66";
        const age = (game.player.slideAge * 2 + k / 5) % 1;
        c.fillRect(
          heroX - game.player.facing * age * 44,
          game.player.y - Math.sin(age * 3) * 7,
          2,
          2,
        );
      }
    }
    this.pose = poseFor(game, time);
    const tf = turnFrame(game.player, this.reduced);
    if (tf.pose && !game.player.board && game.player.grounded)
      this.pose = tf.pose;
    const img = this.assets.character[this.pose] || this.assets.character.idle,
      title = game.status === "title",
      won = game.status === "won";
    let height = title ? 260 : 145,
      width = (height * 340) / 390,
      x = title ? w * 0.73 : won ? w * 0.73 : heroX,
      y = title ? 428 : won ? 425 : game.player.y;
    if (game.mode === "planner" && game.status === "running")
      y = game.surfaceAt(dist);
    c.save();
    if (game.player.invulnerable > 0 && !this.reduced)
      c.globalAlpha = 0.58 + 0.35 * Math.sin(time * 22) ** 2;
    const floor = title
        ? 428
        : game.player.grounded
          ? game.player.y
          : game.surfaceAt(game.distance),
      air = Math.max(0, floor - y),
      radius = width * 0.19 * (1 - Math.min(0.68, air / 220));
    c.save();
    c.translate(x, floor + 2);
    c.scale(1, 0.17);
    const soft = c.createRadialGradient(0, 0, 0, 0, 0, radius);
    soft.addColorStop(
      0,
      `rgba(9,19,29,${0.18 * (1 - Math.min(0.85, air / 170))})`,
    );
    soft.addColorStop(1, "#09131d00");
    c.fillStyle = soft;
    c.fillRect(-radius, -radius, radius * 2, radius * 2);
    c.restore();
    if (!title && game.mode !== "planner") {
      c.translate(x, 0);
      c.scale(tf.facing, 1);
      c.translate(-x, 0);
    }
    c.drawImage(
      img,
      x - width * 0.444,
      y -
        height *
          (game.player.grounded ? this.assets.feet[this.pose] || 0.972 : 0.972),
      width,
      height,
    );
    c.restore();
    if (!this.reduced) {
      for (const p of this.particles) {
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 240 * dt;
        c.globalAlpha = Math.max(0, p.life / p.max);
        c.fillStyle = p.color;
        c.fillRect(p.x, p.y, 4, 4);
      }
      for (let i = this.particles.length - 1; i >= 0; i--)
        if (this.particles[i].life <= 0) {
          this.pool.push(this.particles[i]);
          this.particles.splice(i, 1);
        }
      c.globalAlpha = 1;
    }
    if (this.flash > 0 && !this.reduced) {
      this.flash -= dt;
      c.fillStyle = `rgba(247,112,98,${Math.max(0, this.flash)})`;
      c.fillRect(0, 0, w, 540);
    }
    if (game.mode === "planner" && game.status === "running") {
      const h = game.upcoming();
      if (h) {
        c.fillStyle = P.paper;
        c.textAlign = "center";
        c.font = "600 20px Arial";
        c.fillText(HAZARDS[h.type].name, w * 0.6, 140);
        c.font = "14px Arial";
        c.fillText(
          HAZARDS[h.type].kind === "slide"
            ? "An overhead hazard. Slide beneath it."
            : "A broken path. Jump across it.",
          w * 0.6,
          168,
        );
      }
    }

  }
  tool(c, index, x, y, time, secret = false, tilt = 0) {
    c.save();
    c.translate(x, y);
    c.rotate(tilt);
    c.fillStyle = "#fff";
    c.strokeStyle = secret ? P.peach : P.sage;
    c.lineWidth = 2;
    round(c, -23, -23, 46, 46, 12);
    c.fill();
    c.stroke();
    const image = this.assets.tools[index];
    if (image) {
      const scale = Math.min(34 / image.naturalWidth, 30 / image.naturalHeight);
      c.drawImage(
        image,
        (-image.naturalWidth * scale) / 2,
        (-image.naturalHeight * scale) / 2,
        image.naturalWidth * scale,
        image.naturalHeight * scale,
      );
    } else {
      c.fillStyle = P.navy;
      c.font = "bold 17px Arial";
      c.textAlign = "center";
      c.fillText(TOOLS[index].text || "<>", 0, 6);
    }
    if (secret) {
      c.fillStyle = P.peach;
      c.font = "14px Arial";
      c.fillText("✦", 20, -25);
    }
    c.restore();
  }
  dispose() {
    this.backgrounds.clear();
    this.particles.length = 0;
  }
}
