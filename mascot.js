'use strict';
(() => {
 const root=document.documentElement,launcher=document.getElementById('guide-launcher');if(!launcher)return;
 const mark=launcher.querySelector('.mascot-mark'),cue=launcher.querySelector('.guide-launch-label'),quietButton=document.getElementById('mascot-quiet');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const bank=Object.freeze({
  ENTRY:['A few shortcuts in here.','Pick an icon. I’ll keep watch.','Work, résumé, or a small detour?','There’s a human behind the wordmark.'],
  ABOUT:['Found the human.','Want the formal version?','The portraits come in day and night.','The longer story folds open.'],
  WORKBENCH:['Tap a tool. See what it does.','Building is only half the story.','The tricky bits live under Debug.','Maps have their own tool here.'],
  PORTFOLIO:['Each card has a little more inside.','Try the project notes.','Source, story, or live app?','Six ways into the work.'],
  TRUSTAI:['TrustAI has a live app.','The model choices have a story.','Want the evaluation details?','The case study keeps the limits in view.'],
  GIS:['There are maps behind this card.','A place can be a data problem.','The garden study starts with a site.','Open the GIS notes for the method.'],
  SIDE_QUESTS:['Your next move is optional.','Two players. One small board.','The archive is a different chapter.','A short detour won’t hurt.'],
  VISUALS:['A space for another kind of work.','The lens gets a room of its own.','Nothing to scroll past just yet.','Back to the work, whenever you like.'],
  RESUME:['The formal version, all together.','Need a PDF? There’s a request link.','The print button has you covered.','Ready to talk? Contact is close.'],
  CONTACT:['No form. Straight to your email app.','A note is a good start.','The source is one tap away.','I’ll leave this part to Ahmed.']
 });
 const timing=Object.freeze({firstCue:32000,cueGap:60000,cueDuration:5200,sessionCueLimit:3,idle:14000,moveGap:30000,floatGap:24000});
 let quiet=false,count=0,lastCue=-Infinity,lastInput=performance.now(),lastMove=0,lastFloat=-Infinity,raf=0,anchor=null,animation=null,cueTimer=0;
 const lineIndex={};
 try{quiet=localStorage.getItem('mandalaw-companion-quiet')==='1';count=Number(sessionStorage.getItem('mandalaw-companion-cues')||0);if(!Number.isFinite(count))count=0}catch{}
 const calm=()=>quiet||reduced.matches||root.dataset.motion==='reduce';
 const busy=()=>document.hidden||root.dataset.guideOpen==='true'||root.dataset.sceneOpen==='true'||root.dataset.guideHidden==='true'||document.querySelector('.menu-icon[aria-expanded=true]')||['TRANSITIONING','SETTLING','INTENT_DETECTED'].includes(root.dataset.scrollState)||document.activeElement?.matches('input,textarea,select,[contenteditable=true]');
 const intersect=(a,b,g=9)=>a.left<b.right+g&&a.right>b.left-g&&a.top<b.bottom+g&&a.bottom>b.top-g;
 const box=(x,y,width=58,height=72)=>({left:x,top:y,right:x+width,bottom:y+height,width,height});
 function obstacles(){return [...document.querySelectorAll('header,main a,main button,main summary,main h1,main h2,main h3,main p,main img,main .project-card,main .bench-panel,main .work-card,footer a,footer button,footer summary,footer p')].filter(el=>!el.closest('[hidden],template')&&el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden').map(el=>el.getBoundingClientRect()).filter(r=>r.width&&r.height&&r.bottom>0&&r.top<innerHeight)}
 function context(){const path=location.pathname,id=root.dataset.scrollCurrent||'about';if(path.includes('/visuals'))return'VISUALS';if(path.includes('/resume'))return'RESUME';if(path.includes('trustai'))return'TRUSTAI';if(path.includes('gis')||path.includes('garden'))return'GIS';if(path.includes('/case-studies/'))return'PORTFOLIO';if(id==='portfolio')return root.dataset.activeProject==='trustai'?'TRUSTAI':['garden','routeability'].includes(root.dataset.activeProject)?'GIS':'PORTFOLIO';return({about:'ENTRY',experience:'ABOUT',services:'WORKBENCH',playground:'SIDE_QUESTS',contact:'CONTACT','site-footer':'CONTACT'})[id]||'ENTRY'}
 function available(r,items){const style=getComputedStyle(root),left=parseFloat(style.getPropertyValue('--safe-left'))||0,right=parseFloat(style.getPropertyValue('--safe-right'))||0,bottom=parseFloat(style.getPropertyValue('--safe-bottom'))||0;return r.left>=left+10&&r.right<=innerWidth-right-10&&r.top>=Math.max(12,document.querySelector('header')?.getBoundingClientRect().bottom||0)+10&&r.bottom<=innerHeight-bottom-12&&!items.some(o=>intersect(r,o))}
 function stop(){animation?.cancel();animation=null;mark.style.transform=''}
 function hideCue(){clearTimeout(cueTimer);launcher.dataset.cueVisible='false'}
 function layout(alternate=false){
  raf=0;root.dataset.mascotContext=context();root.dataset.mascotEntryMode=root.dataset.entryMode||'a';const items=obstacles();
  if(busy()){root.dataset.mascotVisible='false';stop();hideCue();return}
  const berth=document.querySelector('.mascot-berth')?.getBoundingClientRect(),style=getComputedStyle(root),right=parseFloat(style.getPropertyValue('--safe-right'))||0,left=parseFloat(style.getPropertyValue('--safe-left'))||0,bottom=parseFloat(style.getPropertyValue('--safe-bottom'))||0,top=Math.max(12,document.querySelector('header')?.getBoundingClientRect().bottom||0)+18;
  const candidates=[];
  if(berth?.width&&berth.height)candidates.push({...box(berth.left+(berth.width-58)/2,berth.top+5),name:'entry-berth'});
  candidates.push({...box(innerWidth-right-78,innerHeight-bottom-94),name:'lower-right'},{...box(left+20,innerHeight-bottom-94),name:'lower-left'},{...box(innerWidth-right-78,top),name:'header-right'},{...box(left+20,top),name:'header-left'});
  const valid=candidates.filter(r=>available(r,items));
  if(!valid.length){root.dataset.mascotVisible='false';stop();hideCue();return}
  // Preserve a clear anchor while reading. Only deliberate long-idle movement chooses another.
  let next=valid.find(r=>r.name===anchor?.name)||valid[0];
  if(valid[0].name==='entry-berth')next=valid[0];
  if(alternate&&!calm()&&valid.length>1&&valid[0].name!=='entry-berth')next=valid.find(r=>r.name!==anchor?.name&&r.name!=='entry-berth')||next;
  const moved=!anchor||Math.abs(next.left-anchor.left)>1||Math.abs(next.top-anchor.top)>1,old=anchor;
  root.dataset.guideTucked='false';root.dataset.mascotVisible='true';root.dataset.mascotAnchor=next.name;
  launcher.style.setProperty('--mascot-x',next.left+'px');launcher.style.setProperty('--mascot-y',next.top+'px');
  if(moved){stop();hideCue();const swept=old&&{left:Math.min(old.left,next.left),top:Math.min(old.top,next.top),right:Math.max(old.right,next.right),bottom:Math.max(old.bottom,next.bottom)};
   // Never animate across a reading surface. Occluded paths relocate without travel.
   if(old&&!calm()&&swept&&!items.some(r=>intersect(swept,r)))animation=mark.animate([{transform:`translate(${old.left-next.left}px,${old.top-next.top}px)`},{transform:'translate(0,0)'}],{duration:540,easing:'cubic-bezier(.2,.75,.25,1)'});
   else if(old&&!calm())animation=mark.animate([{opacity:0},{opacity:1}],{duration:180});
   lastMove=performance.now();anchor=next;
  }
  if(launcher.dataset.cueVisible==='true')placeCue(items);
 }
 function schedule(){if(!raf)raf=requestAnimationFrame(()=>layout())}
 function placeCue(items){for(const side of ['below','left','right']){launcher.dataset.cueSide=side;const r=cue.getBoundingClientRect();if(available(r,items)){launcher.dataset.cueVisible='true';return true}}hideCue();return false}
 function speak(manual=false){if(busy()||root.dataset.mascotVisible!=='true')return false;const now=performance.now();if(!manual&&(calm()||now<timing.firstCue||now-lastInput<timing.idle||now-lastCue<timing.cueGap||count>=timing.sessionCueLimit))return false;const key=context(),i=lineIndex[key]||0;cue.textContent=bank[key][i%bank[key].length];if(!placeCue(obstacles()))return false;lineIndex[key]=i+1;clearTimeout(cueTimer);cueTimer=setTimeout(hideCue,timing.cueDuration);if(!manual){lastCue=now;count++;try{sessionStorage.setItem('mandalaw-companion-cues',String(count))}catch{}}return true}
 function react(){if(calm()||busy()||root.dataset.mascotVisible!=='true')return;stop();animation=mark.animate([{transform:'rotate(0)'},{transform:'rotate(-4deg) translateY(-2px)'},{transform:'rotate(0)'}],{duration:650,easing:'ease-in-out'})}
 function preference(value){quiet=!!value;quietButton?.setAttribute('aria-pressed',String(quiet));root.dataset.mascotQuiet=String(quiet);try{localStorage.setItem('mandalaw-companion-quiet',quiet?'1':'0')}catch{}stop();hideCue();layout()}
 quietButton?.addEventListener('click',()=>preference(!quiet));quietButton?.setAttribute('aria-pressed',String(quiet));root.dataset.mascotQuiet=String(quiet);
 for(const event of ['pointerdown','keydown','touchstart','wheel'])document.addEventListener(event,()=>{lastInput=performance.now();hideCue();stop()},{passive:true});
 launcher.addEventListener('pointerenter',()=>{react();speak(true)});launcher.addEventListener('focus',()=>speak(true));launcher.addEventListener('pointerleave',hideCue);launcher.addEventListener('blur',hideCue);
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);visualViewport?.addEventListener('resize',schedule);document.addEventListener('section-settled',schedule);document.addEventListener('deck-commit',schedule);
 new MutationObserver(records=>{if(records.some(r=>r.attributeName==='data-theme'))react();schedule()}).observe(root,{attributes:true,attributeFilter:['data-theme','data-guide-open','data-scene-open','data-guide-hidden','data-scroll-state','data-scroll-current','data-active-project','data-motion','data-entrance-state','data-entry-mode','data-entry-transition']});
 new MutationObserver(schedule).observe(document.querySelector('.menu-icon'),{attributes:true,attributeFilter:['aria-expanded']});
 reduced.addEventListener('change',()=>{stop();hideCue();schedule()});document.addEventListener('visibilitychange',schedule);
 // One short four-second hover in a 24-second cycle; never a perpetual bounce.
 setInterval(()=>{if(busy())return;const now=performance.now();if(!calm()&&now-lastInput>timing.idle&&now-lastMove>timing.moveGap)layout(true);if(!calm()&&root.dataset.mascotVisible==='true'&&now-lastFloat>timing.floatGap&&now-lastInput>3000){stop();animation=mark.animate([{transform:'translateY(0)'},{transform:'translateY(-3px)',offset:.5},{transform:'translateY(0)'}],{duration:4000,easing:'ease-in-out'});lastFloat=now;const eyes=mark.querySelector('.mascot-eyes');eyes?.animate([{opacity:1},{opacity:.15,offset:.5},{opacity:1}],{duration:200,delay:1700})}speak()},4000);
 root.dataset.mascotReady='true';window.LivingMascot=Object.freeze({layout,preference,lines:bank,timing,snapshot:()=>({anchor:anchor?.name||null,visible:root.dataset.mascotVisible==='true',quiet,context:context(),hints:count,reduced:calm()})});
 layout();addEventListener('load',schedule);document.fonts.ready.then(schedule);
})();
