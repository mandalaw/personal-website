import { byId } from "./catalog.mjs";
import { normalized, instructionLike } from "./contracts.mjs";
import { degreePattern, educationAssessment } from "./degree.mjs";

// This dictionary describes reviewed hands-on scope, not every technology named
// in a project stack. The full requirement is evaluated separately from topics.
export const capabilities = Object.freeze([
  {
    id: "python",
    rx: /\bpython\b/i,
    facts: ["vigilant"],
    scope: "professional",
  },
  { id: "sql", rx: /\bsql\b/i, facts: ["vigilant"], scope: "professional" },
  {
    id: "azure-functions",
    rx: /\bazure functions\b/i,
    facts: ["vigilant"],
    scope: "professional",
  },
  {
    id: "oracle",
    rx: /\boracle\b/i,
    facts: ["vigilant"],
    scope: "professional",
  },
  {
    id: "integration",
    rx: /\b(integration|integrating|integrate)\b/i,
    facts: ["vigilant"],
    scope: "professional",
  },
  {
    id: "api",
    rx: /\b(apis?|rest)\b/i,
    facts: ["vigilant", "freelance", "gdsc"],
    scope: "professional",
  },
  {
    id: "gis",
    rx: /\b(gis|geospatial|spatial|cartograph\w*|mapping|arcgis(?: pro)?)\b/i,
    facts: ["terraprobe", "uoft-support", "garden"],
    scope: "professional",
  },
  {
    id: "data",
    rx: /\b(data quality|data integration|inconsistencies|data validation)\b/i,
    facts: ["vigilant"],
    scope: "professional",
  },
  {
    id: "testing",
    rx: /\b(testing|qa|quality assurance|bug reporting|debugging)\b/i,
    facts: ["freelance", "gdsc", "vigilant"],
    scope: "professional",
  },
  {
    id: "web",
    rx: /\b(web development|frontend|front-end|websites?|reusable (?:web(?:site)? )?components)\b/i,
    facts: ["freelance", "devrun"],
    scope: "professional",
  },
  {
    id: "llm-evaluation",
    rx: /\b(llm evaluation|llm outputs|evaluat(?:e|ing) (?:machine[- ]learning models|llm outputs|model outputs)|model evaluation|model comparison|compare model (?:behavior|behaviour)|structured.output validation|acceptance criteria)\b/i,
    facts: ["trustai"],
    scope: "project",
  },
  {
    id: "software",
    rx: /\b(software development|software engineering)\b/i,
    facts: ["gdsc", "devrun", "quantic"],
    scope: "project",
  },
  { id: "javadoc", rx: /\bjavadoc\b/i, facts: ["othello"], scope: "project" },
  {
    id: "documentation",
    rx: /\b(documentation|tutorials|technical writing)\b/i,
    facts: ["uoft-support", "othello", "terraprobe"],
    scope: "professional",
  },
  {
    id: "requirements",
    rx: /\b(requirements|product owner|business analys\w*)\b/i,
    facts: ["vigilant", "trustai"],
    scope: "related",
  },
  {
    id: "logistics",
    rx: /\b(logistics|route coordination|scheduling)\b/i,
    facts: ["sgs"],
    scope: "professional",
  },
  {
    id: "communication",
    rx: /\b(communicat\w*|collaborat\w*|teamwork|problem.solving|analytical thinking|clear explanation of analytical findings|explain(?:ing)? (?:analytical )?findings)\b/i,
    facts: ["trustai", "garden"],
    scope: "related",
  },
]);
const unsupported =
  /\b(aws|kubernetes|terraform|snowflake|spark|kafka|pytorch|tensorflow|rust|golang|go language|salesforce|sap|energy markets?|power trading|commodity|commodities|derivatives|nuclear|security clearance|cpa|pe license|c\+\+|spring boot|\.net|cobol|tableau|power bi|dbt|airflow)\b/i;
const credential =
  /\b(certified|certification|license|licence|licensed|accredit(?:ed|ation)|ABET|PE|CPA|PMP|CISSP|CCNA)\b/i;
