import { createDiscovery } from './discovery.mjs?v=b845c79e3f52';
import { createCompanion } from "./companion.mjs?v=49210b0f4a70";
import { createImmersive } from "./immersive.mjs?v=e050d774128b";
import { CEREMONY_SECONDS } from "./ceremony.mjs?v=bb109e40cf33";
import { speedFor, sceneFor, LONG_WAY, JOURNEY } from "./course.mjs?v=1b77db058418";
import { Game } from "./engine.mjs?v=446630c70980";
import { STAGES, HAZARDS, TOOLS, KITS, SECRETS, FINISH } from "./course.mjs?v=1b77db058418";
import { loadAssets, Renderer } from "./render.mjs?v=318ab0246136";
import { Dialogue } from "./dialogue.mjs?v=94da74293e6e";
import { AudioBus } from "./audio.mjs?v=0c00726a0636";
import { readRecord, saveRecord } from "./persistence.mjs?v=8b760301279c";
import { clock, rank } from "./scoring.mjs?v=097b44f00e65";
import { bindControls } from "./input.mjs?v=c22a839c2ab6";
import { Metrics } from "./metrics.mjs?v=fd1676bfd8b9";

const $ = (id) => document.getElementById(id),
  abort = new AbortController(),
  { signal } = abort,
  canvas = $("world"),
  screen = $("screen"),
  initialScreen = screen.innerHTML,
  reduce = matchMedia("(prefers-reduced-motion:reduce)");
const storage = {
  getItem: (key) => localStorage.getItem((LONG_WAY?key:JOURNEY+":"+key)),
  setItem: (key, value) => localStorage.setItem((LONG_WAY?key:JOURNEY+":"+key), value),
};
let game = new Game({
    mode:
      reduce.matches || document.documentElement.dataset.motion === "reduce"
        ? "planner"
        : "runner",
  }),
  renderer,
  assets,
  raf = 0,
  last = 0,
  accumulator = 0,
  nextHUD = 0,
  chapterUntil = 0,
  victoryUntil = 0,
  disposed = false,
  planLast = 0,
  screenState = "title",
  loadedAt = 0,
  immersive, companion;
const metrics = new Metrics(),
  audio = new AudioBus(),
  dialogue = new Dialogue(),
  records = readRecord(storage),
  activeSeconds = () => game.stats.time;
let lastScene = "",
  lastCue = "",
  lastPose = "",
  onFrame = null;

