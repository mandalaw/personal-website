const KEY = "mandalaw-dev-run-cinematic-v2";
export function readRecord(storage) {
  try {
    const d = JSON.parse(storage.getItem(KEY) || "{}");
    return {
      runner: Number.isFinite(d.runner)
        ? Math.max(0, Math.min(999999, d.runner))
        : 0,
      planner: Number.isFinite(d.planner)
        ? Math.max(0, Math.min(999999, d.planner))
        : 0,
      sound: d.sound === true,
    };
  } catch {
    return { runner: 0, planner: 0, sound: false };
  }
}
export function saveRecord(storage, mode, score) {
  const d = readRecord(storage);
  if (["runner", "planner"].includes(mode) && Number.isFinite(score))
    d[mode] = Math.max(d[mode], Math.floor(Math.min(999999, score)));
  try {
    storage.setItem(KEY, JSON.stringify(d));
  } catch {}
  return d;
}
export function saveSound(storage, sound) {
  const d = readRecord(storage);
  d.sound = !!sound;
  try {
    storage.setItem(KEY, JSON.stringify(d));
  } catch {}
}
