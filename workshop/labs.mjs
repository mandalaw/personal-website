import {
  arenaCases,
  scoreOutput,
  spatial,
  places,
  routeDistance,
  pipeline,
  challenges,
} from "./lab-core.mjs";
import { esc, $, $$, head, link, button, on, status, scene } from "./ui.mjs";
export async function render(id, station, g) {
  if (id === "arena") arena(station);
  if (id === "maps") maps(station);
  if (id === "api") apiBench(station);
  if (id === "design") design(station, g);
  if (id === "transit") transit(station);
}
function arena(s) {
  let current = 0,
    chosen = "";
  s.innerHTML =
    head(
      "TRUSTAI · EVALUATION ARENA",
      "Which answer earns your trust?",
      "Compare two fictional outputs against a fixed input. Score the structure, grounding and treatment of uncertainty before revealing the rationale.",
      "Teaching examples, not historical TrustAI results or a real-provider benchmark. No model API is called.",
    ) +
    `<label for="arena-case">Controlled case</label><select id="arena-case">${arenaCases.map((c, i) => `<option value="${i}">${esc(c.label)}</option>`).join("")}</select><div id="arena-round"></div><hr>${link("Ahmed’s role in TrustAI", "/case-studies/trustai/")} · ${link("The original output-contract lab", "/labs/evaluation/")}`;
  const draw = () => {
    const c = arenaCases[current];
    chosen = "";
    $("#arena-round").innerHTML =
      `<div class="result"><p class="label">FIXED INPUT</p><p>${esc(c.input)}</p></div><div class="compare">${["a", "b"].map((k) => `<article class="sample"><h3>OUTPUT ${k.toUpperCase()}</h3><pre>${esc(JSON.stringify(c[k], null, 2))}</pre>${["Contract / shape", "Grounding in the input", "Limits & uncertainty"].map((d, i) => `<label for="score-${k}-${i}">${d}</label><select id="score-${k}-${i}" data-score="${k}"><option value="0">0 · not demonstrated</option><option value="1">1 · partly demonstrated</option><option value="2">2 · demonstrated</option></select>`).join("")}<p id="total-${k}" class="quiet">Your score: 0 / 6</p>${button("", "Choose output " + k.toUpperCase(), `data-choice="${k}" aria-pressed="false"`)}</article>`).join("")}</div><div class="controls">${button("reveal", "Reveal the reasoning", "disabled")}</div><div id="arena-result" aria-live="polite"></div>`;
    $$("[data-score]").forEach(
      (x) =>
        (x.onchange = () => {
          const k = x.dataset.score;
          $("#total-" + k).textContent =
            "Your score: " +
            scoreOutput($$(`[data-score="${k}"]`).map((s) => Number(s.value)))
              .total +
            " / 6 · your rubric, not a benchmark";
        }),
    );
    $$("[data-choice]").forEach(
      (b) =>
        (b.onclick = () => {
          chosen = b.dataset.choice;
          scene("output");
          $$("[data-choice]").forEach((x) =>
            x.setAttribute("aria-pressed", String(x === b)),
          );
          $("#reveal").disabled = false;
        }),
    );
    on("#reveal", "click", () => {
      scene("success");
      $("#arena-result").innerHTML =
        `<div class="result"><h3>${chosen === c.better ? "That is the more defensible choice here." : "Look again at what the input actually supports."}</h3><p>${esc(c.rationale)}</p><p class="quiet">A different task may favor a different output. The point is an inspectable criterion, not a universal winner.</p></div>`;
    });
  };
  on("#arena-case", "change", (e) => {
    current = Number(e.target.value);
    draw();
  });
  draw();
}
function maps(s) {
  let selected = "orchard",
    city = "Toronto",
    layers = { water: true, access: true, buffer: true };
  s.innerHTML =
    head(
      "GIS DATA STUDIO",
      "Change the criteria. Watch the answer move.",
      "Compare five fictional sites on a local coordinate grid. Adjust priorities, inspect the shortlist and compare two route assumptions.",
      "Toronto and Bay Area are visual settings only. Points, scores and units are fictional; this is not real geography or a site recommendation.",
    ) +
    `<div class="controls"><button data-city="Toronto" aria-pressed="true">Toronto setting</button><button data-city="Bay Area" aria-pressed="false">Bay Area setting</button></div><div class="map-layout"><div><div class="map-canvas"><div class="map-caption" id="map-city">TORONTO · FICTIONAL GRID</div><svg viewBox="0 0 100 100" role="group" aria-label="Fictional site comparison map. Each site also appears in the table below."><defs><pattern id="map-grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M10 0H0V10" fill="none" stroke="#c1ccbc" stroke-width=".4"/></pattern></defs><rect width="100" height="100" fill="url(#map-grid)"/><g id="map-water"><path d="M-10 45Q30 15 48 49T110 67" fill="none" stroke="#9dc7ce" stroke-width="8"/></g><g id="map-access"><path d="M0 58H100M43 0V100" stroke="#f6f2df" stroke-width="4"/><path d="M0 58H100M43 0V100" stroke="#a9a59a" stroke-width=".4" stroke-dasharray="2 2"/></g><circle id="buffer-circle" cx="50" cy="50" r="50" fill="#c8666830" stroke="#b3414b" stroke-width=".5"/><path id="map-route" fill="none" stroke="#2b6576" stroke-width="1.2" stroke-dasharray="2 1"/><g id="map-points"></g><path d="M48 50H52M50 48V52" stroke="#212f38" stroke-width=".8"/></svg></div><p class="quiet">● Candidate site · + buffer center · blue dashed route · red circle search radius. Grid units are not kilometres.</p><div id="map-inspect" class="result"></div></div><div class="map-tools"><h3>Priorities & layers</h3>${["Access", "Shade", "Water"].map((l, i) => `<label for="weight-${i}">${l} weight <output id="weight-value-${i}">1</output></label><input type="range" id="weight-${i}" min="0" max="10" value="1">`).join("")}<label for="map-radius">Radius <output id="radius-value">100</output> grid units</label><input id="map-radius" type="range" min="0" max="100" value="100"><label for="map-access-min">Minimum access score</label><select id="map-access-min"><option value="0">All sites</option><option value="6">6 or better</option><option value="9">9 or better</option></select><fieldset><legend>Map layers</legend>${Object.keys(
      layers,
    )
      .map(
        (l) =>
          `<label class="check-row"><input type="checkbox" data-layer="${l}" checked>${l}</label>`,
      )
      .join(
        "",
      )}</fieldset><label for="route-mode">Route assumption to selected site</label><select id="route-mode"><option value="direct">Straight line</option><option value="grid">Orthogonal grid</option></select></div></div><div class="table-wrap"><table><caption>Accessible site comparison · fictional inputs</caption><thead><tr><th>Site</th><th>Access</th><th>Shade</th><th>Water</th><th>Distance</th><th>Score</th><th>Inspect</th></tr></thead><tbody id="map-table"></tbody></table></div><p id="map-conclusion" aria-live="polite"></p>${link("The actual Community Garden project", "/case-studies/garden/")}`;
  const draw = () => {
    const weights = [0, 1, 2].map((i) => Number($("#weight-" + i).value)),
      radius = Number($("#map-radius").value);
    weights.forEach((v, i) => ($("#weight-value-" + i).textContent = v));
    $("#radius-value").textContent = radius;
    $("#buffer-circle").setAttribute("r", radius);
    $("#buffer-circle").style.display = layers.buffer ? "" : "none";
    $("#map-water").style.display = layers.water ? "" : "none";
    $("#map-access").style.display = layers.access ? "" : "none";
    const rows = spatial({
      weights,
      radius,
      minAccess: Number($("#map-access-min").value),
    });
    const p = rows.find((p) => p.id === selected) || rows[0];
    if (p) selected = p.id;
    $("#map-points").innerHTML = rows
      .map(
        (p) =>
          `<g role="button" tabindex="0" data-map-place="${p.id}" aria-label="Inspect ${esc(p.name)} on map" aria-pressed="${p.id === selected}"><circle cx="${p.x}" cy="${p.y}" r="8" fill="transparent"/><circle class="map-site ${p.id === selected ? "selected" : ""}" cx="${p.x}" cy="${p.y}" r="2.5"/><text class="map-label" x="${p.x + 3}" y="${p.y - 3}" pointer-events="none">${esc(p.name)}</text></g>`,
      )
      .join("");
    $("#map-table").innerHTML = rows
      .map(
        (p) =>
          `<tr><td>${esc(p.name)}</td><td>${p.access}</td><td>${p.shade}</td><td>${p.water}</td><td>${p.distance.toFixed(1)}</td><td>${p.score === null ? "No weights" : p.score.toFixed(2)}</td><td>${button("", "Inspect " + p.name, `data-place="${p.id}"`)}</td></tr>`,
      )
      .join("");
    $$("[data-place], [data-map-place]").forEach((b) => {
      const inspect = () => {
        const fromMap = Boolean(b.dataset.mapPlace);
        selected = b.dataset.place || b.dataset.mapPlace;
        draw();
        document.querySelector(`[data-${fromMap ? "map-place" : "place"}="${selected}"]`)?.focus({preventScroll:true});
        scene("inspect");
        status("Inspecting " + places.find(p=>p.id===selected).name + ". Attributes and route are shown below the map.");
      };
      b.onclick = inspect;
      if (b.dataset.mapPlace) b.onkeydown = event => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); inspect(); }
      };
    });
    if (p) {
      selected = p.id;
      const mode = $("#route-mode").value,
        d = routeDistance({ x: 50, y: 50 }, p, mode);
      $("#map-inspect").innerHTML =
        `<h3>${esc(p.name)}</h3><p>Access ${p.access}, shade ${p.shade}, water ${p.water}, each on a fictional 0–10 scale.</p><p>${mode === "direct" ? "Straight-line" : "Orthogonal-grid"} distance from center: <strong>${d.toFixed(1)} grid units</strong>. This is not a road-network route.</p>`;
      $("#map-route").setAttribute(
        "d",
        mode === "direct" ? `M50 50L${p.x} ${p.y}` : `M50 50H${p.x}V${p.y}`,
      );
    } else {
      $("#map-inspect").textContent = "No site meets the current filter.";
      $("#map-route").setAttribute("d", "");
    }
    const leaders = rows.length ? rows.filter(row => Math.abs(row.score - rows[0].score) < 1e-9) : [];
    $("#map-conclusion").textContent = !rows.length
      ? "No sites qualify. Relax the radius or access filter."
      : weights.every((x) => x === 0)
        ? "All weights are zero. No suitability ranking is implied."
        : leaders.length > 1
          ? `${leaders.map(row=>row.name).join(" and ")} tie under these weights. There is no unique first choice.`
          : `${rows[0].name} ranks first under these weights. Change the assumptions before treating that as a recommendation.`;
  };
  $$("[data-city]").forEach(
    (b) =>
      (b.onclick = () => {
        city = b.dataset.city;
        $("#map-city").textContent = city.toUpperCase() + " · FICTIONAL GRID";
        $$("[data-city]").forEach((x) =>
          x.setAttribute("aria-pressed", String(x === b)),
        );
        $(".map-canvas").style.background =
          city === "Toronto" ? "#e0e9d9" : "#e9e0cd";
      }),
  );
  $$("[data-layer]").forEach(
    (x) =>
      (x.onchange = () => {
        layers[x.dataset.layer] = x.checked;
        draw();
      }),
  );
  $$(".map-tools input[type=range]").forEach((x) => (x.oninput = draw));
  $$(".map-tools select").forEach((x) => (x.onchange = draw));
  draw();
}
function apiBench(s) {
  const sample = JSON.stringify(
    { event_id: "sample-17", item: "Notebook", quantity: 2 },
    null,
    2,
  );
  s.innerHTML =
    head(
      "API / INTEGRATION BENCH",
      "Follow the request, including the bad days.",
      "Compose a small request. The pipeline shows the first boundary that stops it.",
      "This runs entirely in the browser with fictional data. No real API, database, token or client service is used.",
    ) +
    `<div class="split"><div><label for="api-request">Request body · JSON</label><textarea class="code" id="api-request" spellcheck="false" maxlength="2000">${esc(sample)}</textarea><label for="api-scenario">Simulated service condition</label><select id="api-scenario"><option value="valid">Authorized / available</option><option value="unauthorized">Unauthorized</option><option value="rate-limit">Rate limited</option><option value="database">Database unavailable</option><option value="duplicate">Duplicate event ID</option></select><div class="controls">${button("api-send", "Trace request →")}${button("api-missing", "Omit quantity")}${button("api-bad", "Use bad data")}${button("api-reset", "Reset example")}</div></div><div><p class="label">RESPONSE</p><pre id="api-response" class="result" aria-live="polite">Ready when you are.</pre><details><summary>Show the code path</summary><pre>parse bounded JSON
validate exact keys + types + ranges
require server-validated session
apply request budget
use event_id for idempotency
write once or return a bounded error</pre><p class="quiet">The real server must enforce these boundaries independently. This illustration does not grant authorization.</p></details></div></div><div class="pipeline" id="pipeline"></div><ol id="pipeline-explanation"></ol>${link("Professional integration context", "/resume/")} · ${link("The original failure-handling lab", "/labs/integration/")}`;
  const draw = () => {
    const r = pipeline($("#api-request").value, $("#api-scenario").value);
    scene(r.status < 300 ? "cable" : "error");
    $("#api-response").textContent =
      "HTTP " + r.status + "\n" + JSON.stringify(r.response, null, 2);
    $("#pipeline").innerHTML = [
      "client",
      "validation",
      "authorization",
      "api",
      "database",
      "response",
    ]
      .map((id) => {
        const step = r.steps.find((s) => s.id === id);
        return `<div class="pipe-step ${step?.state || ""}">${esc(id.toUpperCase())}<br>${step?.state === "pass" ? "✓ passed" : step?.state === "fail" ? "× stopped" : "— not reached"}</div>`;
      })
      .join("");
    $("#pipeline-explanation").innerHTML = r.steps
      .map((x) => `<li>${esc(x.detail)}</li>`)
      .join("");
  };
  on("#api-send", "click", draw);
  on("#api-missing", "click", () => {
    const b = JSON.parse(sample);
    delete b.quantity;
    $("#api-request").value = JSON.stringify(b, null, 2);
    draw();
  });
  on("#api-bad", "click", () => {
    $("#api-request").value = JSON.stringify(
      { event_id: "sample-17", item: "Notebook", quantity: "many" },
      null,
      2,
    );
    draw();
  });
  on("#api-reset", "click", () => {
    $("#api-request").value = sample;
    $("#api-scenario").value = "valid";
    draw();
  });
  draw();
}
function design(s, g) {
  let round = Math.max(
    0,
    challenges.findIndex((c) => c.id === location.hash.split("/")[1]),
  );
  s.innerHTML =
    head(
      "DESIGN DECISIONS",
      "There is usually a tradeoff.",
      "Choose a boundary, then inspect what it costs and what it protects. These are engineering scenarios, not a test of memorized answers.",
    ) +
    `<div class="controls">${challenges.map((c, i) => button("", c.title, `data-challenge="${i}"`)).join("")}</div><div id="challenge"></div>`;
  const draw = () => {
    const c = challenges[round],
      p = g.nodes.find((n) => n.id === c.project);
    $("#challenge").innerHTML =
      `<p class="challenge-index">DECISION ${round + 1} / ${challenges.length}</p><h3>${esc(c.prompt)}</h3><div class="choices">${c.choices.map((v, i) => button("", v, `data-answer="${i}"`)).join("")}</div><div id="challenge-answer" aria-live="polite"></div><p>${link("Related work: " + p.label, p.href)}</p>`;
    $$("[data-answer]").forEach(
      (b) =>
        (b.onclick = () => {
          scene("success");
          $("#challenge-answer").innerHTML =
            `<div class="result"><h3>What this choice means</h3><p>${esc(c.answers[Number(b.dataset.answer)])}</p><p class="quiet">The constraints in the prompt matter. This explanation does not assert that every historical project used this exact design.</p></div>`;
        }),
    );
  };
  $$("[data-challenge]").forEach(
    (b) =>
      (b.onclick = () => {
        round = Number(b.dataset.challenge);
        draw();
      }),
  );
  draw();
}
function transit(s) {
  let city = "Toronto",
    index = 0;
  const stops = {
    Toronto: [
      ["University", "/workshop/#career"],
      ["GDSC", "/case-studies/gdsc/"],
      ["Garden GIS", "/case-studies/garden/"],
      ["Photography", "/visuals/"],
    ],
    "Bay Area": [
      ["TrustAI", "/case-studies/trustai/"],
      ["Server room", "/workshop/#api"],
      ["Workbench", "/workshop/#design"],
      ["Arcade", "/play/dev-run/"],
      ["Recruiter Room", "/recruiter-room/"],
    ],
  };
  s.innerHTML =
    head(
      "THE SCENIC ROUTE",
      "Walk through the work.",
      "An optional portfolio-navigation experiment, separate from the original Dev Run. Move between buildings, then open the place you want to inspect.",
      "Cities organize the story, not employment claims or exact addresses. The full game and ordinary site navigation remain unchanged.",
    ) +
    `<div class="controls"><button id="city-toronto">Toronto</button><button id="city-bay">Bay Area</button></div><div class="transit-world" tabindex="0" aria-label="Portfolio street. Use left and right arrows, then Enter to visit."><div class="transit-buildings" id="buildings"></div><div class="transit-dude" aria-hidden="true"><svg viewBox="0 0 220 370"><use href="/images/characters/guide/dev.svg#walk-right"></use></svg></div></div><div class="controls">${button("transit-prev", "← Previous building")}${button("transit-next", "Next building →")}<a class="primary" id="transit-enter" href="/resume/">Enter building</a></div><p id="transit-position" role="status"></p>${link("Play the original Dev Run", "/play/dev-run/")} · ${link("Read how the game works", "/case-studies/dev-run/")}`;
  const draw = () => {
    const list = stops[city];
    $("#buildings").innerHTML = list
      .map(
        ([name, href], i) =>
          `<a class="building" href="${href}" aria-current="${i === index}">${esc(name)}</a>`,
      )
      .join("");
    $(".transit-dude").style.left =
      8 + index * (76 / Math.max(1, list.length - 1)) + "%";
    $("#transit-position").textContent =
      city +
      " · " +
      list[index][0] +
      " · " +
      (index + 1) +
      " of " +
      list.length;
    $("#transit-enter").href = list[index][1];
    $("#transit-enter").textContent = "Enter " + list[index][0] + " ↗";
    $("#city-toronto").setAttribute("aria-pressed", String(city === "Toronto"));
    $("#city-bay").setAttribute("aria-pressed", String(city === "Bay Area"));
  };
  const move = (d) => {
    index = (index + d + stops[city].length) % stops[city].length;
    $(".transit-dude use").setAttribute(
      "href",
      "/images/characters/guide/dev.svg#" +
        (d < 0 ? "walk-left" : "walk-right"),
    );
    draw();
  };
  on("#city-toronto", "click", () => {
    city = "Toronto";
    index = 0;
    draw();
  });
  on("#city-bay", "click", () => {
    city = "Bay Area";
    index = 0;
    draw();
  });
  on("#transit-prev", "click", () => move(-1));
  on("#transit-next", "click", () => move(1));
  on(".transit-world", "keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      move(e.key === "ArrowLeft" ? -1 : 1);
    }
    if (e.key === "Enter") location.href = $("#transit-enter").href;
  });
  draw();
}
