export const exact = (v, keys) =>
  !!v &&
  typeof v === "object" &&
  !Array.isArray(v) &&
  Object.keys(v).length === keys.length &&
  Object.keys(v).every((k) => keys.includes(k));
export const text = (v, max, min = 1) =>
  typeof v === "string" &&
  v.length >= min &&
  v.length <= max &&
  !/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(v);
export const unique = (v, max, check) =>
  Array.isArray(v) &&
  v.length <= max &&
  new Set(v).size === v.length &&
  v.every(check);
export const denied = (code) => ({ ok: false, code });
export function normalized(v, max = 1600) {
  if (!text(v, max)) return null;
  // Remove format controls for matching, never decode or execute user input.
  const result = v
    .normalize("NFKC")
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, "")
    .replace(/[’‘]/g, "'")
    .trim();
  return text(result, max) ? result : null;
}
export const instructionLike = (v) =>
  /ignore.{0,24}(previous|instructions)|system\s*prompt|developer\s*message|<\/?(?:script|system)|jailbreak|exfiltrat|DROP\s+TABLE|UNION\s+SELECT|\b(fetch|curl|exec|eval)\s*\(|https?:\/\/|file:\/\/|javascript:|\b(base64|rot13)\b/i.test(
    v,
  );
export const privateLike = (v) =>
  /private (?:\w+ ){0,4}(?:phone|address|email|file|application|pipeline|inquir(?:y|ies)|analytics|record|detail)s?|team emails?|home address|where.{0,20}live exactly|legally (?:work|employed)|right to work|work eligibility|eligible.{0,25}(?:US|U.S.|American) (?:job|employment)|immigration|visa|citizen|sponsor|work.?authori|salary|compensation|owner (?:inbox|dashboard|analytics|files?|documents?|records?|data)|pipeline|job applications?|application (?:status|history|details|records|answers)|inquir(y|ies)|visitor (name|email|identit)|secret|password|cookie|token|credential|\.env|\/Users\/|\badmin\b/i.test(
    v.replace(
      /\b(?:academic|educational|education) credentials\b/gi,
      "education",
    ),
  ) ||
  /\b(?:save|store|sync)\b.{0,45}\b(?:conversation|chat|questions?|history)\b|\b(?:delete|remove|revoke|disable|reset)\b.{0,35}\b(?:my|your|the|his) (?:account|sessions?)\b/i.test(
    v,
  );
export const claimLike = (v) =>
  /\b(senior|principal|staff engineer|expert|certif\w*|sole|single.?handedly|entirely|founder|ceo|cto|led|managed|head of|production scale|enterprise scale)\b|\d[\d,.]*\s*(?:\+|years?|million|billion|%|percent|users?|requests|employees)|\b(aws|kubernetes|terraform|snowflake|pytorch|tensorflow|kafka|rust|golang|c\+\+|energy market|salesforce|sap|oracle certified|faa|esri certificat)\b/i.test(
    v,
  );
export const unsupportedPremise = (v) =>
  /\bwhat percentage\b|\bhow (?:much faster|many (?:users|customers|requests))\b|\bpeer.reviewed\b|\b(?:research papers?|patents?)\b|\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|many|several)\s+(?:years?|million|billion)|\bdecade\b|\b(?:trained?|pretrained?|fine.tuned?)\b.{0,40}\b(?:foundation|large language) models?\b|\bclaim (?:he|ahmed)\b|\$\s*\d|\b(president|founded|supervised|director|leadership|charterholder|licensed|clearance|ph\.?d|faculty|solo|petabyte|terabyte)\b|\b(entire|every|whole)\b.{0,30}\b(team|part|database|technology|curriculum|competitor)|\blead\b.{0,15}\bevery\b|\b(paid|commercial|client|consulting)\b.{0,30}\b(trustai|gdsc|demo|project)|\b(trustai|gdsc|demo)\b.{0,35}\b(paid|employment|consulting|client|commercial)|\b(invent|fabricat\w*|exaggerat\w*|fake|make up|conceal|guarantee|attest)\b|\b(remember|promote|replace|update|delete|remove|forget|add)\b.{0,70}\b(fact|evidence|record|employer|credits|qualification|verified|conflict)|\b(sgs)\b.{0,35}\b(software|developer|engineer)|\bmajor\b.{0,15}\bcomputer science\b|\bgraduate\b.{0,15}\b(mit|stanford|harvard)\b/i.test(
    v,
  );
export const consequential = (v) =>
  /\b(relocat\w*|night shifts|criminal|medical|authorization changes)\b|\b(?:submit|send|file|withdraw)\b.{0,30}\b(?:an?|my|his|the|this|Ahmed\'s) (?:job )?application\b|\bwho\b.{0,30}\b(visit\w*|read|download\w*|applied)\b/i.test(
    v,
  );
export const limits = Object.freeze({
  questionChars: 1600,
  jdChars: 12000,
  maxFacts: 5,
  maxActions: 3,
  maxTools: 4,
  turns: 12,
  maxOutputTokens: 500,
  maxInputTokens: 2500,
  requestMs: 12000,
});
