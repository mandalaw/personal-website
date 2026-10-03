// Physics owns this clock. Rendering never changes direction, position or slide state.
export const SLIDE = Object.freeze({
  speed: 150,
  seconds: 0.38,
  distance: 55,
  duration: 0.86,
  cooldown: 0.55,
});
export const TURN_SECONDS = 0.22;
export function canSlide(p, axis) {
  return (
    p.grounded &&
    !p.board &&
    !p.slidePhase &&
    !p.turn &&
    (p.slideCooldown || 0) <= 0 &&
    axis !== 0 &&
    axis === p.facing &&
    axis === p.runDirection &&
    Math.sign(p.vx) === axis &&
    Math.abs(p.vx) >= SLIDE.speed &&
    p.runTime >= SLIDE.seconds &&
    p.runDistance >= SLIDE.distance
  );
}
export function startSlide(p, axis) {
  if (!canSlide(p, axis)) return false;
  p.slidePhase = "prepare";
  p.slideAge = 0;
  p.slideEntry=Math.min(335,Math.abs(p.vx));
  p.slideDirection=axis;
  p.slideDuration=.8+(p.slideEntry-150)/185*.14;
  p.duck=p.slideDuration;
  p.vx=axis*p.slideEntry;
  p.runTime = 0;
  p.runDistance = 0;
  return true;
}
export function trackLocomotion(p, dt, axis) {
  if(!p.grounded&&p.slidePhase){p.slidePhase=null;p.slideCooldown=SLIDE.cooldown;p.duck=0;}
  p.slideCooldown = Math.max(0, (p.slideCooldown || 0) - dt);
  if (p.slidePhase) {
    p.slideAge += dt;
    const age = p.slideAge / p.slideDuration * SLIDE.duration;
    p.slidePhase =
      age < 0.07
        ? "prepare"
        : age < 0.16
          ? "lower"
          : age < 0.54
            ? "slide"
            : age < 0.72
              ? "friction"
              : age < 0.86
                ? "recover"
                : null;
    if (!p.slidePhase) p.slideCooldown = SLIDE.cooldown;
  }
  const dir = Math.sign(p.vx);
  if (
    !p.grounded ||
    p.turn ||
    p.slidePhase ||
    axis !== dir ||
    axis !== p.runDirection
  ) {
    p.runDirection = axis;
    p.runTime = 0;
    p.runDistance = 0;
  } else {
    p.runTime = (p.runTime || 0) + dt;
    p.runDistance = (p.runDistance || 0) + Math.abs(p.vx) * dt;
  }
}
export function turnFrame(p, quiet = false) {
  if (!p.turn) return { pose: null, facing: p.facing || 1, width: 1 };
  const progress = 1 - p.turn / TURN_SECONDS;
  return {
    pose: quiet
      ? "turn-front"
      : progress < 0.33
        ? "turn-quarter"
        : progress < 0.67
          ? "turn-front"
          : "turn-quarter",
    facing: progress < 0.5 ? p.turnFrom : p.facing,
    width: 1,
  };
}
