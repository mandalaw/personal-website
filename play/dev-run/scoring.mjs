export const freshStats = () => ({
  points: 0,
  pickups: 0,
  cleared: 0,
  streak: 0,
  bestStreak: 0,
  collisions: 0,
  deaths: 0,
  jumps: 0,
  slides: 0,
  time: 0,
  secrets: [],
});
export const totalScore = (stats, distance, health, won = false) =>
  Math.max(
    0,
    Math.floor(distance / 30) + stats.points + (won ? health * 250 : 0),
  );
export function clearHazard(stats) {
  stats.cleared++;
  stats.streak++;
  stats.bestStreak = Math.max(stats.bestStreak, stats.streak);
  stats.points += 25 + Math.min(stats.streak, 10) * 5;
}
export function collect(stats, multiplier = 1, secret = null) {
  stats.pickups++;
  stats.points += 100 * multiplier;
  if (secret !== null && !stats.secrets.includes(secret)) {
    stats.secrets.push(secret);
    stats.points += 300;
  }
}
export const rank = (stats) =>
  stats.deaths === 0 && stats.collisions <= 2
    ? "Clean release"
    : stats.deaths <= 2
      ? "Shipped with care"
      : "Persistent engineer";
export const clock = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