function announce(text) {
  $("announcement").textContent = text;
}
function focusScreen() {
  const h = screen.querySelector("h2");
  if (h) {
    h.tabIndex = -1;
    h.focus({ preventScroll: true });
  }
}
function button(text, id, primary = false) {
  const b = document.createElement("button");
  b.type = "button";
  b.id = id;
  b.textContent = text;
  if (primary) b.className = "primary";
  return b;
}
function screenFor(kind, reason = "") {
  screenState = kind;
  immersive?.sync(kind);
  screen.classList.toggle("epilogue", kind === "won");
  screen.hidden = kind === "running";
  screen.classList.toggle("is-result", kind === "won" || kind === "over");
  $("game").dataset.status = kind;
  canvas.tabIndex = kind === "running" ? 0 : -1;
  for (const id of ["left", "right", "jump", "slide", "pause"])
    $(id).disabled = kind !== "running";
  if (kind === "running") {
    canvas.focus({ preventScroll: true });
    return;
  }
  if (kind === "title") {
    screen.innerHTML = initialScreen;
    wireTitle();
    return;
  }
  const card = document.createElement("div");
  card.className = "screen-card";
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent =
    kind === "won"
      ? rank(game.stats)
      : kind === "over"
        ? "Checkpoint available"
        : "Take a breath";
  const title = document.createElement("h2");
  title.textContent =
    kind === "won"
      ? "Build passed."
      : kind === "over"
        ? "A recoverable error."
        : "Paused.";
  const p = document.createElement("p");
  p.textContent =
    kind === "won"
      ? "Toronto to the Bay. The cat took a shortcut."
      : kind === "over"
        ? "Your checkpoint kept the good work. Three fresh hearts, same chapter."
        : reason || "The route will be here when you are ready.";
  const actions = document.createElement("div");
  actions.className = "screen-actions";
  card.append(eyebrow, title, p);
  if (kind === "won") {
    const stats = document.createElement("dl");
    stats.className = "run-stats";
    for (const [label, value] of [
      ["Score", game.score().toLocaleString()],
      ["Time", clock(game.stats.time)],
      ["Tools", game.stats.pickups],
      ["Collisions", game.stats.collisions],
      ["Best streak", game.stats.bestStreak],
      ["Secrets", game.stats.secrets.length],
      ["Near misses", game.stats.nearMisses],
    ]) {
      const div = document.createElement("div"),
        dt = document.createElement("dt"),
        dd = document.createElement("dd");
      dt.textContent = label;
      dd.textContent = value;
      div.append(dt, dd);
      stats.append(div);
    }
    card.append(stats);
    const replay = button("Run it again", "replay", true);
    replay.onclick = () => start(true);
    actions.append(replay);
    const detail = document.createElement("a");
    detail.href = "/case-studies/dev-run/";
    detail.textContent = "How it was built ↗";
    actions.append(detail);
    const note = document.createElement("p");
    note.className = "performance-note";
    note.textContent =
      game.mode === "planner"
        ? "Route planner · your pace · separate local best"
        : `${game.stats.deaths} checkpoint retries · best saved on this device`;
    card.append(note);
  } else {
    const go = button(
      kind === "over" ? "Retry checkpoint" : "Resume",
      "resume",
      true,
    );
    go.onclick = () => {
      if (kind === "over") game.restore();
      else game.resume();
      screenFor("running");
      planLast = performance.now();
      audio.resume();
      startLoop();
      flush();
    };
    actions.append(go);
    const checkpoint = button("Restart checkpoint", "restart-checkpoint");
    checkpoint.onclick = () => { controls.clear(); game.restore(); screenFor("running"); audio.resume(); startLoop(); flush(); };
    actions.append(checkpoint);
    const expand = button(immersive?.active ? "Exit fullscreen" : "⛶ Fullscreen / immersive", "pause-fullscreen"); expand.dataset.fullscreenAction="true"; actions.append(expand);
    const reset = button("Start over", "restart");
    reset.onclick = () => titleScreen();
    if (!immersive?.active) actions.append(reset);
  }
  const exit = document.createElement("a");
  exit.href = "/#playground";
  exit.textContent = immersive?.active ? "Exit Dev Run" : "Back to Side quests";
  actions.append(exit);
  card.append(actions);
  screen.replaceChildren(card);
  if (kind === "over" && !immersive?.active)
    $("game").scrollIntoView({ block: "start", behavior: "instant" });
  if (kind === "won")
    screen.scrollIntoView({ block: "nearest", behavior: "instant" });
  focusScreen();
}
function wireTitle() {
  const journeyLink=document.getElementById('journey-link');
journeyLink.textContent=LONG_WAY?'Take the cinematic route →':'Want every detour? Take the long way →';
journeyLink.href=LONG_WAY?'./':'?journey=long-way';
document.getElementById('journey-duration').textContent=LONG_WAY?'About 3–4 minutes':'About 2–3 minutes';

  const mode = $("mode"),
    play = $("play");
  mode.value = game.mode;
  play.disabled = !renderer;
  $("enter-immersive").disabled = !renderer;
  play.textContent = renderer ? "Play Dev Run →" : "Loading the route…";
  if (play.dataset.bound) return;
  play.dataset.bound = "true";
  mode.onchange = () => {
    game.mode = mode.value;
    render();
  };
  play.onclick = () => start(false);
}
function titleScreen() {
 if(game.status==='running'||game.status==='paused')if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('portfolio-game',{detail:{name:'devrun_exited',props:{outcome:'reset'}}}));
  screen.classList.remove("ceremony-screen");
  stopLoop();
  audio.suspend();
  controls.clear();
  game.reset();
  renderer.camera.reset();
  metrics.reset();
  renderer.particles.length = 0;
  screenFor("title");
  $("kit").textContent = "Three hearts. Plenty of second chances.";
  $("dev-line").textContent = "A small trip through a very large backlog.";
  hud();
  render();
  $("play")?.focus({ preventScroll: true });
}
function start(replay = false) {
  if (!renderer) return;
  if (screenState === "title") game.mode = $("mode").value;
  controls.clear();
  game.reset();
  renderer.camera.reset();
  metrics.reset();
  renderer.particles.length = 0;
  game.start();
  try { sessionStorage.setItem('dev-run-played','1'); } catch {}
  dialogue.next = 0;
  planLast = performance.now();
  screenFor("running");
  if (!immersive?.active && (innerWidth <= 700 || innerHeight < 600))
    $("game").scrollIntoView({ block: "start", behavior: "instant" });
  audio.resume();
  startLoop();
  flush();
}
function pause(reason) {
  if (game.status !== "running") return;
  controls.clear();
  game.pause(reason);
  stopLoop();
  audio.suspend();
  screenFor("paused", reason);
  render();
  flush();
}
function startLoop() {
  if (disposed || raf) return;
  last = performance.now();
  accumulator = 0;
  if (game.mode === "planner") {
    hud();
    render();
    return;
  }
  raf = requestAnimationFrame(frame);
}
function stopLoop() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  accumulator = 0;
}
function action(kind) {
  if (game.status !== "running") return;
  if (game.mode === "planner") {
    const now = performance.now();
    game.stats.time += (now - planLast) / 1000;
    planLast = now;
  }
  game[kind]();
  flush();
  hud();
  if (game.mode === "planner") render();
}
function frame(now) {
  raf = 0;
  if (disposed) return;
  const ms = now - last;
  last = now;
  if (ms > 300 && game.status === "running") {
    pause("Paused while the browser was busy. Resume when you are ready.");
    return;
  }
  const startTime = performance.now();
  if (game.status === "running") {
    accumulator += Math.min(ms / 1000, 0.1);
    let n = 0;
    while (accumulator >= 1 / 120 && n++ < 12) {
      game.step(1 / 120);
      accumulator -= 1 / 120;
    }
  }
  flush();
  if (game.status === "won" && game.mode !== "planner") {
    const before = game.ceremony;
    game.ceremony = Math.min(
      CEREMONY_SECONDS,
      game.ceremony + Math.min(ms / 1000, 0.05),
    );
    for (const [at, tone] of [
      [3, "crowd"],
      [6, "cat"],
      [9.5, "win"],
      [11, "crowd"],
    ])
      if (before < at && game.ceremony >= at) audio.play(tone);
  }
  renderer.draw(game, now / 1000, Math.min(ms / 1000, 0.05));
  metrics.frame(ms, performance.now() - startTime);
  if (now > nextHUD) {
    hud();
    if (game.status === "running" && activeSeconds() > dialogue.next + 4)
      say(game.stage === 9 ? "gauntlet" : game.stage < 5 ? "toronto" : "sf");
    nextHUD = now + 100;
  }
  onFrame?.();
  if (
    (game.status === "running" && game.mode === "runner") ||
    (game.status === "won" && now < victoryUntil)
  )
    raf = requestAnimationFrame(frame);
  else if (game.status === "won") showVictory();
}
function render() {
  if (renderer) renderer.draw(game, performance.now() / 1000, 0);
}
function hud() {
  companion?.update();
  const s = STAGES[game.stage];
  $("city").textContent = s.city.toUpperCase();
  $("stage-name").textContent = s.name;
  $("collect-count").textContent = game.stats.pickups;
  $("checkpoint-cue").textContent = " · CP " + game.checkpoint;
  $("health").textContent =
    "♥ ".repeat(game.health) + "♡ ".repeat(3 - game.health);
  $("health").setAttribute("aria-label", `${game.health} of 3 hearts`);
  $("score").textContent = game.score().toLocaleString();
  $("time").textContent = clock(game.stats.time);
  $("progress").value = (game.maxDistance / FINISH) * 100;
  $("best").textContent =
    "Best on this device: " + (records[game.mode] || 0).toLocaleString();
  const h = game.upcoming();
  let cue = "A clear stretch. Breathe.";
  if (game.status === "running" && h) {
    const def = HAZARDS[h.type],
      secs = Math.max(0, (h.x - game.distance) / speedFor(game)),
      verb = def.kind === "slide" ? "Slide" : "Jump";
    cue =
      game.mode === "planner"
        ? `${def.name} · ${verb} when you are ready`
        : `${def.name} · ${verb} · ${secs.toFixed(1)} s`;
  }
  if (game.encounter) {
    cue =
      game.mode === "planner"
        ? `${game.encounter.title} · Jump high / Duck low`
        : game.encounter.kind === "ride"
          ? `${game.encounter.title} · Duck to ride / Jump to walk`
          : game.encounter.cue ? `${game.encounter.title} · ${game.encounter.cue}` : `${game.encounter.title} · Jump onto the ledge, then go LEFT to the switch. Or duck at the lower switch.`;
  } else if (
    game.mode === "planner" &&
    game.nextJunction() &&
    (!h || game.nextJunction().x < h.x)
  )
    cue = game.nextJunction().title + " · Jump high / Slide low";
  if (game.status === "won")
    cue =
      game.ceremony < 12
        ? "A welcome committee. And one very proud cat."
        : "Congratulations. You survived production. That counts.";
  if (game.status === "running") {
    $("jump").disabled = false;
    $("slide").disabled = false;
  }
  if (game.status === "running" && sceneFor(game) !== lastScene) {
    lastScene = sceneFor(game);
    canvas.dataset.scene = lastScene;
  }
  $("kit").dataset.cover = String(game.shield);
  if (game.status === "over") cue = "Your checkpoint is ready.";
  $("next-hazard").textContent = cue;
  if (game.mode === "planner" && cue !== lastCue) {
    announce(cue);
    lastCue = cue;
  }
  if (performance.now() > chapterUntil) $("chapter").hidden = true;
  if (renderer?.pose !== lastPose) {
    canvas.dataset.pose = renderer?.pose || "idle";
    lastPose = renderer?.pose;
  }
  canvas.dataset.status = game.status;
  canvas.dataset.chapter = s.id;
}
function say(category, force = false) {
  const line = dialogue.say(category, activeSeconds(), force);
  if (line) $("dev-line").textContent = line;
}
function flush() {
  const events = game.drain();
  for (const e of events) {
    renderer?.event(e, game);
    if (["jump", "pickup", "hit", "checkpoint", "win"].includes(e.type))
      audio.play(e.type);
    if (e.type === "junction") {
      $("dev-line").textContent = e.title + ". Take a moment.";
      announce(
        e.title +
          ". Follow the signs. Left and right move; Jump climbs; Duck uses the lower switch or starts a marked ride.",
      );
    }
    if (e.type === "route" || e.type === "tool") {
      $("kit").textContent = e.text;
      if (e.type === "route") $("dev-line").textContent = e.text;
      announce(e.text);
    }
    if (e.type === "near") {
      say("near");
      audio.play("near");
    }
    if (e.type === "slide") audio.play("slide");
    if (e.type === "land") audio.play("land");
    if (e.type === "jump" && game.stats.jumps % 4 === 1) say("jump");
    if (e.type === "clear" && game.stats.cleared % 3 === 0) say("clear");
    if (e.type === "stage") {
      const chapter = $("chapter");
      chapter.replaceChildren();
      const small = document.createElement("small");
      small.textContent = e.stage.city;
      chapter.append(small, document.createTextNode(e.stage.name));
      chapter.hidden = false;
      chapterUntil = performance.now() + 2600;
      $("dev-line").textContent = e.stage.line;
      dialogue.next = activeSeconds() + 7;
      announce(e.stage.city + ". " + e.stage.name + ". " + e.stage.line);
    }
    if (e.type === "checkpoint") {
      $("kit").textContent = "Checkpoint saved · one heart restored";
      say("checkpoint", true);
    }
    if (e.type === "pickup") {
      $("kit").textContent = e.tool.name + " · " + KITS[e.tool.kit];
      if (e.secret !== null) {
        $("dev-line").textContent = SECRETS[e.secret];
        announce("Secret found. " + SECRETS[e.secret]);
      } else say("pickup");
    }
    if (e.type === "shield") {
      $("kit").textContent = "Test cover absorbed the hit";
      say("hit", true);
    }
    if (e.type === "hit") {
      say("hit", true);
      announce(`Collision. ${game.health} hearts remain.`);
    }
    if (e.type === "over") {
      stopLoop();
      audio.suspend();
      screenFor("over");
      announce("Out of hearts. Retry the checkpoint.");
    }
    if (e.type === "retry") {
      say("checkpoint", true);
      announce("Checkpoint restored. Three hearts.");
    }
    if (e.type === "win") {
      say("victory", true);
      victoryUntil = performance.now() + CEREMONY_SECONDS * 1000;
      game.ceremony = 0;
      controls.clear();
      $("left").disabled = true;
      $("right").disabled = true;
      $("pause").disabled = true;
      $("jump").disabled = true;
      $("slide").disabled = true;
      const record = saveRecord(storage, game.mode, game.score());
      Object.assign(records, record);
      announce("Deployment successful. Score " + game.score() + ".");
      if (game.mode === "planner") plannerCeremony();
    }
  }
  if (events.length) hud();
}
function plannerCeremony() {
  screen.hidden = false;
  screen.classList.add("ceremony-screen");
  screen.replaceChildren();
  const card = document.createElement("div");
  card.className = "ceremony-card";
  const title = document.createElement("h2");
  title.textContent =
    game.ceremony < 5
      ? "A welcome at the finish."
      : game.ceremony < 8
        ? "The cat brought the trophy."
        : game.ceremony < 12
          ? "A proper handoff."
          : "Congratulations. You survived production.";
  const next = button(
    game.ceremony >= 13 ? "See the results" : "Continue the celebration",
    "ceremony-next",
    true,
  );
  next.onclick = () => {
    const beats = [5, 8, 10.5, 13, 16];
    game.ceremony = beats.find((t) => t > game.ceremony) || 16;
    audio.play(game.ceremony === 10.5 ? "win" : "ui");
    if (game.ceremony >= 16) {
      screen.classList.remove("ceremony-screen");
      showVictory();
    } else plannerCeremony();
    render();
  };
  card.append(title, next);
  screen.append(card);
  focusScreen();
  render();
  announce(title.textContent);
}
function showVictory() {
  if (screenState !== "won") {
    screenFor("won");
    render();
    onFrame?.();
  }
}
function confirm() {
  if (game.status === "title") start();
  else if (game.status === "paused") {
    $("resume")?.click();
  } else if (game.status === "over") {
    $("resume")?.click();
  } else if (game.status === "won") {
    if ($("ceremony-next")) $("ceremony-next").click();
    else if (game.ceremony >= CEREMONY_SECONDS) start(true);
  }
}

