export const PHYSICS = Object.freeze({
  gravity: 1550,
  jumpVelocity: -625,
  buffer: 0.15,
  coyote: 0.12,
  height: 98,
  duckHeight: 43,
  halfWidth: 17,
  invulnerable: 1.8,
});
export const overlap = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
export function playerBox(player, distance) {
  const height =
    (player.duck > 0 || player.board) && player.grounded
      ? PHYSICS.duckHeight
      : PHYSICS.height;
  return { x: distance - 14, y: player.y - height + 9, w: 28, h: height - 16 };
}
export function hazardBox(h, ground, kind) {
  return kind === "slide"
    ? { x: h.x + 5, y: ground - 123, w: h.width - 10, h: 52 }
    : {
        x: h.x + 6,
        y: ground - h.height + 5,
        w: h.width - 12,
        h: h.height - 5,
      };
}
export function integrate(
  player,
  dt,
  { ground, gap, buffer = 0.15, jumpVelocity = PHYSICS.jumpVelocity },
) {
  const events = [];
  player.airAge = player.grounded ? 0 : (player.airAge || 0) + dt;

  player.takeoff = Math.max(0, (player.takeoff || 0) - dt);
  player.anticipate = Math.max(0, (player.anticipate || 0) - dt);
  player.restart = Math.max(0, (player.restart || 0) - dt);
  player.buffer = Math.max(0, player.buffer - dt);
  player.duck = Math.max(0, player.duck - dt);
  player.land = Math.max(0, player.land - dt);
  player.invulnerable = Math.max(0, player.invulnerable - dt);
  player.coyote = player.grounded
    ? PHYSICS.coyote
    : Math.max(0, player.coyote - dt);
  if (player.buffer > 0 && (player.grounded || player.coyote > 0)) {
    player.vy = jumpVelocity;
    player.takeoff = 0.13;
    player.airAge = 0;
    player.grounded = false;
    player.duck = 0;
    if(player.slidePhase){player.slidePhase=null;player.slideCooldown=.55;}
    player.buffer = 0;
    player.coyote = 0;
    events.push("jump");
  }
  if (player.grounded && !gap) {
    player.y = ground;
    player.vy = 0;
  } else {
    player.grounded = false;
    player.vy += PHYSICS.gravity * dt;
    player.y += player.vy * dt;
    if (!gap && player.y >= ground && player.vy > 0) {
      player.impact = player.vy;
      player.y = ground;
      player.vy = 0;
      player.grounded = true;
      player.land = 0.22;
      events.push("land");
    }
  }
  return events;
}
