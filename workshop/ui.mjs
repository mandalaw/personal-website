export const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const status = (s) => ($("#ws-status").textContent = s);
export const link = (label, href) =>
  `<a href="${esc(href)}">${esc(label)} ↗</a>`;
export const button = (id, label, extra = "") =>
  `<button ${id ? `id="${id}"` : ""} ${extra}>${esc(label)}</button>`;
export function evidence(n, g, { detail = true } = {}) {
  return `<article class="evidence-item" data-evidence="${esc(n.id)}"><span class="classification">${esc(n.classification)} · ${esc(n.type.replaceAll("_", " "))}</span><h3>${esc(n.label)}</h3><p>${esc(n.summary)}</p>${n.ownership ? `<p class="quiet">${esc(n.ownership)}</p>` : ""}${n.href ? link("Explore the evidence", n.href) : ""}${
    detail
      ? `<details><summary>Evidence & scope</summary><p>${esc(
          n.sourceRefs
            .map((id) => g.sources.find((s) => s.id === id)?.title)
            .filter(Boolean)
            .join(" · "),
        )}</p>${n.periodBasis ? `<p>${esc(n.periodBasis)}</p>` : ""}<p>Supported means a bounded account or artifact supports the wording; it is not a claim of sole authorship or independently measured impact.</p></details>`
      : ""
  }</article>`;
}
export function head(label, title, intro, aside = "") {
  const l = label.toLowerCase(),
    pose = l.includes("gis")
      ? "map"
      : l.includes("terminal")
        ? "laptop"
        : l.includes("api")
          ? "workbench"
          : l.includes("notes") || l.includes("design")
            ? "reading"
            : l.includes("arena")
              ? "think"
              : l.includes("packet") || l.includes("education")
                ? "document"
                : l.includes("passport")
                  ? "found-it"
                  : l.includes("role")
                    ? "envelope"
                    : "point-right";
  return `<div class="station-head"><div><p class="eyebrow">${esc(label)}</p><h2>${esc(title)}</h2><p>${esc(intro)}</p></div><div class="station-aside"><div class="station-character" data-pose="${pose}" aria-hidden="true"><span class="scene-chair"></span><span class="scene-prop"></span><span class="scene-cable"></span><svg viewBox="0 0 220 370"><use href="/images/characters/guide/dev.svg#${pose}"></use></svg><span class="scene-stamp">✓</span></div>${aside ? `<p class="quiet">${esc(aside)}</p>` : ""}</div></div>`;
}
const sceneTimers = new WeakMap();
export function scene(action) {
  const n = document.querySelector(".station-character");
  if (
    !n ||
    document.documentElement.dataset.motion === "reduce" ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  )
    return;
  clearTimeout(sceneTimers.get(n));
  delete n.dataset.action;
  // Restart a bounded authored action, including when the same control is reused.
  void n.offsetWidth;
  n.dataset.action = action;
  const use = n.querySelector("use"),
    pose =
      {
        error: "think",
        success: "found-it",
        stamp: "document",
        inspect: "map",
        type: "sit",
        cable: "workbench",
        shelf: "document",
        drawer: "peek-right",
        notebook: "reading",
        carry: "document",
        walk: "walk-right",
        output: "think",
      }[action] || n.dataset.pose;
  use.setAttribute("href", "/images/characters/guide/dev.svg#" + pose);
  sceneTimers.set(
    n,
    setTimeout(() => {
      delete n.dataset.action;
      use.setAttribute(
        "href",
        "/images/characters/guide/dev.svg#" + n.dataset.pose,
      );
      sceneTimers.delete(n);
    }, 1000),
  );
}
export function on(id, event, fn) {
  $(id)?.addEventListener(event, async (e) => {
    try {
      await fn(e);
    } catch (err) {
      status(err.message || "That action could not finish.");
    }
  });
}
