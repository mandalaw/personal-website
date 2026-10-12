export const $ = (s) => document.querySelector(s);
export const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export function evidence(entries) {
  return entries
    .map(
      (n) =>
        `<article class="evidence"><span class="classification">${esc(n.classification)}</span><h3><a href="${esc(n.href)}">${esc(n.label)}</a></h3><p>${esc(n.summary)}</p>${n.period ? `<small>${esc(n.period)} · ${esc(n.periodBasis || "")}</small>` : ""}<p class="sources">Sources: ${n.sourceRefs.map(esc).join(" · ")}</p>${(n.reasons || []).map((r) => `<p class="fine">${esc(r.classification)} · ${esc(r.statement)}</p>`).join("")}</article>`,
    )
    .join("");
}
export function theme() {
  const el = $("#theme");
  if (el)
    el.onclick = () => {
      const v =
        document.documentElement.dataset.theme === "night" ? "day" : "night";
      document.documentElement.dataset.theme = v;
      try {
        localStorage.setItem("mandalaw-theme", v);
      } catch {}
    };
}
export function download(blob, name) {
  const u = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 30000);
}
export async function action(button, status, fn) {
  button.disabled = true;
  status.textContent = "Working…";
  try {
    await fn();
  } catch (e) {
    status.textContent = e.message;
  } finally {
    button.disabled = false;
  }
}
