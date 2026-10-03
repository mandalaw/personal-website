export const HAZARDS = Object.freeze({
  ratelimit: {
    name: "Rate limit gate",
    kind: "jump",
    glyph: "429",
    family: "cloud",
  },
  timeout: {
    name: "Timeout platform",
    kind: "gap",
    glyph: "TTL",
    family: "data",
  },
  scanner: {
    name: "Sweeping scanner",
    kind: "slide",
    glyph: "wave",
    family: "security",
  },
  dependency: {
    name: "Shifting dependencies",
    kind: "jump",
    glyph: "box",
    family: "code",
  },
  baddeploy: {
    name: "Deployment fragments",
    kind: "jump",
    glyph: "CI ×",
    family: "cloud",
  },
  syntax: { name: "Syntax error", kind: "jump", glyph: "</>", family: "code" },
  merge: { name: "Merge conflict", kind: "jump", glyph: "≪ ≫", family: "code" },
  bug: { name: "A stubborn bug", kind: "jump", glyph: "bug", family: "code" },
  leak: { name: "Memory leak", kind: "gap", glyph: "LEAK", family: "data" },
  loop: { name: "Loading loop", kind: "slide", glyph: "loop", family: "code" },
  build: { name: "Failed build", kind: "jump", glyph: "CI ×", family: "code" },
  phishing: {
    name: "Phishing hook",
    kind: "slide",
    glyph: "hook",
    family: "security",
  },
  malware: {
    name: "Suspicious blob",
    kind: "jump",
    glyph: "blob",
    family: "security",
  },
  lock: {
    name: "Locked file",
    kind: "jump",
    glyph: "lock",
    family: "security",
  },
  packet: {
    name: "Dropped packet",
    kind: "slide",
    glyph: "packet",
    family: "cloud",
  },
  firewall: {
    name: "Firewall rule",
    kind: "jump",
    glyph: "wall",
    family: "security",
  },
  json: {
    name: "Malformed JSON",
    kind: "jump",
    glyph: "{ ? }",
    family: "data",
  },
  null: { name: "Null pointer", kind: "gap", glyph: "NULL", family: "data" },
  sql: { name: "Query timeout", kind: "jump", glyph: "SQL !", family: "data" },
  schema: { name: "Schema mismatch", kind: "jump", glyph: "≠", family: "data" },
  server: {
    name: "Falling server",
    kind: "jump",
    glyph: "server",
    family: "cloud",
    falling: true,
  },
  latency: {
    name: "Latency wave",
    kind: "slide",
    glyph: "wave",
    family: "cloud",
  },
  cloud: {
    name: "Offline service",
    kind: "slide",
    glyph: "cloud",
    family: "cloud",
  },
  dns: { name: "DNS not found", kind: "jump", glyph: "DNS ?", family: "cloud" },
  container: {
    name: "Container crash",
    kind: "jump",
    glyph: "box",
    family: "cloud",
  },
  tile: { name: "Missing map tile", kind: "gap", glyph: "TILE", family: "gis" },
  projection: {
    name: "Wrong projection",
    kind: "jump",
    glyph: "map",
    family: "gis",
  },
  drift: { name: "Model drift", kind: "slide", glyph: "drift", family: "ai" },
  hallucination: {
    name: "Unverified output",
    kind: "slide",
    glyph: "?!",
    family: "ai",
  },
});

