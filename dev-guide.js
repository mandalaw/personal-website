import {Behavior} from './dev-behavior.mjs?v=590514eecad1';
import * as Targets from './dev-targets.mjs?v=80fc0b1f07ae';
import * as Motion from './dev-motion.mjs?v=d984f1260926';
'use strict';
(() => {
 const root=document.documentElement,launcher=document.getElementById('guide-launcher');if(!launcher)return;
 const mark=launcher.querySelector('.dev-character'),cue=launcher.querySelector('.guide-launch-label'),quietButton=document.getElementById('dev-quiet'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const behavior=new Behavior(performance.now());
 let behaviorTimer=0,keyboard=false,held=false,reaction=null,lastReaction=0,lastContext=null;
 const words={ENTRY:['Hello.','Psst.','Need a shortcut?','Poke around.','A few secrets here.','There’s more in here.'],ABOUT:['The actual human.','A little backstory.','Still curious?'],WORKBENCH:['Want the nerdy version?','Try a tool.','Look a little closer.'],PORTFOLIO:['Want the technical bit?','Open a project.','More inside.'],TRUSTAI:['That one’s live.','Check the answer.','Try the demo.'],GIS:['Maps? Of course.','Follow the map.','Location matters.'],SIDE_QUESTS:['One game?','Found the fun bit.','A small detour?','A few secrets here.'],VISUALS:['Through the lens.','Still choosing the frames.'],RESUME:['Straight to business?','Ask for the PDF.'],CONTACT:['Say hi.','A short note works.','Over to Ahmed.'],LOST:['Home still works.','A small detour.'],FOOTER:['Still here?','One more door?','A few secrets here.']};
 const restPoses={ENTRY:'stand',ABOUT:'think',WORKBENCH:'workbench',PORTFOLIO:'laptop',TRUSTAI:'tablet',GIS:'map',SIDE_QUESTS:'game-piece',VISUALS:'camera',RESUME:'document',CONTACT:'envelope',LOST:'curious',FOOTER:'sit'};
 const topics={build:'workbench',ai:'laptop',trustai:'laptop',gis:'map',resume:'document',contact:'envelope',break:'game',fun:'game',photo:'camera',visuals:'camera',study:'reading'};
 const timing=Object.freeze({firstCue:16000,idle:14000,cueGap:[35000,55000],cueDuration:3800,sessionCueLimit:6,moveGap:68000});
 let nextTarget=0,target=null,lastPoint=0,clickCount=0,lastClick=0,engagementTopic='';
 let quiet=false,count=0,lastInput=performance.now(),lastMove=0,cueUntil=0,poseUntil=0,raf=0,anchor=null,animation=null,waved=false;
 try{quiet=localStorage.getItem('mandalaw-companion-quiet')==='1';count=Math.max(0,Number(sessionStorage.getItem('mandalaw-companion-cues'))||0)}catch{}
 const reading=()=>/^\/(resume|case-studies)\//.test(location.pathname);
 const calm=()=>quiet||reduced.matches||root.dataset.motion==='reduce';
 const locked=()=>calm()||document.hidden||held||root.dataset.guideOpen==='true'||root.dataset.sceneOpen==='true'||root.dataset.entryTransition==='true'||root.dataset.entranceState==='running'||!!document.querySelector('.menu-icon[aria-expanded=true]')||['TRANSITIONING','SETTLING','INTENT_DETECTED'].includes(root.dataset.scrollState)||(keyboard&&document.activeElement?.matches('a,button,summary,input,select,textarea'));
 const behaviorContext=()=>context()==='ENTRY'?'ENTRY_'+(root.dataset.entryMode||'a').toUpperCase():context();
 const intersect=(a,b,g=12)=>a.left<b.right+g&&a.right>b.left-g&&a.top<b.bottom+g&&a.bottom>b.top-g;
 function state(value){root.dataset.devState=value}
 function pose(value){if(mark.dataset.pose===value)return;Motion.pose(mark,value);root.dataset.devPose=value}

 function context(){const p=location.pathname,id=root.dataset.scrollCurrent||'about';if(root.dataset.page==='not-found'||p.includes('404'))return'LOST';if(p.includes('/visuals'))return'VISUALS';if(p.includes('/resume'))return'RESUME';if(p.includes('trustai'))return'TRUSTAI';if(p.includes('garden'))return'GIS';if(p.includes('/case-studies/'))return'PORTFOLIO';if(id==='portfolio')return root.dataset.activeProject==='trustai'?'TRUSTAI':['garden','routeability'].includes(root.dataset.activeProject)?'GIS':'PORTFOLIO';return({about:'ENTRY',experience:'ABOUT',services:'WORKBENCH',playground:'SIDE_QUESTS',contact:'CONTACT','site-footer':'FOOTER'})[id]||'ENTRY'}
 function obstacles(){return [...document.querySelectorAll('header,main a,main button,main summary,main h1,main h2,main h3,main p,main img,main .site-character,main .project-card,main .bench-panel,main .work-card,footer a,footer button,footer summary,footer p')].filter(e=>!e.closest('[hidden],template')&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden').map(e=>e.getBoundingClientRect()).filter(r=>r.width&&r.height&&r.bottom>0&&r.top<innerHeight)}
 function available(r,items){const s=getComputedStyle(root),n=v=>parseFloat(s.getPropertyValue('--safe-'+v))||0;return r.left>=n('left')+10&&r.right<=innerWidth-n('right')-10&&r.top>Math.max(12,document.querySelector('header')?.getBoundingClientRect().bottom||0)+10&&r.bottom<=innerHeight-n('bottom')-12&&!items.some(o=>intersect(r,o))}
 function hideCue(){cueUntil=0;launcher.dataset.cueVisible='false';launcher.dataset.cueTopic=''}
 function stop(){animation?.cancel();animation=null;Motion.stop(mark);mark.style.transform=''}
 function invisible(value){root.dataset.devVisible='false';state(value);hideCue();stop()}
 function layout(travel=false){
  raf=0;const key=context();root.dataset.devContext=key;
  const panel=document.querySelector('#pocket-guide .dev-character');if(panel)Motion.pose(panel,window.PortfolioData?.guide.find(x=>x.id===root.dataset.guideTopic)?.pose||root.dataset.guideGreetingPose||topics[root.dataset.guideTopic]||'sit');
  if(root.dataset.guideOpen==='true'){invisible('OPEN');return}
  if(root.dataset.guideHidden==='true'){invisible('DISMISSED');return}
  if(document.hidden||root.dataset.sceneOpen==='true'||root.dataset.entryTransition==='true'||root.dataset.entranceState==='running'||document.querySelector('.menu-icon[aria-expanded=true]')||['TRANSITIONING','SETTLING','INTENT_DETECTED'].includes(root.dataset.scrollState)){invisible('HIDDEN');return}
  const otherMini=[...document.querySelectorAll('main .dev-micro,footer .dev-micro')].some(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.bottom>72&&r.top<innerHeight});if(otherMini){invisible('HIDDEN');return}
  const items=obstacles(),w=innerWidth<800?56:68,h=innerWidth<800?88:106,header=document.querySelector('header')?.getBoundingClientRect().bottom||0,s=getComputedStyle(root),bottom=parseFloat(s.getPropertyValue('--safe-bottom'))||0;
  const box=(x,y,name)=>({left:x,top:y,right:x+w,bottom:y+h,width:w,height:h,name});
  const surface=document.querySelector(({ENTRY:'.entry-dock',PORTFOLIO:'.project-card:not([inert])',TRUSTAI:'.project-card:not([inert])',GIS:'.project-card:not([inert])',WORKBENCH:'.bench-character-heading',ABOUT:'.about-portrait',RESUME:'.document-actions',CONTACT:'.contact-signal',SIDE_QUESTS:'.quest-character-heading',VISUALS:'.character-future'})[key]||'.entry-dock')?.getBoundingClientRect();
  const edges=surface&&surface.bottom>h&&surface.top<innerHeight?[box(surface.left-w-18,Math.min(innerHeight-h-20,Math.max(header+22,surface.top)),'scene-left'),box(surface.right+18,Math.min(innerHeight-h-20,Math.max(header+22,surface.top)),'scene-right')]:[];
  const choices=[...edges,box(innerWidth-w-20,innerHeight-h-bottom-20,'lower-right'),box(20,innerHeight-h-bottom-20,'lower-left'),box(innerWidth-w-20,header+28,'upper-right'),box(20,header+28,'upper-left'),box(innerWidth-w-76,innerHeight-h-bottom-32,'lower-right-inset'),box(76,innerHeight-h-bottom-32,'lower-left-inset')].filter(r=>available(r,items));
  if(!choices.length){invisible('HIDDEN');return}
  let next=choices.find(r=>r.name===anchor?.name)||choices[0];
  if(travel&&!calm())next=choices.find(r=>r.name!==anchor?.name&&!behavior.anchorRecent.includes(r.name)&&anchor&&Math.hypot(r.left-anchor.left,r.top-anchor.top)<160)||choices.find(r=>r.name!==anchor?.name&&anchor&&Math.hypot(r.left-anchor.left,r.top-anchor.top)<160)||next;
  const old=anchor,moved=!old||Math.abs(next.left-old.left)>1||Math.abs(next.top-old.top)>1;
  root.dataset.devVisible='true';root.dataset.devAnchor=next.name;launcher.style.setProperty('--dev-x',next.left+'px');launcher.style.setProperty('--dev-y',next.top+'px');
  if(moved){stop();hideCue();anchor=next;lastMove=performance.now();const swept=old&&{left:Math.min(old.left,next.left),top:Math.min(old.top,next.top),right:Math.max(old.right,next.right),bottom:Math.max(old.bottom,next.bottom)};
   if(old&&!locked()&&!reading()&&Math.hypot(old.left-next.left,old.top-next.top)<160&&!items.some(r=>intersect(swept,r))){state('MOVING');poseUntil=performance.now()+1900;Motion.walk(mark,old.left-next.left,old.top-next.top).then(()=>{if(root.dataset.devState==='MOVING'){poseUntil=0;Motion.change(mark,restPoses[context()]||'stand');state('RESTING')}})}else if(old&&!locked()&&!reading())animation=mark.animate([{opacity:0},{opacity:1}],{duration:160});
  }
  if(performance.now()>poseUntil){if(lastContext!==key){pose(restPoses[key]||'stand');lastContext=key}state(quiet?'QUIET':key==='ENTRY'?'RESTING':'CONTEXT')}
  if(cueUntil>performance.now())state('PROMPTING');
 }
 function schedule(){if(!raf)raf=requestAnimationFrame(()=>layout())}
 function pointAt(item,mini=mark,animated=true){if(!item||!Targets.visible(item.el)||!mini)return false;const direction=Motion.toward(mini,item.el);Motion.face(mini,direction.facing,animated);behavior.faced(direction.facing,performance.now());root.dataset.devFacing=direction.facing;root.dataset.devTarget=item.id;Motion.change(mini,direction.pose);behavior.react(direction.pose,performance.now());poseUntil=performance.now()+1800;lastPoint=performance.now();behavior.rememberList(behavior.targetRecent,item.id,5);return true}
 function bubble(text,topic=''){cue.textContent=text;const facing=mark.dataset.facing||'FACING_RIGHT',sides=facing==='FACING_LEFT'?['left','right','below']:['right','left','below'];
  for(const side of sides){launcher.dataset.cueSide=side;launcher.dataset.cueVisible='true';if(available(cue.getBoundingClientRect(),obstacles())){cueUntil=performance.now()+3800;launcher.dataset.cueTopic=topic;state('PROMPTING');return true}}hideCue();return false;
 }
 function speak(){const now=performance.now();if(locked()||reading()||mark.dataset.motionBusy==='true'||root.dataset.devVisible!=='true'||count>=timing.sessionCueLimit)return;
  const item=target&&Targets.visible(target.el)?target:null,bank=[...(words[context()]||words.ENTRY),...(item?[item.prompt]:[])];const text=behavior.speech(now,now-lastInput,bank);if(!text)return;
  if(bubble(text,text.includes('secrets')?'secrets':'help')){count++;behavior.spoken(text,now);if(item&&text===item.prompt)pointAt(item);try{sessionStorage.setItem('mandalaw-companion-cues',String(count));sessionStorage.setItem('mandalaw-companion-lines',JSON.stringify(behavior.speechRecent))}catch{}}
 }
 function activity(event){lastInput=performance.now();hideCue();if(event?.type==='pointermove')return;poseUntil=0;stop();behavior.reset(lastInput);schedule()}
 function queueReaction(event){const item=Targets.match(event.target,context());if(!item||item.el===reaction?.target)return;reaction={item,pose:item.pose,target:item.el,at:performance.now()+200,type:event.type};}
 function engage(){const now=performance.now();clickCount=now-lastClick<20000?clickCount+1:1;lastClick=now;const index=Math.min(clickCount-1,3),line=['Hey.','Yep?','Still here.','The projects are good too.'][index],pose=['wave','curious','shrug','present'][index];return {line,pose,topic:engagementTopic||launcher.dataset.cueTopic||'help'}}

 function preference(value){quiet=!!value;root.dataset.devQuiet=String(quiet);quietButton?.setAttribute('aria-pressed',String(quiet));try{localStorage.setItem('mandalaw-companion-quiet',quiet?'1':'0')}catch{}activity()}
 quietButton?.addEventListener('click',()=>preference(!quiet));quietButton?.setAttribute('aria-pressed',String(quiet));
 for(const event of ['pointermove','wheel','focusin'])document.addEventListener(event,activity,{passive:true});
 document.addEventListener('pointerdown',e=>{keyboard=false;held=true;activity(e)},{passive:true});
 for(const name of ['pointerup','pointercancel'])document.addEventListener(name,e=>{held=false;activity(e)},{passive:true});
 document.addEventListener('keydown',e=>{keyboard=true;Motion.stopAll();activity(e)});
 document.addEventListener('pointerover',queueReaction,{passive:true});document.addEventListener('focusin',queueReaction);
 document.addEventListener('click',queueReaction);

 launcher.addEventListener('pointerdown',()=>{engagementTopic=launcher.dataset.cueTopic||''});
 launcher.addEventListener('pointerenter',()=>{if(!calm()&&!waved){waved=true;pose('wave');Motion.micro(mark,'wave');poseUntil=performance.now()+1600;state('PEEKING')}});
 launcher.addEventListener('pointerleave',activity);
 addEventListener('scroll',schedule,{passive:true});addEventListener('resize',activity);visualViewport?.addEventListener('resize',activity);document.addEventListener('section-settled',activity);document.addEventListener('deck-commit',activity);
 new MutationObserver(records=>{if(locked())Motion.stopAll();if(records.some(r=>r.attributeName==='data-theme')&&!locked()){reaction={pose:'look-up',at:performance.now()+200,target:null}}if(records.every(r=>['data-entry-mode','data-entry-transition'].includes(r.attributeName)))schedule();else activity()}).observe(root,{attributes:true,attributeFilter:['data-theme','data-guide-open','data-guide-topic','data-scene-open','data-guide-hidden','data-scroll-state','data-scroll-current','data-active-project','data-motion','data-entrance-state','data-entry-mode','data-entry-transition']});
 const gameHost=document.getElementById('scene-content');if(gameHost)new MutationObserver(()=>{const game=gameHost.querySelector('.reversi'),figure=document.querySelector('.scene-guide');if(game&&figure)Motion.pose(figure,game.dataset.over==='true'?'pleased':'game-piece')}).observe(gameHost,{subtree:true,childList:true,attributes:true,attributeFilter:['data-over']});
 const menu=document.querySelector('.menu-icon');if(menu)new MutationObserver(activity).observe(menu,{attributes:true,attributeFilter:['aria-expanded']});
 reduced.addEventListener('change',()=>{Motion.stopAll();activity()});
 function visibleMicro(){return [...document.querySelectorAll('main .dev-micro,footer .dev-micro')].find(el=>{const r=el.getBoundingClientRect();return r.width&&r.top>60&&r.bottom<innerHeight})||null}
 function tick(){behaviorTimer=0;const now=performance.now(),lock=locked(),isReading=reading(),mini=root.dataset.devVisible==='true'?mark:visibleMicro();
  if(cueUntil&&now>=cueUntil)hideCue();
  if(poseUntil&&now>=poseUntil){poseUntil=0;schedule()}
  if(lock){reaction=null;Motion.stopAll();behavior.step(now,{locked:true});hideCue()}
  else {
   if(now>=nextTarget){target=Targets.choose(context(),behavior.targetRecent);nextTarget=now+4500+Math.random()*3000}
   if(reaction&&now>=reaction.at&&now-lastReaction>1400){const r=reaction;reaction=null;if(mini&&(!r.target||Targets.visible(r.target))){if(r.item){const direction=Motion.toward(mini,r.target);Motion.face(mini,direction.facing,false);behavior.faced(direction.facing,now);root.dataset.devFacing=direction.facing;root.dataset.devTarget=r.item.id}
    Motion.change(mini,r.pose);behavior.react(r.pose,now);state('CONTEXT');lastReaction=now;poseUntil=now+1400;
    if(r.item?.effect==='plane'&&!isReading&&now-behavior.lastJump>65000){Motion.plane(mini);behavior.jumped(now)}
   }}
   const busy=mini?.dataset.motionBusy==='true'||mini?.getAnimations({subtree:true}).some(a=>a.playState==='running')||!!cueUntil||!!poseUntil;
   const event=busy?null:behavior.step(now,{context:behaviorContext(),idle:now-lastInput,visible:!!mini||Motion.visibleScenes().length>0,reading:isReading});
   if(event){root.dataset.devAction=event.type==='micro'?event.action:event.pose;
    if(event.type==='pose'){if(mini){Motion.change(mini,event.pose);poseUntil=now+700;state('CONTEXT')}const scene=Motion.visibleScenes()[0];if(scene)Motion.micro(scene,scene.dataset.motionScene==='workbench'?'type':'prop-check',true)}
    else {Motion.micro(mini,event.action==='prop-check'?({coffee:'sip',reading:'page','sit-read':'page','sit-laptop':'type',workbench:'type',wave:'wave'})[mini?.dataset.pose]||event.action:event.action);const scene=Motion.visibleScenes()[0];if(scene&&Math.random()<.35)Motion.micro(scene,event.action,true)}
   }
   if(!busy&&!event&&!poseUntil&&!isReading&&mini&&now-lastInput>3500&&!/point|walk/.test(mini.dataset.poseKind||'')&&!/laptop|workbench|reading|document/.test(mini.dataset.pose||'')){
    const facing=behavior.orient(now,target?Motion.toward(mini,target.el).facing:null);if(facing){Motion.face(mini,facing);root.dataset.devFacing=facing;if(['idle','look'].includes(mini.dataset.poseKind)&&Math.random()<.35){const look=facing==='FACING_LEFT'?'look-left':'look-right';Motion.change(mini,look);behavior.react(look,now);poseUntil=now+700}}
    if(target&&now-lastInput>11000&&now-lastPoint>24000&&!mini.closest('#pocket-guide')&&Math.random()<.02)pointAt(target,mini);
   }
   if(!busy&&!event&&!poseUntil&&!isReading&&behavior.canJump(now,now-lastInput,behaviorContext())&&mini&&root.dataset.devVisible==='true'&&Math.random()<.015){Motion.jump(mini);behavior.jumped(now);poseUntil=now+900;state('JUMPING')}
   if(!busy&&!event&&!poseUntil&&!isReading&&behavior.canTravel(now,now-lastInput)&&root.dataset.devVisible==='true'){layout(true);behavior.travelled(now,anchor?.name)}
   speak();
  }
  if(!document.hidden)behaviorTimer=setTimeout(tick,250);
 }
 function visibility(){held=false;reaction=null;clearTimeout(behaviorTimer);behaviorTimer=0;Motion.stopAll();activity();if(!document.hidden)tick()}
 document.addEventListener('visibilitychange',visibility);
 root.dataset.devQuiet=String(quiet);root.dataset.devReady='true';root.dataset.devIntensity='ALIVE+';root.dataset.devFacing='FACING_RIGHT';
 try{behavior.speechRecent=JSON.parse(sessionStorage.getItem('mandalaw-companion-lines')||'[]').filter(x=>typeof x==='string').slice(-20)}catch{}
 window.DevGuide=Object.freeze({layout,preference,timing,engage,greet:value=>Motion.pose(document.querySelector('#pocket-guide .dev-character'),value),targets:()=>Targets.candidates(context()).map(x=>({id:x.id,pose:x.pose,prompt:x.prompt})),intensity:mode=>{behavior.configure(mode,performance.now());root.dataset.devIntensity=behavior.mode},react:value=>{reaction={pose:value,at:performance.now(),target:null}},snapshot:()=>({state:root.dataset.devState,context:context(),pose:mark.dataset.pose,anchor:anchor?.name,quiet,hints:count,facing:mark.dataset.facing,target:root.dataset.devTarget,reading:reading(),timerCount:behaviorTimer?1:0,behavior:behavior.snapshot()})});
 document.querySelectorAll('.dev-character').forEach(el=>{const current=el.querySelector('use')?.getAttribute('href')?.split('#')[1]||'stand';Motion.pose(el,({ 'walk-left':'curious','peek-left':'peek-left' })[current]||current)});
 layout();tick();addEventListener('load',schedule);document.fonts.ready.then(schedule);
})();
