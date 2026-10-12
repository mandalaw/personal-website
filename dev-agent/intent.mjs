import { aliases, topics } from "./catalog.mjs";

// This only narrows retrieval/navigation. Security and unsupported-claim checks
// must run on the original question, before any excluded wording is removed.
export function retrievalIntent(question) {
  const excludedIds = new Set(),
    excludedTypes = new Set(),
    positive = [];
  const chunks = question.split(
    /[.;,!?\n]+|\b(?:but|instead)\b|\band\s+(?=(?:show|explain|inspect|open|tell|give)\b)/i,
  );
  for (const chunk of chunks) {
    const s = chunk.trim();
    if (!s) continue;
    // "Not only X" is additive, not an exclusion.
    if (/\b(?:do not only|not only)\b/i.test(s)) {
      positive.push(s.replace(/\b(?:do not only|not only)\b/gi, ""));
      continue;
    }
    // A negative factual predicate is a question about scope, not a request
    // to exclude its subject from retrieval ("did not build Othello").
    if (
      /\b(?:did|does|has|have|is|was|can|could|will|would|should)\s+not\s+(?:build|write|create|author|own|work|use|train|lead|manage)\b/i.test(
        s,
      )
    ) {
      positive.push(s);
      continue;
    }
    const neg =
      /\b(?:not interested in|not asking about|do not (?:include|show|discuss)|don't (?:include|show|discuss)|leave out|exclud(?:e|ing)|skip|rather than|as distinct from|separate from|not(?:\s+(?:his|the|this|that|a))?)\s+(.+)$/i.exec(
        s,
      );
    if (!neg) {
      positive.push(s);
      continue;
    }
    const target = neg[1];
    const named = aliases.filter(([, rx]) => rx.test(target)).map(([id]) => id);
    const scoped = topics.some(([, rx]) => rx.test(target));
    const type = /\b(projects?|coursework)\b/i.test(target)
      ? "PROJECT"
      : /\b(employment|roles?|professional work)\b/i.test(target)
        ? "ROLE"
        : /\b(field notes?|notes?)\b/i.test(target)
          ? "FIELD_NOTE"
          : /\b(degrees?|education)\b/i.test(target)
            ? "EDUCATION"
            : null;
    const recognized =
      named.length ||
      type ||
      /\b(resume|résumé|contact|hiring|email)\b/i.test(target) ||
      scoped;
    if (!recognized) {
      positive.push(s);
      continue;
    }
    named.forEach((id) => excludedIds.add(id));
    if (type && !named.length && !scoped) excludedTypes.add(type);
    if (neg.index) positive.push(s.slice(0, neg.index));
  }
  return { query: positive.join(". ").trim(), excludedIds, excludedTypes };
}

export function contactIntent(q) {
  if (/^(?:please\s+)?(?:contact|email|linkedin|hire)\b/i.test(q)) return true;
  if (
    /\b(?:how|where)\s+(?:can|could|do|would|should|may)\s+(?:i|we|someone)\s+(?:contact|email|reach|speak|discuss)\b/i.test(
      q,
    )
  )
    return true;
  if (
    /\b(?:want|would like|need)\s+to\s+(?:contact|email|hire|reach|speak|discuss)\b/i.test(
      q,
    )
  )
    return true;
  const outreach =
    /\b(contact|hire|hiring|opportunity|discuss a role|reach him|speak to|email|linkedin)\b/i.test(
      q,
    );
  const evidence =
    /\b(what|which|where|why|how|explain|compare|inspect|show|proof|evidence|contribut\w*)\b/i.test(
      q,
    );
  return outreach && !evidence;
}
// Complete navigation requests only. A match grants a link preview, never a
// write, message, account lookup, inquiry read, or automatic form submission.
export function inquiryNavigation(value) {
  const q = value
    .trim()
    .replace(/[.!?]+$/, "")
    .trim();
  const request =
    /^(?:(?:please|can (?:you|i)|could (?:you|i)|i want to|i would like to) )?(?:open|start|create|make|send|submit|show me|take me to) (?:a |an |the )?(?:new |job |hiring )?inquiry(?: form)?(?: about a role)?$/i;
  return (
    request.test(q) ||
    /^(?:where (?:can|do) i (?:send|submit|make) (?:an? |a hiring |a job )?inquiry(?: about a role)?|how (?:can|do) i (?:make|send|submit) (?:an? |a hiring |a job )?inquiry|where is the inquiry form|how can i contact ahmed with an inquiry)$/i.test(
      q,
    )
  );
}
