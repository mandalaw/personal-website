import { MovementInput } from "./movement.mjs?v=44a7d9e8e468";
export function bindControls({
  canvas,
  left,
  right,
  jump,
  slide,
  latch,
  onMove,
  onAction,
  onConfirm,
  onPause,
  signal,
}) {
  const held = new MovementInput();
  const publish = () => onMove(held.value());
  const clear = () => {
    held.clear();
    publish();
    for (const b of [left, right]) b.setAttribute("aria-pressed", "false");
    for (const b of [left, right, jump, slide]) delete b.dataset.held;
  };
  const direction = {
    a: "left",
    ArrowLeft: "left",
    d: "right",
    ArrowRight: "right",
    s: "duck",
    ArrowDown: "duck",
  };
  const interactive = (target) =>
    target?.closest?.("input,select,textarea,a,summary,button");
  window.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        clear();
        onPause();
        return;
      }
      if (interactive(e.target)) return;
      if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
        return;
      }
      if (canvas.dataset.status !== "running") return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (direction[key]) {
        e.preventDefault();
        held.set("key:" + key, direction[key], true);
        publish();
        if (direction[key] === "duck" && !e.repeat) onAction("slide");
      } else if ([" ", "ArrowUp", "w"].includes(key)) {
        e.preventDefault();
        if (!e.repeat) onAction("jump");
      }
    },
    { signal },
  );
  window.addEventListener(
    "keyup",
    (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (direction[key]) {
        held.set("key:" + key, direction[key], false);
        publish();
      }
    },
    { signal },
  );
  for (const [button, action] of [
    [left, "left"],
    [right, "right"],
    [jump, "jump"],
    [slide, "duck"],
  ]) {
    const start = (e) => {
      if (button.disabled) return;
      button.dataset.held = "true";
      e.preventDefault();
      canvas.focus({ preventScroll: true });
      if ((action === "left" || action === "right") && latch.checked) {
        const old = held.sources.get("latch");
        held.set("latch", action, old !== action);
        publish();
        left.setAttribute(
          "aria-pressed",
          String(held.sources.get("latch") === "left"),
        );
        right.setAttribute(
          "aria-pressed",
          String(held.sources.get("latch") === "right"),
        );
        return;
      }
      if (e.pointerId !== undefined) {
        try {
          button.setPointerCapture(e.pointerId);
        } catch {
          /* A cancelled pointer may already be gone. */
        }
      }
      if (action !== "jump") {
        held.set("pointer:" + e.pointerId, action, true);
        publish();
      }
      if (action === "jump" || action === "duck")
        onAction(action === "duck" ? "slide" : "jump");
    };
    button.addEventListener("pointerdown", start, { signal });
    for (const type of ["pointerup", "pointercancel", "lostpointercapture"])
      button.addEventListener(
        type,
        (e) => {
          delete button.dataset.held;
          held.set("pointer:" + e.pointerId, action, false);
          publish();
        },
        { signal },
      );
    button.addEventListener(
      "click",
      (e) => {
        if (e.detail === 0) {
          if (action === "left" || action === "right") {
            const old = held.sources.get("latch");
            held.set("latch", action, old !== action);
            publish();
            left.setAttribute(
              "aria-pressed",
              String(held.sources.get("latch") === "left"),
            );
            right.setAttribute(
              "aria-pressed",
              String(held.sources.get("latch") === "right"),
            );
          } else onAction(action === "duck" ? "slide" : "jump");
        }
      },
      { signal },
    );
  }
  latch.addEventListener("change", clear, { signal });
  window.addEventListener("blur", clear, { signal });
  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden) clear();
    },
    { signal },
  );
  return { clear };
}
