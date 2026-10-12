export const places = [
  {
    id: "orchard",
    name: "Orchard",
    x: 18,
    y: 30,
    access: 8,
    shade: 4,
    water: 7,
  },
  { id: "depot", name: "Depot", x: 43, y: 58, access: 9, shade: 2, water: 5 },
  { id: "ridge", name: "Ridge", x: 70, y: 20, access: 4, shade: 9, water: 8 },
  { id: "harbor", name: "Harbor", x: 83, y: 68, access: 6, shade: 6, water: 9 },
  {
    id: "commons",
    name: "Commons",
    x: 38,
    y: 82,
    access: 7,
    shade: 8,
    water: 4,
  },
];
export function spatial({
  weights = [1, 1, 1],
  radius = 100,
  minAccess = 0,
  center = [50, 50],
} = {}) {
  if (
    !Array.isArray(weights) ||
    weights.length !== 3 ||
    !weights.every((v) => Number.isFinite(v) && v >= 0 && v <= 10) ||
    !Number.isFinite(radius) ||
    radius < 0 ||
    radius > 100 ||
    !Number.isFinite(minAccess) ||
    minAccess < 0 ||
    minAccess > 10 ||
    !Array.isArray(center) ||
    center.length !== 2 ||
    !center.every(Number.isFinite)
  )
    throw Error("Invalid map parameters.");
  const total = weights.reduce((a, b) => a + b, 0);
  return places
    .map((p) => ({
      ...p,
      distance: Math.hypot(p.x - center[0], p.y - center[1]),
      score: total
        ? [p.access, p.shade, p.water].reduce(
            (s, x, i) => s + x * weights[i],
            0,
          ) / total
        : null,
    }))
    .filter((p) => p.distance <= radius && p.access >= minAccess)
    .sort(
      (a, b) => (b.score ?? 0) - (a.score ?? 0) || a.id.localeCompare(b.id),
    );
}
export function routeDistance(a, b, mode = "direct") {
  const x = Math.abs(a.x - b.x),
    y = Math.abs(a.y - b.y);
  return mode === "grid" ? x + y : Math.hypot(x, y);
}
export function pipeline(raw, scenario = "valid") {
  const steps = [
      {
        id: "client",
        state: "pass",
        detail: "Local illustration; no request leaves the browser.",
      },
    ],
    stop = (id, status, detail) => ({
      status,
      steps: [...steps, { id, state: "fail", detail }],
      response: { error: detail },
    });
  let b;
  try {
    b = JSON.parse(raw);
  } catch {
    return stop("validation", 400, "Expected valid JSON.");
  }
  if (
    !b ||
    Array.isArray(b) ||
    typeof b !== "object" ||
    Object.keys(b).some((k) => !["event_id", "item", "quantity"].includes(k)) ||
    typeof b.event_id !== "string" ||
    !/^[a-z0-9-]{1,40}$/.test(b.event_id) ||
    typeof b.item !== "string" ||
    !b.item.trim() ||
    b.item.length > 80 ||
    !Number.isInteger(b.quantity) ||
    b.quantity < 1 ||
    b.quantity > 100
  )
    return stop(
      "validation",
      422,
      "Use event_id, item and quantity (integer 1–100); no additional fields.",
    );
  steps.push({
    id: "validation",
    state: "pass",
    detail: "Exact keys, bounded strings and numeric range checked.",
  });
  if (scenario === "unauthorized")
    return stop(
      "authorization",
      401,
      "A server-validated session is required.",
    );
  steps.push({
    id: "authorization",
    state: "pass",
    detail: "Simulated authorized caller; never a frontend role grant.",
  });
  if (scenario === "rate-limit")
    return stop(
      "api",
      429,
      "Request budget exhausted. Retry later, not in a loop.",
    );
  steps.push({
    id: "api",
    state: "pass",
    detail: "Stable event ID becomes the idempotency key.",
  });
  if (scenario === "database")
    return stop(
      "database",
      503,
      "Storage unavailable. No success claimed; no blind replay.",
    );
  steps.push(
    {
      id: "database",
      state: "pass",
      detail:
        scenario === "duplicate"
          ? "Existing ID found; no second write."
          : "One synthetic write.",
    },
    {
      id: "response",
      state: "pass",
      detail: "Return only the bounded response.",
    },
  );
  return {
    status: scenario === "duplicate" ? 200 : 201,
    steps,
    response: {
      event_id: b.event_id,
      accepted: true,
      duplicate: scenario === "duplicate",
      quantity: b.quantity,
    },
  };
}
export const arenaCases = [
  {
    id: "supplier",
    label: "Missing supplier verification",
    input:
      "Listing: desk lamp, $40. No supplier-verification record is provided.",
    a: {
      price: 40,
      supplier_verified: false,
      limitations: ["Supplier verification missing"],
    },
    b: { price: 40, supplier_verified: true, limitations: [] },
    better: "a",
    rationale:
      "A keeps the missing verification visible. B is valid JSON but invents a fact. Neither output verifies the physical item.",
  },
  {
    id: "probability",
    label: "A score is not a probability",
    input:
      "Listing: bicycle, unusually low price. No labeled fraud-rate dataset is available.",
    a: {
      signal: "price_needs_review",
      explanation: "Price seems unusual; additional checks needed.",
    },
    b: { fraud_probability: 0.97, explanation: "Almost certainly fraudulent." },
    better: "a",
    rationale:
      "A gives a bounded review signal. B asserts a numerical probability without calibration data. Both still require external validation.",
  },
  {
    id: "condition",
    label: "Unclear condition",
    input:
      "A low-resolution photo shows a phone. The screen condition is not discernible.",
    a: { condition: "excellent", confidence: 0.99 },
    b: {
      condition: "unknown",
      limitations: ["Image does not establish screen condition"],
    },
    better: "b",
    rationale:
      "B preserves uncertainty. A sounds precise but the input cannot support its claim. Confidence is not correctness.",
  },
];
export function scoreOutput(values) {
  if (
    !Array.isArray(values) ||
    values.length !== 3 ||
    !values.every((n) => Number.isInteger(n) && n >= 0 && n <= 2)
  )
    throw Error("Score 0–2 in each dimension.");
  return {
    total: values.reduce((a, b) => a + b, 0),
    maximum: 6,
    meaning:
      "Your rubric score for a fictional output, not a provider benchmark.",
  };
}
export const challenges = [
  {
    id: "sql-kv",
    title: "SQL or KV?",
    prompt: "Save a member’s packet with ownership and a revision check.",
    choices: ["SQL row + conditional update", "KV entry + expiry"],
    answers: [
      "Good fit: atomic revision checks and account deletion are easy to express. Still index access by user and test concurrent writes.",
      "Useful for cached public data. For this write path, eventual consistency and racing updates need an additional design.",
    ],
    project: "portfolio",
  },
  {
    id: "cache",
    title: "Cache or query?",
    prompt: "An OWNER opens a private inquiry.",
    choices: ["Public CDN cache", "Authorized no-store response"],
    answers: [
      "A shared cache can disclose another person’s message. Do not cache this as public content.",
      "Good boundary: authorize every request and use private, no-store responses. The database still needs bounded queries.",
    ],
    project: "portfolio",
  },
  {
    id: "public",
    title: "Public or authenticated?",
    prompt: "A recruiter wants to evaluate the strongest project.",
    choices: ["Require an account", "Keep evidence public"],
    answers: [
      "Adds friction without protecting sensitive material. Offer saving separately.",
      "Keep professional evidence open; optional accounts can remember a useful selection.",
    ],
    project: "portfolio",
  },
  {
    id: "validate",
    title: "Where does validation belong?",
    prompt: "The form checks a quantity before sending.",
    choices: ["Frontend only", "Both, with server authority"],
    answers: [
      "A client can bypass the form. The interface check helps the visitor but cannot protect storage.",
      "Frontend checks make errors clear. The server independently enforces the full contract and authorization.",
    ],
    project: "gdsc",
  },
  {
    id: "derived",
    title: "Store the score?",
    prompt: "Garden suitability changes when the visitor moves a weight.",
    choices: ["Persist every slider result", "Compute from source values"],
    answers: [
      "Useful only with a clear versioned snapshot need. Otherwise it multiplies writes and risks stale scores.",
      "For five fixed fictional sites, compute locally. Store a versioned decision only if it is actually needed.",
    ],
    project: "garden",
  },
  {
    id: "retry",
    title: "Retry or fail fast?",
    prompt: "The destination times out after a write.",
    choices: ["Retry forever", "Bound attempts + deduplicate"],
    answers: [
      "Can amplify an outage and duplicate a write. It also has no cost ceiling.",
      "Use a stable ID, limited attempts and backoff. An ambiguous timeout still requires reconciliation.",
    ],
    project: "vigilant",
  },
  {
    id: "spatial",
    title: "Spatial index or full scan?",
    prompt: "The demo has five points. A future dataset has millions.",
    choices: ["Same full scan for both", "Measure and change strategy"],
    answers: [
      "Five points are cheap to scan. Millions can make each interaction expensive.",
      "Keep the tiny demo simple; for large data, measure and use suitable spatial indexing and server-side bounds.",
    ],
    project: "garden",
  },
  {
    id: "model",
    title: "Which output needs validation?",
    prompt: "One output is fluent. Another is valid JSON.",
    choices: ["Only the malformed one", "Both outputs"],
    answers: [
      "Fluency and shape do not establish truth. A valid object may invent supplier status.",
      "Validate the contract and grounding independently. Unknown evidence should stay unknown.",
    ],
    project: "trustai",
  },
];

