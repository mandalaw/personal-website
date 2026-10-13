import source from "./proof-data.mjs?v=1115578c3c87";
import {
  normalized,
  instructionLike,
  privateLike,
  claimLike,
  unsupportedPremise,
  consequential,
} from "./contracts.mjs";
import { retrievalIntent } from "./intent.mjs?v=2c6c29687acc";
export const proofDetails = Object.freeze(
  source.map((row) => Object.freeze(row)),
);
const patterns = new Map(
  proofDetails.map((d) => [d.id, new RegExp(d.pattern, "i")]),
);
// Details cannot expand the validated fact scope. The model cannot author them.
// These are excerpts of the same public account, not independent corroboration.
export function selectProofDetails(raw, response) {
  const q = normalized(raw);
  if (
    !q ||
    !response?.ok ||
    instructionLike(q) ||
    privateLike(q) ||
    claimLike(q) ||
    unsupportedPremise(q) ||
    consequential(q)
  )
    return [];
  const ids = new Set(response.facts?.map((f) => f.id) || []),
    intent = retrievalIntent(q);
  const future =
    /improv|next|revisit|future|reviv|before.*review|review.*before/i.test(
      intent.query,
    );
  return proofDetails
    .filter(
      (d) =>
        ids.has(d.factId) &&
        !intent.excludedIds.has(d.factId) &&
        patterns.get(d.id).test(intent.query) &&
        (future
          ? d.scope === "future proposal"
          : d.scope !== "future proposal"),
    )
    .slice(0, 2)
    .map(({ pattern, ...d }) => d);
}
