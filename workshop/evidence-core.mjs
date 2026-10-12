export const topics = [
  "sql",
  "gis",
  "ai",
  "api",
  "frontend",
  "backend",
  "integration",
  "testing",
  "security",
  "data",
];
export function evidenceFor(g, topic) {
  if (!topics.includes(topic)) return [];
  const links = g.edges.filter(
    (e) =>
      (e.toId === topic || e.fromId === topic) &&
      e.publicSafe &&
      ["VERIFIED", "SUPPORTED"].includes(e.classification),
  );
  return links
    .map((e) => ({
      node: g.nodes.find(
        (n) => n.id === (e.toId === topic ? e.fromId : e.toId),
      ),
      edge: e,
    }))
    .filter(
      (x) =>
        x.node &&
        ["ROLE", "PROJECT", "EDUCATION", "FIELD_NOTE", "DECISION"].includes(
          x.node.type,
        ),
    );
}
export const missions = [
  {
    id: "software",
    title: "Can Ahmed build software?",
    stops: ["gdsc", "devrun", "portfolio"],
    next: "packet",
  },
  {
    id: "professional",
    title: "Has he worked professionally?",
    stops: ["vigilant", "freelance", "terraprobe"],
    next: "career",
  },
  {
    id: "backend",
    title: "Backend & APIs",
    stops: ["gdsc", "vigilant", "owner-boundary"],
    next: "api",
  },
  {
    id: "ai",
    title: "AI, with the limits visible",
    stops: ["trustai", "output-contract", "provider-choice"],
    next: "arena",
  },
  {
    id: "data",
    title: "How does he work with data?",
    stops: ["vigilant", "garden", "query-shape"],
    next: "maps",
  },
  {
    id: "gis",
    title: "GIS & maps",
    stops: ["garden", "terraprobe", "uoft"],
    next: "maps",
  },
  {
    id: "frontend",
    title: "Frontend craft",
    stops: ["gdsc", "devrun", "public-first"],
    next: "transit",
  },
  {
    id: "integration",
    title: "Connecting systems",
    stops: ["vigilant", "retry-budget", "test-boundaries"],
    next: "api",
  },
  {
    id: "education",
    title: "Education & learning",
    stops: ["quantic", "trustai", "uoft"],
    next: "career",
  },
  {
    id: "strongest",
    title: "Show me the strongest work",
    stops: ["trustai", "gdsc", "devrun", "garden"],
    next: "packet",
  },
  {
    id: "resume",
    title: "I need the résumé",
    stops: ["vigilant", "quantic", "uoft"],
    next: "resume",
  },
  {
    id: "role",
    title: "I have a role in mind",
    stops: ["vigilant", "gdsc"],
    next: "inquiry",
  },
];
export const commands = [
  "help",
  "about",
  "experience",
  "projects",
  "projects --backend",
  "projects --ai",
  "projects --gis",
  "skills",
  "skills --evidence sql",
  "maps",
  "trustai",
  "devrun",
  "education",
  "resume",
  "contact",
  "workshop",
  "secrets",
];
export function terminal(g, raw) {
  const q = String(raw).trim().toLowerCase().replace(/\s+/g, " ");
  const nodes = (ids) => g.nodes.filter((n) => ids.includes(n.id));
  if (q === "help" || q === "")
    return {
      lines: ["Small terminal. Real evidence. Try one of these:", ...commands],
    };
  if (q === "secrets")
    return {
      lines: [
        "The secret is that the interesting bits are public. No keys in this drawer.",
      ],
      nodes: nodes(["portfolio"]),
    };
  if (q.startsWith("skills --evidence ")) {
    const topic = q.slice(18).replace("apis", "api");
    const hits = evidenceFor(g, topic);
    return {
      lines: hits.length
        ? [
            `Evidence for ${topic}. Project stack and individual work stay separate.`,
          ]
        : [
            "No supported connection in this graph. Try sql, gis, ai, api or frontend.",
          ],
      nodes: hits.map((h) => h.node),
    };
  }
  if (q === "skills")
    return {
      lines: [
        "Explore a subject with skills --evidence <topic>.",
        topics.join(" · "),
      ],
    };
  if (q === "about") return { nodes: nodes(["ahmed"]) };
  if (q === "experience")
    return { nodes: g.nodes.filter((n) => n.type === "ROLE") };
  if (q === "education")
    return { nodes: g.nodes.filter((n) => n.type === "EDUCATION") };
  if (q === "projects")
    return { nodes: g.nodes.filter((n) => n.type === "PROJECT") };
  if (q.startsWith("projects --")) {
    const t = q.slice(11);
    return {
      nodes: evidenceFor(g, t)
        .map((x) => x.node)
        .filter((n) => n.type === "PROJECT"),
      lines: ["Only graph-supported connections are shown."],
    };
  }
  const ids = {
    maps: ["garden"],
    trustai: ["trustai"],
    devrun: ["devrun"],
    workshop: ["portfolio"],
  };
  if (ids[q]) return { nodes: nodes(ids[q]) };
  if (q === "resume")
    return {
      lines: ["The résumé overview is public."],
      links: [{ label: "Résumé", href: "/resume/" }],
    };
  if (q === "contact")
    return {
      lines: ["A role, a technical question, or a good conversation."],
      links: [
        { label: "Email Ahmed", href: "mailto:dev@mandalawi.ca" },
        { label: "LinkedIn", href: "https://www.linkedin.com/in/devmandalaw" },
      ],
    };
  return {
    lines: [
      "Command not found. Nothing was run. Type help for the small, useful set.",
    ],
  };
}
export function packet(g, selected) {
  if (
    !Array.isArray(selected) ||
    !selected.length ||
    selected.some((x) => !topics.includes(x))
  )
    throw Error("Choose supported interests.");
  const found = new Map();
  for (const t of selected)
    for (const h of evidenceFor(g, t)) {
      if (!found.has(h.node.id))
        found.set(h.node.id, { ...h.node, reasons: [] });
      found
        .get(h.node.id)
        .reasons.push({
          topic: t,
          edgeId: h.edge.id,
          classification: h.edge.classification,
          statement: h.edge.statement,
        });
    }
  return [...found.values()].sort(
    (a, b) =>
      ["ROLE", "PROJECT", "EDUCATION", "FIELD_NOTE", "DECISION"].indexOf(
        a.type,
      ) -
      ["ROLE", "PROJECT", "EDUCATION", "FIELD_NOTE", "DECISION"].indexOf(
        b.type,
      ),
  );
}
export function search(g, q) {
  const terms = q
    .toLowerCase()
    .trim()
    .slice(0, 100)
    .split(/\s+/)
    .filter(Boolean);
  return g.nodes
    .filter(
      (n) =>
        n.href &&
        terms.every((t) =>
          (n.label + " " + n.summary + " " + n.tags.join(" "))
            .toLowerCase()
            .includes(t),
        ),
    )
    .slice(0, 20);
}
// Slots keep labels separate even at a 240px reflow viewport. Subjects rotate the
// evidence order rather than changing the underlying meaning of any connection.
export function graphLayout(count, topicIndex, narrow) {
  const total = Math.min(7, Math.max(0, count));
  const slots = narrow
    ? [
        [24, 30],
        [76, 30],
        [24, 50],
        [76, 50],
        [24, 70],
        [76, 70],
        [24, 90],
      ]
    : [
        [20, 14],
        [80, 14],
        [20, 38],
        [80, 38],
        [20, 62],
        [80, 62],
        [20, 86],
      ];
  return {
    center: { x: 50, y: narrow ? 9 : 50 },
    nodes: Array.from({ length: total }, (_, i) => {
      const [x, y] = slots[(i + topicIndex) % Math.max(total, 1)];
      return { x, y };
    }),
  };
}
