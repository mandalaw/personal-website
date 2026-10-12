import {
  facts,
  byId,
  actions,
  intros,
  aliases,
  topics,
  evidenceVersion,
} from "./catalog.mjs";
import {
  exact,
  text,
  unique,
  denied,
  normalized,
  instructionLike,
  privateLike,
  claimLike,
  unsupportedPremise,
  consequential,
  limits,
} from "./contracts.mjs";
import {
  retrievalIntent,
  contactIntent,
  inquiryNavigation,
} from "./intent.mjs";

export const publicTools = Object.freeze({
  "career_graph.search": { args: ["query"], kind: "read" },
  "career_graph.node": { args: ["id"], kind: "read" },
  "career_graph.nodes": { args: ["ids"], kind: "read" },
  "experience.lookup": { args: ["id"], kind: "read" },
  "projects.lookup": { args: ["id"], kind: "read" },
  "notes.lookup": { args: ["id"], kind: "read" },
  "workshop.navigate": { args: ["action"], kind: "preview" },
  "workshop.highlight": { args: ["id"], kind: "preview" },
  "lab.open": { args: ["lab"], kind: "preview" },
  "devrun.open": { args: [], kind: "preview" },
  "resume.options": { args: [], kind: "preview" },
  "packet.preview": { args: ["topics"], kind: "read" },
  "contact.open": { args: [], kind: "preview" },
  "inquiry.start": { args: [], kind: "preview" },
});
// A named source keeps its identity even when the request also names a demo
// topic. University employment/tutorial work is distinct from the degree.
function namedEvidence(q, intent) {
  let named = aliases.filter(([id, rx]) => rx.test(q)).map(([id]) => id);
  // The generic word "game" must not override the explicitly named console
  // archive. Both remain selectable when Dev Run itself is also named.
  if (named.includes("othello") && !/dev\s?run|authored routes/i.test(q))
    named = named.filter((id) => id !== "devrun");
  if (
    named.includes("uoft") &&
    /\b(?:tutorials?|multimedia|student[- ]assistant|support work)\b/i.test(q)
  ) {
    if (!/\b(?:degree|education|major|minor|qualification)\b/i.test(q))
      named = named.filter((id) => id !== "uoft");
    named.push("uoft-support");
  }
  return [...new Set(named)].filter(
    (id) =>
      !intent.excludedIds.has(id) && !intent.excludedTypes.has(byId(id).type),
  );
}
const namedPlan = (ids, q) => ({
  intro:
    ids.includes("othello") && /\b(?:api|backend|integration)\b/i.test(q)
      ? "limits"
      : ids.every((id) => ["gdsc", "trustai", "othello"].includes(id))
        ? "team"
        : "evidence",
  factIds: ids.slice(0, limits.maxFacts),
  actionIds: ["graph"],
});

// Teaching records are not employment proof. Only an explanatory/note request
// can use these concept aliases, and all security checks still run first.
function teachingEvidence(q, intent) {
  if (
    !/\b(?:notes?|teaching|lessons?|principles?|explain\w*|explanation|discussion)\b/i.test(
      q,
    )
  )
    return [];
  const concepts = [
    [
      "output-contract",
      /\b(?:schema|json|required fields|allowed categories|output shape)\b/i,
    ],
    ["retry-budget", /\b(?:idempotency|timeout|retries|retry)\b/i],
    [
      "map-weights",
      /\bweights?\b/i.test(q) &&
        /\b(?:map|site|shade|water|suitability|criteria|criterion)\b/i.test(q),
    ],
    [
      "owner-boundary",
      /\b(?:session|role|authori[sz]ation)\b/i.test(q) &&
        /\b(?:server|fresh|hidden|hiding|button|protected)\b/i.test(q),
    ],
    [
      "game-state",
      /\b(?:saving|saved|persistence)\b/i.test(q) &&
        /\b(?:game|movement|chapter)\b/i.test(q),
    ],
    [
      "test-boundaries",
      /\b(?:tests?|testing)\b.{0,35}\b(?:components?|boundaries)\b|\bform submission\b.{0,45}\b(?:ownership|database)\b/i,
    ],
    [
      "query-shape",
      /\bquery shape\b|\bindexes\b|\breturn\w*\b.{0,40}\b(?:read|reading)\b/i,
    ],
    [
      "public-first",
      /\bhiring evidence\b|\brecruiters?\b.{0,45}\b(?:qualifications|contact|registration|signing)\b/i,
    ],
    ["provider-choice", /\bprovider\b/i],
  ];
  return concepts
    .filter(
      ([id, match]) =>
        (typeof match === "boolean" ? match : match.test(q)) &&
        !intent.excludedIds.has(id) &&
        !intent.excludedTypes.has("FIELD_NOTE"),
    )
    .map(([id]) => id)
    .slice(0, limits.maxFacts);
}

