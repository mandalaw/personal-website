import { aliases, byId } from "./catalog.mjs?v=fb787761583a";
import {
  normalized,
  instructionLike,
  privateLike,
  claimLike,
  unsupportedPremise,
  consequential,
  limits,
} from "./contracts.mjs";
import { planQuestion } from "./public-core.mjs?v=d1dfc7ade722";

// Memory contains reviewed public IDs and a small depth counter, never raw chat.
const followUp =
  /\b(?:that (?:project|role|work|example|note)|this (?:project|role|example)|(?:into|in|about|test|built|build|on) it|its (?:limitations|sources|design|tests|accessibility)|he (?:actually|personally) (?:do|contribute|build)|his (?:contribution|part|responsibilities)|(?:part was his|rest of the team)|source for that|what (?:were|are) the (?:limitations|tradeoffs)|what (?:would|could) (?:he|you) (?:improve|change)|how were the sites compared|what could change the result|how did he validate the data|how does that run|show me (?:that|it))\b/i;
const newTechnicalSubject =
  /\b(?:python|sql|oracle|azure|apis?|gis|arcgis|javascript|react|education|degree)\b/i;
export function resolveFollowUp(raw, state = null) {
  const q = normalized(raw);
  const plain = { question: raw, contextId: null, notice: null };
  if (
    !q ||
    instructionLike(q) ||
    privateLike(q) ||
    claimLike(q) ||
    unsupportedPremise(q) ||
    consequential(q)
  )
    return plain;
  if (!followUp.test(q) || aliases.some(([, rx]) => rx.test(q))) return plain;
  const direct = planQuestion(q);
  if (["resume", "contact", "private", "unknown"].includes(direct.intro))
    return plain;
  // Explicit new topical evidence wins over an incidental pronoun.
  if (newTechnicalSubject.test(q)) return plain;
  if (
    !state?.id ||
    !byId(state.id) ||
    !Number.isInteger(state.depth) ||
    state.depth < 0 ||
    state.depth >= limits.turns
  )
    return {
      ...plain,
      question: "",
      notice:
        "Which project or role do you mean? Name it so I can keep the evidence specific.",
    };
  const f = byId(state.id),
    question = f.title + ". " + q;
  if (!normalized(question)) return plain;
  return {
    question,
    contextId: f.id,
    notice: "Following up on " + f.title + ". Clear starts a new topic.",
  };
}
export function publicContext(response, previous = null, contextId = null) {
  if (
    !response?.ok ||
    response.facts?.length !== 1 ||
    !byId(response.facts[0].id)
  )
    return null;
  const id = response.facts[0].id;
  return {
    id,
    depth: contextId === id && previous?.id === id ? previous.depth + 1 : 0,
  };
}
