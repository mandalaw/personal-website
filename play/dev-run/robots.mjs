import { round } from "./scenery.mjs?v=5014aceabc11";
export const ROBOTS = Object.freeze({
  chatter: {
    name: "CHATTER",
    color: "#efa699",
    glyph: "···",
    pattern: "pulse",
  },
  twin: { name: "TWIN", color: "#a4c7cd", glyph: "Ⅱ", pattern: "paired" },
  analyst: { name: "ANALYST", color: "#e0c58f", glyph: "◇", pattern: "cone" },
  open: { name: "OPEN BOT", color: "#accdb7", glyph: "{}", pattern: "modular" },
  swarm: {
    name: "AGENT SWARM",
    color: "#bab7d4",
    glyph: "⋮",
    pattern: "swarm",
  },
  guardrail: {
    name: "GUARDRAIL",
    color: "#eeaa95",
    glyph: "=",
    pattern: "barrier",
  },
});
const TYPES = {
  packet: "chatter",
  hallucination: "chatter",
  merge: "twin",
  dependency: "twin",
  scanner: "analyst",
  drift: "analyst",
  container: "open",
  schema: "open",
  malware: "swarm",
  baddeploy: "swarm",
  firewall: "guardrail",
  ratelimit: "guardrail",
};
export const ROBOT_PHASES = Object.freeze({
  notice: 0.22,
  telegraph: 0.78,
  attack: 0.88,
  cooldown: 1.15,
  reposition: 0.5,
  patrol: 0.55,
});
export const robotFor = (h) => TYPES[h.type] || null;
export function updateRobots(game, dt) {
  for (const [id] of game.robots) {
    const h = game.course.hazards.find((h) => h.id === id);
    if (!h || Math.abs(h.x - game.distance) > 1000) game.robots.delete(id);
  }
  for (const h of game.course.hazards) {
    if (
      !robotFor(h) ||
      game.done.has(h.id) ||
      Math.abs(h.x - game.distance) > 720
    )
      continue;
    let r = game.robots.get(h.id);
    const lead = h.x - game.distance;
    if (!r) {
      r = {
        state: "patrol",
        age: 0,
        engaged: false,
        cycles: 0,
        target: h.x,
        telegraphed: 0,
      };
      game.robots.set(h.id, r);
    }
    if (!r.engaged) {
      r.age += dt; // Visible patrols move before the player enters notice range.
      if (lead < 390 && lead > 120) {
        r.engaged = true;
        r.state = "notice";
        r.age = 0;
      }
      continue;
    }
    r.age += dt;
    if (r.age >= ROBOT_PHASES[r.state]) {
      r.age -= ROBOT_PHASES[r.state];
      const next = {
        notice: "telegraph",
        telegraph: "attack",
        attack: "cooldown",
        cooldown: "reposition",
        reposition: "patrol",
        patrol: "notice",
      };
      if (r.state === "telegraph") r.telegraphed++;
      if (r.state === "cooldown") r.cycles++;
      r.state = next[r.state];
    }
  }
}
export function robotFrame(h, game) {
  const type = robotFor(h);
  if (!type) return null;
  const state = game.robots?.get(h.id) || {
    state: "patrol",
    age: 0,
    engaged: false,
    cycles: 0,
    target: h.x,
    telegraphed: 0,
  };
  return {
    ...state,
    type,
    active: state.state === "attack" && state.telegraphed > 0,
    telegraph: ["notice", "telegraph"].includes(state.state),
  };
}
export function drawRobot(c, h, frame, x, ground, quiet = false) {
  const r = frame.robot,
    def = ROBOTS[r.type],
    t = r.age;
  const patrol =
    !quiet && ["patrol", "reposition"].includes(r.state)
      ? Math.sin(t * 3) * 8
      : 0;
  const bx = x - 25 + patrol,
    by = ground - 13;
  c.save();
  c.globalAlpha = 1;
  c.fillStyle = "#132b3844";
  c.beginPath();
  c.ellipse(bx, ground + 1, 25, 4, 0, 0, 7);
  c.fill();
  const body = (px, py, s = 1) => {
    c.save();
    c.translate(px, py);
    c.scale(s, s);
    c.fillStyle = "#293e50";
    round(c, -17, -44, 34, 41, 8);
    c.fill();
    c.fillStyle = def.color;
    round(c, -14, -40, 28, 18, 5);
    c.fill();
    c.fillStyle = "#1d3343";
    c.fillRect(-8, -34, 5, 4);
    c.fillRect(5, -34, 5, 4);
    c.fillStyle = "#688592";
    c.fillRect(-13, -4, 9, 14);
    c.fillRect(5, -4, 9, 14);
    c.fillStyle = def.color;
    c.fillRect(-20, 8, 17, 5);
    c.fillRect(4, 8, 17, 5);
    c.strokeStyle = "#728d96";
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(-18, -29);
    c.lineTo(-24, -12);
    c.moveTo(18, -29);
    c.lineTo(24, -15);
    c.stroke();
    c.fillStyle = def.color;
    c.font = "10px Arial";
    c.textAlign = "center";
    c.fillText(def.glyph, 0, -9);
    c.restore();
  };
  body(bx, by);
  if (r.type === "twin") body(bx - 35, by + 7, 0.7);
  if (r.type === "swarm")
    for (let i = 0; i < 3; i++)
      body(
        bx - 32 + i * 20,
        by - 52 - (quiet ? 0 : Math.sin(t * 2 + i) * 3),
        0.35,
      );
  if (r.type === "open") {
    c.strokeStyle = def.color;
    c.lineWidth = 2;
    c.strokeRect(bx - 22, by - 48, 44, 50);
  }
  const yy = frame.box.y,
    hh = frame.box.h;
  if (r.telegraph || r.active) {
    c.fillStyle = r.active ? def.color + "55" : def.color + "18";
    c.strokeStyle = def.color;
    c.lineWidth = r.active ? 2 : 1;
    c.setLineDash(r.active ? [] : [5, 6]);
    c.fillRect(x, yy, h.width, hh);
    c.strokeRect(x, yy, h.width, hh);
    c.setLineDash([]);
    if (r.type === "analyst") {
      c.beginPath();
      c.moveTo(bx + 14, by - 27);
      c.lineTo(x + h.width, yy);
      c.lineTo(x + h.width, yy + hh);
      c.closePath();
      c.fill();
    }
    if (r.active) {
      c.fillStyle = def.color;
      const n = r.type === "swarm" ? 5 : 3;
      for (let i = 0; i < n; i++) {
        const u = quiet
          ? 0.5
          : (t * (r.type === "chatter" ? 3 : 1.5) + i / n) % 1;
        c.fillRect(x + u * (h.width - 5), yy + 6 + (i * (hh - 14)) / n, 5, 5);
      }
    }
    c.fillStyle = def.color;
    c.font = "bold 10px Arial";
    c.textAlign = "center";
    c.fillText(
      r.active ? "DATA PULSE" : r.state === "notice" ? "NOTICED" : "CHARGING",
      x + h.width / 2,
      yy - 10,
    );
  }
  c.fillStyle = "#e4eadd";
  c.textAlign = "center";
  c.font = "bold 9px Arial";
  c.fillText(def.name, bx, by - 55);
  c.restore();
}