export function search(query) {
  const original = normalized(query, limits.questionChars);
  if (!original || instructionLike(original) || privateLike(original))
    return [];
  const intent = retrievalIntent(original),
    q = intent.query;
  if (!q) return [];
  const allowed = (f) =>
    !intent.excludedIds.has(f.id) && !intent.excludedTypes.has(f.type);
  const named = namedEvidence(q, intent);
  const teaching = teachingEvidence(q, intent);
  if (
    teaching.length &&
    (!named.length ||
      (named.length === 1 && named[0] === "devrun" && !/dev\s?run/i.test(q)))
  )
    return teaching;
  if (named.length) return named.slice(0, limits.maxFacts);
  const directNotes = facts.filter(
    (f) =>
      f.type === "FIELD_NOTE" &&
      (q.toLowerCase().includes(f.id) ||
        q.toLowerCase().includes(f.title.toLowerCase())),
  );
  if (directNotes.length)
    return directNotes.map((f) => f.id).slice(0, limits.maxFacts);
  const noteIntent = /\b(field notes?|notes?|lessons?|principles?)\b/i.test(q);
  const roleIntent =
    /\b(professionally|professional|employment|roles?|freelance|internship)\b/i.test(
      q,
    ) && !/\b(?:project|team) role\b/i.test(q);
  const projectIntent = /\b(projects?|coursework)\b/i.test(q);
  const pool = facts.filter(
    (f) =>
      allowed(f) &&
      (!/\bintern(?:ship)?\b/i.test(q) || /\bintern\b/i.test(f.title)) &&
      (noteIntent
        ? f.type === "FIELD_NOTE"
        : roleIntent
          ? f.type === "ROLE"
          : projectIntent
            ? f.type === "PROJECT"
            : ["ROLE", "PROJECT"].includes(f.type)),
  );
  if (
    projectIntent &&
    /\bsoftware\b/i.test(q) &&
    !topics.some(([, rx]) => rx.test(q))
  )
    return ["portfolio", "gdsc", "devrun", "trustai"].filter((id) =>
      pool.some((f) => f.id === id),
    );
  const tags = topics.filter(([, rx]) => rx.test(q)).map(([id]) => id);
  const stop = new Set([
    "the",
    "and",
    "does",
    "has",
    "his",
    "ahmed",
    "what",
    "about",
    "with",
    "show",
    "did",
    "work",
    "worked",
    "experience",
    "tell",
    "have",
    "this",
    "that",
    "from",
    "where",
    "which",
    "would",
    "could",
    "should",
    "example",
    "examples",
    "evidence",
    "source",
    "sources",
    "concrete",
    "give",
    "can",
    "you",
    "him",
    "role",
    "roles",
    "employment",
    "professionally",
    "project",
    "projects",
    "involved",
    "explain",
    "behind",
    "candidate",
    "specific",
    "reviewing",
  ]);
  const stem = (w) => {
    if (/^inconsisten(?:t|cy|cies)$/.test(w)) return "inconsistency";
    if (/^investigat(?:e|ed|ing|ion|ions)$/.test(w)) return "investigate";
    return w.length > 4 ? w.replace(/(?:s|ed)$/, "") : w;
  };
  const words = [
    ...new Set(
      q
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((w) => w.length > 2 && !stop.has(w))
        .map(stem),
    ),
  ];
  const literals = [
    ...q.matchAll(/\b(python|sql|oracle|arcgis pro|java)\b/gi),
  ].map((m) => m[1].toLowerCase());
  const scored = pool
    .map((f) => {
      const body = (f.title + " " + f.statement).toLowerCase(),
        tokens = body.split(/[^\p{L}\p{N}]+/u).map(stem),
        lexical = words.filter((w) => tokens.includes(w)).length;
      return {
        f,
        score: f.tags.filter((t) => tags.includes(t)).length * 8 + lexical * 3,
        literal: !literals.length || literals.some((l) => body.includes(l)),
      };
    })
    .filter((x) => x.score > 0 && x.literal)
    .sort((a, b) => b.score - a.score || a.f.id.localeCompare(b.f.id));
  if (!scored.length) return [];
  const floor = Math.max(3, scored[0].score * 0.5);
  const literalProof =
    literals.length > 1
      ? literals.flatMap((l) =>
          scored
            .filter((x) =>
              (x.f.title + " " + x.f.statement).toLowerCase().includes(l),
            )
            .slice(0, 1)
            .map((x) => x.f.id),
        )
      : [];
  return [
    ...new Set([
      ...literalProof,
      ...scored.filter((x) => x.score >= floor).map((x) => x.f.id),
    ]),
  ].slice(0, limits.maxFacts);
}
export function tool(name, args) {
  const spec = Object.hasOwn(publicTools, name) && publicTools[name];
  if (!spec || !exact(args, spec.args)) return denied("TOOL_SCHEMA");
  if (name === "career_graph.search")
    return text(args.query, limits.questionChars)
      ? { ok: true, ids: search(args.query) }
      : denied("TOOL_SCHEMA");
  if (name === "career_graph.nodes")
    return unique(
      args.ids,
      limits.maxFacts,
      (id) => typeof id === "string" && !!byId(id),
    ) && args.ids.length
      ? { ok: true, ids: [...args.ids] }
      : denied("TOOL_SCHEMA");
  if (
    name.endsWith(".lookup") ||
    name === "career_graph.node" ||
    name === "workshop.highlight"
  ) {
    const f = text(args.id, 70) && byId(args.id),
      type = {
        "experience.lookup": "ROLE",
        "projects.lookup": "PROJECT",
        "notes.lookup": "FIELD_NOTE",
      }[name];
    if (!f || (type && f.type !== type)) return denied("EVIDENCE_UNAVAILABLE");
    return {
      ok: true,
      ids: [f.id],
      ...(name === "workshop.highlight" ? { actions: ["graph"] } : {}),
    };
  }
  if (name === "workshop.navigate")
    return text(args.action, 30) && Object.hasOwn(actions, args.action)
      ? { ok: true, actions: [args.action] }
      : denied("ACTION_UNAVAILABLE");
  if (name === "lab.open")
    return ["ai", "gis", "api", "design"].includes(args.lab)
      ? {
          ok: true,
          actions: [
            { ai: "arena", gis: "maps", api: "api", design: "design" }[
              args.lab
            ],
          ],
        }
      : denied("ACTION_UNAVAILABLE");
  if (name === "packet.preview") {
    if (
      !unique(args.topics, 6, (t) => topics.some(([id]) => id === t)) ||
      !args.topics.length
    )
      return denied("TOOL_SCHEMA");
    return {
      ok: true,
      ids: facts
        .filter(
          (f) =>
            ["ROLE", "PROJECT", "EDUCATION"].includes(f.type) &&
            f.tags.some((t) => args.topics.includes(t)),
        )
        .slice(0, 5)
        .map((f) => f.id),
      actions: ["packet"],
    };
  }
  return {
    ok: true,
    actions: {
      "devrun.open": ["devrun"],
      "resume.options": ["resume", "access"],
      "contact.open": ["contact"],
      "inquiry.start": ["inquiry"],
    }[name],
  };
}

