import { search } from "./evidence-core.mjs";
import { esc } from "./ui.mjs";
import graph from "./graph-data.mjs";
const stations = Object.entries({
  missions: "Recruiter missions",
  graph: "Career graph",
  terminal: "Terminal",
  arena: "AI evaluation arena",
  maps: "GIS studio",
  api: "API playground",
  design: "System-design decisions",
  transit: "Scenic portfolio route",
  career: "Experience and education",
  notes: "Field notes",
  packet: "Recruiter reading packet",
  passport: "Your Workshop trail",
  inquiry: "Discuss a role",
  resources: "Engineering worksheets",
});
const dialog = document.createElement("dialog");
dialog.id = "global-palette";
dialog.setAttribute("aria-label", "Search the public portfolio");
dialog.style.cssText =
  "max-width:600px;width:calc(100% - 30px);max-height:80vh;background:#f5f2eb;color:#222833;border:1px solid #999;border-radius:15px;padding:24px;z-index:999;";
dialog.innerHTML =
  '<button id="global-close" aria-label="Close search" style="float:right;min-height:44px;background:#fffdf8;color:#222833">Close</button><h2>Find a thread.</h2><label for="global-query">Project, skill, note or station</label><input id="global-query" type="search" maxlength="100" style="width:100%;padding:14px;background:#fffdf8;color:#222833"><p>Search stays in this browser.</p><div id="global-results"></div>';
document.body.append(dialog);
dialog.addEventListener("keydown", event => {
  if (event.key === "Escape") { event.preventDefault(); dialog.close(); }
});
const draw = () => {
  const query = dialog.querySelector("input").value.trim().toLowerCase();
  const found = search(graph, query).map((node) => ({
    label: node.label,
    href: node.href,
    type: node.type.replaceAll("_", " "),
  }));
  const matched = stations
    .filter(
      ([id, name]) => query && (id + " " + name).toLowerCase().includes(query),
    )
    .map(([id, label]) => ({
      label,
      href: "/workshop/#" + id,
      type: "Workshop station",
    }));
  dialog.querySelector("#global-results").innerHTML =
    [...matched, ...found]
      .slice(0, 20)
      .map(
        (node) =>
          `<p><a style="color:#912b37;display:inline-block;min-height:32px" href="${esc(node.href)}">${esc(node.label)}</a><br><small>${esc(node.type)}</small></p>`,
      )
      .join("") +
    '<p><a style="color:#912b37" href="/workshop/">Open The Workshop</a> · <a style="color:#912b37" href="/resume/">Résumé</a> · <a style="color:#912b37" href="/#contact">Contact</a></p>';
};
dialog.querySelector("#global-close").onclick = () => dialog.close();
let previousFocus;
dialog.addEventListener("close", () => {
  if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
});
export function openSearch(returnFocus) {
  if (dialog.open) {
    dialog.close();
    return;
  }
  previousFocus = returnFocus;
  dialog.showModal();
  dialog.querySelector("input").focus();
}
dialog.querySelector("input").oninput = draw;
draw();
