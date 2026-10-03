import { startSlide } from "./locomotion.mjs?v=1e48e39f8dd4";
import { collectibleFrame } from "./collectibles.mjs?v=31db57189395";
import { updateRobots } from "./robots.mjs?v=346697f0306a";
import { horizontal } from "./movement.mjs?v=1fa9be477985";
import { pocketPlatforms, supportFor } from "./platforms.mjs?v=8393928aef89";
import { hazardFrame } from "./dynamics.mjs?v=263cebe5feb5";
import { speedFor, stageProgress } from "./course.mjs?v=3d15474f11f1";
import {
  makeCourse,
  STAGES,
  FINISH,
  HAZARDS,
  TOOLS,
  stageAt,
  groundAt,
} from "./course.mjs?v=3d15474f11f1";
import {
  PHYSICS,
  overlap,
  playerBox,
  hazardBox,
  integrate,
} from "./physics.mjs?v=ff700b9e51ad";
import {
  freshStats,
  clearHazard,
  collect,
  totalScore,
} from "./scoring.mjs?v=097b44f00e65";

export class Game {
  constructor({ seed = 23023, mode = "runner" } = {}) {
    this.seed = seed;
    this.mode = mode;
    this.course = makeCourse(seed);
    this.reset();
  }
  reset() {
    this.status = "title";
    this.distance = 0;
    this.maxDistance = 0;
    this.furthestStage = 0;
    this.input = { axis: 0, duck: false };
    this.visited = new Set([0]);
    this.lastSafe = 0;
    this.intro = 2.2;
    this.health = 3;
    this.stage = 0;
    this.checkpoint = 0;
    this.player = {
      vx: 0,
      facing: 1,
      turn: 0,
      idle: 0,
      support: "ground",
      ride: null,
      y: groundAt(0),
      vy: 0,
      grounded: true,
      coyote: 0,
      buffer: 0,
      duck: 0,
      land: 0,
      invulnerable: 0,
    };
    this.stats = {
      ...freshStats(),
      nearMisses: 0,
      routes: [],
      bypassed: 0,
      backtracked: 0,
      pockets: 0,
    };
    this.robots = new Map();
    this.routes = {};
    this.encounter = null;
    this.junctionDone = new Set();
    this.reaction = { name: "adjust-pack", until: 0 };
    this.closeGaps = new Map();
    this.bridge = 0;
    this.mapReveal = 0;
    this.previousStage = 0;
    this.stageAge = 0;
    this.ceremony = 0;
    this.shield = false;
    this.review = 0;
    this.focus = 0;
    this.events = [];
    this.done = new Set();
    this.taken = new Set();
    this.next = 0;
    this.pickupNext = 0;
    this.history = [];
    this.checkpointData = null;
    this.captureCheckpoint();
  }
  event(type, data = {}) {
    this.events.push({ type, ...data });
  }
  drain() {
    return this.events.splice(0);
  }
  start() {
    if (this.status === "title") {
      this.status = "running";
      this.event("stage", { stage: STAGES[0] });
    }
  }
  pause(reason = "Paused") {
    if (this.status !== "running") return;
    this.status = "paused";
    this.input = { axis: 0, duck: false };
    this.event("pause", { reason });
  }
  resume() {
    if (this.status === "paused") {
      this.status = "running";
      this.event("resume");
    }
  }
  move(input) {
    if (this.status !== "running") return;
    this.input = { ...input };
    if (input.axis) this.intro = 0;
  }
  jump() {
    if (this.status !== "running") return;
    if (this.mode === "planner") return this.plan("jump");
    if (this.encounter?.kind === "ride") return this.choose("jump");
    this.player.buffer = this.focus > 0 ? 0.24 : PHYSICS.buffer;
    this.player.anticipate = 0.055;
  }
  slide() {
    if (this.status !== "running") return;
    if (this.mode === "planner") return this.plan("slide");
    if (this.encounter?.kind === "ride") return this.choose("slide");
    if (startSlide(this.player, this.input.axis)) {
      this.stats.slides++;
      this.player.slideAge = 0;
      this.event("slide");
    }
  }
  captureCheckpoint() {
    this.checkpointData = {
      distance: this.distance,
      stage: this.stage,
      health: this.health,
      stats: structuredClone(this.stats),
      done: [...this.done],
      taken: [...this.taken],
      next: this.next,
      pickupNext: this.pickupNext,
      routes: { ...this.routes },
      junctionDone: [...this.junctionDone],
      stageAge: this.stageAge,
      maxDistance: this.maxDistance,
      playerY: this.player.y,
    };
  }
  restore() {
    const c = this.checkpointData,
      total = {
        collisions: this.stats.collisions,
        deaths: this.stats.deaths + 1,
        time: this.stats.time,
        jumps: this.stats.jumps,
        slides: this.stats.slides,
      };
    Object.assign(this, {
      distance: c.distance,
      stage: c.stage,
      health: 3,
      status: "running",
      done: new Set(c.done),
      taken: new Set(c.taken),
      next: c.next,
      pickupNext: c.pickupNext,
      stats: { ...structuredClone(c.stats), ...total },
      shield: false,
      review: 0,
      focus: 0,
      routes: { ...c.routes },
      junctionDone: new Set(c.junctionDone),
      encounter: null,
      stageAge: c.stageAge || 0,
      maxDistance: Math.max(this.maxDistance, c.maxDistance || c.distance),
      input: { axis: 0, duck: false },
      lastSafe: c.distance,
      bridge: 0,
      mapReveal: 0,
    });
    this.robots.clear();
    Object.assign(this.player, {
      vx: 0,
      ride: null,
      board: false,
      support: "ground",
      y: this.surfaceAt(this.distance),
      vy: 0,
      grounded: true,
      duck: 0,
      buffer: 0,
      land: 0,
      invulnerable: 1.8,
      restart: 0.35,
      slidePhase: null,
      slideCooldown: 0,
      runTime: 0,
      runDistance: 0,
      turn: 0,
    });
    this.event("retry");
  }
  advanceStage() {
    const stage = stageAt(this.distance);
    if (stage.index === this.stage) return;
    this.previousStage = this.stage;
    this.stage = stage.index;
    this.stageAge = 0;
    if (this.mode === "planner") {
      this.player.y = this.surfaceAt(this.distance);
      this.player.vy = 0;
      this.player.grounded = true;
    }
    if (!this.visited.has(stage.index)) {
      this.visited.add(stage.index);
      this.furthestStage = Math.max(this.furthestStage, stage.index);
      this.checkpoint = stage.index;
      this.health = Math.min(3, this.health + 1);
      this.captureCheckpoint();
      this.event("checkpoint", { stage });
      this.event("stage", { stage });
    }
  }
  damage(h) {
    if (this.player.invulnerable > 0) return;
    this.stats.collisions++;
    this.stats.streak = 0;
    this.history.push({
      distance: Math.round(this.distance),
      maxDistance: Math.round(this.maxDistance),
      input: { ...this.input },
      platformCount: this.platforms().length,
      stage: this.stage,
      hazard: h.type,
    });
    if (this.shield) {
      this.shield = false;
      this.player.invulnerable = PHYSICS.invulnerable;
      this.event("shield");
      return;
    }
    this.health--;
    this.player.stun=.12;
    this.player.vx=-(this.player.facing||1)*75;
    this.player.invulnerable = PHYSICS.invulnerable;
    this.event("hit", { hazard: h.type });
    if (this.health <= 0) {
      this.status = "over";
      this.event("over");
    }
  }
  pickup(p) {
    if (this.taken.has(p.id)) return;
    this.taken.add(p.id);
    const tool = TOOLS[p.tool];
    collect(this.stats, this.review > 0 ? 2 : 1, p.secret);
    if (tool.kit === "shield") this.shield = true;
    if (tool.kit === "repair") this.health = Math.min(3, this.health + 1);
    if (tool.kit === "review") this.review = 12;
    if (tool.kit === "focus") this.focus = 12;
    if (tool.id === "git") {
      this.captureCheckpoint();
      this.event("tool", { text: "Git marker · a fresh checkpoint" });
    }
    if (tool.id === "python") {
      const h = this.course.hazards.find(
        (h) =>
          !this.done.has(h.id) &&
          h.x > this.distance &&
          h.x < this.distance + 1300 &&
          ["bug", "malware"].includes(h.type),
      );
      if (h) {
        this.done.add(h.id);
        this.stats.bypassed++;
        this.event("tool", { text: "Helper script · one bug cleared" });
      }
    }
    if (["react", "azure", "mongo", "postgres"].includes(tool.id)) {
      this.bridge = 10;
      this.event("tool", {
        text: "Temporary panels · gaps covered for ten seconds",
      });
    }
    if (tool.id === "qgis") {
      this.mapReveal = 14;
      this.event("tool", { text: "Map layer · the upper route is marked" });
    }
    this.reaction = { name: "look-up", until: this.stats.time + 0.55 };
    this.event("pickup", { tool, secret: p.secret });
  }
  win() {
    if (this.status === "won") return;
    this.distance = FINISH;
    this.maxDistance = FINISH;
    this.stage = STAGES.length - 1;
    this.status = "won";
    this.event("win");
  }
  platforms(time = this.stats.time) {
    return this.course.junctions
      .filter((j) => j.kind !== "ride" && Math.abs(j.x - this.distance) < 1600)
      .flatMap((j) => pocketPlatforms(j, time));
  }
  step(dt) {
    if (this.status !== "running" || this.mode === "planner") return;
    dt = Math.max(0, Math.min(dt, 1 / 30));
    this.stats.time += dt;
    this.stageAge += dt;
    for (const k of ["bridge", "mapReveal", "review", "focus"])
      this[k] = Math.max(0, this[k] - dt);
    this.intro = Math.max(0, this.intro - dt);
    const p = this.player,
      s = STAGES[this.stage],
      beforeX = this.distance;
    const oldSupport = this.platforms(this.stats.time - dt).find(
      (x) => x.id === p.support,
    );
    const moving = this.platforms().find((x) => x.id === p.support);
    if (p.grounded && oldSupport && moving) p.y += moving.y - oldSupport.y;
    if (this.input.duck && p.grounded) {
      if (startSlide(p, this.input.axis)) {
        this.stats.slides++;
        this.event("slide");
      }
      p.duck = Math.max(p.duck, 0.1); // Stationary crouch is useful; it is never a powerslide.
    }
    if (p.ride) {
      p.ride.age += dt;
      if (p.ride.phase === "extract" && p.ride.age >= 1.1) {
        p.ride.phase = "ride";
        p.ride.age = 0;
      }
      if (
        p.ride.phase === "ride" &&
        this.distance > STAGES[p.ride.stage].end - 340
      ) {
        p.ride.phase = "exit";
        p.ride.age = 0;
        this.event("ride-exit");
      }
      if (p.ride.phase === "exit" && p.ride.age >= 1.2) p.ride = null;
    }
    p.board = !!p.ride && p.ride.phase !== "extract";
    const slope =
      (groundAt(this.distance + 6) - groundAt(this.distance - 6)) / 12;
    const auto =
      s.movement === "travel" ? 145 : s.movement === "arrival" ? 115 : 0;
    const delta = horizontal(p, dt, this.input, {
      topSpeed: p.board ? 335 : s.speed + 15,
      board: p.board,
      slope,
      auto,
    });
    this.distance = Math.max(
      Math.max(
        0,
        Math.min(this.checkpointData?.distance || 0, this.maxDistance - 1800),
      ),
      Math.min(FINISH, this.distance + (this.intro ? 0 : delta)),
    );
    if (this.distance < beforeX)
      this.stats.backtracked += beforeX - this.distance;
    this.maxDistance = Math.max(this.maxDistance, this.distance);
    this.advanceStage();
    const j = this.course.junctions.find(
      (j) =>
        !this.junctionDone.has(j.id) &&
        this.distance >= j.x - 2 &&
        this.distance < j.x + 650,
    );
    if (j && !this.encounter) {
      this.encounter = {
        ...j,
        age: 0,
        phase: j.kind === "ride" ? "waiting" : "explore",
      };
      this.event("junction", { title: j.title });
    }
    if (this.encounter) {
      const e = this.encounter;
      e.age += dt;
      const gate = e.x + (e.kind === "ride" ? 70 : 425);
      if (this.distance > gate) {
        this.distance = gate;
        p.vx = Math.min(0, p.vx);
      }
      if (
        e.kind !== "ride" &&
        this.distance < e.x - 92 &&
        this.distance > e.x - 230
      ) {
        if (p.y < groundAt(e.x) - 64 && p.grounded) this.finishPocket("high");
        else if (p.grounded && p.duck > 0) this.finishPocket("low");
      }
    }
    updateRobots(this, dt);
    const near = this.course.hazards.filter(
      (h) => h.x > this.distance - 240 && h.x < this.distance + 650,
    );
    const pit = near.find(
      (h) =>
        HAZARDS[h.type].kind === "gap" &&
        hazardFrame(h, this).active &&
        this.distance > h.x + 6 &&
        this.distance < h.x + hazardFrame(h, this).w - 6,
    );
    const previousY = p.y;
    const support = supportFor(
      p,
      this.distance,
      this.surfaceAt(this.distance),
      this.platforms(),
      previousY,
    );
    if (p.grounded && Math.abs(support.y - p.y) > 12) {
      p.grounded = false;
      p.coyote = 0.12;
    }
    for (const e of integrate(p, dt, {
      ground: support.y,
      gap: !!pit && this.bridge <= 0 && support.id === "ground",
      jumpVelocity: p.board ? -585 : PHYSICS.jumpVelocity,
    })) {
      if (e === "jump") this.stats.jumps++;
      this.event(e);
    }
    p.support = p.grounded ? support.id : null;
    if (p.grounded && !pit) this.lastSafe = this.distance;
    const box = playerBox(p, this.distance);
    for (const h of near) {
      if (this.done.has(h.id)) continue;
      const kind = HAZARDS[h.type].kind,
        f = hazardFrame(h, this);
      if (kind !== "gap" && f.active && Math.abs(f.x - this.distance) < 90) {
        const gap = Math.max(
          f.box.y - (box.y + box.h),
          box.y - (f.box.y + f.box.h),
        );
        if (gap >= 0 && gap < 22) this.closeGaps.set(h.id, gap);
      }
      if (kind !== "gap" && f.active && overlap(box, f.box)) {
        this.done.add(h.id);
        this.damage(h);
      } else if (h.x + h.width < this.maxDistance - 18) {
        this.done.add(h.id);
        clearHazard(this.stats);
        this.event("clear", { hazard: h.type });
        if (this.closeGaps.has(h.id)) {
          this.stats.nearMisses++;
          this.stats.points += 35;
          this.closeGaps.delete(h.id);
          this.reaction = { name: "look-back", until: this.stats.time + 0.7 };
          this.event("near");
        }
      }
    }
    if (p.y > this.surfaceAt(this.distance) + 95) {
      this.damage(pit || { type: "null" });
      this.distance = this.lastSafe;
      p.y = this.surfaceAt(this.distance);
      p.vy = 0;
      p.vx = 0;
      p.grounded = true;
      p.support = "ground";
      p.land = 0.25;
    }
    for (const pickup of this.course.pickups) {
      if (this.taken.has(pickup.id) || Math.abs(pickup.x - this.distance) > 100)
        continue;
      const rect = collectibleFrame(pickup, this).box;
      if (overlap(playerBox(p, this.distance), rect)) this.pickup(pickup);
    }
    if (
      this.distance >= FINISH &&
      this.junctionDone.size === this.course.junctions.length &&
      this.status === "running"
    )
      this.win();
  }
  nextJunction() {
    return (
      this.course.junctions.find(
        (j) => !this.junctionDone.has(j.id) && j.x >= this.distance - 650,
      ) || null
    );
  }
  surfaceAt(x) {
    return groundAt(x);
  }
  finishPocket(route) {
    const e = this.encounter;
    if (!e) return;
    this.routes[e.stage] = route;
    this.stats.routes.push({ junction: e.id, route });
    this.junctionDone.add(e.id);
    this.stats.pockets++;
    if (
      route === "high" &&
      e.secret !== null &&
      !this.stats.secrets.includes(e.secret)
    ) {
      this.stats.secrets.push(e.secret);
      this.stats.points += 425;
    }
    this.encounter = null;
    this.captureCheckpoint();
    this.event("route", {
      text:
        route === "high"
          ? "Worth the detour. Upper switch found — head right."
          : "Service switch found. Head right; the path is open.",
      high: route === "high",
    });
  }
  choose(action) {
    const e = this.encounter;
    if (!e) return;
    if (e.kind === "ride") {
      const ride = action === "slide";
      this.routes[e.stage] = ride ? "ride" : "foot";
      this.stats.routes.push({ junction: e.id, route: ride ? "ride" : "foot" });
      this.junctionDone.add(e.id);
      if (ride) {
        this.player.ride = { phase: "extract", age: 0, stage: e.stage };
        this.player.vx = Math.max(100, this.player.vx);
        this.stats.slides++;
      }
      this.encounter = null;
      this.captureCheckpoint();
      this.event("route", {
        text: ride
          ? "Laptop warranty definitely void."
          : "Taking the footpath. Mind the low beams.",
      });
    } else if (this.mode === "planner")
      this.finishPocket(action === "jump" ? "high" : "low");
  }
  upcoming() {
    return (
      this.course.hazards.find(
        (h) =>
          !this.done.has(h.id) &&
          !(h.route === "low" && this.routes[h.stage] === "high") &&
          h.x + h.width > this.distance - 15,
      ) || null
    );
  }
  plan(action) {
    if (this.status !== "running" || this.mode !== "planner") return;
    const h = this.upcoming(),
      j = this.nextJunction();
    if (j && (!h || j.x < h.x)) {
      this.distance = j.x;
      this.maxDistance = Math.max(this.maxDistance, this.distance);
      this.advanceStage();
      this.encounter = { ...j, age: 1, phase: "waiting" };
      this.choose(action);
      this.junctionDone.add(j.id);
      this.encounter = null;
      this.player.y = this.surfaceAt(this.distance);
      this.captureCheckpoint();
      return;
    }
    if (!h) {
      this.win();
      return;
    }
    this.distance = h.x + h.width + 25;
    this.maxDistance = Math.max(this.maxDistance, this.distance);
    this.advanceStage();
    const expected =
      HAZARDS[h.type].kind === "gap" ? "jump" : HAZARDS[h.type].kind;
    this.done.add(h.id);
    this.player.invulnerable = 0;
    if (action !== expected) this.damage(h);
    else {
      clearHazard(this.stats);
      this.event("clear", { hazard: h.type });
      if (action === "jump") this.stats.jumps++;
      else this.stats.slides++;
    }
    for (const p of this.course.pickups.filter(
      (p) => p.x < this.distance + 400 && !this.taken.has(p.id),
    ))
      this.pickup(p);
    const next = this.upcoming();
    if (next) {
      this.distance = Math.max(
        this.distance,
        Math.min(next.x, this.nextJunction()?.x ?? Infinity) - 180,
      );
      this.advanceStage();
    }
    this.player.y = this.surfaceAt(this.distance);
    if (!this.upcoming() && this.status === "running") this.win();
  }
  score() {
    return totalScore(
      this.stats,
      this.maxDistance,
      this.health,
      this.status === "won",
    );
  }
  snapshot() {
    return {
      status: this.status,
      mode: this.mode,
      distance: Math.round(this.distance),
      maxDistance: Math.round(this.maxDistance),
      input: { ...this.input },
      platformCount: this.platforms().length,
      percent: Math.min(100, (this.maxDistance / FINISH) * 100),
      stage: STAGES[this.stage].name,
      checkpoint: this.checkpoint,
      health: this.health,
      score: this.score(),
      stats: { ...this.stats },
      player: { ...this.player },
      shield: this.shield,
      encounter: this.encounter ? { ...this.encounter } : null,
      routes: { ...this.routes },
      speed: speedFor(this),
      sceneAge: this.stageAge,
      obstacles: this.course.hazards.length,
      upcoming: this.upcoming(),
      history: this.history.slice(),
    };
  }
}
