import {
  topics,
  evidenceFor,
  missions,
  terminal,
  commands,
  packet,
  search,
  graphLayout,
} from "./evidence-core.mjs?v=aa6c2449610d";
import {
  esc,
  $,
  $$,
  status,
  link,
  button,
  evidence,
  head,
  on,
  scene,
} from "./ui.mjs";
const station = $("#station");
let graph,
  mission = null,
  step = 0,
  topic = "sql",
  history = [],
  historyAt = 0,
  notesFilter = "",
  selectedInterests = ["backend"],
  generation = 0;
const names = {
  missions: "Short tours",
  graph: "Career map",
  arena: "AI evaluation arena",
  maps: "GIS studio",
  api: "API bench",
  design: "Design decisions",
  transit: "Scenic route",
  career: "Experience & education",
  notes: "Field notes",
  packet: "Reading packet",
  passport: "Your trail",
  terminal: "Terminal",
  inquiry: "Discuss a role",
  resources: "Engineering extras",
};
const pose = {
  missions: "point-right",
  graph: "point-left",
  arena: "think",
  maps: "map",
  api: "workbench",
  design: "reading",
  transit: "walk-right",
  career: "document",
  notes: "reading",
  packet: "document",
  passport: "found-it",
  terminal: "laptop",
  inquiry: "envelope",
};
let stationPreview=null;
let poseAnimations=[];
function paintDude(next) {
  const d=$('.workshop-dude'), current=$('svg:not(.pose-outgoing)',d);
  if(d.dataset.pose===next)return;
  poseAnimations.forEach(a=>a.cancel());poseAnimations=[];
  d.querySelectorAll('.pose-outgoing').forEach(n=>n.remove());
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches||document.documentElement.dataset.motion==='reduce';
  const previous=current.cloneNode(true);previous.classList.add('pose-outgoing');
  d.dataset.pose=next;$('use',current).setAttribute('href','/images/characters/guide/dev.svg#'+next);
  if(reduced)return;
  d.append(previous);
  const exit=previous.animate([{opacity:1},{opacity:0}],{duration:180,easing:'ease-out'});
  const enter=current.animate([{opacity:0},{opacity:1}],{duration:180,easing:'ease-out'});
  poseAnimations=[exit,enter];exit.finished.then(()=>previous.remove()).catch(()=>previous.remove());
}
function dude(id) {if(!stationPreview)paintDude('stand');}
function setTheme(v) {
  document.documentElement.dataset.theme = v;
  $("#theme").setAttribute(
    "aria-label",
    v === "night" ? "Switch to day theme" : "Switch to night theme",
  );
  try {
    localStorage.setItem("mandalaw-theme", v);
  } catch {}
}
$("#theme").setAttribute(
  "aria-label",
  document.documentElement.dataset.theme === "night"
    ? "Switch to day theme"
    : "Switch to night theme",
);
on("#theme", "click", () =>
  setTheme(
    document.documentElement.dataset.theme === "night" ? "day" : "night",
  ),
);
const palette = $("#palette");
// Native search inputs can otherwise consume the first Escape to clear text.
palette.addEventListener("keydown", event => {
  if (event.key === "Escape") { event.preventDefault(); palette.close(); }
});
const openPalette = () => {
  palette.showModal();
  $("#palette-query").focus();
  drawSearch();
};
on("#find", "click", openPalette);
on("#palette-close", "click", () => palette.close());
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    palette.open ? palette.close() : openPalette();
  }
});
on("#palette-query", "input", drawSearch);
function drawSearch() {
  if (!graph) return;
  const q = $("#palette-query").value;
  const stations = Object.entries(names)
    .filter(([id, n]) => (n + " " + id).toLowerCase().includes(q.toLowerCase()))
    .map(
      ([id, n]) =>
        `<a href="#${id}">${esc(n)}<small>Workshop station</small></a>`,
    );
  const found = search(graph, q).map(
    (n) =>
      `<a href="${esc(n.href)}">${esc(n.label)}<small>${esc(n.type.replaceAll("_", " "))} · ${esc(n.classification)}</small></a>`,
  );
  $("#palette-results").innerHTML =
    [...stations, ...found].slice(0, 20).join("") ||
    "<p>No match. Try SQL, GIS, TrustAI or contact.</p>";
  $$("#palette-results a").forEach((a) =>
    a.addEventListener("click", () => palette.close()),
  );
}
function drawMissions() {
  station.innerHTML =
    head(
      "A SHORT TOUR",
      "What are you trying to figure out?",
      "Choose a question. Take two to five evidence stops, then decide where to go next.",
      "These are fixed routes through supported work. No inferred personalization; you choose the route.",
    ) +
    `<div class="mission-menu">${missions.map((m) => button("", m.title + " ↗", `data-mission="${m.id}"`)).join("")}</div><div id="mission-content"></div>`;
  $$("[data-mission]").forEach(
    (b) =>
      (b.onclick = () => {
        mission = missions.find((m) => m.id === b.dataset.mission);
        step = 0;
        drawStop();
      }),
  );
  if (mission) drawStop();
}
function drawStop() {
  const n = graph.nodes.find((n) => n.id === mission.stops[step]);
  $("#mission-content").innerHTML =
    `<hr><p class="eyebrow">${esc(mission.title)} · STOP ${step + 1} OF ${mission.stops.length}</p><div class="mission-progress" aria-hidden="true">${mission.stops.map((_, i) => `<span class="${i <= step ? "done" : ""}"></span>`).join("")}</div><div class="mission-stage">${evidence(n, graph)}<div class="controls">${button("mission-prev", "Previous", step === 0 ? "disabled" : "")}${step < mission.stops.length - 1 ? button("mission-next", "Next evidence stop →") : link(mission.next === "resume" ? "Request résumé" : "Keep exploring", mission.next === "resume" ? "/professional-access/" : "#" + mission.next)}</div></div>`;
  on("#mission-next", "click", () => {
    step++;
    drawStop();
    dude("graph");
    scene(step === mission.stops.length - 1 ? "stamp" : "walk");
  });
  on("#mission-prev", "click", () => {
    step--;
    drawStop();
  });
  on("#mission-save", "click", async () => {
    const mod = await import("./member.mjs?v=da1072e29c5e");
    await mod.remember("mission", mission.id);
  });
}
function drawGraph() {
  station.innerHTML =
    head(
      "FOLLOW THE EVIDENCE",
      "Where does the skill show up?",
      "Choose a subject. Each connection leads to a role, a project or an explanation you can inspect.",
      "Team stack, individual contribution and professional use are separate relationships. Connections are not transitive endorsements.",
    ) +
    `<div class="controls" aria-label="Evidence subjects">${topics.map((t) => button("", t === "api" ? "APIs" : t === "sql" ? "SQL" : t === "gis" ? "GIS" : t === "ai" ? "AI" : t[0].toUpperCase() + t.slice(1), `data-topic="${t}" aria-pressed="${topic === t}"`)).join("")}</div><div class="split"><div><div class="graph-board" aria-label="Evidence relationship diagram"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" id="graph-lines"></svg><div id="graph-nodes"></div></div><p class="quiet">Choose a node to inspect the exact connection. The list below is a text alternative.</p></div><div id="graph-detail" class="graph-note"></div></div><div id="graph-list"></div>`;
  $$("[data-topic]").forEach(
    (b) =>
      (b.onclick = () => {
        topic = b.dataset.topic;
        updateGraph();
      }),
  );
  updateGraph();
  const board = $(".graph-board");
  let narrow = board.clientWidth < 360;
  const observer = new ResizeObserver(() => {
    if (!board.isConnected) {
      observer.disconnect();
      return;
    }
    const next = board.clientWidth < 360;
    if (next !== narrow) {
      narrow = next;
      updateGraph();
    }
  });
  observer.observe(board);
}
function updateGraph() {
  const hits = evidenceFor(graph, topic);
  $$("[data-topic]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.topic === topic)),
  );
  const board = $(".graph-board");
  const bounds = board.getBoundingClientRect();
  board.dataset.animate = String(
    bounds.top < innerHeight &&
      bounds.bottom > 0 &&
      !matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const mobile = board.clientWidth < 360;
  const positions = graphLayout(
    hits.slice(0, 7).length,
    topics.indexOf(topic),
    mobile,
  );
  const layout = hits
    .slice(0, 7)
    .map((h, i) => ({ ...h, ...positions.nodes[i] }));
  $(".graph-board").dataset.layout = mobile ? "narrow" : "wide";
  $("#graph-lines").innerHTML = layout
    .map(
      (h) =>
        `<line class="graph-line" x1="50" y1="${positions.center.y}" x2="${h.x}" y2="${h.y}"/>`,
    )
    .join("");
  const existing = new Map($$(".graph-node").map((n) => [n.dataset.id, n]));
  const container = $("#graph-nodes");
  const keep = new Set(["center", ...layout.map((h) => h.node.id)]);
  existing.forEach((n, id) => {
    if (!keep.has(id)) n.remove();
  });
  let center = existing.get("center");
  if (!center) {
    center = document.createElement("div");
    center.className = "graph-node center";
    center.dataset.id = "center";
    container.append(center);
  }
  center.style.left = "50%";
  center.style.top = positions.center.y + "%";
  center.textContent = graph.nodes.find((n) => n.id === topic)?.label || topic;
  for (const h of layout) {
    let b = existing.get(h.node.id);
    if (!b) {
      b = document.createElement("button");
      b.className = "graph-node";
      b.dataset.id = h.node.id;
      container.append(b);
    }
    // Position is authoritative immediately. A bounded FLIP transform supplies
    // the motion; WebKit cannot retain an offscreen left/top transition.
    b.getAnimations().forEach((animation) => animation.cancel());
    const previous = b.getBoundingClientRect();
    b.style.transition = "none";
    b.style.left = h.x + "%";
    b.style.top = h.y + "%";
    b.textContent = h.node.label;
    const current = b.getBoundingClientRect();
    const visibleMove =
      board.dataset.animate === "true" &&
      existing.has(h.node.id) &&
      document.documentElement.dataset.motion !== "reduce" &&
      document.visibilityState === "visible" &&
      previous.top >= 0 &&
      previous.bottom <= innerHeight &&
      current.top >= 0 &&
      current.bottom <= innerHeight;
    if (visibleMove) {
      const dx = previous.left - current.left,
        dy = previous.top - current.top;
      const animation = b.animate(
        [
          {
            transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`,
          },
          { transform: "translate(-50%, -50%)" },
        ],
        { duration: 360, easing: "ease-out" },
      );
      // A hidden subframe can suspend its animation clock; never its layout.
      setTimeout(() => animation.cancel(), 400);
    }
    b.onclick = () => {
      detail(h);
      scene("shelf");
    };
  }
  const detail = (h) => {
    $("#graph-detail").innerHTML = h
      ? `<p class="label">${esc(h.edge.relation.replaceAll("_", " "))}</p>${evidence(h.node, graph)}<p class="quiet">${esc(h.edge.statement)}</p>${related(h.node.id)}`
      : "<p>No supported connection in this view.</p>";
  };
  detail(hits[0]);
  $("#graph-list").innerHTML =
    `<details><summary>All ${hits.length} connections as text</summary>${hits.map((h) => `<p><strong>${esc(h.node.label)}</strong> → ${esc(h.edge.relation.replaceAll("_", " "))} → ${esc(topic)}. ${esc(h.edge.statement)} ${link("Read", h.node.href)}</p>`).join("")}</details>`;
}
function related(id) {
  const links = graph.edges
    .filter(
      (e) => e.relation === "related_to" && (e.fromId === id || e.toId === id),
    )
    .map((e) =>
      graph.nodes.find((n) => n.id === (e.fromId === id ? e.toId : e.fromId)),
    )
    .filter((n) => n?.href);
  return links.length
    ? "<h3>Follow the connection</h3>" +
        links
          .map(
            (n) =>
              `<p>${link(n.label, n.href)}<br><small>${esc(n.type.replaceAll("_", " "))} · ${esc(n.summary)}</small></p>`,
          )
          .join("")
    : "";
}
function drawTerminal() {
  station.innerHTML =
    head(
      "THE LITTLE TERMINAL",
      "Ask for the evidence.",
      "Try “skills --evidence sql”. Tab completes a command; ↑ and ↓ recall this session’s history.",
      "This is a deterministic command interface. Nothing you type is sent to a model, analytics or server.",
    ) +
    `<div class="terminal"><div class="terminal-top">ahmed@workshop ~ · evidence shell</div><div class="terminal-log" id="terminal-log" tabindex="0" role="log" aria-live="polite" aria-label="Terminal output"></div><form id="terminal-form"><label for="command">&gt;</label><input id="command" aria-label="Terminal command" autocomplete="off" spellcheck="false" maxlength="120"><button>Run command</button></form></div><div class="controls">${["help", "experience", "projects --ai", "skills --evidence sql"].map((c) => button("", c, `data-command="${c}"`)).join("")}</div>`;
  const run = (q) => {
    scene(String(q).trim().toLowerCase() === "secrets" ? "drawer" : "type");
    const result = terminal(graph, q),
      s = document.createElement("section");
    s.innerHTML = `<p><code>&gt; ${esc(q)}</code></p>${(result.lines || []).map((x) => `<p>${esc(x)}</p>`).join("")}${(result.nodes || []).map((n) => evidence(n, graph, { detail: false })).join("")}${(result.links || []).map((x) => link(x.label, x.href)).join(" ")}`;
    $("#terminal-log").append(s);
    while ($("#terminal-log").children.length > 15)
      $("#terminal-log").firstChild.remove();
    s.scrollIntoView({ block: "nearest" });
    history.push(q);
    history = history.slice(-50);
    historyAt = history.length;
    $("#command").value = "";
  };
  on("#terminal-form", "submit", (e) => {
    e.preventDefault();
    run($("#command").value);
  });
  $$("[data-command]").forEach(
    (b) => (b.onclick = () => run(b.dataset.command)),
  );
  on("#command", "keydown", (e) => {
    if (e.key === "Tab" && e.target.value) {
      const match = commands.find((c) => c.startsWith(e.target.value));
      if (match) {
        e.preventDefault();
        e.target.value = match;
      }
    }
    if (["ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      historyAt = Math.max(
        0,
        Math.min(history.length, historyAt + (e.key === "ArrowUp" ? -1 : 1)),
      );
      e.target.value = history[historyAt] || "";
    }
  });
  run("help");
}
function drawCareer() {
  station.innerHTML =
    head(
      "EXPERIENCE & EDUCATION",
      "The work behind the tools.",
      "Software, professional systems work and spatial analysis meet here. Each story keeps its original scope.",
      "Full role descriptions and date ranges are also available in the professional overview. Team projects remain separate from employment.",
    ) +
    graph.nodes
      .filter((n) => ["ROLE", "EDUCATION"].includes(n.type))
      .map(
        (n) =>
          `<div class="career-line"><span>${esc(n.period || "")}</span><div>${evidence(n, graph)}</div></div>`,
      )
      .join("") +
    link("Full professional overview", "/professional-access/");
}
function drawNotes() {
  const notes = graph.nodes.filter((n) => n.type === "FIELD_NOTE");
  station.innerHTML =
    head(
      "FIELD NOTES",
      "Keep the edges visible.",
      "Short engineering notes. Open one for the tradeoff, then follow it back to the work.",
    ) +
    `<label for="notes-query">Search the notebook</label><input type="search" id="notes-query" placeholder="validation, cache, maps…" value="${esc(notesFilter)}" maxlength="100"><div class="controls">${["all", "ai", "gis", "api", "data", "frontend", "backend", "security", "performance", "testing", "ux"].map((t) => button("", t, `data-note-tag="${t}"`)).join("")}</div><div id="note-list" class="note-list"></div>`;
  const draw = (tag = "all") => {
    const q = $("#notes-query").value.toLowerCase();
    const hits = notes.filter(
      (n) =>
        (tag === "all" || n.tags.includes(tag)) &&
        (n.label + " " + n.summary + " " + n.detail).toLowerCase().includes(q),
    );
    $("#note-list").innerHTML =
      hits
        .map(
          (n) =>
            `<details data-note="${n.id}"><summary><span class="tags">${n.tags.join(" / ").toUpperCase()}</span>${esc(n.label)}</summary><p>${esc(n.summary)}</p><p>${esc(n.detail)}</p>${graph.edges
              .filter((e) => e.fromId === n.id && e.relation === "related_to")
              .map((e) => {
                const p = graph.nodes.find((n) => n.id === e.toId);
                return link(p.label, p.href);
              })
              .join(
                "",
              )}</details>`,
        )
        .join("") ||
      '<p class="empty">No note in this view yet. Try another subject.</p>';
    $$("[data-note]").forEach((note) =>
      note.addEventListener("toggle", () => {
        if (note.open) scene("notebook");
      }),
    );
    $$("[data-save-note]").forEach(
      (b) =>
        (b.onclick = async () => {
          try {
            await (
              await import("./member.mjs?v=da1072e29c5e")
            ).remember("note", b.dataset.saveNote);
          } catch (e) {
            status(e.message);
          }
        }),
    );
  };
  on("#notes-query", "input", () => {
    notesFilter = $("#notes-query").value;
    draw();
  });
  $$("[data-note-tag]").forEach(
    (b) =>
      (b.onclick = () => {
        notesFilter = "";
        $("#notes-query").value = "";
        draw(b.dataset.noteTag);
      }),
  );
  draw();
  const noteId = location.hash.split("/")[1];
  if (noteId) {
    const n = $$("[data-note]").find((n) => n.dataset.note === noteId);
    if (n) n.open = true;
  }
}
function drawPacket() {
  station.innerHTML =
    head(
      "A READING PACKET",
      "Send the relevant work forward.",
      "Choose the interests that matter. This packet is assembled from the same evidence graph, with the contribution boundaries intact.",
      "Public browser and print views need no account. No private document is published.",
    ) +
    `<fieldset class="no-print"><legend>Interests</legend><div class="controls">${["backend", "ai", "gis", "frontend", "data", "integration"].map((t) => `<label class="check-row"><input type="checkbox" name="interest" value="${t}" ${selectedInterests.includes(t) ? "checked" : ""}>${esc(t.toUpperCase())}</label>`).join("")}</div></fieldset><div class="controls">${button("packet-print", "Print / save as PDF")}${link("Professional overview", "/professional-access/")}</div><p class="quiet no-print">For a clean PDF, turn off browser headers and footers in the print options.</p><div id="packet-output"></div>`;
  const draw = () => {
    selectedInterests = $$("input[name=interest]:checked").map((n) => n.value);
    if (!selectedInterests.length) {
      $("#packet-output").innerHTML =
        '<p class="empty">Choose at least one interest.</p>';
      return;
    }
    const items = packet(graph, selectedInterests);
    $("#packet-output").innerHTML =
      `<article class="packet-sheet"><header><p class="eyebrow">SELECTED WORK · ${selectedInterests.join(" / ").toUpperCase()}</p><h2>Ahmed Mandalawi</h2><p>Software developer · systems integration · geospatial work</p><p>${link("Résumé", "/professional-access/")} · ${link("Email", "mailto:dev@mandalawi.ca")} · ${link("LinkedIn", "https://www.linkedin.com/in/devmandalaw")}</p></header>${items.map((n) => `<section class="packet-entry">${evidence(n, graph)}<p class="quiet packet-reasons">${n.reasons.map((x) => esc(x.topic) + ": " + esc(x.statement)).join("<br>")}</p></section>`).join("")}<p class="quiet">Selected public evidence. Team contributions remain attributed as team work. No client documents or private contact details are included.</p></article>`;
  };
  $$("input[name=interest]").forEach(
    (n) =>
      (n.onchange = () => {
        draw();
        scene("carry");
      }),
  );
  on("#packet-print", "click", () => window.print());
  on("#packet-save", "click", async () => {
    if (!selectedInterests.length) throw Error("Choose an interest first.");
    await (await import("./member.mjs?v=da1072e29c5e")).remember("packet", selectedInterests);
  });
  draw();
}
async function render() {
  if (!graph || location.hash === "#station") return;
  const token = ++generation;
  const id = location.hash.slice(1).split("/")[0] || "missions";
  const active = names[id] ? id : "missions";
  const detailId = location.hash.split("/")[1] || "";
  if (active === "graph" && topics.includes(detailId)) topic = detailId;
  if (active === "notes" && detailId) notesFilter = "";
  if (active === "packet" && detailId) {
    const picks = detailId.split(",");
    if (
      picks.length &&
      picks.every((x) =>
        ["backend", "ai", "gis", "frontend", "data", "integration"].includes(x),
      )
    )
      selectedInterests = [...new Set(picks)];
  }
  station.dataset.station = active;
  $$(".station-rail a").forEach((a) =>
    a.setAttribute("aria-current", a.hash === "#" + active ? "page" : "false"),
  );
  dude(active);
  status("");
  if (active === "missions") drawMissions();
  else if (active === "graph") drawGraph();
  else if (active === "terminal") drawTerminal();
  else if (active === "career") drawCareer();
  else if (active === "notes") drawNotes();
  else if (active === "packet") drawPacket();
  else {
    station.innerHTML = "<p>Opening the station…</p>";
    try {
      const mod = await import(
        ["passport", "inquiry", "resources"].includes(active)
          ? "./member.mjs?v=da1072e29c5e"
          : "./labs.mjs?v=f6b43f2f8fa7"
      );
      if (token === generation) await mod.render(active, station, graph);
    } catch {
      if (token === generation)
        station.innerHTML =
          "<p>The station could not load. The project stories and résumé remain available.</p>";
    }
  }
}
window.addEventListener("hashchange", async () => {
  await render();
  if (location.hash !== "#station") {
    station.focus({ preventScroll: true });
    station.scrollIntoView({ block: "start" });
  }
});
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (a && a.hash === location.hash && !palette.open) {
    station.focus({ preventScroll: true });
    station.scrollIntoView({ block: "start" });
  }
});
try {
  const r = await fetch("/workshop/graph.json");
  if (!r.ok) throw Error();
  graph = await r.json();
  await render();
  if (location.hash && location.hash !== "#station")
    station.scrollIntoView({ block: "start" });
  const settleInitialDestination = () => {
    document.fonts.ready.then(() =>
      requestAnimationFrame(() => {
        if (location.hash && location.hash !== "#station") {
          station.focus({ preventScroll: true });
          station.scrollIntoView({ block: "start" });
        }
      }),
    );
  };
  if (document.readyState === "complete") settleInitialDestination();
  else
    window.addEventListener("load", settleInitialDestination, { once: true });
} catch {
  status(
    "The evidence map is unavailable. The public project links above still work.",
  );
}

let printLinks = [];
addEventListener("beforeprint", () => {
  if (printLinks.length) return;
  printLinks = [...document.querySelectorAll("#packet-output a[href]")].map(
    (a) => [a, a.getAttribute("href")],
  );
  for (const [a, href] of printLinks) {
    if (href.startsWith("/") && !href.startsWith("//"))
      a.setAttribute("href", "https://www.mandalawi.ca" + href);
  }
});
addEventListener("afterprint", () => {
  for (const [a, href] of printLinks)
    if (a.isConnected) a.setAttribute("href", href);
  printLinks = [];
});

// One preview owner for the original scene and its compact station menu.
const heroDude=$('.workshop-dude'), stationLinks=[...document.querySelectorAll('.workbench a,.station-rail a')];
let previewTimer=0,leaveTimer=0;
function previewStation(link){
 const id=link.hash.slice(1);if(!Object.hasOwn(names,id))return;
 clearTimeout(leaveTimer);
 if(stationPreview?.hash===link.hash){stationPreview=link;return;}
 stationPreview=link;heroDude.dataset.selection=id;
 stationLinks.forEach(a=>a.toggleAttribute('data-preview',a.hash===link.hash));
 const object=stationLinks.find(a=>a.closest('.workbench')&&a.hash===link.hash)||link;
 const b=object.getBoundingClientRect(),r=heroDude.getBoundingClientRect();
 paintDude(b.left+b.width/2<r.left+r.width/2?'point-left':'point-right');
}
function restPreview(){clearTimeout(previewTimer);clearTimeout(leaveTimer);leaveTimer=setTimeout(()=>{stationPreview=null;heroDude.removeAttribute('data-selection');stationLinks.forEach(a=>a.removeAttribute('data-preview'));paintDude('stand')},180)}
for(const a of stationLinks){
 a.addEventListener('pointerenter',e=>{if(e.pointerType==='touch')return;clearTimeout(previewTimer);clearTimeout(leaveTimer);previewTimer=setTimeout(()=>previewStation(a),90)});
 a.addEventListener('pointerleave',()=>{if(document.activeElement!==a)restPreview()});
 a.addEventListener('focus',()=>{clearTimeout(previewTimer);previewStation(a)});
 a.addEventListener('blur',restPreview);
 a.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')previewStation(a)},{passive:true});
 a.addEventListener('click',()=>{clearTimeout(previewTimer);previewStation(a);$('.station-menu').open=false});
}
const stationMenu=$('.station-menu');
stationMenu.addEventListener('keydown',e=>{if(e.key==='Escape'&&stationMenu.open){stationMenu.open=false;$('summary',stationMenu).focus();restPreview();}});
document.addEventListener('pointerdown',e=>{if(stationMenu.open&&!stationMenu.contains(e.target)){stationMenu.open=false;restPreview();}},{passive:true});
