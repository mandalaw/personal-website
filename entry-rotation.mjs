import {IdleClock, nextMode} from './entry-clock.mjs';
const root = document.documentElement;
const entry = document.getElementById('about');
const stage = document.getElementById('entry-stage');
if (entry && stage) {
  const media = matchMedia('(max-width:799px)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const modes = new Map([...stage.querySelectorAll('[data-entry-mode]')].map(el => [el.dataset.entryMode, el]));
  const switcher = document.querySelector('.entry-switcher');
  const selectors = [...switcher.querySelectorAll('[data-entry-select]')];
  const auto = document.getElementById('entry-auto');
  const line = document.getElementById('entry-line');
  const lines = {a:'Go on. Open something.', b:'Pick a piece. See where it goes.', c:'One way into the work.'};
  const clock = new IdleClock(performance.now());
  let current = 'a', phase = 'idle', animation = null, serial = 0;
  let paused = false, keyboard = false, hovered = null, touching = false;
  const held = new Set();
  const calm = () => reduced.matches || root.dataset.motion === 'reduce';
  function cancel() {
    serial++; animation?.cancel(); animation = null; phase = 'idle';
    root.dataset.entryTransition = 'false';
  }
  function activity() { clock.reset(performance.now()); cancel(); }
  function paint(mode) {
    current = mode; root.dataset.entryMode = mode;
    for (const [key, el] of modes) { el.hidden = key !== mode; el.inert = key !== mode; }
    selectors.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.entrySelect === mode)));
    line.textContent = lines[mode];
    window.LivingMascot?.layout();
  }
  function syncControl() {
    const stopped = paused || calm();
    auto.setAttribute('aria-pressed', String(stopped));
    auto.setAttribute('aria-label', calm() ? 'Automatic rotation off for reduced motion' : stopped ? 'Resume automatic entry rotation' : 'Pause automatic entry rotation');
    auto.disabled = calm();
  }
  function blocked() {
    const focus = document.activeElement;
    const r = stage.getBoundingClientRect();
    const headerBottom = document.querySelector('header').getBoundingClientRect().bottom;
    return !media.matches || paused || calm() || document.hidden || phase !== 'idle' || held.size > 0 || touching ||
      root.dataset.scrollCurrent !== 'about' || ['TRANSITIONING','SETTLING','INTENT_DETECTED'].includes(root.dataset.scrollState) ||
      root.dataset.guideOpen === 'true' || root.dataset.sceneOpen === 'true' || root.dataset.entranceState === 'running' ||
      document.querySelector('.menu-icon[aria-expanded=true]') ||
      !!(hovered?.isConnected && hovered.getClientRects().length) ||
      stage.contains(focus) || (keyboard && focus?.matches('a,button,summary,input,select,textarea,[tabindex]')) ||
      entry.querySelector('details[open],[aria-expanded=true]') || r.top < headerBottom - 1 || r.bottom > innerHeight - 8;
  }
  async function select(mode, {instant = false, automatic = false} = {}) {
    if (!modes.has(mode) || (!media.matches && mode !== 'a')) return false;
    if (automatic && blocked()) return false;
    // A keyboard user keeps ownership of any action inside the current composition.
    if (mode !== current && stage.contains(document.activeElement)) return false;
    activity();
    if (mode === current) return true;
    const token = serial;
    const outgoing = modes.get(current);
    if (automatic && !instant && !calm()) {
      phase = 'out'; root.dataset.entryTransition = 'true';
      animation = outgoing.animate([{opacity:1},{opacity:0}], {duration:240,easing:'ease-in',fill:'forwards'});
      try { await animation.finished; } catch { return false; }
      if (token !== serial) return false;
    }
    // An explicit selection takes effect immediately; later scroll/focus events may
    // settle its reveal, but cannot undo the visitor's chosen view.
    animation?.cancel(); animation = null; paint(mode);
    if (!instant && !calm()) {
      phase = 'in'; root.dataset.entryTransition = 'true';
      animation = modes.get(mode).animate([{opacity:0},{opacity:1}], {duration:automatic ? 360 : 600,easing:'cubic-bezier(.2,.65,.3,1)'});
      try { await animation.finished; } catch { return false; }
      if (token !== serial) return false;
    }
    animation = null; phase = 'idle'; root.dataset.entryTransition = 'false';
    clock.reset(performance.now()); return true;
  }
  selectors.forEach(button => button.addEventListener('click', () => select(button.dataset.entrySelect)));
  auto.addEventListener('click', () => { activity(); paused = !paused; syncControl(); });
  stage.querySelectorAll('[data-entry-tool]').forEach(button => button.addEventListener('click', async () => {
    activity(); const key = button.dataset.entryTool;
    await window.SectionScroll.route('#services', {focus:true});
    const tool = document.querySelector('[data-cap="' + key + '"]');
    if (tool?.getAttribute('aria-expanded') !== 'true') tool?.click();
    tool?.focus({preventScroll:true});
  }));
  // Passive observation only: the approved sectional scroll engine owns gestures.
  document.addEventListener('pointerdown', e => { keyboard = false; held.add(e.pointerId); activity(); }, {passive:true});
  for (const type of ['pointerup','pointercancel']) document.addEventListener(type, e => { held.delete(e.pointerId); activity(); }, {passive:true});
  document.addEventListener('touchstart', () => { touching = true; activity(); }, {passive:true});
  for (const type of ['touchend','touchcancel']) document.addEventListener(type, e => { touching = e.touches.length > 0; activity(); }, {passive:true});
  for (const type of ['touchmove','wheel']) document.addEventListener(type, activity, {passive:true});
  document.addEventListener('keydown', () => { keyboard = true; activity(); });
  document.addEventListener('focusin', activity);
  document.addEventListener('focusout', () => clock.reset(performance.now()));
  const action = target => target instanceof Element ? target.closest('a,button,summary,input,select,textarea') : null;
  document.addEventListener('pointerover', e => { if (e.pointerType === 'mouse') { hovered = action(e.target); if (hovered) activity(); } }, {passive:true});
  document.addEventListener('pointerout', e => { if (e.pointerType === 'mouse') { hovered = action(e.relatedTarget); activity(); } }, {passive:true});
  function wake() { held.clear(); touching = false; hovered = null; activity(); syncControl(); }
  addEventListener('pageshow', wake); addEventListener('pagehide', wake);
  addEventListener('blur', wake); document.addEventListener('visibilitychange', wake);
  addEventListener('scroll', activity, {passive:true});
  addEventListener('resize', activity); visualViewport?.addEventListener('resize', activity);
  document.addEventListener('section-settled', activity);
  new MutationObserver(() => { activity(); syncControl(); }).observe(root, {attributes:true,attributeFilter:['data-theme','data-motion','data-guide-open','data-scene-open','data-scroll-state']});
  new MutationObserver(activity).observe(document.querySelector('.menu-icon'), {attributes:true,attributeFilter:['aria-expanded']});
  reduced.addEventListener('change', () => { activity(); syncControl(); });
  media.addEventListener('change', () => { activity(); if (!media.matches) paint('a'); });
  // A small tab-local counter changes the next load's starting view. No visitor ID.
  let start = 'a';
  if (media.matches && !calm()) {
    try {
      const saved = sessionStorage.getItem('mandalaw-entry-next');
      start = modes.has(saved) ? saved : ['a','b','c'][Math.floor(Math.random()*3)];
      sessionStorage.setItem('mandalaw-entry-next', nextMode(start));
    } catch { start = 'a'; }
  }
  paint(start); syncControl(); switcher.hidden = false; root.dataset.entryReady = 'true';
  const timer = setInterval(() => { if (clock.tick(performance.now(), !!blocked())) select(nextMode(current), {automatic:true}); }, 250);
  window.EntryRotation = Object.freeze({select, snapshot:() => ({current,phase,paused,blocked:!!blocked(),reduced:calm(),mobile:media.matches,interval:clock.interval,since:clock.since,timerCount:timer ? 1 : 0})});
}
