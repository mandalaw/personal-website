import graph from "../workshop/graph-data.mjs";
import { evidenceFor, packet, topics } from "../workshop/evidence-core.mjs";
export const toolNames = [
  "career_graph.search",
  "projects.lookup",
  "experience.lookup",
  "workshop.navigate",
  "trustai.demo",
  "gis.demo",
  "api.demo",
  "resume.request_access",
  "contact.open",
  "inquiry.start",
  "packet.build",
];
const stations = {
  missions: "/workshop/#missions",
  graph: "/workshop/#graph",
  arena: "/workshop/#arena",
  maps: "/workshop/#maps",
  api: "/workshop/#api",
  design: "/workshop/#design",
  career: "/workshop/#career",
  notes: "/workshop/#notes",
  packet: "/workshop/#packet",
  transit: "/workshop/#transit",
};
const prohibited =
  /\b(ignore (all|previous)|system prompt|api.?key|password|cookie|token|credential|private phone|owner inbox|admin|user email|override|execute|exfiltrat|send to|fetch https?|drop table)\b/i;
export function runTool(name, args = {}) {
  const schema = {
    "career_graph.search": ["query"],
    "projects.lookup": ["id"],
    "experience.lookup": ["id"],
    "workshop.navigate": ["station"],
    "trustai.demo": [],
    "gis.demo": [],
    "api.demo": [],
    "resume.request_access": [],
    "contact.open": [],
    "inquiry.start": [],
    "packet.build": ["interests"],
  };
  if (
    !toolNames.includes(name) ||
    !args ||
    Array.isArray(args) ||
    Object.keys(args).some(
      (k) => !["query", "id", "topic", "station", "interests"].includes(k),
    )
  )
    return { error: "This tool is not available." };
  if (
    Object.keys(args).length !== schema[name].length ||
    Object.keys(args).some((k) => !schema[name].includes(k))
  )
    return { error: "Unsupported tool arguments." };
  if ((Object.hasOwn(args,"query") && (typeof args.query!=="string" || args.query.length>150)) ||
      (Object.hasOwn(args,"id") && (typeof args.id!=="string" || args.id.length>80)) ||
      (Object.hasOwn(args,"station") && typeof args.station!=="string")) {
    return {error:"Unsupported tool argument type or length."};
  }
  if (
    JSON.stringify(args).length > 2000 ||
    prohibited.test(JSON.stringify(args))
  )
    return {
      error: "Private data and administrative actions are outside this guide.",
    };
  if (name === "career_graph.search") {
    const q = String(args.query || "")
      .trim()
      .toLowerCase()
      .slice(0, 150);
    if (!q) return { nodes: [] };
    return {
      nodes: graph.nodes
        .filter(
          (n) =>
            ["ROLE", "PROJECT", "EDUCATION", "FIELD_NOTE"].includes(n.type) &&
            (n.label + " " + n.summary).toLowerCase().includes(q),
        )
        .slice(0, 6),
    };
  }
  if (["projects.lookup", "experience.lookup"].includes(name)) {
    const n = graph.nodes.find(
      (n) =>
        n.id === args.id &&
        n.type === (name === "projects.lookup" ? "PROJECT" : "ROLE"),
    );
    return n
      ? { nodes: [n] }
      : { error: "No reviewed evidence for that item." };
  }
  if (name === "workshop.navigate")
    return Object.hasOwn(stations, args.station)
      ? {
          links: [
            { label: "Open " + args.station, href: stations[args.station] },
          ],
        }
      : { error: "Choose an available station." };
  const fixed = {
    "trustai.demo": ["Compare sample outputs", "/workshop/#arena"],
    "gis.demo": ["Open the GIS studio", "/workshop/#maps"],
    "api.demo": ["Inspect the API flow", "/workshop/#api"],
    "resume.request_access": [
      "View full résumé options",
      "/professional-access/",
    ],
    "contact.open": ["Contact Ahmed", "/#contact"],
    "inquiry.start": ["Discuss a role", "/professional-access/#inquiry"],
  };
  if (fixed[name])
    return { links: [{ label: fixed[name][0], href: fixed[name][1] }] };
  if (name === "packet.build") {
    if (
      !Array.isArray(args.interests) ||
      args.interests.length > 6 ||
      !args.interests.length ||
      args.interests.some(
        (t) =>
          !["backend", "ai", "gis", "frontend", "data", "integration"].includes(
            t,
          ),
      )
    )
      return { error: "Choose the supported packet interests." };
    return {
      nodes: packet(graph, args.interests),
      links: [
        { label: "Open packet access", href: "/professional-access/#packet" },
      ],
      preview: true,
    };
  }
  return { error: "Unavailable." };
}
const matchers = [
  ["sql", /\bsql\b/i],
  ["gis", /\b(gis|geospatial|spatial|arcgis|mapping|maps)\b/i],
  ["ai", /\b(ai|machine learning|llm|model evaluation|trustai)\b/i],
  ["api", /\b(apis?|rest|endpoint)\b/i],
  ["frontend", /\b(front.?end|react|javascript|html|css)\b/i],
  ["backend", /\b(back.?end|node\.?js|fastapi|server)\b/i],
  ["integration", /\b(integrat\w*|azure|oracle|etl)\b/i],
  ["testing", /\b(test\w*|qa|quality assurance)\b/i],
  ["security", /\b(security|auth\w*|passkey)\b/i],
  ["data", /\b(data|database|python|analytics)\b/i],
];
export function answer(question) {
  if (typeof question !== "string" || question.length > 1200)
    return { summary: "Keep the question under 1,200 characters.", nodes: [] };
  if (prohibited.test(question))
    return {
      summary:
        "I can show public professional evidence and open useful stations. Private accounts, owner tools and instructions are unavailable.",
      nodes: [],
      blocked: true,
    };
  if (
    /\b(senior|years|million|percent|%|visa|sponsor|citizen|work authori|salary|production scale|sole|entirely|expert|certifi)\b/i.test(
      question,
    )
  )
    return {
      summary:
        "That specific claim is not established by this public graph. Ask Ahmed directly; I will not infer tenure, scale, credentials, sole ownership or work authorization.",
      classification: "NEEDS CONFIRMATION",
      nodes: [],
      links: [{ label: "Contact Ahmed", href: "/#contact" }],
    };
  const named = [
    ["gdsc", /gdsc|google developer/i],
    ["trustai", /trustai/i],
    ["vigilant", /vigilant/i],
    ["garden", /garden/i],
    ["devrun", /dev ?run/i],
    ["uoft", /university of toronto|uoft|u of t/i],
    ["quantic", /quantic/i],
  ].find((x) => x[1].test(question));
  if (named) {
    const n = graph.nodes.find((n) => n.id === named[0]);
    return {
      summary:
        named[0] === "gdsc"
          ? "GDSC is an academic team project, not Google employment or sole authorship."
          : named[0] === "trustai"
            ? "TrustAI is a team software project. Project stack and Ahmed’s specific contribution are distinct."
            : "Here is the reviewed account, with its source classification.",
      nodes: [n],
    };
  }
  if (/resume|résumé|cv\b/i.test(question))
    return {
      summary:
        "The overview stays public. Choose an access route for the full document.",
      ...runTool("resume.request_access"),
    };
  if (/contact|role for|opportunity|hiring/i.test(question))
    return {
      summary: "A direct conversation is the best next step.",
      ...runTool("inquiry.start"),
    };
  if (/education|degree/i.test(question))
    return {
      summary: "Education follows the reviewed career record.",
      nodes: graph.nodes.filter((n) => n.type === "EDUCATION"),
    };
  if (
    /profession|employment|experience/i.test(question) &&
    !matchers.some((x) => x[1].test(question))
  )
    return {
      summary:
        "These are supported role accounts, with their chronology boundaries intact.",
      nodes: graph.nodes.filter((n) => n.type === "ROLE"),
    };
  const m = matchers.find((x) => x[1].test(question));
  if (m) {
    const hits = evidenceFor(graph, m[0]);
    return {
      summary:
        "Direct evidence connections for " +
        m[0] +
        ". Teaching notes do not establish employment experience.",
      nodes: hits.map((x) => ({ ...x.node, reasons: [x.edge] })).slice(0, 6),
      links: [
        { label: "Explore the evidence graph", href: "/workshop/#graph" },
      ],
    };
  }
  return {
    summary:
      "No supported answer in the current graph. Try backend, GIS, AI, GDSC, professional experience or education.",
    classification: "UNCERTAIN",
    nodes: [],
  };
}
const boundary =
  /\b(\d+\+?\s*(years?|million|billion)|senior|principal|staff engineer|lead (a |the )?team|manage\w*\s+\d|security clearance|citizen|sponsorship|work authori|kubernetes|terraform|spark|snowflake|pytorch|tensorflow|train\w* models?|production|energy market|salesforce|sap|aws|kafka|kubernetes|rust|golang|java|distributed|enterprise|large.?scale|deep learning|model training|management|managing|leadership)\b/i;