// The inference adapter may return only this closed plan. All displayed factual
// prose, links and source labels are reconstructed from the reviewed catalogue.
export function validatePlan(
  plan,
  {
    allowedIds = facts.map((f) => f.id),
    allowedActions = Object.keys(actions),
  } = {},
) {
  if (
    !exact(plan, ["intro", "factIds", "actionIds"]) ||
    typeof plan.intro !== "string" ||
    !Object.hasOwn(intros, plan.intro) ||
    !unique(
      plan.factIds,
      limits.maxFacts,
      (id) => typeof id === "string" && allowedIds.includes(id) && !!byId(id),
    ) ||
    !unique(
      plan.actionIds,
      limits.maxActions,
      (id) =>
        typeof id === "string" &&
        allowedActions.includes(id) &&
        Object.hasOwn(actions, id),
    )
  )
    return denied("OUTPUT_CONTRACT");
  if (
    ["unknown", "private", "clarify", "privacy"].includes(plan.intro) &&
    plan.factIds.length
  )
    return denied("OUTPUT_CONTRADICTION");
  if (["evidence", "limits"].includes(plan.intro) && !plan.factIds.length)
    return denied("OUTPUT_CONTRADICTION");
  if (plan.intro === "show" && !plan.actionIds.length)
    return denied("OUTPUT_CONTRADICTION");
  if (
    plan.intro === "resume" &&
    !plan.actionIds.some((id) => ["resume", "access"].includes(id))
  )
    return denied("OUTPUT_CONTRADICTION");
  if (
    plan.intro === "contact" &&
    !plan.actionIds.some((id) => ["contact", "inquiry"].includes(id))
  )
    return denied("OUTPUT_CONTRADICTION");
  if (
    plan.intro === "privacy" &&
    (plan.actionIds.length !== 1 || plan.actionIds[0] !== "privacy")
  )
    return denied("OUTPUT_CONTRADICTION");
  if (
    plan.intro === "education" &&
    (!plan.factIds.length ||
      plan.factIds.some((id) => byId(id).type !== "EDUCATION"))
  )
    return denied("OUTPUT_CONTRADICTION");
  if (
    plan.intro === "team" &&
    (!plan.factIds.length ||
      plan.factIds.some((id) => !["trustai", "gdsc", "othello"].includes(id)))
  )
    return denied("OUTPUT_CONTRADICTION");
  return { ok: true };
}
export function materialize(plan, context = {}) {
  const validation = validatePlan(plan, context);
  if (!validation.ok)
    return {
      ok: false,
      code: validation.code,
      summary: intros.unknown,
      facts: [],
      actions: [],
      mode: "deterministic",
    };
  return {
    ok: true,
    summary: intros[plan.intro],
    facts: plan.factIds.map(byId),
    actions: plan.actionIds.map((id) => ({ id, ...actions[id] })),
    classification: ["unknown", "private", "clarify"].includes(plan.intro)
      ? "NEEDS CONFIRMATION"
      : "SUPPORTED",
    mode: "deterministic",
    evidenceVersion,
  };
}
const plan = (intro, factIds = [], actionIds = []) => ({
  intro,
  factIds,
  actionIds,
});
function routeQuestion(raw) {
  const original = normalized(raw);
  if (!original) return plan("clarify", [], ["missions"]);
  if (instructionLike(original)) return plan("private", [], ["graph"]);
  if (inquiryNavigation(original))
    return plan("contact", [], ["contact", "inquiry"]);
  if (privateLike(original)) return plan("private", [], ["contact"]);
  if (
    claimLike(original) ||
    unsupportedPremise(original) ||
    consequential(original)
  )
    return plan("unknown", [], ["contact"]);
  const intent = retrievalIntent(original),
    q = intent.query;
  if (!q) return plan("clarify", [], ["missions"]);
  if (
    /\bprivacy (?:policy|notice|choices|settings|controls)\b/i.test(q) ||
    (/\banalytics\b/i.test(q) &&
      /\b(?:consent|opt.out|withdraw|disable|turn.{0,20}off)\b/i.test(q))
  )
    return plan("privacy", [], ["privacy"]);
  if (/routeability|\bwwm\b|\bwmm\b|uber/i.test(q))
    return plan("unknown", [], ["contact"]);
  if (
    /\b(work(?:ed|ing)?|employ(?:ed|ment)|role)\s+(at|for|by)\s+/i.test(q) &&
    !aliases.some(([, r]) => r.test(q))
  )
    return plan("unknown", [], ["contact"]);
  const named = namedEvidence(q, intent);
  const teaching = teachingEvidence(q, intent);
  if (
    teaching.length &&
    (!named.length ||
      (named.length === 1 && named[0] === "devrun" && !/dev\s?run/i.test(q)))
  )
    return plan("evidence", teaching, ["notes"]);
  if (
    /^(?:please |(?:can|could) (?:you|i|we) |i want to |i would like to )?(?:show|open|try|inspect|demo|take me|play|walk me)\b|\bshow me\b/i.test(
      q,
    )
  ) {
    // Generic demos can illustrate a topic, but never stand in for another
    // named employer/project. Source cards retain their reviewed links.
    if (named.length) {
      if (named.length === 1) {
        if (
          named[0] === "trustai" &&
          !/\b(?:api|backend|integration)\b/i.test(q)
        )
          return plan("show", named, ["arena"]);
        if (named[0] === "garden") return plan("show", named, ["maps"]);
        if (named[0] === "vigilant" && /api|integrat|backend/i.test(q))
          return plan("show", named, ["api"]);
        if (named[0] === "devrun") return plan("show", named, ["devrun"]);
      }
      return namedPlan(named, q);
    }
    if (/trustai|\bai\b|\bllm\b|model|output/i.test(q))
      return plan("show", ["trustai"], ["arena"]);
    if (/gis|spatial|map|garden/i.test(q))
      return plan("show", ["garden"], ["maps"]);
    if (/api|integrat|backend/i.test(q))
      return plan("show", ["vigilant"], ["api"]);
    if (/design|tradeoff|blueprint/i.test(q))
      return plan("show", [], ["design"]);
    if (/dev\s?run|game/i.test(q)) return plan("show", ["devrun"], ["devrun"]);
    if (/note|reading/i.test(q)) return plan("show", [], ["notes"]);
    if (/graph|evidence|original sources/i.test(q))
      return plan("show", [], ["graph"]);
  }
  if (
    /\b(?:need|have|required|must)\b.{0,30}\b(?:sign in|log in|register)\b.{0,40}\b(?:qualifications|experience|work|projects)\b/i.test(
      q,
    )
  )
    return plan("resume", [], ["resume", "career"]);
  if (/résumé|resume|\bcv\b/i.test(q))
    return plan("resume", [], ["resume", "access"]);
  if (contactIntent(q)) return plan("contact", [], ["contact", "inquiry"]);
  if (
    /education|degree|academic (?:credentials|qualifications)|educational credentials/i.test(
      q,
    ) &&
    !aliases.some(([, r]) => r.test(q))
  )
    return plan("education", ["uoft", "quantic"], ["career"]);
  if (named.length) return namedPlan(named, q);
  if (
    /experience|professional|employment/i.test(q) &&
    !topics.some(([, rx]) => rx.test(q))
  )
    return plan(
      "evidence",
      facts
        .filter((f) => f.type === "ROLE")
        .map((f) => f.id)
        .slice(0, 5),
      ["career"],
    );
  if (
    /(?:owner |server.side )?authori[sz]ation|server.side permissions|hiding (?:a |the )?button/i.test(
      q,
    ) &&
    /how|different|explain|boundary|why/i.test(q)
  )
    return plan("evidence", ["owner-boundary"], ["notes"]);
  const ids = search(original);
  return ids.length
    ? plan("evidence", ids, ["graph"])
    : plan("clarify", [], ["missions"]);
}
export function planQuestion(raw) {
  const selected = routeQuestion(raw),
    original = normalized(raw);
  if (!original || !selected.factIds.length) return selected;
  const intent = retrievalIntent(original);
  const ids = selected.factIds.filter(
    (id) =>
      !intent.excludedIds.has(id) && !intent.excludedTypes.has(byId(id).type),
  );
  if (!ids.length && selected.intro !== "show")
    return plan("clarify", [], ["missions"]);
  return { ...selected, factIds: ids };
}
export function answer(raw) {
  return materialize(planQuestion(raw));
}
export { facts, actions, evidenceVersion };
