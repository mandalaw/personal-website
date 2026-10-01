'use strict';
(() => {
  const root = document.documentElement;
  const panels = [...document.querySelectorAll('.project-panel')];
  const links = [...document.querySelectorAll('.project-selector')];
  const previews = [...document.querySelectorAll('.deck-preview')];
  const keys = panels.map(panel => panel.dataset.project);
  const core = document.querySelector('.deck-core');
  const compact = matchMedia('(max-width:999px),(max-height:679px),(pointer:coarse),(max-width:1099px) and (max-height:739px)');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)');
  const state = {phase:'IDLE', current:Math.max(0, keys.indexOf(location.hash.replace('#project-', ''))), target:null, direction:1, queued:null, generation:0};
  let animations = [], resizeFrame;
  const reduced = () => reduce.matches || root.dataset.motion === 'reduce';
  const ease = getComputedStyle(root).getPropertyValue('--ease-flow').trim() || 'cubic-bezier(.22,.68,.2,1)';
  const duration = name => parseFloat(getComputedStyle(root).getPropertyValue(name));
  function publish() {
    root.dataset.deckState = state.phase;
    root.dataset.projectTransition = String(state.phase !== 'IDLE');
    root.dataset.activeProject = keys[state.current];
    root.dataset.targetProject = state.target === null ? '' : keys[state.target];
    root.dataset.queuedProject = state.queued === null ? '' : keys[state.queued];
    root.dataset.deckDirection = String(state.direction);
    links.forEach((link, i) => link.toggleAttribute('data-pending', i === (state.queued ?? state.target) && i !== state.current));
  }
  function phase(value) { state.phase = value; publish(); }
  // Visibility, identity, rail and both side previews commit together, before the next paint.
  function commit(index, historyMode = 'replace') {
    state.current = index;
    root.dataset.deckMode = compact.matches ? 'compact' : 'layered';
    panels.forEach((panel, i) => { panel.hidden = !compact.matches && i !== index; panel.inert = panel.hidden; });
    links.forEach((link, i) => i === index ? link.setAttribute('aria-current','true') : link.removeAttribute('aria-current'));
    document.querySelector('.deck-position').textContent = `${String(index + 1).padStart(2,'0')} / ${String(panels.length).padStart(2,'0')}`;
    previews.forEach(button => {
      const i = (index + (button.classList.contains('deck-left') ? -1 : 1) + panels.length) % panels.length;
      button.dataset.project = keys[i];
      button.setAttribute('aria-label', 'Show ' + panels[i].querySelector('h3').textContent);
      button.querySelector('span').textContent = links[i].querySelector('.project-name').textContent;
      button.querySelector('img').src = panels[i].querySelector('img').getAttribute('src');
      button.querySelector('.deck-number').textContent = String(i + 1).padStart(2,'0');
    });
    if (window.SectionScroll) document.dispatchEvent(new CustomEvent('deck-commit',{detail:{index,key:keys[index],historyMode}}));
    else if (historyMode === 'push' && location.hash !== '#project-' + keys[index]) history.pushState(null,'','#project-' + keys[index]);
    publish();
  }
  function cancelMotion() { state.generation++; animations.forEach(animation => animation.cancel()); animations = []; }
  function animate(element, frames, ms, delay = 0) {
    const animation = element.animate(frames, {duration:ms, delay, easing:ease, fill:'both'});
    // Slow motion is only enabled by the same-origin lab; the main page has no debug controls.
    if (root.dataset.labPreview === 'true') animation.playbackRate = Number(root.dataset.deckPlaybackRate) || 1;
    animations.push(animation);
    return animation.finished.catch(() => {});
  }
  function releaseMotion() { animations.forEach(animation => animation.cancel()); animations = []; }
  async function run(index, historyMode = 'push') {
    if (index === state.current) return;
    state.target = index;
    const distance = (index - state.current + panels.length) % panels.length;
    state.direction = distance <= panels.length / 2 ? 1 : -1;
    const generation = ++state.generation;
    phase('PREPARING');
    // Hidden lazy images must be ready before they become the incoming card.
    const image = panels[index].querySelector('img');
    image.loading = 'eager';
    try { await image.decode(); } catch { /* Native alt text remains available on a failed image. */ }
    if (generation !== state.generation) return;
    if (compact.matches || reduced()) { settle(index, historyMode); return; }
    const outgoing = panels[state.current], incoming = panels[index], direction = state.direction;
    phase('TRANSITION_OUT');
    await Promise.all([
      animate(outgoing, [{opacity:1,transform:'none'},{opacity:0,transform:`translateX(${-direction*22}px) translateY(5px) scale(.975) rotateY(${-direction*2}deg)`}], duration('--deck-out')),
      ...previews.map(button => animate(button,[{opacity:1},{opacity:0}],duration('--deck-out')))
    ]);
    if (generation !== state.generation) return;
    phase('REORDER');
    commit(index, historyMode);
    // Install the incoming zero-opacity frame in the SAME task that exposes its DOM.
    releaseMotion();
    phase('TRANSITION_IN');
    const work = [animate(incoming,[{opacity:0,transform:`translateX(${direction*22}px) translateY(9px) scale(.978) rotateY(${direction*2}deg)`},{opacity:1,transform:'none'}],duration('--deck-in'))];
    work.push(animate(incoming.querySelector('.project-media'),[{opacity:.45,transform:'translateY(3px) scale(.99)'},{opacity:1,transform:'none'}],duration('--deck-detail')));
    ['.project-category','h3','.project-role','p','.project-tech','.project-actions','.action-note'].forEach((selector,i) => {
      const element = incoming.querySelector('.project-details ' + selector);
      if (element) work.push(animate(element,[{opacity:0,transform:'translateY(5px)'},{opacity:1,transform:'none'}],duration('--deck-detail'),i*18));
    });
    previews.forEach((button,i) => work.push(animate(button,[{opacity:0,translate:`${direction*(i?5:-5)}px 0`},{opacity:1,translate:'0 0'}],duration('--deck-in'))));
    await Promise.all(work);
    if (generation !== state.generation) return;
    phase('SETTLING');
    releaseMotion();
    // Two paint boundaries retain hover suppression through animation cleanup.
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (generation !== state.generation) return;
    state.target = null;
    phase('IDLE');
    drain();
  }
  function drain() { const next = state.queued; state.queued = null; publish(); if (next !== null && next !== state.current) run(next); }
  function settle(index, historyMode = 'replace') { cancelMotion(); state.target = null; phase('REORDER'); commit(index,historyMode); phase('IDLE'); drain(); }
  function choose(index, focus = true) {
    if (index < 0 || index >= panels.length) return;
    if (focus) links[index].focus({preventScroll:true});
    if (state.phase !== 'IDLE') { state.queued = index; publish(); return; }
    if (compact.matches || reduced()) { settle(index,'push'); if (compact.matches) {if(window.SectionScroll)window.SectionScroll.project(index);else panels[index].scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'}); panels[index].focus({preventScroll:true});} }
    else run(index);
  }
  links.forEach((link,index) => {
    link.addEventListener('click',event => {event.preventDefault(); choose(index);});
    link.addEventListener('keydown',event => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? panels.length-1 : (index + (event.key==='ArrowLeft'?-1:1) + panels.length) % panels.length;
      choose(next);
    });
  });
  previews.forEach(button => button.addEventListener('click',() => choose(keys.indexOf(button.dataset.project))));
  function fit() {
    const intended = state.queued ?? state.target ?? state.current;
    state.queued = null;
    settle(intended);
    if (compact.matches) {core.style.height = ''; return;}
    // Measure inert, invisible copies; never expose or restyle the real cards.
    let height = 0;
    panels.forEach(panel => {
      const measure = panel.cloneNode(true);
      measure.removeAttribute('id'); measure.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      measure.hidden = false; measure.inert = true; measure.setAttribute('aria-hidden','true');
      measure.classList.add('deck-measure'); core.append(measure);
      height = Math.max(height, measure.getBoundingClientRect().height); measure.remove();
    });
    core.style.height = Math.ceil(height) + 'px';
  }
  addEventListener('popstate',() => {if(window.SectionScroll)return;const index=keys.indexOf(location.hash.replace('#project-',''));if(index>=0){state.queued=null;settle(index);}});
  compact.addEventListener('change',fit); reduce.addEventListener('change',fit);
  addEventListener('resize',() => {cancelAnimationFrame(resizeFrame); resizeFrame=requestAnimationFrame(fit);});
  addEventListener('load',fit); document.fonts.ready.then(fit);
  // Official integration boundary. Callers never manipulate panels or synthesize rail clicks.
  window.ProjectDeck = Object.freeze({
    snapshot: () => ({phase:state.phase,current:state.current,target:state.target,queued:state.queued,compact:compact.matches,keys:[...keys]}),
    select: async (index, options = {}) => {
      if (!Number.isInteger(index)||index<0||index>=panels.length||state.phase!=='IDLE') return false;
      if(options.instant)settle(index,options.history||'none');else await run(index,options.history||'none');
      return state.current===index;
    },
    settle: (index) => {state.queued=null;settle(Math.max(0,Math.min(panels.length-1,index)),'none');}
  });
  root.classList.add('showcase-ready'); fit();
})();
