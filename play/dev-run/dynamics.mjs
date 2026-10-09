import { robotFrame } from "./robots.mjs?v=e403c3a2fa85";
import { HAZARDS } from "./course.mjs?v=1b77db058418";
import { hazardBox } from "./physics.mjs?v=ff700b9e51ad";

// The same transform drives both drawing and collision. Telegraphs never have hitboxes.
export function hazardFrame(h, game) {
  const def = HAZARDS[h.type],
    ground = game.surfaceAt(h.x),
    lead = h.x - game.distance,
    revealedLead = h.x - (game.maxDistance ?? game.distance);
  let x = h.x,
    y = 0,
    w = h.width,
    active = true;
  if (h.type === "bug" || h.type === "malware")
    y = -Math.max(0, Math.sin(game.stats.time * 3 + h.id)) * 14;
  if (h.type === "packet" || h.type === "latency")
    x += Math.sin(game.stats.time * 2 + h.id) * 15;
  if (h.type === "server" || h.type === "build" || h.type === "baddeploy")
    y = -Math.max(0, Math.min(150, (revealedLead - 190) * 0.7));
  if (h.type === "firewall" || h.type === "cloud" || h.type === "ratelimit")
    active = Math.sin(game.stats.time * 2 + h.id) > 0.05;
  if (h.type === "scanner") x += Math.sin(game.stats.time * 2.5 + h.id) * 24;
  if (h.type === "dependency") {
    x += Math.sin(game.stats.time * 2 + h.id) * 10;
    y = -Math.abs(Math.sin(game.stats.time * 2 + h.id)) * 12;
  }
  if (h.type === "timeout") active = revealedLead < 220;
  if (h.type === "leak")
    w += Math.max(0, Math.min(22, (330 - revealedLead) * 0.08));
  const robot = robotFrame(h, game);
  if (robot) {
    x = h.x + (h.choreography && robot.type==='analyst' ? Math.sin(robot.age*3)*24 : h.choreography && robot.type==='open' ? Math.min(20,robot.age*25) : 0);
    y = 0;
    active = robot.active;
  }
  const box = hazardBox({ ...h, x, width: w }, ground + y, def.kind);
  return {
    x,
    ground,
    y,
    w,
    active,
    box,
    robot,
    telegraph:
      (h.type === "server" || h.type === "build" || h.type === "baddeploy") &&
      lead > 190 &&
      lead < 520,
  };
}
export const BEHAVIORS = Object.freeze([
  "static block",
  "bouncing bug",
  "moving packet",
  "falling build",
  "pulsing gate",
  "expanding leak",
  "gap / missing tile",
  "overhead clearance",
  "shifting stack",
  "collapsing platform",
]);