const specialist =
  /\b(arcgis (?:enterprise|workflow manager|server)|sql server|database administ\w*|non.?technical audiences|direct reports|lead (?:a |the )?team|manag\w* (?:\w+ )?reports)\b/i;
const unknownLanguage = (s) =>
  /\b(?:C\+\+|C#)(?!\w)/.test(s) ||
  /\b(?:Go (?:services|development|programming)|R (?:statistical|programming))\b/.test(
    s,
  ) ||
  /(?:[\s/])R(?=[\s/])/.test(s) ||
  /\b(?:in|with|using|and|or)\s+(?:Go|R|C\+\+|C#)\b/.test(s) ||
  /\b(?:Go|R) programming\b/.test(s);
// Positive vocabulary guard: a supported keyword cannot vouch for a whole
// compound requirement. Unknown domain, tool or depth terms keep the row open.
// This deliberately favors review over inventing equivalence.
const projectNames = [
  ["gdsc", /\bgdsc\b/i],
  ["trustai", /\btrustai\b/i],
  ["othello", /\bothello\b/i],
  ["garden", /\bcommunity garden\b/i],
  ["devrun", /\bdev run\b/i],
];
const connectorWords = new Set(
  (
    "a an the and or of in on to for with using use used uses via as at from by plus well along " +
    "experience experienced knowledge familiarity familiar hands hands-on practical basic working professional " +
    "work working worked ability able skills skill required requirement requirements must have be is are " +
    "develop developing development build building create creating write writing implement implementing " +
    "design designing maintain maintaining support supporting test testing validate validating investigate " +
    "software systems system applications application solutions solution services service tools tool workflows workflow " +
    "programming code coding languages language queries query scripts scripting technical demonstrated relevant " +
    "including such related integration integrate data prepare prepared document review evaluate outputs responses preferred desired recommended ideally mandatory essential shall bonus " +
    "connect connecting through integrations errors functionality perform maps map project projects coordinate schedules " +
    "against behavior behaviour limitations contribute gather product othello issues stakeholder team environment"
  ).split(/\s+/),
);
function unmappedTerms(s, matches) {
  let rest = s;
  for (const [, rx] of projectNames)
    rest = rest.replace(new RegExp(rx.source, "gi"), " ");
  for (const c of matches)
    rest = rest.replace(new RegExp(c.rx.source, "gi"), " ");
  return [
    ...new Set(
      (rest.toLowerCase().match(/[a-z][a-z0-9+#.-]*/g) || [])
        .map((x) => x.replace(/[.-]$/, ""))
        .filter((x) => !connectorWords.has(x)),
    ),
  ].slice(0, 12);
}
const alternatives = /\bor\b|and\/or|equivalen\w*/i;
const nonRequirement =
  /\b(?:not required|is optional|are optional|need not|no .{0,60} (?:is |are )?required)\b/i;
const logisticsConstraint =
  /\b(travel|relocat\w*|client sites?|night shifts?|weekends?|on.call|in.person|\d+ hours (?:per week|weekly)|(?:available|availability) (?:for|to work))\b/i;
const workArrangement =
  /\b(remote|hybrid|on.site|onsite|in.person|monday|tuesday|wednesday|thursday|friday|saturday|sunday|travel|\d+ hours (?:per week|weekly))\b/i;
// Attendance and residential constraints are decisions, not missing skills.
// Keep Microsoft Office/product references outside these patterns.
const attendanceConstraint =
  /\boffice attendance\b|\battendance at (?:our |the |an )?office\b|\battend(?:ing)? (?:the |our |an )?office\b|\bwork(?:ing)? (?:from|at|in) (?:the |our |an |a )?(?:(?!microsoft\b)[a-z-]+ ){0,5}office\b(?!\s+(?:365|software|apps|applications|products|suite))/i;
const residenceConstraint =
  /\b(?:existing|local) (?:[a-z-]+ ){0,4}residence\b|\bmust (?:already |currently )?(?:live|reside|be based) in\b/i;
const scopedClaim =
  /\b(architect|administ\w*|petabyte|terabyte|uptime|slas?|offshore|exploration|lead (?:\w+ ){0,3}(?:developers|engineers)|train\w* (?:\w+ )?models)\b/i;
const unestablished =
  /\b(large datasets?|large.scale|distributed systems|production (ai|ml)|model training|train\w* (neural|models)|millions|billions|expert|advanced|fluent|deep expertise|leadership|manage\w* (a |the )?team|senior|principal|staff engineer)\b/i;
const quantitative =
  /\b(?:\d+(?:\s*[-–]\s*\d+)?\+?|one|two|three|four|five|six|seven|eight|nine|ten|several|multiple)\s*(?:years?|months?|million|billion)|\d+\s*%/i;
const hardPriority = /\b(must|required|minimum|shall|essential|mandatory)\b/i;
const preferredPriority =
  /\b(preferred|nice.to.have|bonus|ideally|desired|recommended)\b/i;
const heading = (s) => {
  const tags = [...s.matchAll(/\((required|preferred|minimum)\)/gi)].map((m) =>
    m[1].toLowerCase(),
  );
  const clean = s
    .replace(/\s*\((?:required|preferred|minimum)\)\s*/gi, " ")
    .replace(/:\s*$/, "")
    .trim();
  let kind = null;
  if (
    /^(?:requirements|education requirements|must have|(?:required|minimum|basic|essential|mandatory)(?: qualifications| requirements| skills| experience| criteria| education and experience| skills and experience| knowledge, skills and abilities)?)$/i.test(
      clean,
    )
  )
    kind = "HARD";
  else if (
    /^(?:preferred|desired|recommended|nice.to.have|bonus)(?: qualifications| requirements| skills| experience| criteria| skills and experience)?$/i.test(
      clean,
    )
  )
    kind = "PREFERRED";
  else if (
    /^(?:(?:(?:key|role|primary|job|your|core) )?responsibilities|what you(?: will|.ll) do|(?:primary )?duties|duties and responsibilities)$/i.test(
      clean,
    )
  )
    kind = "RESPONSIBILITY";
  else if (
    /^(?:what you(?: will|.ll) bring|qualifications|your background|about you|knowledge of|experience|skills|education and experience|knowledge, skills and abilities)$/i.test(
      clean,
    )
  )
    kind = "UNSPECIFIED";
  // Interpret qualifiers only after recognizing a complete heading. Words in
  // ordinary sentences must not disappear or silently change the next section.
  if (!kind) return null;
  if (kind === "HARD" || tags.some((t) => t === "required" || t === "minimum"))
    return "HARD";
  if (tags.includes("preferred")) return "PREFERRED";
  return kind;
};
function kindFor(s, section) {
  if (hardPriority.test(s) && preferredPriority.test(s)) return "HARD";
  if (nonRequirement.test(s)) return "UNSPECIFIED";
  if (hardPriority.test(s)) return "HARD";
  if (preferredPriority.test(s)) return "PREFERRED";
  if (/\b(responsible for|you will|you.ll)\b/i.test(s)) return "RESPONSIBILITY";
  return section;
}
function segments(content) {
  const result = [];
  let start = 0;
  for (let i = 0; i < content.length; i++) {
    const c = content[i],
      tail = content.slice(i + 1);
    if (
      c === "\n" ||
      (c === ";" && /^\s+[A-Z]/.test(tail)) ||
      (c === "." &&
        /^\s+[A-Z]/.test(tail) &&
        !/(?:[A-Z]\.){1,4}$|(?:M|B)\.Sc\.$|Ph\.D\.$/.test(
          content.slice(Math.max(start, i - 8), i + 1),
        ))
    ) {
      result.push(content.slice(start, i));
      start = i + 1;
    }
  }
  result.push(content.slice(start));
  return result;
}
export function parseJD(raw) {
  const content = normalized(raw, 12000);
  if (!content)
    return {
      ok: false,
      error: "Use a job description between 1 and 12,000 characters.",
    };
  let section = "UNSPECIFIED",
    requirements = [],
    notices = [];
  for (const line of segments(content)) {
    const s = line.replace(/^\s*[-*•]\s*/, "").trim();
    if (!s) continue;
    const h = heading(s);
    if (h) {
      section = h;
      if (hardPriority.test(s) && preferredPriority.test(s))
        notices.push(
          "A heading combines required and preferred labels. Its following lines remain under hard requirements until the posting is reviewed.",
        );
      continue;
    }
    if (requirements.length === 40) {
      notices.push(
        "Only the first 40 requirement lines were analyzed. Review the remaining text separately.",
      );
      break;
    }
    const location =
      /^(?:location|work location|based in)\s*:/i.test(s) ||
      residenceConstraint.test(s);
    const priority = kindFor(s, section);
    const mode =
      /^(?:work mode|work arrangement|attendance)\s*:/i.test(s) ||
      attendanceConstraint.test(s) ||
      (workArrangement.test(s) && !capabilities.some((c) => c.rx.test(s)));
    requirements.push({
      id: "r" + (requirements.length + 1),
      text: s.slice(0, 1000),
      kind: location ? "LOCATION" : mode ? "WORK_MODE" : priority,
      priority,
      truncated: s.length > 1000,
    });
  }
  return { ok: true, requirements, notices };
}
export function evaluateRequirement(r) {
  const s = r.text
    .replace(/\bM\.S(?:c)?\.?/gi, "MS")
    .replace(/\bB\.S(?:c)?\.?/gi, "BS")
    .replace(/\bPh\.D\.?/gi, "PhD")
    .replace(/[’‘]/g, "'");
  const matches = capabilities.filter((c) => c.rx.test(s));
  const namedProjects = projectNames
    .filter(([, rx]) => rx.test(s))
    .map(([id]) => id);
  const ids = [...new Set(matches.flatMap((m) => m.facts))]
    .filter((id) => !namedProjects.length || namedProjects.includes(id))
    .slice(0, 5);
  if (degreePattern.test(s)) ids.splice(0, ids.length, "uoft", "quantic");
  let assessment = "UNCERTAIN",
    explanation =
      "The reviewed record does not settle this requirement. A keyword match is not a qualification decision.",
    question = "What specific evidence would establish this requirement?";
  if (instructionLike(s) || /<\/?[a-z]|on\w+\s*=/i.test(s)) {
    assessment = "GAP";
    explanation = "Instruction-like job text is untrusted and is not executed.";
    question = "Review this posting manually before using it.";
  } else if (r.truncated) {
    explanation =
      "This requirement exceeded the line limit. No qualification decision is made from a shortened line.";
    question = "Review the complete requirement separately.";
  } else if (hardPriority.test(s) && preferredPriority.test(s)) {
    explanation =
      "This line combines required and preferred conditions. The tool keeps it under hard requirements until the separate conditions are reviewed.";
    question = "Which condition is mandatory and which is preferred?";
  } else if (nonRequirement.test(s)) {
    explanation =
      "This line appears to waive or make a requirement optional. It is not treated as a missing mandatory qualification.";
    question =
      "Confirm that the surrounding posting uses this as an exemption.";
  } else if (
    ["LOCATION", "WORK_MODE"].includes(r.kind) ||
    logisticsConstraint.test(s) ||
    attendanceConstraint.test(s) ||
    residenceConstraint.test(s)
  ) {
    explanation =
      "Location and work arrangements require a current personal decision; this tool makes no relocation commitment.";
    question = "Is this specific location and work arrangement acceptable?";
  } else if (
    /\b(sponsorship|work authori\w*|citizen\w*|visa|legal|clearance|salary|compensation|relocat\w*)\b/i.test(
      s,
    )
  ) {
    explanation =
      "Eligibility and consequential application answers must be confirmed directly with Ahmed.";
    question = "Ahmed must answer the employer’s exact question.";
  } else if (/\b(willingness|willing to|motivation|interest in)\b/i.test(s)) {
    explanation =
      "A personal willingness or motivation cannot be inferred from a career record. It is not classified as a missing technical skill.";
    question = "Does Ahmed want to make this specific commitment?";
  } else if (alternatives.test(s)) {
    explanation =
      "This requirement offers alternatives or equivalency. Related evidence is shown, but the tool does not choose an employer’s interpretation.";
    question =
      "Which stated alternative is accepted, and what evidence establishes that path?";
  } else if (
    degreePattern.test(s) &&
    !/\b(certified|certification|license|licence|licensed|PE|CPA|PMP|CISSP|CCNA)\b/i.test(
      s,
    )
  ) {
    const d = educationAssessment(s);
    assessment = d.assessment;
    explanation = d.explanation;
    question = d.question;
    ids.splice(0, ids.length, ...d.ids);
  } else if (credential.test(s)) {
    assessment = "GAP";
    explanation =
      "No reviewed credential record establishes this certification, license or accreditation. Work with the product does not establish a credential.";
    question =
      "Is there a current authoritative credential record for this exact requirement?";
  } else if (unsupported.test(s) || unknownLanguage(s)) {
    assessment = "GAP";
    explanation =
      "At least one named requirement lacks reviewed direct evidence. Any related evidence below is context only.";
  } else if (
    quantitative.test(s) ||
    unestablished.test(s) ||
    specialist.test(s) ||
    scopedClaim.test(s)
  ) {
    explanation =
      "The required tenure, scale, depth or leadership is not established by the available evidence.";
    question =
      "Is there a supportable example with the required duration, scope or depth?";
  } else if (matches.length && !ids.length) {
    assessment = "GAP";
    explanation =
      "The reviewed record does not tie this activity to the named project.";
    question = "Is there project-specific evidence for this activity?";
  } else if (matches.length) {
    const soft =
      /\b(communicat\w*|collaborat\w*|teamwork|stakeholder|analytical)\b/i.test(
        s,
      );
    const unmapped = unmappedTerms(s, matches);
    if (unmapped.length) {
      assessment = "UNCERTAIN";
      explanation =
        "Related evidence is available, but additional tools, domain or scope in this line have not been mapped. The complete requirement remains unresolved.";
      question =
        "What evidence establishes the additional scope: " +
        unmapped.join(", ") +
        "?";
    } else if (
      matches.every((c) => c.scope === "professional") &&
      !soft &&
      !namedProjects.length
    ) {
      assessment = "SUPPORTED";
      explanation =
        "Reviewed professional evidence supports the named activity. Proficiency, breadth and the complete requirement still need human review.";
      question = null;
    } else {
      assessment = "TRANSFERABLE";
      explanation =
        "Project or related experience supports part of the activity; it does not establish equivalent professional tenure.";
      question =
        "Can Ahmed explain a concrete contribution and how it transfers to this role?";
    }
  } else {
    assessment = "GAP";
    explanation = "No specific reviewed evidence has been mapped to this line.";
  }
  return {
    ...r,
    assessment,
    displayCategory:
      assessment === "SUPPORTED"
        ? "SUPPORTED"
        : assessment === "TRANSFERABLE"
          ? "TRANSFERABLE"
          : assessment === "GAP"
            ? "GAP"
            : "UNCERTAIN",
    explanation,
    question,
    decisionScope: "RELATED_EVIDENCE_ONLY",
    evidence: ids.map(byId).filter(Boolean),
    satisfied: null,
  };
}
export function compareJD(raw) {
  const p = parseJD(raw);
  if (!p.ok) return p;
  const results = p.requirements.map(evaluateRequirement);
  return {
    ok: true,
    results,
    notices: p.notices,
    summary: {
      hard: results.filter((r) => r.priority === "HARD").length,
      preferred: results.filter((r) => r.priority === "PREFERRED").length,
      unresolvedHard: results.filter(
        (r) =>
          r.priority === "HARD" && ["GAP", "UNCERTAIN"].includes(r.assessment),
      ).length,
    },
    warning:
      "Evidence comparison, not a hiring verdict. No fit percentage; no inferred eligibility, tenure or relocation commitment.",
    evidenceIds: [
      ...new Set(results.flatMap((r) => r.evidence.map((e) => e.id))),
    ],
    questions: results
      .filter((r) => r.question && r.priority !== "PREFERRED")
      .map((r) => ({ requirementId: r.id, question: r.question }))
      .slice(0, 5),
  };
}
export function requirementLabel(r) {
  const priority =
    ["HARD", "PREFERRED"].includes(r.priority) && r.priority !== r.kind
      ? r.priority + " · "
      : "";
  return priority + r.kind + " / " + r.assessment;
}
