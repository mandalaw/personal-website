import graph from "../workshop/graph-data.mjs";

// Authored evidence is the only source of career statements. A model may choose
// IDs; it may not replace these statements, classifications or destinations.
const publicTypes = new Set([
  "ROLE",
  "PROJECT",
  "EDUCATION",
  "FIELD_NOTE",
  "DECISION",
]);
export const facts = Object.freeze(
  graph.nodes
    .filter(
      (n) =>
        publicTypes.has(n.type) &&
        ["VERIFIED", "SUPPORTED", "HISTORICAL"].includes(n.classification) &&
        n.sourceRefs?.length,
    )
    .map((n) =>
      Object.freeze({
        id: n.id,
        type: n.type,
        title: n.label,
        statement: n.summary,
        classification: n.classification,
        sources: n.sourceRefs.map((id) => {
          const s = graph.sources.find((s) => s.id === id);
          if (!s) throw Error("Missing evidence source");
          return Object.freeze({ id: s.id, title: s.title, kind: s.kind });
        }),
        href: n.href,
        tags: Object.freeze([...n.tags]),
        ...(n.ownership ? { boundary: n.ownership } : {}),
        ...(n.period
          ? {
              period: n.period,
              periodBasis:
                n.periodBasis || "Reviewed education or project account.",
            }
          : {}),
      }),
    ),
);
export const byId = (id) => facts.find((f) => f.id === id);
export const actions = Object.freeze({
  graph: {
    label: "Show the evidence graph",
    href: "/workshop/#graph",
    pose: "point",
    station: "graph",
  },
  career: {
    label: "Open the career timeline",
    href: "/workshop/#career",
    pose: "walk",
    station: "career",
  },
  arena: {
    label: "Compare sample AI outputs",
    href: "/workshop/#arena",
    pose: "terminal",
    station: "arena",
  },
  maps: {
    label: "Try a spatial comparison",
    href: "/workshop/#maps",
    pose: "map",
    station: "maps",
  },
  api: {
    label: "Inspect an API flow",
    href: "/workshop/#api",
    pose: "terminal",
    station: "api",
  },
  design: {
    label: "Explore a design tradeoff",
    href: "/workshop/#design",
    pose: "blueprint",
    station: "design",
  },
  notes: {
    label: "Read the field notes",
    href: "/workshop/#notes",
    pose: "drawer",
    station: "notes",
  },
  missions: {
    label: "Pick an evidence trail",
    href: "/workshop/#missions",
    pose: "point",
    station: "missions",
  },
  packet: {
    label: "Build an evidence packet",
    href: "/workshop/#packet",
    pose: "packet",
    station: "packet",
  },
  resume: {
    label: "Read the public résumé overview",
    href: "/resume/",
    pose: "drawer",
  },
  access: {
    label: "Full résumé access options",
    href: "/professional-access/",
    pose: "drawer",
  },
  contact: { label: "Contact Ahmed", href: "/#contact", pose: "point" },
  inquiry: {
    label: "Discuss a role",
    href: "/professional-access/#inquiry",
    pose: "chair",
  },
  devrun: { label: "Play Dev Run", href: "/play/dev-run/", pose: "walk" },
  privacy: {
    label: "Privacy notice & analytics choices",
    href: "/privacy/#privacy-settings",
    pose: "point",
  },
  interview: {
    label: "Review public career evidence",
    href: "/workshop/#career",
    pose: "chair",
  },
});
export const intros = Object.freeze({
  evidence: "Here is the relevant work, with the source and scope attached.",
  show: "Less talking. Open the example and inspect it.",
  team: "Here is what Ahmed contributed to the team project.",
  education: "The degree information and its source are shown below.",
  resume: "The overview is public. Full-document access has its own options.",
  privacy:
    "Open the privacy notice to review the policy and choose your analytics settings. This guide has not changed your preferences.",
  contact:
    "For a specific opportunity, a direct conversation is the useful next step.",
  unknown:
    "I don’t have reviewed evidence for that claim. Ask Ahmed before relying on it.",
  private:
    "I can help with public work and projects. Private records and account actions are outside this guide.",
  clarify:
    "Which part would you like to inspect: software, data integration, AI evaluation, GIS, education or a project?",
  limits: "This evidence has a narrower scope than the claim in your question.",
});
export const aliases = Object.freeze([
  [
    "gdsc",
    /\bgdsc\b|google developer|utm (portal|application)|(?:student[- ]club|university club) (?:application )?portal/i,
  ],
  ["trustai", /trust\s?ai|marketplace/i],
  ["vigilant", /vigilant/i],
  [
    "garden",
    /garden|site.selection|candidate sites|potential (?:sites|locations)/i,
  ],
  ["devrun", /dev\s?run|\bgame\b|authored routes/i],
  [
    "uoft",
    /u\s?of\s?t\b|uoft|university of toronto|honours bachelor|\bh[.\s]*b[.\s]*sc\b|computer science and geography|\bminors?\b/i,
  ],
  [
    "quantic",
    /quantic|master['’]?s|\bmsse\b|ms in software|software.engineering (study|education|degree)|degree (?:is )?in software engineering/i,
  ],
  ["terraprobe", /terraprobe/i],
  [
    "uoft-support",
    /multimedia|student[- ]assistant|geospatial holdings|tutorial videos/i,
  ],
  ["sgs", /\bsgs\b|logistics (?:experience|work|record)|vehicle[- ]tracking/i],
  [
    "freelance",
    /freelance|web[- ]development|web work|personal and business websites?/i,
  ],
  ["othello", /othello|console[- ]game archive|supplied[- ]code credits/i],
  [
    "portfolio",
    /this (site|website)|portfolio itself|(?:this |the )?portfolio['’]s? account|dev mandalaw/i,
  ],
]);
export const topics = Object.freeze([
  ["sql", /\bsql\b/i],
  ["gis", /\bgis\b|geospatial|spatial|arcgis|mapping|\bmaps?\b/i],
  [
    "ai",
    /\bai\b|\bllm\b|machine learning|model evaluation|model[- ](?:output|comparison)|structured[- ]output/i,
  ],
  ["api", /\bapis?\b|\brest\b|endpoint/i],
  ["frontend", /front.?end|react|javascript|\bhtml\b|\bcss\b/i],
  ["backend", /back.?end|node\.?js|fastapi|server/i],
  ["integration", /integrat|azure|oracle|\betl\b|inconsisten|reconcil/i],
  ["testing", /test|quality assurance|\bqa\b/i],
  ["security", /security|auth|passkey/i],
  ["data", /\bdata\b|database|python|analytics/i],
  ["java", /\bjava\b/i],
]);
export const evidenceVersion = "public-graph-28.1+agent-30.1";
