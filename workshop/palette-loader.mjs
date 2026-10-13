// The public index and dialog load only when the visitor requests search.
let palette,
  loading = false;
const launcher = document.createElement("button");
launcher.type = "button";
launcher.dataset.workshopSearch = "";
launcher.textContent = "Find in the portfolio · ⌘ K";
launcher.setAttribute(
  "aria-label",
  "Search projects, skills, notes and Workshop stations",
);
launcher.style.cssText =
  "display:inline-flex;align-items:center;margin:16px 8px;min-height:44px;border-radius:9px;padding:10px 14px;background:#f5f2eb;color:#222833;border:1px solid #59616b;";
const launch = async (returnFocus = document.activeElement) => {
  if (loading) return;
  try {
    if (!palette) {
      loading = true;
      palette = await import("./palette.mjs?v=faf24c6c310f");
    }
    palette.openSearch(returnFocus);
  } catch {
    location.href = "/search/";
  } finally {
    loading = false;
  }
};
launcher.addEventListener("click", () => launch(launcher));
(
  document.querySelector("footer") ||
  document.querySelector("main") ||
  document.body
).append(launcher);
document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    launch();
  }
});
