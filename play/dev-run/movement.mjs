import { TURN_SECONDS, trackLocomotion } from "./locomotion.mjs?v=9390228e9641";
export const MOTION = Object.freeze({
  acceleration: 1900,
  brake: 2400,
  friction: 2100,
  air: 820,
  turnSeconds: TURN_SECONDS,
});
const approach = (a, b, step) =>
  a < b ? Math.min(b, a + step) : Math.max(b, a - step);

// Input sources stay independent: releasing a finger must not release a held key.
export class MovementInput {
  constructor() {
    this.sources = new Map();
  }
  set(source, action, down) {
    if (down) this.sources.set(source, action);
    else this.sources.delete(source);
    return this.value();
  }
  clear() {
    this.sources.clear();
    return this.value();
  }
  value() {
    const a = new Set(this.sources.values());
    return {
      axis: Number(a.has("right")) - Number(a.has("left")),
      duck: a.has("duck"),
    };
  }
}

export function horizontal(
  player,
  dt,
  input,
  { topSpeed = 270, board = false, slope = 0, auto = 0 } = {},
) {
  player.stun=Math.max(0,(player.stun||0)-dt);
  const axis = player.stun>0 ? 0 : input.axis || 0;
  player.vx ||= 0;
  player.facing ||= 1;
  player.turn = Math.max(0, (player.turn || 0) - dt);
  const reverse = axis && axis !== player.facing;
  // Plant before changing facing. Air steering remains available; no sprite squeeze.
  if (reverse && !player.slidePhase && !player.turn && Math.abs(player.vx) < 25) {
    player.turnFrom = player.facing;
    player.facing = axis;
    player.turn = TURN_SECONDS;
  }
  if (board) {
    const target =
      axis < 0
        ? -100
        : axis > 0
          ? topSpeed
          : Math.max(100, player.vx + (40 + slope * 120) * dt);
    player.vx = approach(player.vx, target, (axis < 0 ? 750 : 510) * dt);
  } else {
    const target = player.turn
      ? 0
      : reverse
        ? 0
        : axis
          ? axis * topSpeed
          : auto;
    const rate = !player.grounded
      ? MOTION.air
      : axis && Math.sign(player.vx) !== axis
        ? MOTION.brake
        : axis || auto
          ? MOTION.acceleration
          : MOTION.friction;
    if (player.grounded && player.slidePhase) {
      const t=player.slideAge/player.slideDuration;
      // Fixed entry momentum, mild carry then planted braking. Reverse is queued until recovery.
      const drag=t<.18?45:t<.6?85:t<.82?350:180;
      player.vx=player.slideDirection*Math.max(0,Math.abs(player.vx)-drag*dt);
    } else player.vx = approach(player.vx, target, rate * dt);
  }
  if (Math.abs(player.vx) < 0.25) player.vx = 0;
  player.idle =
    Math.abs(player.vx) < 8 && player.grounded ? (player.idle || 0) + dt : 0;
  trackLocomotion(player, dt, axis);
  return player.vx * dt;
}
