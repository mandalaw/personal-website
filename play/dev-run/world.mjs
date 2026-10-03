import {
  STAGES,
  sceneFor,
  weatherFor,
  stageProgress,
} from "./course.mjs?v=1b77db058418";
import { round } from "./scenery.mjs?v=5014aceabc11";
export const ENVIRONMENTS = Object.freeze([
  "morning",
  "roofs",
  "snow",
  "transit",
  "tunnel",
  "grid",
  "layers",
  "transition",
  "fog",
  "golden",
  "hills",
  "bridge",
  "cloud",
  "deploy",
  "finish",
]);
export const WEATHER = Object.freeze([
  "clear",
  "flurry",
  "snow",
  "fog",
  "clearing",
  "rain",
  "wind",
]);
export function cat(c, x, y, scale = 1, t = 0) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  c.fillStyle = "#232d3b";
  c.beginPath();
  c.ellipse(0, -12, 17, 13, 0, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.moveTo(3, -23);
  c.lineTo(1, -40);
  c.lineTo(10, -34);
  c.lineTo(20, -40);
  c.lineTo(22, -23);
  c.closePath();
  c.fill();
  c.fillStyle = "#e7e8de";
  c.beginPath();
  c.ellipse(10, -19, 5, 8, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = "#f8a78f";
  c.fillRect(7, -30, 2, 2);
  c.fillRect(16, -30, 2, 2);
  c.strokeStyle = "#232d3b";
  c.lineWidth = 6;
  c.lineCap = "round";
  c.beginPath();
  c.moveTo(-13, -9);
  c.bezierCurveTo(-32, -10, -32, -25, -28 + Math.sin(t * 2) * 4, -27);
  c.stroke();
  c.restore();
}
export function drawCityMotion(c, w, game, t, reduced, zone = {}) {
  const scene = zone.scene || sceneFor(game),
    weather = zone.weather || weatherFor(game),
    p = stageProgress(game),
    clock = reduced ? 0 : t;
  const indoors = ["transit", "tunnel", "grid", "layers"].includes(scene);
  // Midground moves separately from the skyline, always behind hazards and Dev.
  if (["transit", "tunnel"].includes(scene)) {
    c.fillStyle = "#1d293b";
    c.fillRect(0, 0, w, 350);
    c.strokeStyle = "#68818c55";
    c.lineWidth = 12;
    for (let x = -((game.distance * 0.22) % 260); x < w + 260; x += 260) {
      c.beginPath();
      c.moveTo(x, 351);
      c.lineTo(x, 144);
      c.quadraticCurveTo(x + 110, 10, x + 223, 144);
      c.lineTo(x + 223, 351);
      c.stroke();
      c.fillStyle = "#f9cf9c";
      c.fillRect(x + 64, 94, 95, 4);
    }
    const train = ((clock * 65) % (w + 650)) - 600;
    c.fillStyle = "#4e697b";
    round(c, train, 238, 560, 85, 14);
    c.fill();
    c.fillStyle = "#b8d3ce";
    for (let i = 0; i < 7; i++) {
      round(c, train + 20 + i * 76, 251, 55, 31, 5);
      c.fill();
    }
    c.fillStyle = "#f77062";
    c.fillRect(train + 8, 300, 543, 4);
  }
  if (["grid", "layers"].includes(scene)) {
    c.fillStyle = "#153443";
    c.fillRect(0, 0, w, 405);
    const ox = (game.distance * 0.08) % 180;
    c.strokeStyle = "#5c8a9366";
    c.lineWidth = 2;
    for (let x = -ox - 100; x < w + 180; x += 180) {
      c.beginPath();
      c.moveTo(x, 70);
      c.lineTo(x + 50, 390);
      c.moveTo(x + 100, 70);
      c.lineTo(x - 10, 390);
      c.stroke();
    }
    for (let y = 100; y < 370; y += 55) {
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(w, y - 35);
      c.stroke();
    }
    c.fillStyle = "#84aaa233";
    for (let i = 0; i < 9; i++) {
      const x = i * 174 - ox;
      c.beginPath();
      c.moveTo(x, 175);
      c.lineTo(x + 90, 155);
      c.lineTo(x + 130, 222);
      c.lineTo(x + 28, 244);
      c.closePath();
      c.fill();
    }
    c.strokeStyle = "#f8a78f88";
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(0, 300);
    c.bezierCurveTo(w * 0.3, 130, w * 0.65, 335, w, 158);
    c.stroke();
    c.fillStyle = "#d0e0d1";
    c.font = "12px Arial";
    c.textAlign = "left";
    c.fillText(
      scene === "layers"
        ? "LAYERS  /  ROUTES  /  POSSIBILITIES"
        : "DATA IN MOTION",
      32,
      55,
    );
  }
  if (["grid", "layers", "cloud", "deploy"].includes(scene)) {
    c.strokeStyle = scene === "deploy" ? "#f8a78f25" : "#a9c4b633";
    c.lineWidth = 1;
    for (let i = 0; i < 8; i++) {
      const x = (i * 137 - game.distance * 0.12) % (w + 160);
      const y = 108 + (i % 3) * 59;
      c.fillStyle = i % 2 ? "#68859628" : "#bed0c024";
      round(c, x, y, 112, 67, 8);
      c.fill();
      c.stroke();
      c.fillStyle = "#c2d7d033";
      for (let k = 0; k < 3; k++)
        c.fillRect(x + 14, y + 13 + k * 12, 70 - k * 15, 3);
    }
    if (scene === "layers") {
      c.strokeStyle = "#f8a78f55";
      for (let i = 0; i < 4; i++) {
        c.beginPath();
        c.ellipse(w * 0.66, 150 + i * 32, 120, 22, -0.16, 0, Math.PI * 2);
        c.stroke();
      }
    }
  }
  if (scene === "cloud") {
    c.fillStyle = "#c9ddd51d";
    for (let i = 0; i < 4; i++) {
      const x = (i * 270 - clock * 7) % (w + 280);
      c.beginPath();
      c.ellipse(x, 235 + (i % 2) * 45, 140, 34, 0, 0, Math.PI * 2);
      c.fill();
    }
  }
  if (scene === "bridge") {
    c.strokeStyle = "#b3858199";
    c.lineWidth = 2;
    for (let x = -((game.distance * 0.18) % 230); x < w + 230; x += 230) {
      c.beginPath();
      c.moveTo(x, 126);
      c.quadraticCurveTo(x + 110, 190 + Math.sin(clock) * 3, x + 220, 126);
      c.stroke();
    }
  }
}
export function drawSurfaceDetails(
  c,
  w,
  game,
  dist,
  heroX,
  ground,
  t,
  zone = {},
) {
  if (game.bridge > 0) {
    c.fillStyle = "#a9c4b6";
    for (const h of game.course.hazards) {
      if (!["null", "tile", "leak", "timeout"].includes(h.type)) continue;
      const x = h.x - dist + heroX;
      if (x < -150 || x > w + 150) continue;
      round(c, x, game.surfaceAt(h.x) - 4, h.width + 24, 7, 3);
      c.fill();
    }
  }
  if (game.mapReveal > 0) {
    // Quiet ground chevrons point to the landing beyond the next hazard.
    const next = game.upcoming();
    if (next) {
      const x = next.x + next.width + 38 - dist + heroX;
      if (x > heroX && x < w - 35) {
        c.strokeStyle = "#c4ddc7";
        c.lineWidth = 3;
        c.lineCap = "round";
        for (let k = 0; k < 3; k++) {
          c.beginPath();
          c.moveTo(x + k * 12, ground(x) - 11);
          c.lineTo(x + k * 12 + 5, ground(x) - 7);
          c.lineTo(x + k * 12, ground(x) - 3);
          c.stroke();
        }
      }
    }
  }
  // Posts stay below or at the far edges of the gameplay area, never over the hero.
  c.fillStyle = "#526b7740";
  for (let i = 0; i < 2; i++) {
    const x = i === 0 ? 4 : w - 10;
    c.fillRect(x, 460, 5, 65);
  }
}
