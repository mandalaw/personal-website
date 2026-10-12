import { resolveFollowUp, publicContext } from "./conversation.mjs";
import { executeQuestion } from "./executor.mjs";
import { bindActions } from "./orchestration.mjs";
const element = (tag, text, className) => {
  const e = document.createElement(tag);
  if (text) e.textContent = text;
  if (className) e.className = className;
  return e;
};
const add = (parent, ...children) => {
  parent.append(...children);
  return parent;
};
function link(a) {
  const e = element("a", a.label, "agent-action");
  e.href = a.href;
  e.dataset.action = a.id || "";
  return e;
}
function factCard(f) {
  const e = element("article", null, "agent-fact");
  e.dataset.evidence = f.id;
  add(
    e,
    element(
      "span",
      f.classification + " · " + f.type.toLowerCase(),
      "agent-chip",
    ),
    element("h3", f.title),
    element("p", f.statement),
  );
  if (f.boundary) add(e, element("p", f.boundary, "agent-boundary"));
  if (f.period)
    add(e, element("p", f.period + " · " + f.periodBasis, "agent-meta"));
  const details = element("details", null, "agent-sources"),
    list = element("ul");
  f.sources.forEach((s) =>
    list.append(element("li", s.title + " — " + s.kind)),
  );
  add(details, element("summary", "Why this answer is supported"), list);
  add(e, details, link({ label: "Inspect " + f.title, href: f.href }));
  return e;
}
export function mount(
  root,
  { compact = false, beforeNavigate = () => {} } = {},
) {
  const unbindActions = bindActions(root, { beforeNavigate });
  root.classList.add("dev-agent");
  let mode = "ask",
    generation = 0,
    last = "",
    abort = null,
    context = null;
  const tabs = element("div", null, "agent-tabs"),
    askTab = element("button", "Ask Dev dude"),
    jdTab = element("button", "Compare a role");
  askTab.type = jdTab.type = "button";
  askTab.setAttribute("aria-pressed", "true");
  jdTab.setAttribute("aria-pressed", "false");
  add(tabs, askTab, jdTab);
  const layout = element("div", null, "agent-layout"),
    work = element("section", null, "agent-workspace"),
    aside = element("aside", null, "agent-aside");
  const disclosure = element(
    "p",
    "Evidence guide · fixed, reviewed answers. No live AI model is connected. This is not a live chat with Ahmed.",
    "agent-disclosure",
  );
  const suggestions = element("div", null, "agent-suggestions");
  [
    "What did Ahmed do in TrustAI?",
    "Show me an API example",
    "What is GDSC?",
    "GIS experience",
    "Full résumé options",
  ].forEach((q) => {
    const b = element("button", q);
    b.type = "button";
    b.onclick = () => {
      input.value = q;
      form.requestSubmit();
    };
    suggestions.append(b);
  });
  const form = element("form", null, "agent-compose"),
    label = element("label", "Ask about the work"),
    input = element("textarea");
  input.id = "agent-question-" + crypto.randomUUID();
  label.htmlFor = input.id;
  input.rows = compact ? 2 : 3;
  input.maxLength = 1600;
  input.autocomplete = "off";
  input.placeholder = "A project, a contribution, a technical question…";
  const buttons = element("div", null, "agent-form-actions"),
    send = element("button", "Show the evidence", "agent-send"),
    cancel = element("button", "Cancel"),
    retry = element("button", "Retry"),
    clear = element("button", "Clear");
  send.type = "submit";
  for (const b of [cancel, retry, clear]) b.type = "button";
  cancel.hidden = true;
  retry.hidden = true;
  add(buttons, send, cancel, retry, clear);
  add(form, label, input, buttons);
  const status = element("p", null, "agent-status");
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.setAttribute("aria-atomic", "true");
  const result = element("div", null, "agent-result");
  result.tabIndex = -1;
  result.setAttribute("role", "region");
  result.setAttribute("aria-label", "Evidence result");
  const technical = element("details", null, "agent-technical"),
    trace = element("pre");
  add(technical, element("summary", "Technical view"), trace);
  add(work, disclosure, suggestions, form, status, result, technical);
  add(
    aside,
    element("h2", "A short path to the interesting part."),
    element(
      "p",
      "Ask about a contribution, then open its source. The guide separates professional work, team projects and teaching examples.",
    ),
    element("h2", "Your question stays here."),
    element(
      "p",
      "Questions and public job descriptions run in this browser. They are not saved or sent to a model. Don’t paste confidential employer material.",
    ),
    link({ label: "Explore the Workshop", href: "/workshop/" }),
    element("h2", "A boundary worth keeping."),
    element(
      "p",
      "No guessed years, invented metrics or private application details. Missing evidence stays missing.",
    ),
  );
  add(layout, work, aside);
  add(root, tabs, layout);
  const reset = () => {
    generation++;
    abort?.abort();
    abort = null;
    result.replaceChildren();
    trace.textContent = "";
    status.textContent = "";
    send.disabled = false;
    cancel.hidden = true;
    retry.hidden = true;
  };
  function setMode(next) {
    reset();
    mode = next;
    context = null;
    last = "";
    input.value = "";
    askTab.setAttribute("aria-pressed", String(mode === "ask"));
    jdTab.setAttribute("aria-pressed", String(mode === "jd"));
    suggestions.hidden = mode === "jd";
    input.maxLength = mode === "jd" ? 12000 : 1600;
    input.rows = mode === "jd" ? 8 : compact ? 2 : 3;
    label.textContent =
      mode === "jd" ? "Paste a public job description" : "Ask about the work";
    input.placeholder =
      mode === "jd"
        ? "Required qualifications\nPython and SQL\nPreferred qualifications\nGIS experience\nLocation: California"
        : "A project, a contribution, a technical question…";
    send.textContent = mode === "jd" ? "Compare evidence" : "Show the evidence";
    input.focus();
  }
  askTab.onclick = () => setMode("ask");
  jdTab.onclick = () => setMode("jd");
  form.onsubmit = async (e) => {
    e.preventDefault();
    reset();
    const q = input.value.trim();
    if (!q) {
      status.textContent = "Add a question or description first.";
      input.focus();
      return;
    }
    last = q;
    const own = ++generation;
    abort = new AbortController();
    send.disabled = true;
    cancel.hidden = false;
    status.textContent =
      mode === "ask"
        ? "Finding reviewed evidence…"
        : "Separating requirements and evidence…";
    try {
      // Keep cancellation ordered without depending on a visible animation frame.
      // Safari can suspend requestAnimationFrame in an inactive page.
      await Promise.resolve();
      if (own !== generation || abort.signal.aborted) return;
      if (mode === "ask") {
        const followed = resolveFollowUp(q, context),
          response = executeQuestion(followed.question),
          p = response.plan;
        context = publicContext(response, context, followed.contextId);
        if (followed.notice)
          add(result, element("p", followed.notice, "agent-context"));
        add(result, element("p", response.summary, "agent-answer"));
        response.proofDetails.forEach((d) => {
          const item = element("article", null, "agent-fact agent-proof");
          item.dataset.proof = d.id;
          add(
            item,
            element("span", d.scope, "agent-chip"),
            element("h3", d.title),
            element("blockquote", d.statement),
            link({ label: "Read the project account", href: d.href }),
          );
          result.append(item);
        });
        response.facts.forEach((f) => result.append(factCard(f)));
        const links = element("div", null, "agent-actions");
        response.actions.forEach((a) => links.append(link(a)));
        result.append(links);
        trace.textContent = JSON.stringify(
          {
            mode: "deterministic",
            plan: p,
            routing: "authored plan; bounded typed public tools",
            toolCalls: response.trace,
            selectedEvidenceIds: response.facts.map((f) => f.id),
            selectedPublicExcerptIds: response.proofDetails.map((d) => d.id),
            validatedActionIds: response.actions.map((a) => a.id),
            followedPublicTopic: followed.contextId,
            modelCalls: 0,
            evidenceVersion: response.evidenceVersion,
            externalRequests: 0,
          },
          null,
          2,
        );
        status.textContent = response.ok
          ? response.facts.length +
            (response.facts.length === 1
              ? " evidence item. No model request."
              : " evidence items. No model request.")
          : "The guide could not finish. Try again or open the Workshop.";
      } else {
        const { compareJD, requirementLabel } = await import("./jd.mjs");
        if (own !== generation || abort.signal.aborted) return;
        const compared = compareJD(q);
        if (!compared.ok) throw Error(compared.error);
        const summary = element("div", null, "agent-jd-summary");
        add(
          summary,
          element("h2", "Requirements, with the gaps visible."),
          element("p", compared.warning),
          element(
            "p",
            compared.summary.hard +
              " hard · " +
              compared.summary.preferred +
              " preferred · " +
              compared.summary.unresolvedHard +
              " unresolved hard requirements",
          ),
        );
        result.append(summary);
        for (const r of compared.results) {
          const card = element("article", null, "agent-jd-row");
          card.dataset.assessment = r.assessment;
          add(
            card,
            element("span", requirementLabel(r), "agent-chip"),
            element("h3", r.text),
            element("p", r.explanation),
          );
          if (r.question) add(card, element("p", r.question, "agent-boundary"));
          if (r.evidence.length) {
            const d = element("details");
            add(
              d,
              element(
                "summary",
                "Inspect related evidence (" + r.evidence.length + ")",
              ),
            );
            r.evidence.forEach((f) => d.append(factCard(f)));
            card.append(d);
          }
          result.append(card);
        }
        compared.notices.forEach((n) => result.append(element("p", n)));
        trace.textContent = JSON.stringify(
          {
            mode: "deterministic",
            requirements: compared.results.map((r) => ({
              id: r.id,
              kind: r.kind,
              priority: r.priority,
              assessment: r.assessment,
              evidenceIds: r.evidence.map((f) => f.id),
              satisfied: r.satisfied,
            })),
            externalRequests: 0,
          },
          null,
          2,
        );
        status.textContent =
          compared.results.length +
          " requirement lines compared. No fit percentage.";
      }
      retry.hidden = false;
    } catch (error) {
      if (own === generation) {
        status.textContent =
          "The guide could not finish. Your question remains available to retry.";
        retry.hidden = false;
      }
    } finally {
      if (own === generation) {
        send.disabled = false;
        cancel.hidden = true;
        abort = null;
      }
    }
  };
  cancel.onclick = () => {
    reset();
    status.textContent = "Canceled. Nothing was saved.";
    retry.hidden = false;
  };
  retry.onclick = () => {
    input.value = last;
    form.requestSubmit();
  };
  clear.onclick = () => {
    reset();
    input.value = "";
    last = "";
    context = null;
    status.textContent = "Cleared from this page.";
    input.focus();
  };
  const leave = () => {
    reset();
    input.value = "";
    last = "";
    context = null;
  };
  window.addEventListener("pagehide", leave);
  return {
    focus: () => input.focus(),
    clear: leave,
    destroy: () => {
      unbindActions();
      leave();
      window.removeEventListener("pagehide", leave);
      root.replaceChildren();
    },
  };
}