const controls = bindControls({
  canvas,
  left: $("left"),
  right: $("right"),
  latch: $("latch"),
  onMove: (value) => game.move(value),
  jump: $("jump"),
  slide: $("slide"),
  onAction: action,
  onConfirm: confirm,
  onPause: () => {
    if (game.status === "running") pause("A safe place to stop.");
    else if (game.status === "paused") $("resume")?.click();
  },
  signal,
});
$("pause").addEventListener("click", () => pause("A safe place to stop."), {
  signal,
});
$("sound").addEventListener(
  "click",
  async () => {
    await audio.enable(!audio.enabled);
    $("sound").textContent = audio.enabled ? "Sound on" : "Sound off";
    $("sound").setAttribute("aria-pressed", String(audio.enabled));
  },
  { signal },
);
window.addEventListener(
  "blur",
  () => { if (!immersive?.transitioning) pause("Paused when the game lost focus."); },
  { signal },
);
document.addEventListener(
  "visibilitychange",
  () => {
    if (document.hidden) pause("Paused while you were away.");
  },
  { signal },
);
reduce.addEventListener(
  "change",
  (e) => {
    if (e.matches && game.mode !== "planner") {
      pause("Reduced motion is on. Continue with Route planner at your pace.");
      game.mode = "planner";
      if (game.status === "won") plannerCeremony();
      render();
    }
  },
  { signal },
);
companion=createCompanion({button:$('run-companion'),panel:$('companion-panel'),canvas:$('companion-art'),game:()=>game,assets:()=>assets,pause:()=>{$('pause').click()},resume:()=>{$('resume')?.click()},signal});
immersive = createImmersive({shell:$("game"),canvas,entry:$("enter-immersive"),signal,status:()=>game.status,
  onStart:()=>start(false),
  onSuspend:()=>{controls.clear();if(game.status==='running')game.pause('View changing');stopLoop();audio.suspend();},
  onResume:()=>{if(game.status==='paused'){game.resume();screenFor('running');planLast=performance.now();audio.resume();startLoop();flush();}else if(game.status==='won'&&game.mode!=='planner'&&game.ceremony<CEREMONY_SECONDS)startLoop();},
  onPause:reason=>{if(game.status==='paused')screenFor('paused',reason);else pause(reason);if(game.status==='won'&&game.mode!=='planner'&&game.ceremony<CEREMONY_SECONDS)startLoop();render();},
  onResize:()=>{if(renderer){renderer.resize();render();hud();}}
});
createDiscovery({shell:$('game'),entry:$('enter-immersive'),toggle:$('hud-fullscreen'),invite:$('fullscreen-invite'),immersive,signal});
const observer = new ResizeObserver(()=>immersive.resize());
observer.observe(canvas);
function dispose() {
  if (disposed) return;
  disposed = true;
  stopLoop();

  observer.disconnect();
  abort.abort();
  audio.dispose();
  renderer?.dispose();
}
window.addEventListener(
  "pagehide",
  (e) => {
    pause("Welcome back. Resume your run.");
    if (!e.persisted) dispose();
  },
  { signal },
);
window.addEventListener(
  "pageshow",
  (e) => {
    if (e.persisted && !disposed) {
      renderer?.resize();
      render();
    }
  },
  { signal },
);
wireTitle();
try {
  const begin = performance.now();
  assets = await loadAssets();
  renderer = new Renderer(canvas, assets);
  loadedAt = performance.now() - begin;
  wireTitle();
  hud();
  render();
  const box = $("toolbox");
  for (const t of TOOLS) {
    const badge = document.createElement("span");
    if (t.file) {
      const img = document.createElement("img");
      img.src = t.file;
      img.alt = "";
      img.loading = "lazy";
      badge.append(img);
    }
    badge.append(document.createTextNode(t.name));
    box.append(badge);
  }

} catch (error) {
  $("play").textContent = "The route could not load";
  $("play").disabled = true;
  const p = document.createElement("p");
  p.textContent = "Please reload to try again, or return to Side quests.";
  screen.querySelector(".screen-card").append(p);
  console.error("Dev Run asset loading failed", error);
}