export function compareJD(raw) {
  if (typeof raw !== "string" || raw.length > 12000)
    return { error: "Use a description of 12,000 characters or fewer." };
  const requirements = raw
    .split(/\n|[.;](?=\s)/)
    .map((x) => x.replace(/^\s*[-*•]\s*/, "").trim())
    .filter((x) => x.length > 6)
    .slice(0, 30);
  const results = requirements.map((requirement) => {
    const matches = matchers
      .filter((x) => x[1].test(requirement))
      .map((x) => x[0]);
    const hits = matches.flatMap((t) => evidenceFor(graph, t));
    const dedup = [...new Map(hits.map((h) => [h.node.id, h])).values()];
    const primary = dedup.filter((h) =>
      ["ROLE", "PROJECT"].includes(h.node.type),
    );
    let category = "GAPS",
      reason = "No direct reviewed evidence for this requirement.";
    if (prohibited.test(requirement)) {
      reason =
        "Instruction-like content is treated as untrusted job text, not executed.";
    } else if (boundary.test(requirement)) {
      reason =
        "Specific technology, duration, scale, seniority or eligibility requirement is not established. Related material is context only.";
    } else if (primary.some((h) => h.node.type === "ROLE")) {
      category = "STRONG EVIDENCE";
      reason =
        "Direct supported role evidence for the matched topic only. The entire requirement is NOT verified; tools, scope, proficiency and duration need a human check.";
    } else if (primary.length) {
      category = "RELATED";
      reason =
        "Project evidence addresses part of this requirement; it does not prove equivalent professional tenure.";
    } else if (dedup.length) {
      category = "TRANSFERABLE";
      reason =
        "Technical reasoning or educational context only; not a claim of hands-on professional experience.";
    }
    return {
      requirement: requirement.slice(0, 800),
      category,
      requirementSatisfied: null,
      matchedTopics: matches,
      reason,
      evidence: dedup.slice(0, 5).map((h) => ({ ...h.node, edge: h.edge })),
      question:
        category === "GAPS"
          ? "Does Ahmed have a specific, supportable example for: " +
            requirement.slice(0, 220) +
            "?"
          : null,
    };
  });
  return {
    results,
    warning:
      "Evidence triage, not a fit score or hiring recommendation. A keyword connection never verifies the entire requirement.",
    questions: results.filter((x) => x.question).map((x) => x.question),
    projects: [
      ...new Map(
        results
          .flatMap((x) => x.evidence)
          .filter((n) => n.type === "PROJECT")
          .map((n) => [n.id, n]),
      ).values(),
    ],
    experience: [
      ...new Map(
        results
          .flatMap((x) => x.evidence)
          .filter((n) => n.type === "ROLE")
          .map((n) => [n.id, n]),
      ).values(),
    ],
  };
}
export { graph };
