const smooth = (x) => {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
};
// An immutable world anchor and one simulation clock; never use projected screen x as phase.
export function collectibleFrame(p, game, quiet = false) {
  const t = quiet ? 0 : game.stats.time,
    phase = p.id * 2.39996;
  const hover = quiet ? 0 : Math.sin(t * 0.85 + phase) * 2.2;
  const anchorY = game.surfaceAt(p.x) - p.height;
  const dy = game.player.y - 53 - anchorY,
    dx = game.distance - p.x;
  const magnet = quiet ? 0 : smooth(1 - Math.hypot(dx, dy) / 80) * 0.32;
  return {
    x: p.x + dx * magnet,
    y: anchorY + hover + dy * magnet,
    anchorX: p.x,
    anchorY,
    ground: game.surfaceAt(p.x),
    tilt: quiet ? 0 : Math.sin(t * 0.55 + phase) * 0.045,
    box: { x: p.x - 22, y: anchorY - 23, w: 44, h: 46 },
  };
}
