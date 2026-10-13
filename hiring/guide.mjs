import { $, esc, evidence, theme } from "./ui.mjs";
import { answer, compareJD } from "./guide-core.mjs?v=966626e075bf";
theme();
function ask(q) {
  const d = answer(q);
  $("#guide-status").textContent = d.summary;
  $("#guide-result").innerHTML =
    evidence(d.nodes || []) +
    (d.links || [])
      .map((l) => `<p><a href="${esc(l.href)}">${esc(l.label)} ↗</a></p>`)
      .join("");
}
$("#question-form").onsubmit = (e) => {
  e.preventDefault();
  ask($("#question").value);
};
document.querySelectorAll("[data-question]").forEach(
  (b) =>
    (b.onclick = () => {
      $("#question").value = b.dataset.question;
      ask(b.dataset.question);
    }),
);
$("#jd-form").onsubmit = (e) => {
  e.preventDefault();
  const d = compareJD($("#jd").value);
  $("#jd-status").textContent = d.error || d.warning;
  $("#jd-result").innerHTML = d.error
    ? ""
    : d.results
        .map(
          (x) =>
            `<article class="evidence ${x.category === "GAPS" ? "gap" : ""}"><span class="classification">${esc(x.category)}</span><h3>${esc(x.requirement)}</h3><p>${esc(x.reason)}</p><details><summary>Inspect relevant evidence (${x.evidence.length})</summary>${evidence(x.evidence)}</details>${x.question ? `<p><b>Question for Ahmed:</b> ${esc(x.question)}</p>` : ""}</article>`,
        )
        .join("");
};
$("#clear-jd").onclick = () => {
  $("#jd").value = "";
  $("#jd-result").replaceChildren();
  $("#jd-status").textContent = "Description cleared.";
};