const A = "/assets/brands/";
export const TOOLS = Object.freeze([
  {
    id: "python",
    name: "Python",
    file: A + "technologies/icon-python.svg",
    kit: "shield",
  },
  {
    id: "react",
    name: "React",
    file: A + "technologies/icon-react.svg",
    kit: "review",
  },
  {
    id: "js",
    name: "JavaScript",
    file: A + "technologies/javascript.svg",
    kit: "focus",
  },
  {
    id: "git",
    name: "Git",
    file: A + "technologies/icon-git.svg",
    kit: "repair",
  },
  {
    id: "fastapi",
    name: "FastAPI",
    file: A + "technologies/logo-fastapi.svg",
    kit: "review",
  },
  {
    id: "mongo",
    name: "MongoDB",
    file: A + "technologies/logo-mongodb.svg",
    kit: "shield",
  },
  {
    id: "java",
    name: "Java · Duke",
    file: A + "technologies/java-duke.svg",
    kit: "focus",
  },
  {
    id: "html",
    name: "HTML5",
    file: A + "technologies/icon-html5.svg",
    kit: "repair",
  },
  { id: "css", name: "CSS", file: A + "technologies/css.svg", kit: "review" },
  {
    id: "node",
    name: "Node.js",
    file: A + "technologies/icon-nodejs.svg",
    kit: "shield",
  },
  {
    id: "bootstrap",
    name: "Bootstrap",
    file: A + "technologies/bootstrap.svg",
    kit: "focus",
  },
  {
    id: "qgis",
    name: "QGIS",
    file: A + "technologies/qgis.svg",
    kit: "repair",
  },
  {
    id: "azure",
    name: "Azure Functions",
    file: A + "platforms/azure-functions.svg",
    kit: "review",
  },
  {
    id: "aws",
    name: "AWS EC2",
    file: A + "platforms/aws-ec2.svg",
    kit: "shield",
  },
  {
    id: "github",
    name: "GitHub",
    file: A + "platforms/github-black.svg",
    kit: "repair",
  },
  { id: "postgres", name: "PostgreSQL", text: "PG", kit: "focus" },
]);
export const KITS = Object.freeze({
  shield: "Test cover · one protected hit",
  repair: "Recovery · restore one heart",
  review: "Review streak · double pickup points for 12 seconds",
  focus: "Focus · wider jump buffer for 12 seconds",
});
// Every chapter has a reason to exist; the midpoint beat changes its staging.
const specs = [
  [
    "first",
    "Morning build",
    "Toronto",
    16,
    180,
    "morning",
    "run",
    "road",
    ["syntax", "loop", "bug"],
    "One jump. One slide. Then take the long way up.",
  ],
  [
    "roofs",
    "City stack",
    "Toronto",
    18,
    192,
    "roofs",
    "roof",
    "roof",
    ["merge", "server", "null", "build"],
    "The lift is on your left. The cat got here first.",
  ],
  [
    "snow",
    "Cold cache / last train",
    "Toronto",
    18,
    200,
    "snow",
    "run",
    "snow",
    ["malware", "firewall", "lock", "phishing"],
    "Snow now. A warm tunnel in a moment.",
  ],
  [
    "rush",
    "Laptop rush",
    "Toronto",
    16,
    260,
    "tunnel",
    "board",
    "metal",
    ["packet", "ratelimit", "leak", "latency"],
    "It has a keyboard. It also has excellent ground clearance.",
  ],
  [
    "grid",
    "Data in motion",
    "Between layers",
    18,
    185,
    "grid",
    "map",
    "digital",
    ["projection", "tile", "schema", "sql"],
    "Two routes. One very opinionated map.",
  ],
  [
    "cross",
    "Westbound",
    "Across the map",
    10,
    170,
    "transition",
    "travel",
    "digital",
    [],
    "Same backpack. Different weather.",
  ],
  [
    "fog",
    "Above the fog",
    "San Francisco",
    18,
    194,
    "fog",
    "roof",
    "roof",
    ["dns", "container", "hallucination", "json"],
    "The fog clears. The estimate does not.",
  ],
  [
    "hills",
    "Downhill from here",
    "San Francisco",
    18,
    270,
    "hills",
    "board",
    "road",
    ["dependency", "scanner", "null", "drift"],
    "Laptop: portable. Surprisingly portable.",
  ],
  [
    "bridge",
    "Bridge / cloud lift",
    "The Bay",
    20,
    204,
    "bridge",
    "lift",
    "bridge",
    ["timeout", "cloud", "phishing", "server"],
    "Wait for the platform. We have time.",
  ],
  [
    "deploy",
    "One last deployment",
    "Bay Area",
    24,
    225,
    "deploy",
    "sprint",
    "server",
    ["build", "packet", "sql", "malware", "merge", "leak", "baddeploy"],
    "Small changes. Very visible consequences.",
  ],
  [
    "finish",
    "Someone brought a cart",
    "The finish line",
    6,
    140,
    "finish",
    "arrival",
    "road",
    [],
    "Is that the cat from Toronto?",
  ],
];
let start = 0;
export const STAGES = specs.map(
  (
    [id, name, city, seconds, speed, style, movement, surface, pattern, line],
    index,
  ) => {
    const stage = {
      id,
      name,
      city,
      seconds,
      speed,
      style,
      movement,
      surface,
      pattern,
      line,
      index,
      start,
      end: start + seconds * speed,
    };
    start = stage.end;
    return Object.freeze(stage);
  },
);
export const FINISH = start;
export const SECRETS = [
  "Trust the test, not the confidence.",
  "404: the upper path exists.",
  "A map is an opinionated database.",
  "Six people. One GDSC repository.",
  "The cat knows whose turn it is at Reversi.",
  "Works on both my coasts.",
];
export const JUNCTIONS = Object.freeze([
  { stage: 0, at: 1.8, title: "A small detour", kind: "pocket", secret: 0 },
  { stage: 1, at: 2.2, title: "The rooftop return", kind: "lift", secret: 1 },
  { stage: 3, at: 0.8, title: "The transit ramp", kind: "ride", secret: null },
  { stage: 4, at: 2.2, title: "One layer back", kind: "lift", secret: 2 },
  { stage: 6, at: 2.2, title: "Above the arcade", kind: "pocket", secret: 4 },
  { stage: 7, at: 0.8, title: "Downhill shortcut", kind: "ride", secret: 3 },
  { stage: 8, at: 2.2, title: "The cloud return", kind: "lift", secret: 5 },
]);
export function seeded(seed = 23023) {
  let a = seed >>> 0;
  return () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };
}
export function makeCourse(seed = 23023) {
  const random = seeded(seed),
    hazards = [],
    pickups = [];
  let serial = 0,
    tool = 0;
  for (const stage of STAGES) {
    const junction = JUNCTIONS.find((j) => j.stage === stage.index);
    const count = stage.index === 0 ? 3 : stage.pattern.length;
    const first =
      junction && junction.kind !== "ride"
        ? (junction.at * stage.speed + 900) / stage.speed
        : 3.7;
    const times = Array.from(
      { length: count },
      (_, i) =>
        first + i * ((stage.seconds - 1.6 - first) / Math.max(1, count - 1)),
    );
    for (let i = 0; i < times.length; i++) {
      let t = times[i];
      if (t > stage.seconds - 1.4) continue;
      if (stage.index === 0 && i === times.length - 1) t = stage.seconds - 0.85;
      const type = stage.pattern[i % stage.pattern.length],
        h = HAZARDS[type],
        x = stage.start + (t + (random() - 0.5) * 0.12) * stage.speed;
      hazards.push({
        id: serial++,
        type,
        x,
        stage: stage.index,
        width: h.kind === "gap" ? 105 : 50 + (i % 2) * 6,
        height: h.kind === "slide" ? 50 : 48 + (i % 3) * 4,
        route: null,
      });
      pickups.push({
        id: tool,
        x: x + stage.speed * 0.85,
        tool: tool % TOOLS.length,
        height: i === 2 ? 140 : stage.movement === "board" ? 27 : 68,
        secret:
          stage.index === 3 && i === 2
            ? 1
            : stage.index === 7 && i === 2
              ? 3
              : null,
      });
      tool++;
    }
  }
  hazards.sort((a, b) => a.x - b.x);
  pickups.sort((a, b) => a.x - b.x);
  return {
    seed,
    hazards,
    pickups,
    junctions: JUNCTIONS.map((j, i) => ({
      ...j,
      id: i,
      x: STAGES[j.stage].start + j.at * STAGES[j.stage].speed,
    })),
  };
}
export function stageAt(distance) {
  return STAGES.find((s) => distance < s.end) || STAGES.at(-1);
}
export function groundAt(distance) {
  const s = stageAt(distance),
    t = Math.max(0, Math.min(1, (distance - s.start) / (s.end - s.start)));
  // Every zone joins at the same height; internal slopes have zero endpoint offset.
  const edge = Math.sin(Math.PI * t);
  if (s.movement === "board")
    return 421 - 36 * Math.sin(Math.PI * 2 * t) * edge;
  if (s.movement === "roof") return 421 - 27 * edge * edge;
  if (s.style === "bridge") return 421 - 16 * edge * edge;
  return 421;
}
export function stageProgress(game) {
  const s = STAGES[game.stage];
  return Math.max(
    0,
    Math.min(1, (game.distance - s.start) / (s.end - s.start)),
  );
}
export function sceneFor(game) {
  const s = STAGES[game.stage],
    p = stageProgress(game);
  return s.id === "snow" && p > 0.52
    ? "transit"
    : s.id === "bridge" && p > 0.55
      ? "cloud"
      : s.id === "grid" && p > 0.55
        ? "layers"
        : s.id === "fog" && p > 0.55
          ? "golden"
          : s.style;
}
export function weatherFor(game) {
  const scene = sceneFor(game),
    p = stageProgress(game);
  if (scene === "snow") return p < 0.22 ? "flurry" : "snow";
  if (scene === "fog") return "fog";
  if (scene === "golden") return "clearing";
  if (scene === "bridge") return "wind";
  if (scene === "hills") return "rain";
  return "clear";
}
export function speedFor(game) {
  const s = STAGES[game.stage],
    p = stageProgress(game);
  if (s.movement === "board") return s.speed * (0.78 + 0.44 * p);
  if (s.movement === "sprint") return s.speed * (0.88 + 0.24 * p);
  if (s.movement === "travel")
    return s.speed * (0.7 + 0.6 * Math.sin(p * Math.PI));
  if (s.movement === "arrival") return s.speed * (1.2 - 0.7 * p);
  return s.speed;
}
