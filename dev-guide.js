'use strict';
(() => {
 const root=document.documentElement,launcher=document.getElementById('guide-launcher');if(!launcher)return;
 const mark=launcher.querySelector('.dev-character'),cue=launcher.querySelector('.guide-launch-label'),quietButton=document.getElementById('dev-quiet'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const sprite=mark.querySelector('use').getAttribute('href').split('#')[0];
 const contexts={ENTRY:['stand',['Pick a door.','The maps are worth a detour.']],ABOUT:['think',['There’s the actual human.','The longer story folds open.']],WORKBENCH:['workbench',['Try a tool.','The interesting bit is underneath.']],PORTFOLIO:['laptop',['A few things I’ve worked on.','There’s more inside each card.']],TRUSTAI:['laptop',['An answer still needs checking.','The model choices have a story.']],GIS:['map',['Yes, there’s a map for that.','Start with the place.']],SIDE_QUESTS:['game',['One game?','Your next move is optional.']],VISUALS:['camera',['Still finding the right frame.','This room is waiting for photographs.']],RESUME:['document',['The formal version lives here.','Need the career notes?']],CONTACT:['envelope',['Over to the actual human.','A note is a good start.']],LOST:['walk-left',['A wrong turn. Easy fix.','Home is that way.']]};
 const topics={build:'workbench',ai:'laptop',trustai:'laptop',gis:'map',resume:'document',contact:'envelope',break:'game',fun:'game',photo:'camera',visuals:'camera',study:'reading'};
 const timing=Object.freeze({firstCue:40000,idle:16000,cueGap:90000,cueDuration:4800,sessionCueLimit:3,moveGap:45000});
 let quiet=false,count=0,lastInput=performance.now(),lastCue=-Infinity,lastMove=0,cueUntil=0,poseUntil=0,raf=0,anchor=null,animation=null,waved=false;
 const lines={};
 try{quiet=localStorage.getItem('mandalaw-companion-quiet')==='1';count=Math.max(0,Number(sessionStorage.getItem('mandalaw-companion-cues'))||0)}catch{}
 const calm=()=>quiet||reduced.matches||root.dataset.motion==='reduce';
 const intersect=(a,b,g=12)=>a.left<b.right+g&&a.right>b.left-g&&a.top<b.bottom+g&&a.bottom>b.top-g;
 function state(value){root.dataset.devState=value}
 function pose(value){if(mark.dataset.pose===value)return;mark.dataset.pose=value;mark.querySelector('use').setAttribute('href',sprite+'#'+value)}
 function context(){const p=location.pathname,id=root.dataset.scrollCurrent||'about';if(root.dataset.page==='not-found'||p.includes('404'))return'LOST';if(p.includes('/visuals'))return'VISUALS';if(p.includes('/resume'))return'RESUME';if(p.includes('trustai'))return'TRUSTAI';if(p.includes('garden'))return'GIS';if(p.includes('/case-studies/'))return'PORTFOLIO';if(id==='portfolio')return root.dataset.activeProject==='trustai'?'TRUSTAI':['garden','routeability'].includes(root.dataset.activeProject)?'GIS':'PORTFOLIO';return({about:'ENTRY',experience:'ABOUT',services:'WORKBENCH',playground:'SIDE_QUESTS',contact:'CONTACT','site-footer':'CONTACT'})[id]||'ENTRY'}
 function obstacles(){return [...document.querySelectorAll('header,main a,main button,main summary,main h1,main h2,main h3,main p,main img,main .site-character,main .project-card,main .bench-panel,main .work-card,footer a,footer button,footer summary,footer p')].filter(e=>!e.closest('[hidden],template')&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden').map(e=>e.getBoundingClientRect()).filter(r=>r.width&&r.height&&r.bottom>0&&r.top<innerHeight)}
 function available(r,items){const s=getComputedStyle(root),n=v=>parseFloat(s.getPropertyValue('--safe-'+v))||0;return r.left>=n('left')+10&&r.right<=innerWidth-n('right')-10&&r.top>Math.max(12,document.querySelector('header')?.getBoundingClientRect().bottom||0)+10&&r.bottom<=innerHeight-n('bottom')-12&&!items.some(o=>intersect(r,o))}
 function hideCue(){cueUntil=0;launcher.dataset.cueVisible='false'}
 function stop(){animation?.cancel();animation=null;mark.style.transform=''}
 function invisible(value){root.dataset.devVisible='false';state(value);hideCue();stop()}
 function layout(travel=false){
  raf=0;const key=context();root.dataset.devContext=key;
  const panel=document.querySelector('#pocket-guide .dev-character use');if(panel)panel.setAttribute('href',sprite+'#'+(topics[root.dataset.guideTopic]||'sit'));
  if(root.dataset.guideOpen==='true'){invisible('OPEN');return}
  if(root.dataset.guideHidden==='true'){invisible('DISMISSED');return}
  if(document.hidden||root.dataset.sceneOpen==='true'||root.dataset.entryTransition==='true'||root.dataset.entranceState==='running'||document.querySelector('.menu-icon[aria-expanded=true]')||['TRANSITIONING','SETTLING','INTENT_DETECTED'].includes(root.dataset.scrollState)){invisible('HIDDEN');return}
  const otherMini=[...document.querySelectorAll('main .dev-micro,footer .dev-micro')].some(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.bottom>72&&r.top<innerHeight});if(otherMini){invisible('HIDDEN');return}
  const items=obstacles(),w=innerWidth<800?56:68,h=innerWidth<800?88:106,header=document.querySelector('header')?.getBoundingClientRect().bottom||0,s=getComputedStyle(root),bottom=parseFloat(s.getPropertyValue('--safe-bottom'))||0;
  const box=(x,y,name)=>({left:x,top:y,right:x+w,bottom:y+h,width:w,height:h,name});
  const choices=[box(innerWidth-w-20,innerHeight-h-bottom-20,'lower-right'),box(20,innerHeight-h-bottom-20,'lower-left'),box(innerWidth-w-20,header+28,'upper-right'),box(20,header+28,'upper-left'),box(innerWidth-w-76,innerHeight-h-bottom-32,'lower-right-inset'),box(76,innerHeight-h-bottom-32,'lower-left-inset')].filter(r=>available(r,items));
  if(!choices.length){invisible('HIDDEN');return}
  let next=choices.find(r=>r.name===anchor?.name)||choices[0];
  if(travel&&!calm())next=choices.find(r=>r.name!==anchor?.name&&anchor&&Math.hypot(r.left-anchor.left,r.top-anchor.top)<160)||next;
  const old=anchor,moved=!old||Math.abs(next.left-old.left)>1||Math.abs(next.top-old.top)>1;
  root.dataset.devVisible='true';root.dataset.devAnchor=next.name;launcher.style.setProperty('--dev-x',next.left+'px');launcher.style.setProperty('--dev-y',next.top+'px');
  if(moved){stop();hideCue();anchor=next;lastMove=performance.now();const swept=old&&{left:Math.min(old.left,next.left),top:Math.min(old.top,next.top),right:Math.max(old.right,next.right),bottom:Math.max(old.bottom,next.bottom)};
   if(old&&!calm()&&Math.hypot(old.left-next.left,old.top-next.top)<160&&!items.some(r=>intersect(swept,r))){state('MOVING');pose(next.left<old.left?'walk-left':'walk-right');animation=mark.animate([{transform:`translate(${old.left-next.left}px,${old.top-next.top}px)`},{transform:'translate(0,0)'}],{duration:450,easing:'cubic-bezier(.2,.7,.3,1)'});poseUntil=performance.now()+500}else if(old&&!calm())animation=mark.animate([{opacity:0},{opacity:1}],{duration:160});
  }
  if(performance.now()>poseUntil){pose(contexts[key][0]);state(quiet?'QUIET':key==='ENTRY'?'RESTING':'CONTEXT')}
  if(cueUntil>performance.now())state('PROMPTING');
 }
 function schedule(){if(!raf)raf=requestAnimationFrame(()=>layout())}
 function speak(){const now=performance.now();if(calm()||root.dataset.devVisible!=='true'||now<timing.firstCue||now-lastInput<timing.idle||now-lastCue<timing.cueGap||count>=timing.sessionCueLimit)return;
  const key=context(),i=lines[key]||0;cue.textContent=contexts[key][1][i%2];
  for(const side of ['left','right','below']){launcher.dataset.cueSide=side;launcher.dataset.cueVisible='true';if(available(cue.getBoundingClientRect(),obstacles())){cueUntil=now+timing.cueDuration;lastCue=now;count++;lines[key]=i+1;state('PROMPTING');try{sessionStorage.setItem('mandalaw-companion-cues',String(count))}catch{}return}}
  hideCue();
 }
 function activity(event){lastInput=performance.now();hideCue();if(event?.type==='pointermove'&&launcher.contains(event.target))return;poseUntil=0;stop();schedule()}
 function preference(value){quiet=!!value;quietButton?.setAttribute('aria-pressed',String(quiet));try{localStorage.setItem('mandalaw-companion-quiet',quiet?'1':'0')}catch{}activity()}
 quietButton?.addEventListener('click',()=>preference(!quiet));quietButton?.setAttribute('aria-pressed',String(quiet));
 for(const event of ['pointerdown','pointermove','keydown','touchstart','wheel','focusin'])document.addEventListener(event,activity,{passive:true});
 launcher.addEventListener('pointerenter',()=>{if(!calm()&&!waved){waved=true;pose('wave');poseUntil=performance.now()+1600;state('PEEKING')}});
 launcher.addEventListener('pointerleave',activity);
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',activity);visualViewport?.addEventListener('resize',activity);document.addEventListener('section-settled',activity);document.addEventListener('deck-commit',activity);
 new MutationObserver(records=>{if(records.every(r=>['data-entry-mode','data-entry-transition'].includes(r.attributeName)))schedule();else activity()}).observe(root,{attributes:true,attributeFilter:['data-theme','data-guide-open','data-guide-topic','data-scene-open','data-guide-hidden','data-scroll-state','data-scroll-current','data-active-project','data-motion','data-entrance-state','data-entry-mode','data-entry-transition']});
 const menu=document.querySelector('.menu-icon');if(menu)new MutationObserver(activity).observe(menu,{attributes:true,attributeFilter:['aria-expanded']});
 reduced.addEventListener('change',activity);document.addEventListener('visibilitychange',activity);
 // One scheduler, no recurring limb animation and no per-pose timers.
 setInterval(()=>{const now=performance.now();if(cueUntil&&now>=cueUntil)hideCue();if(poseUntil&&now>=poseUntil){poseUntil=0;schedule()}if(document.hidden)return;if(now-lastInput>timing.idle){if(now-lastMove>timing.moveGap)layout(true);speak()}},1000);
 root.dataset.devReady='true';window.DevGuide=Object.freeze({layout,preference,timing,snapshot:()=>({state:root.dataset.devState,context:context(),pose:mark.dataset.pose,anchor:anchor?.name,quiet,hints:count,timerCount:1})});
 layout();addEventListener('load',schedule);document.fonts.ready.then(schedule);
})();
