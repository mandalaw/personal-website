import { selectProofDetails } from "./proof-details.mjs";
import {
  planQuestion,
  validatePlan,
  materialize,
  tool,
} from "./public-core.mjs";
import { unique, limits } from "./contracts.mjs";

// The planner can select capabilities, not code. These calls only resolve public
// evidence and authored previews; user clicks perform any actual navigation.
const actionCall = (id) =>
  id === "devrun"
    ? ["devrun.open", {}]
    : ["resume", "access"].includes(id)
      ? ["resume.options", {}]
      : id === "contact"
        ? ["contact.open", {}]
        : id === "inquiry"
          ? ["inquiry.start", {}]
          : ["arena", "maps", "api", "design"].includes(id)
            ? [
                "lab.open",
                {
                  lab: {
                    arena: "ai",
                    maps: "gis",
                    api: "api",
                    design: "design",
                  }[id],
                },
              ]
            : ["workshop.navigate", { action: id }];
export function executePublicPlan(
  plan,
  { dispatch = tool, maxTools = limits.maxTools } = {},
) {
  const trace = [];
  const failed = (code) => ({
    ...materialize({ intro: "unknown", factIds: [], actionIds: [] }),
    ok: false,
    code,
    trace,
    toolCalls: trace.length,
  });
  if (
    !validatePlan(plan).ok ||
    !Number.isInteger(maxTools) ||
    maxTools < 1 ||
    maxTools > limits.maxTools
  )
    return failed("OUTPUT_CONTRACT");
  const resolvedFacts = new Set(),
    resolvedActions = new Set();
  const call = (name, args, expected) => {
    if (trace.length >= maxTools) throw Error("TOOL_LIMIT");
    let value;
    try {
      value = dispatch(name, args);
    } catch {
      trace.push({ tool: name, args, outcome: "unavailable" });
      throw Error("TOOL_UNAVAILABLE");
    }
    const keys = value && Object.keys(value);
    const allowedShape =
      keys?.every((k) => ["ok", "ids", "actions"].includes(k)) &&
      value.ok === true;
    const safeIds =
      value?.ids === undefined ||
      unique(value.ids, limits.maxFacts, (id) => expected.ids?.includes(id));
    const safeActions =
      value?.actions === undefined ||
      unique(value.actions, limits.maxActions, (id) =>
        expected.actions?.includes(id),
      );
    const complete =
      (!expected.ids || expected.ids.every((id) => value?.ids?.includes(id))) &&
      (!expected.actions ||
        expected.actions.every((id) => value?.actions?.includes(id)));
    trace.push({
      tool: name,
      args,
      outcome:
        allowedShape && safeIds && safeActions && complete
          ? "allowed"
          : "rejected",
    });
    if (!allowedShape || !safeIds || !safeActions || !complete)
      throw Error("TOOL_OUTPUT");
    value.ids?.forEach((id) => resolvedFacts.add(id));
    value.actions?.forEach((id) => resolvedActions.add(id));
  };
  try {
    if (plan.factIds.length)
      call(
        "career_graph.nodes",
        { ids: [...plan.factIds] },
        { ids: plan.factIds },
      );
    for (const id of plan.actionIds) {
      if (resolvedActions.has(id)) continue;
      const [name, args] = actionCall(id);
      // The résumé capability deliberately previews both approved access options.
      call(name, args, {
        actions: name === "resume.options" ? ["resume", "access"] : [id],
      });
    }
    if (
      plan.factIds.some((id) => !resolvedFacts.has(id)) ||
      plan.actionIds.some((id) => !resolvedActions.has(id))
    )
      return failed("TOOL_OUTPUT");
    return { ...materialize(plan), trace, toolCalls: trace.length };
  } catch (e) {
    return failed(
      ["TOOL_LIMIT", "TOOL_UNAVAILABLE", "TOOL_OUTPUT"].includes(e.message)
        ? e.message
        : "TOOL_UNAVAILABLE",
    );
  }
}
export function executeQuestion(question, options) {
  const plan = planQuestion(question);
  const response = executePublicPlan(plan, options);
  return {
    plan,
    ...response,
    proofDetails: selectProofDetails(question, response),
  };
}
